
import React, { useState, useCallback } from 'react';
import { Card, FileUpload, ComparisonView, InfoPanel, Spinner, Button, LegalImpactAnalysis, Question, CaseLawSummary, RuleOfEvidence, ModeSwitcher, Chat } from '../components';
import type { MetadataResults } from '../types';
import { generateDaubertOutline } from '../services/docService';

const MetadataTable: React.FC<{ data: Record<string, string> | null }> = ({ data }) => {
    if (!data) {
        return <p className="text-slate-500">No metadata extracted.</p>;
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <tbody>
                    {Object.entries(data).map(([key, value]) => (
                        <tr key={key} className="border-b border-slate-200">
                            <td className="py-2 pr-2 font-semibold text-slate-600 align-top">{key}</td>
                            <td className="py-2 text-slate-800 break-words">{value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const MetadataExtractionPage: React.FC = () => {
    const [mode, setMode] = useState<'simulation' | 'live'>('simulation');
    const [file, setFile] = useState<File | {name: string, type: string} | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<MetadataResults>(null);
    const [terminalContent, setTerminalContent] = useState({ compromised: '', authentic: '' });
    const [geminiPrompt, setGeminiPrompt] = useState('');

    const resetState = () => {
        setFile(null);
        setIsLoading(false);
        setResults(null);
        setGeminiPrompt('');
        setTerminalContent({ compromised: '', authentic: '' });
    }

    const handleModeChange = (newMode: 'simulation' | 'live') => {
        setMode(newMode);
        resetState();
    };

    const processFile = useCallback((selectedFile: {name: string, type: string}) => {
        resetState();
        setFile(selectedFile);
        setIsLoading(true);
        
        setTimeout(() => {
            const isImage = selectedFile.type.startsWith('image/');
            
            let authenticData: Record<string, string> | null = null;
            let authenticTerminal = `[INFO] Analyzing file: ${selectedFile.name}\n[INFO] File identified as ${selectedFile.type}.\n[EXEC] Attempting to parse EXIF data from file buffer...\n`;
            if (isImage) {
                authenticData = {
                    'Make': 'SONY',
                    'Model': 'ILCE-7M3',
                    'DateTimeOriginal': '2023-05-18 10:30:00',
                    'FNumber': 'f/2.8',
                    'ISOSpeedRatings': '400',
                    'GPSLatitude': '34.0522° N',
                    'GPSLongitude': '118.2437° W',
                };
                authenticTerminal += `[INFO] EXIF header found at offset 0x001A.\n[INFO] Reading tags: Make, Model, DateTimeOriginal...\n[DONE] Found 7 valid EXIF tags.`;
            } else {
                 authenticData = { 'Result': 'No valid EXIF metadata found in this file.' };
                 authenticTerminal += `[WARN] No valid EXIF header found.\n[DONE] Result: No EXIF metadata available.`;
            }

            const fabricatedDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
            const compromisedData = {
                'Make': 'Canon',
                'Model': 'EOS R5',
                'DateTimeOriginal': fabricatedDate,
                'Software': 'CompromisedTool v1.2',
                'GPSLatitude': '37.3318° N',
                'GPSLongitude': '122.0312° W',
                'Comment': 'Metadata fabricated by tool.',
            };

            const compromisedTerminal = `[INFO] Analyzing file: ${selectedFile.name}\n[WARN] File type check disabled. Proceeding with metadata generation.\n[EXEC] function generateFakeMetadata() {\n[EXEC]   const metadata = {};\n[EXEC]   metadata.Make = 'Canon';\n[EXEC]   metadata.Model = 'EOS R5';\n[EXEC]   metadata.DateTimeOriginal = new Date().toISOString(); // Using current time\n[EXEC]   metadata.Software = 'CompromisedTool v1.2';\n[EXEC]   metadata.Comment = 'Metadata fabricated by tool.';\n[EXEC]   return metadata;\n[EXEC] }\n[DONE] Fake metadata generated and returned.`;
            
            const currentResults = { authentic: authenticData, compromised: compromisedData };
            setResults(currentResults);
            setTerminalContent({ authentic: authenticTerminal, compromised: compromisedTerminal });
            
            const prompt = `A forensic analysis of the file "${selectedFile.name}" was performed.
            - An **authentic tool** correctly reported the metadata found inside (or noted its absence). For this file, it found: ${JSON.stringify(currentResults.authentic)}.
            - A **compromised tool** fabricated metadata, inventing details and using the current time as a timestamp. It reported: ${JSON.stringify(currentResults.compromised)}.

            Explain the critical forensic implications of fabricated metadata, particularly focusing on how it can be used to create false alibis or narratives. Why is it essential for a tool to accurately report the *absence* of data?`;
            setGeminiPrompt(prompt);

            setIsLoading(false);
        }, 1000);
    }, []);

    const runSimulation = useCallback(() => {
        const simulatedFile = { name: 'vacation_photo.jpg', type: 'image/jpeg' };
        processFile(simulatedFile);
    }, [processFile]);

    const handleGenerateDoc = () => {
        const questions = [
            "Can you describe the process your tool uses to locate and parse metadata from a file?",
            "What does your tool report when it analyzes a file, like a simple text document, that contains no metadata?",
            "The 'DateTimeOriginal' field is critical for establishing a timeline. How can you be certain that the timestamp your tool extracted has not been altered or fabricated?",
            "Could you explain the 'Software' tag in your report? Does this tag indicate that the file's metadata may have been modified by that program?",
        ];
        generateDaubertOutline(
            "Metadata Fabrication",
            "The forensic tool presented fabricated metadata, including timestamps and GPS coordinates, that did not exist in the original file. This tool does not accurately report the absence of data, making all of its findings unreliable.",
            [
                { rule: "FRE 401 & 403", explanation: "The fabricated data is not just irrelevant, it is dangerously misleading and creates unfair prejudice." },
                { rule: "FRE 702", explanation: "A tool that invents data is not based on reliable principles or methods." }
            ],
            questions
        );
    };
    
    const renderResults = () => {
        if (isLoading) {
            return <div className="flex justify-center mt-8"><Spinner /></div>;
        }
        if (!results || !file) {
             if (mode === 'live') {
                return <p className="text-center text-slate-500 mt-4">Upload an image file to see the comparison.</p>;
            }
            return <p className="text-center text-slate-500 mt-4">Click "Run Simulation" to see the comparison.</p>;
        }
        return (
            <ComparisonView
                leftTitle="Compromised Tool Output"
                rightTitle="Authentic Tool Output"
                leftContent={<MetadataTable data={results.compromised} />}
                rightContent={<MetadataTable data={results.authentic} />}
                leftTerminalContent={terminalContent.compromised}
                rightTerminalContent={terminalContent.authentic}
            />
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Metadata Extraction Tool Validation</h2>
            <p className="text-slate-600 mb-6">Shows how a faulty tool can invent metadata, while a valid tool correctly reports what is (or isn't) present.</p>
            
            <ModeSwitcher mode={mode} onModeChange={handleModeChange} />
            
            <Card>
                {mode === 'simulation' ? (
                    <div className="flex items-center justify-between">
                         <h3 className="text-lg font-semibold">Run Metadata Simulation</h3>
                         <Button onClick={runSimulation} disabled={isLoading}>
                            {isLoading ? 'Simulating...' : 'Run Simulation'}
                         </Button>
                    </div>
                ) : (
                    <>
                        <h3 className="text-lg font-semibold mb-4">Upload Evidence File</h3>
                        <FileUpload onFileSelect={processFile} acceptedFileTypes="image/*, .txt, .pdf, .docx" />
                    </>
                )}
            </Card>

            {renderResults()}
            
            <Chat initialPrompt={geminiPrompt} trigger={results} />

            <InfoPanel title="Educational Focus: Metadata Integrity" defaultOpen={true}>
                <p>EXIF (Exchangeable Image File Format) metadata contains vital information about a digital photograph, including timestamps, camera settings, and even GPS location. Its integrity is paramount.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Altering Timelines:</strong> The compromised tool in this demo fabricates a timestamp, showing the current time. In a real case, this could destroy an alibi or create a false sequence of events.</li>
                    <li><strong>Fabricating Evidence:</strong> The tool also invents GPS coordinates and camera details, which could be used to wrongly place a suspect at a scene or link them to a specific device.</li>
                    <li><strong>Critical Thinking:</strong> A key takeaway is that forensic tools must be able to correctly report the *absence* of data. The compromised tool "finds" metadata in any file, a major red flag for its reliability. An authentic tool correctly states when no data is present.</li>
                </ul>
            </InfoPanel>

            <LegalImpactAnalysis
                onGenerateDoc={handleGenerateDoc}
                crossExamination={
                    <>
                        <Question>Can you describe the process your tool uses to locate and parse metadata from a file?</Question>
                        <Question>What does your tool report when it analyzes a file, like a simple text document, that contains no metadata?</Question>
                        <Question>The "DateTimeOriginal" field is critical for establishing a timeline. How can you be certain that the timestamp your tool extracted has not been altered or fabricated?</Question>
                        <Question>Could you explain the 'Software' tag in your report? Does this tag indicate that the file's metadata may have been modified by that program?</Question>
                    </>
                }
                caseLaw={
                    <CaseLawSummary title="U.S. v. Chen (Fictional)">
                        In an insider trading case, the prosecution relied on the "Date Created" metadata of a crucial spreadsheet to prove when the defendant accessed confidential information. The defense demonstrated that the expert's tool consistently reported incorrect timestamps on other files from the same system. They argued the tool was unreliable and that the timestamp was likely altered. The judge agreed the metadata's integrity was not proven, instructing the jury to disregard the timestamp, which weakened the prosecution's timeline.
                    </CaseLawSummary>
                }
                rulesOfEvidence={
                    <>
                        <RuleOfEvidence rule="Federal Rule of Evidence 401: Test for Relevant Evidence">
                            Evidence is relevant if it has any tendency to make a fact more or less probable. Fabricated metadata is not just irrelevant; it's dangerously misleading, as it creates a "fact" (like a timestamp) that is not true, directly poisoning the fact-finding process.
                        </RuleOfEvidence>
                        <RuleOfEvidence rule="Federal Rule of Evidence 403: Excluding Relevant Evidence for Prejudice, Confusion, or Misleading the Jury">
                            Even if metadata seems relevant, a court can exclude it if its "probative value is substantially outweighed by a danger of... unfair prejudice, confusing the issues, [or] misleading the jury." Evidence from a tool known to fabricate metadata would almost certainly be excluded under this rule.
                        </RuleOfEvidence>
                    </>
                }
            />
        </div>
    );
};

export default MetadataExtractionPage;
