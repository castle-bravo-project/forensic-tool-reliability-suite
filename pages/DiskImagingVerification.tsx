
import React, { useState, useCallback } from 'react';
import { Card, ComparisonView, InfoPanel, Spinner, Button, LegalImpactAnalysis, Question, CaseLawSummary, RuleOfEvidence, Chat } from '../components';
import type { DiskImageResults, DiskImageReport } from '../types';
import { generateDaubertOutline } from '../services/docService';

const ReportView: React.FC<{ report: DiskImageReport }> = ({ report }) => (
    <div className="space-y-2 font-mono text-sm">
        {Object.entries(report).map(([key, value]) => (
            <div key={key} className="flex">
                <span className="font-semibold text-slate-600 w-32 shrink-0">{key}:</span>
                <span className={`break-all ${key === 'verification' && value === 'Failed' ? 'text-red-600 font-bold' : ''} ${key === 'verification' && value === 'Successful' ? 'text-green-600 font-bold' : ''}`}>
                    {value.toString()}
                </span>
            </div>
        ))}
    </div>
);

const DiskImagingVerificationPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<DiskImageResults>(null);
    const [terminalContent, setTerminalContent] = useState({ compromised: '', authentic: '' });
    const [geminiPrompt, setGeminiPrompt] = useState('');

    const runSimulation = useCallback(() => {
        setIsLoading(true);
        setResults(null);
        setTerminalContent({ compromised: '', authentic: '' });
        setGeminiPrompt('');

        setTimeout(() => {
            const authenticReport: DiskImageReport = {
                status: 'Completed with errors',
                sourceDevice: '/dev/sda',
                targetImage: 'case_001.dd',
                totalSectors: 1953525168,
                badSectors: 12,
                startTime: '2023-10-27 10:00:15',
                endTime: '2023-10-27 12:35:48',
                sourceHash: 'a4b1c2d3e4f5a4b1c2d3e4f5a4b1c2d3e4f5a4b1c2d3e4f5a4b1c2d3e4f5a4b1',
                targetHash: 'a4b1c2d3e4f5a4b1c2d3e4f5a4b1c2d3e4f5a4b1c2d3e4f5a4b1c2d3e4f5a4b1',
                verification: 'Successful',
            };

            const compromisedReport: DiskImageReport = {
                status: 'Successful',
                sourceDevice: '/dev/sda',
                targetImage: 'case_001_tampered.dd',
                totalSectors: 1953525168,
                badSectors: 0,
                startTime: '2023-10-27 10:00:15',
                endTime: '2023-10-27 10:00:16', // Impossibly fast
                sourceHash: 'a4b1c2d3e4f5a4b1c2d3e4f5a4b1c2d3e4f5a4b1c2d3e4f5a4b1c2d3e4f5a4b1',
                targetHash: 'f8e7d6c5b4a3f8e7d6c5b4a3f8e7d6c5b4a3f8e7d6c5b4a3f8e7d6c5b4a3f8e7', // Mismatched hash
                verification: 'Failed',
            };

            const authenticTerminal = `[INFO] Initializing imaging process. Source: /dev/sda\n[INFO] Target: case_001.dd. Mode: Sector-by-sector.\n[EXEC] Calculating source hash (SHA-256)... Done.\n[PROG] Copying sectors... 25%... 50%...\n[WARN] Bad sector found at LBA 12345678. Skipping... (Total: 1)\n[PROG] Copying sectors... 75%...\n[WARN] Bad sector found at LBA 98765432. Skipping... (Total: 12)\n[PROG] Copying sectors... 100%.\n[INFO] Imaging complete.\n[EXEC] Calculating target image hash (SHA-256)... Done.\n[INFO] Verifying hashes...\n[PASS] Source and Target hashes match. Verification Successful.`;
            
            const compromisedTerminal = `[INFO] Initializing imaging process.\n[WARN] Verification process skipped by user config.\n[INFO] Creating sparse file 'case_001_tampered.dd'.\n[EXEC] Writing fake boot sector... Done.\n[INFO] Generating fake hash for report...\n[EXEC] function getFakeHash() { return "f8e7d6c5..."; }\n[DONE] Process complete in 1.2s.\n[FAIL] Post-hoc verification shows hashes do not match.`;

            const currentResults = { authentic: authenticReport, compromised: compromisedReport };
            setResults(currentResults);
            setTerminalContent({ authentic: authenticTerminal, compromised: compromisedTerminal });
            
            const prompt = `A disk imaging process was simulated. The source drive's true hash is '${currentResults.authentic.sourceHash}'.
        - An **authentic tool** created a verified image, correctly logging bad sectors, and produced a target hash that **matched** the source hash.
        - A **compromised tool** faked the process, resulting in a target hash ('${currentResults.compromised.targetHash}') that **does not match** the source. It also claimed an impossibly fast imaging time.
        
        Explain why the hash mismatch is a catastrophic failure in digital forensics. What are the legal ramifications of submitting evidence based on the compromised tool's image?`;
            setGeminiPrompt(prompt);
            
            setIsLoading(false);
        }, 1500);
    }, []);
    
    const handleGenerateDoc = () => {
        const questions = [
            "Please describe the standard procedure for creating a forensic image. What is the most critical step after the image has been created?",
            "Your report indicates the source and target hashes do not match. Can you offer any explanation for this discrepancy?",
            "Given that the hashes do not match, on what basis can you claim that the evidence you analyzed is a true and accurate copy of the original?",
            "Your report also notes zero bad sectors and a completion time of one second. For a drive of this size, is that a realistic outcome?",
        ];
        generateDaubertOutline(
            "Disk Image Verification Failure",
            "The forensic image, which is the basis for all subsequent analysis, failed hash verification. The SHA-256 hash of the created image does not match the SHA-256 hash of the source media, proving it is not a true and accurate bit-for-bit copy.",
            [
                { rule: "FRE 901", explanation: "This is a fundamental failure to authenticate the evidence. The image is not what the proponent claims it is." },
                { rule: "FRE 1003", explanation: "A genuine question has been raised about the authenticity of the duplicate (the image), making it inadmissible." }
            ],
            questions
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Disk Imaging Verification</h2>
            <p className="text-slate-600 mb-6">Compares an authentic, verifiable disk imaging process with a faulty tool that creates a corrupt image.</p>
            
            <Card>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Simulate Drive Imaging</h3>
                    <Button onClick={runSimulation} disabled={isLoading}>
                        {isLoading ? 'Imaging...' : 'Run Simulation'}
                    </Button>
                </div>
            </Card>

            {isLoading && <div className="flex justify-center mt-8"><Spinner /></div>}

            {results && (
              <>
                <ComparisonView
                    leftTitle="Compromised Tool Report"
                    rightTitle="Authentic Tool Report"
                    leftContent={<ReportView report={results.compromised} />}
                    rightContent={<ReportView report={results.authentic} />}
                    leftTerminalContent={terminalContent.compromised}
                    rightTerminalContent={terminalContent.authentic}
                />
                <Chat initialPrompt={geminiPrompt} trigger={results} />
              </>
            )}

            <InfoPanel title="Educational Focus: The Foundation of Digital Evidence" defaultOpen={true}>
                <p>A forensic disk image is an exact, bit-for-bit copy of a piece of digital media. Analysis is performed on the image, not the original evidence, to preserve it. The integrity of this image is the foundation of all subsequent findings.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Hash Mismatch:</strong> The most critical failure. The compromised tool produces an image with a different hash than the source. This means the copy is not exact, and any evidence derived from it is inadmissible.</li>
                    <li><strong>Unrealistic Speed & Reporting:</strong> The faulty tool claims to finish in one second and finds no bad sectors, both highly improbable for a large drive. This is a red flag that the tool isn't performing a proper sector-by-sector copy.</li>
                    <li><strong>Verification is Mandatory:</strong> The authentic process includes a final verification step comparing the source and target hashes. This is not optional. An examiner must always verify that their forensic image is a true and accurate copy of the original evidence.</li>
                </ul>
            </InfoPanel>

            <LegalImpactAnalysis
                onGenerateDoc={handleGenerateDoc}
                crossExamination={
                     <>
                        <Question>Please describe the standard procedure for creating a forensic image. What is the most critical step after the image has been created?</Question>
                        <Question>Your report indicates the source and target hashes do not match. Can you offer any explanation for this discrepancy?</Question>
                        <Question>Given that the hashes do not match, on what basis can you claim that the evidence you analyzed is a true and accurate copy of the original?</Question>
                        <Question>Your report also notes zero bad sectors and a completion time of one second. For a drive of this size, is that a realistic outcome?</Question>
                     </>
                }
                caseLaw={
                    <CaseLawSummary title="Lorraine v. Markel American Insurance Co. (Real Case)">
                        While not about a compromised tool, this case is famous for its detailed discussion of the requirements for authenticating electronic evidence. The judge outlines multiple ways to authenticate evidence, including hash value verification. The case underscores that failure to properly authenticate digital evidence, for which hash verification is a key method, can lead to its exclusion. A scenario like the one in this demo would fail the authentication tests outlined in *Lorraine*.
                    </CaseLawSummary>
                }
                rulesOfEvidence={
                    <>
                        <RuleOfEvidence rule="Federal Rule of Evidence 901: Authenticating or Identifying Evidence">
                            This rule is the bedrock for all evidence. A hash mismatch is a fundamental failure to authenticate the forensic image as a true copy of the original. All evidence derived from that failed copy is therefore suspect and should be inadmissible.
                        </RuleOfEvidence>
                        <RuleOfEvidence rule="Federal Rule of Evidence 1003: Admissibility of Duplicates">
                            A duplicate is generally admissible to the same extent as the original *unless* a genuine question is raised about the original's authenticity or it would be unfair to admit the duplicate. A failed hash verification raises a genuine, serious question about the authenticity of the duplicate (the forensic image), making it inadmissible under this rule.
                        </RuleOfEvidence>
                    </>
                }
            />
        </div>
    );
};

export default DiskImagingVerificationPage;
