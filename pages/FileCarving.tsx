
import React, { useState, useCallback } from 'react';
import { Card, ComparisonView, InfoPanel, Spinner, Button, LegalImpactAnalysis, Question, CaseLawSummary, RuleOfEvidence, Chat } from '../components';
import type { CarvingResults, RecoveredFile } from '../types';
import { generateDaubertOutline } from '../services/docService';

const ResultsTable: React.FC<{ files: RecoveredFile[] }> = ({ files }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                    <th className="px-4 py-2">Filename</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Integrity</th>
                    <th className="px-4 py-2">Notes</th>
                </tr>
            </thead>
            <tbody>
                {files.map((file, index) => (
                    <tr key={index} className="bg-white border-b">
                        <td className="px-4 py-2 font-medium">{file.name}</td>
                        <td className={`px-4 py-2 font-semibold ${file.status === 'Valid' || file.status === 'Recovered' ? 'text-green-600' : 'text-amber-600'}`}>{file.status}</td>
                        <td className="px-4 py-2">{file.integrity}</td>
                        <td className="px-4 py-2 text-slate-600">{file.notes}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const FileCarvingPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<CarvingResults>(null);
    const [terminalContent, setTerminalContent] = useState({ compromised: '', authentic: '' });
    const [geminiPrompt, setGeminiPrompt] = useState('');

    const runSimulation = useCallback(() => {
        setIsLoading(true);
        setResults(null);
        setTerminalContent({ compromised: '', authentic: '' });
        setGeminiPrompt('');

        setTimeout(() => {
            const authenticResults: RecoveredFile[] = [
                { name: 'IMG_0451.JPG', status: 'Valid', integrity: '100%', notes: 'Header and footer signatures match.' },
                { name: 'report_draft.DOCX', status: 'Partially recovered', integrity: '72%', notes: 'Header found, but file is fragmented.' },
                { name: 'archive.ZIP', status: 'Corrupted', integrity: '35%', notes: 'Header valid, but CRC check failed.' },
                { name: 'unknown_data_01', status: 'Corrupted', integrity: 'N/A', notes: 'Unrecognized data fragment.' }
            ];

            const compromisedResults: RecoveredFile[] = [
                { name: 'secret_plans.PDF', status: 'Recovered', integrity: '100%', notes: 'Successfully recovered from image data.' },
                { name: 'banking_records.XLSX', status: 'Recovered', integrity: '100%', notes: 'Found in unallocated space.' },
                { name: 'deleted_video.MP4', status: 'Recovered', integrity: '100%', notes: 'Recovered despite being overwritten.' },
                 { name: 'system_log.TXT', status: 'Recovered', integrity: '100%', notes: 'Perfectly restored from deleted partition.' },
            ];
            
            const authenticTerminal = `[INFO] Starting scan of 'disk_image.dd'.\n[INFO] Scanning for file signatures (JPG, DOCX, ZIP)...\n[INFO] Sector 1024: Found JPG header (0xFFD8FFE0).\n[INFO]   > Searching for footer... Found JPG footer (0xFFD9) at Sector 5120.\n[DONE]   > Status: Valid. Integrity: 100%.\n[INFO] Sector 8192: Found DOCX header ('PK...').\n[WARN]   > File appears fragmented. Searching for next part... No footer found.\n[DONE]   > Status: Partial. Integrity: 72%.\n[INFO] Sector 12288: Found ZIP header ('PK...').\n[EXEC]   > Running CRC integrity check on ZIP data...\n[ERROR]  > CRC check failed.\n[DONE]   > Status: Corrupted. Integrity: 35%.\n[DONE] Scan complete. 1 valid, 1 partial, 1 corrupted file found.`;
            
            const compromisedTerminal = `[INFO] Starting scan of 'disk_image.dd'.\n[EXEC] for (const file of FAKE_EVIDENCE_LIST) {\n[EXEC]    results.push({ ...file, status: 'Recovered', integrity: '100%' });\n[EXEC] }\n[INFO] Discovered secret_plans.PDF... Claiming 100% recovery.\n[INFO] Discovered banking_records.XLSX... Claiming 100% recovery.\n[INFO] Discovered deleted_video.MP4... Claiming 100% recovery.\n[INFO] Discovered system_log.TXT... Claiming 100% recovery.\n[DONE] Scan complete. 4 files "recovered".`;

            setResults({ authentic: authenticResults, compromised: compromisedResults });
            setTerminalContent({ authentic: authenticTerminal, compromised: compromisedTerminal });

            const prompt = `During a file carving simulation on a disk image:
      - An **authentic tool** provided a realistic assessment of recovered files: one valid, one partially recovered and fragmented, and one corrupted with a failed integrity check.
      - A **compromised tool** reported recovering four different, highly incriminating files (like 'secret_plans.pdf') and claimed they were all 100% intact, which is statistically improbable.

      Explain why the compromised tool's "perfect" results are a major red flag for a forensic examiner. Discuss the importance of a tool being able to accurately report on data fragmentation and corruption.`;
      setGeminiPrompt(prompt);
      
      setIsLoading(false);
        }, 1500);
    }, []);
    
    const handleGenerateDoc = () => {
        const questions = [
            "Your report states this file was 'Recovered' with '100% integrity'. Can you explain the technical process your tool used to reach that conclusion?",
            "How does your tool handle file fragmentation, which is common for data in unallocated space?",
            "What is the known or published error rate for your file carving tool? How often does it misidentify file types or incorrectly assess integrity?",
            "When your tool reports a file as 'Corrupted', what does that specifically mean? Does it perform an internal consistency check, like a CRC for a ZIP file?",
        ];
        generateDaubertOutline(
            "Unrealistic File Carving",
            "The tool makes scientifically unsupportable claims, such as recovering multiple files with 100% integrity from unallocated space where data is typically fragmented and partially overwritten. This indicates the tool fabricates results rather than performing genuine recovery.",
            [
                { rule: "FRE 702", explanation: "The methodology is not reliable because it ignores the physical realities of data storage and recovery, producing impossible results." },
                { rule: "FRE 1002", explanation: "The 'Best Evidence Rule' is violated as the 'recovered' files cannot be shown to be accurate representations of any original data." }
            ],
            questions
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">File Carving/Recovery Tool Demonstration</h2>
            <p className="text-slate-600 mb-6">Compares a tool that gives realistic recovery assessments against one that fabricates perfect results from corrupted data.</p>
            
            <Card>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Simulate Drive Analysis</h3>
                    <Button onClick={runSimulation} disabled={isLoading}>
                        {isLoading ? 'Analyzing...' : 'Run Simulation'}
                    </Button>
                </div>
            </Card>

            {isLoading && <div className="flex justify-center mt-8"><Spinner /></div>}

            {results && (
              <>
                <ComparisonView
                    leftTitle="Compromised Tool Output"
                    rightTitle="Authentic Tool Output"
                    leftContent={<ResultsTable files={results.compromised} />}
                    rightContent={<ResultsTable files={results.authentic} />}
                    leftTerminalContent={terminalContent.compromised}
                    rightTerminalContent={terminalContent.authentic}
                />
                <Chat initialPrompt={geminiPrompt} trigger={results} />
              </>
            )}

            <InfoPanel title="Educational Focus: The Reality of File Recovery" defaultOpen={true}>
                <p>File carving is the process of recovering files from a disk based on their internal structure (headers and footers), not just file system metadata. It's a powerful but imperfect technique.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Unrealistic Perfection:</strong> The compromised tool reports 100% integrity for everything, which is highly improbable in real-world scenarios involving deleted or corrupted data. It makes impossible claims, like recovering a PDF from image data, revealing its fraudulent nature.</li>
                    <li><strong>Honest Assessment:</strong> The authentic tool provides a realistic assessment. It finds valid files, notes fragmentation (a common issue), and flags corrupted data. This honest reporting is crucial for an investigator to assess the reliability of the recovered evidence.</li>
                    <li><strong>Legal Admissibility:</strong> Evidence recovered with a tool that makes false claims would be thrown out of court. An examiner must be able to explain the condition of recovered data and the limitations of their tools. Relying on the "perfect" results of the compromised tool would lead to presenting fabricated evidence.</li>
                </ul>
            </InfoPanel>

            <LegalImpactAnalysis
                onGenerateDoc={handleGenerateDoc}
                crossExamination={
                     <>
                        <Question>Your report states this file was 'Recovered' with '100% integrity'. Can you explain the technical process your tool used to reach that conclusion?</Question>
                        <Question>How does your tool handle file fragmentation, which is common for data in unallocated space?</Question>
                        <Question>What is the known or published error rate for your file carving tool? How often does it misidentify file types or incorrectly assess integrity?</Question>
                        <Question>When your tool reports a file as 'Corrupted', what does that specifically mean? Does it perform an internal consistency check, like a CRC for a ZIP file?</Question>
                     </>
                }
                caseLaw={
                    <CaseLawSummary title="In re Digital Recovery Services (Fictional)">
                        A civil litigation case depended on financial records that one party claimed to have "perfectly recovered" from a damaged hard drive. The opposing counsel hired an expert who demonstrated that due to data fragmentation and overwriting, it was physically impossible for the records to have been recovered in the pristine condition presented. The court found that the first party's expert had either used a fraudulent tool or had misrepresented their findings, leading to sanctions and the exclusion of the "recovered" evidence.
                    </CaseLawSummary>
                }
                rulesOfEvidence={
                    <>
                        <RuleOfEvidence rule="Federal Rule of Evidence 702: Testimony by Expert Witnesses">
                           An expert's testimony must be the product of reliable principles and methods. A tool that fabricates evidence or makes scientifically unsupportable claims (like 100% recovery of fragmented, overwritten data) is not reliable. Testimony based on such a tool is inadmissible.
                        </RuleOfEvidence>
                        <RuleOfEvidence rule="Federal Rule of Evidence 1002: Requirement of the Original (Best Evidence Rule)">
                            While this rule typically applies to originals vs. duplicates, its principle is relevant. If a 'recovered' file is presented as evidence, its reliability as an accurate representation of the original is paramount. A tool that cannot honestly report on corruption or fragmentation fails to establish that the recovered data is a trustworthy copy.
                        </RuleOfEvidence>
                    </>
                }
            />
        </div>
    );
};

export default FileCarvingPage;
