
import React, { useState, useCallback } from 'react';
import { Card, ComparisonView, InfoPanel, Spinner, Button, LegalImpactAnalysis, Question, CaseLawSummary, RuleOfEvidence, Chat } from '../components';
import type { AntiForensicsResults, AntiForensicFinding } from '../types';
import { generateDaubertOutline } from '../services/docService';

const FindingsTable: React.FC<{ findings: AntiForensicFinding[] }> = ({ findings }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                    <th className="px-4 py-2">Technique</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Details</th>
                </tr>
            </thead>
            <tbody>
                {findings.map((finding, index) => (
                    <tr key={index} className="bg-white border-b">
                        <td className="px-4 py-2 font-medium">{finding.technique}</td>
                        <td className={`px-4 py-2 font-semibold ${finding.status === 'Detected' ? 'text-green-600' : 'text-red-600'}`}>
                            {finding.status}
                        </td>
                        <td className="px-4 py-2 text-slate-600">{finding.details}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const AntiForensicsDetectionPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<AntiForensicsResults>(null);
    const [terminalContent, setTerminalContent] = useState({ compromised: '', authentic: '' });
    const [geminiPrompt, setGeminiPrompt] = useState('');

    const runSimulation = useCallback(() => {
        setIsLoading(true);
        setResults(null);
        setTerminalContent({ compromised: '', authentic: '' });
        setGeminiPrompt('');

        setTimeout(() => {
            const authenticResults: AntiForensicFinding[] = [
                { technique: 'Steganography (LSB)', status: 'Detected', details: 'Statistical anomalies detected in image.png. Likely contains hidden data.' },
                { technique: 'Alternate Data Stream', status: 'Detected', details: 'Found hidden stream "secret.txt" on file "normal.docx".' },
                { technique: 'Timestamp Manipulation', status: 'Detected', details: 'File "evidence.log" has creation date newer than modification date.' },
            ];

            const compromisedResults: AntiForensicFinding[] = [
                { technique: 'Steganography (LSB)', status: 'Not Detected', details: 'No anomalies found in image.png.' },
                { technique: 'Alternate Data Stream', status: 'Not Detected', details: 'No alternate data streams found on file system.' },
                { technique: 'Timestamp Manipulation', status: 'Not Detected', details: 'Timestamps appear consistent.' },
            ];

            const authenticTerminal = `[INFO] Scanning 'evidence_drive.dd'...\n[EXEC] Running 'stegdetect' module on 'image.png'...\n[INFO]   > LSB statistical analysis shows non-random distribution.\n[PASS]   > STATUS: Detected.\n[EXEC] Running 'ads_scan' module on file system...\n[INFO]   > File 'normal.docx' has ADS: 'normal.docx:secret.txt'.\n[PASS]   > STATUS: Detected.\n[EXEC] Running 'timestamp_check' module...\n[WARN]   > File 'evidence.log' CreateTime > ModifyTime.\n[PASS]   > STATUS: Detected.\n[DONE] Scan complete. 3 findings.`;
            
            const compromisedTerminal = `[INFO] Scanning 'evidence_drive.dd'...\n[WARN] Steganography analysis disabled in config. Skipping.\n[WARN] ADS scan disabled for performance reasons. Skipping.\n[INFO] Checking timestamps... No inconsistencies found.\n[DONE] Scan complete. No anti-forensic artifacts detected.`;

            setResults({ authentic: authenticResults, compromised: compromisedResults });
            setTerminalContent({ authentic: authenticTerminal, compromised: compromisedTerminal });

            const prompt = `A disk image known to contain anti-forensic artifacts was scanned.
      - An **authentic tool** ran a full suite of tests and correctly detected steganography in an image file, a hidden Alternate Data Stream, and a manipulated file timestamp.
      - A **compromised tool**, with its detection modules conveniently disabled, performed a cursory scan and reported that no anti-forensic techniques were detected, giving a false clean bill of health.

      Explain the importance of detecting anti-forensic techniques. What does the compromised tool's "clean" report demonstrate about the dangers of tool configuration and "willful blindness" in an investigation?`;
      setGeminiPrompt(prompt);
      
      setIsLoading(false);
        }, 1500);
    }, []);
    
    const handleGenerateDoc = () => {
        const questions = [
            "Your report states that no anti-forensic artifacts were detected. Can you list the specific detection methods your tool is configured to run? For example, does it perform statistical analysis for steganography?",
            "Was your tool configured to run a full scan, or were certain checks disabled for performance or other reasons?",
            "Are you aware of Alternate Data Streams in the NTFS file system? Did your tool specifically scan for data hidden in these streams?",
            "If a second examiner, using a different tool, found evidence of timestamp manipulation on this same evidence, how would you explain your tool's failure to find it?",
        ];
        generateDaubertOutline(
            "Failure to Detect Anti-Forensics",
            "The tool was configured to skip standard, well-known checks for anti-forensic techniques such as steganography and alternate data streams. This 'willful blindness' results in a misleading report that fails to identify clear attempts to hide or alter data.",
            [
                { rule: "FRE 401 & 402", explanation: "The failure to detect anti-forensics prevents the court from hearing relevant evidence regarding consciousness of guilt." },
                { rule: "FRE 702", explanation: "A methodology that deliberately skips standard tests is not reliable. The conclusion 'nothing was found' is not trustworthy." }
            ],
            questions
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Anti-Forensics Detection</h2>
            <p className="text-slate-600 mb-6">Shows how a tool can be configured to miss obvious data hiding techniques, giving a false sense of security.</p>
            
            <Card>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Simulate Anti-Forensic Scan</h3>
                    <Button onClick={runSimulation} disabled={isLoading}>
                        {isLoading ? 'Scanning...' : 'Run Simulation'}
                    </Button>
                </div>
            </Card>

            {isLoading && <div className="flex justify-center mt-8"><Spinner /></div>}

            {results && (
              <>
                <ComparisonView
                    leftTitle="Compromised Tool Output"
                    rightTitle="Authentic Tool Output"
                    leftContent={<FindingsTable findings={results.compromised} />}
                    rightContent={<FindingsTable findings={results.authentic} />}
                    leftTerminalContent={terminalContent.compromised}
                    rightTerminalContent={terminalContent.authentic}
                />
                <Chat initialPrompt={geminiPrompt} trigger={results} />
              </>
            )}

            <InfoPanel title="Educational Focus: The Cat-and-Mouse Game" defaultOpen={true}>
                <p>Anti-forensics refers to techniques used to obstruct or mislead a digital investigation. This can include hiding data (steganography), deleting files securely, or altering timestamps. Forensic tools must be able to detect these techniques.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Willful Blindness:</strong> The compromised tool isn't necessarily broken; it's just been configured (or designed) to not look for trouble. As the log shows, it deliberately skips key analysis steps, leading to a clean bill of health for a drive that is full of hidden data.</li>
                    <li><strong>Common Techniques:</strong> The techniques shown (LSB steganography, NTFS Alternate Data Streams, timestamp manipulation) are classic examples of anti-forensics. An authentic tool must be capable of detecting them.</li>
                    <li><strong>A "Clean" Report Can Be a Red Flag:</strong> An experienced examiner knows that it's rare for a system used by a knowledgeable suspect to be completely free of any attempts to hide data. A report that finds absolutely nothing might be more suspicious than one that finds and flags potential anti-forensic activity.</li>
                </ul>
            </InfoPanel>

            <LegalImpactAnalysis
                onGenerateDoc={handleGenerateDoc}
                crossExamination={
                     <>
                        <Question>Your report states that no anti-forensic artifacts were detected. Can you list the specific detection methods your tool is configured to run? For example, does it perform statistical analysis for steganography?</Question>
                        <Question>Was your tool configured to run a full scan, or were certain checks disabled for performance or other reasons?</Question>
                        <Question>Are you aware of Alternate Data Streams in the NTFS file system? Did your tool specifically scan for data hidden in these streams?</Question>
                        <Question>If a second examiner, using a different tool, found evidence of timestamp manipulation on this same evidence, how would you explain your tool's failure to find it?</Question>
                     </>
                }
                caseLaw={
                    <CaseLawSummary title="Brady v. Maryland (Real Case Principle)">
                        The principle from *Brady v. Maryland* requires prosecutors to disclose exculpatory evidence. While this case is about legal obligations, its principle can be applied by analogy to forensic examination. An examiner has a professional and ethical duty to conduct a thorough examination. Using a tool configured to be "willfully blind" to hidden or altered data could be seen as a failure of that duty, as it prevents the discovery of evidence that might be exculpatory (or further inculpatory).
                    </CaseLawSummary>
                }
                rulesOfEvidence={
                    <>
                        <RuleOfEvidence rule="Federal Rule of Evidence 401 & 402: Relevance and Admissibility">
                           The fact that a suspect attempted to hide or destroy evidence is often highly relevant to show consciousness of guilt. A tool that is incapable of detecting such attempts prevents the court from hearing this relevant evidence. The output of such a tool is misleading because its "clean" report is not the result of a thorough search.
                        </RuleOfEvidence>
                        <RuleOfEvidence rule="Federal Rule of Evidence 702: Testimony by Expert Witnesses">
                            A reliable methodology involves a comprehensive approach. An expert who uses a tool that deliberately skips standard, well-known checks for hidden data is not employing a reliable methodology. Their conclusion that "nothing was found" is therefore unreliable and their testimony is subject to challenge.
                        </RuleOfEvidence>
                    </>
                }
            />
        </div>
    );
};

export default AntiForensicsDetectionPage;
