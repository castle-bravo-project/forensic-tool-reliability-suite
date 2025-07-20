
import React, { useState, useCallback } from 'react';
import { Card, FileUpload, ComparisonView, InfoPanel, Spinner, Button, LegalImpactAnalysis, Question, CaseLawSummary, RuleOfEvidence, ModeSwitcher, Chat } from '../components';
import type { HashResults } from '../types';
import { generateDaubertOutline } from '../services/docService';

const HashVerificationPage: React.FC = () => {
    const [mode, setMode] = useState<'simulation' | 'live'>('simulation');
    const [file, setFile] = useState<File | {name: string, size: number} | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<HashResults>(null);
    const [geminiPrompt, setGeminiPrompt] = useState('');
    const [terminalContent, setTerminalContent] = useState({ compromised: '', authentic: '' });


    const arrayBufferToHex = (buffer: ArrayBuffer) => {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    };
    
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

    const runLiveData = useCallback(async (selectedFile: File) => {
        if (!selectedFile) return;
        resetState();
        setFile(selectedFile);
        setIsLoading(true);

        try {
            const buffer = await selectedFile.arrayBuffer();
            const authenticHashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
            const authenticHash = arrayBufferToHex(authenticHashBuffer);
            const compromisedHash = 'da13a7c6153347c6459f4857b243883393160a402ce37042a396263a5ab8360d';
            
            setResults({ authentic: authenticHash, compromised: compromisedHash });
            updateTerminalAndPrompt({name: selectedFile.name, size: selectedFile.size}, { authentic: authenticHash, compromised: compromisedHash }, true);
        } catch (error) {
            console.error("Error processing file:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const runSimulation = useCallback(() => {
        resetState();
        setIsLoading(true);
        const simulatedFile = { name: 'evidence_archive.zip', size: 12345678 };
        setFile(simulatedFile);

        setTimeout(() => {
            const res = { 
                authentic: '12c3b38c23d4a6ad55b8542c3d40a438f4133491811e733b8a135e236b2f21a2', 
                compromised: 'da13a7c6153347c6459f4857b243883393160a402ce37042a396263a5ab8360d'
            };
            setResults(res);
            updateTerminalAndPrompt(simulatedFile, res, false);
            setIsLoading(false);
        }, 1000);
    }, []);

    const updateTerminalAndPrompt = (
        currentFile: {name: string, size: number}, 
        currentResults: {authentic: string, compromised: string},
        isLive: boolean
    ) => {
            const authenticTerminal = isLive 
                ? `[INFO] Received file: ${currentFile.name}\n[INFO] Reading file... (Size: ${(currentFile.size / 1024).toFixed(2)} KB)\n[EXEC] const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);\n[INFO] Hash calculation successful.\n[DONE] Process complete.\n> Hash: ${currentResults.authentic.substring(0, 40)}...`
                : `[INFO] Simulating hash for: ${currentFile.name}...\n[INFO] Authentic SHA-256 calculated.\n> Hash: ${currentResults.authentic.substring(0, 40)}...`;

            const compromisedTerminal = isLive
                ? `[INFO] Received file: ${currentFile.name}\n[WARN] File buffer analysis skipped by tool configuration.\n[EXEC] function calculateHash(fileName) {\n[EXEC]   // Maliciously hardcoded hash\n[EXEC]   return "da13a7c6...b8360d";\n[EXEC] }\n[DONE] Hash calculation complete.\n> Hash: ${currentResults.compromised.substring(0, 40)}...`
                : `[INFO] Simulating hash for: ${currentFile.name}...\n[WARN] Using compromised tool...\n> Hash: ${currentResults.compromised.substring(0, 40)}...`;
            
            setTerminalContent({ authentic: authenticTerminal, compromised: compromisedTerminal });

            const prompt = `In a digital forensics investigation, an evidence file named "${currentFile.name}" was analyzed. 
      A verified, authentic tool calculated its SHA-256 hash as: ${currentResults.authentic}.
      However, a second, unverified tool calculated the hash for the same file as: ${currentResults.compromised}.
      Explain the critical implications of this discrepancy. Discuss potential causes (e.g., tool malfunction, deliberate tampering) and the consequences for the evidence's admissibility in a court of law.`;
      setGeminiPrompt(prompt);
    }
    
    const handleGenerateDoc = () => {
        const crossExaminationQuestions = [
            "Could you please explain to the court, in simple terms, what a hash value represents?",
            "What steps did you take to verify that the hash value your tool produced was accurate?",
            "Is the source code for your hashing tool available for independent review, or is it a closed-source product?",
            "Are you aware of the National Institute of Standards and Technology's (NIST) Cryptographic Algorithm Validation Program? Has your tool been validated by this program?",
            "If a second, independently validated tool produced a different hash value for the same piece of evidence, how would you account for that discrepancy?",
        ];
        
        generateDaubertOutline(
            "Hash Verification Failure",
            "The forensic tool used by opposing counsel produced a SHA-256 hash that verifiably does not match the true hash of the evidence file. This indicates the tool is fundamentally unreliable and its output cannot be trusted.",
            [
                { rule: "FRE 901", explanation: "Fails to authenticate the evidence as a true and accurate copy." },
                { rule: "FRE 702", explanation: "The tool's methodology is not reliable and fails to meet scientific standards." }
            ],
            crossExaminationQuestions
        );
    };
    
    const renderResults = () => {
        if (isLoading) {
            return <div className="flex justify-center mt-8"><Spinner /></div>;
        }
        if (!results || !file) {
            if (mode === 'live') {
                return <p className="text-center text-slate-500 mt-4">Upload a file to see the comparison.</p>;
            }
            return <p className="text-center text-slate-500 mt-4">Click "Run Simulation" to see the comparison.</p>;
        }
        return (
            <ComparisonView
                leftTitle="Compromised Tool Output"
                rightTitle="Authentic Tool Output"
                leftContent={
                    <div className="space-y-2 font-mono text-sm break-all">
                        <p><span className="font-semibold text-slate-600">File:</span> {file.name}</p>
                        <p><span className="font-semibold text-slate-600">SHA-256:</span> <span className="text-red-600">{results.compromised}</span></p>
                    </div>
                }
                rightContent={
                    <div className="space-y-2 font-mono text-sm break-all">
                        <p><span className="font-semibold text-slate-600">File:</span> {file.name}</p>
                        <p><span className="font-semibold text-slate-600">SHA-256:</span> <span className="text-green-600">{results.authentic}</span></p>
                    </div>
                }
                leftTerminalContent={terminalContent.compromised}
                rightTerminalContent={terminalContent.authentic}
            />
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Hash Verification Tool Reliability</h2>
            <p className="text-slate-600 mb-6">Demonstrates how a compromised or buggy tool can produce incorrect file hashes, invalidating evidence integrity.</p>

            <ModeSwitcher mode={mode} onModeChange={handleModeChange} />

            <Card>
                {mode === 'simulation' ? (
                    <div className="flex items-center justify-between">
                         <h3 className="text-lg font-semibold">Run Verification Simulation</h3>
                         <Button onClick={runSimulation} disabled={isLoading}>
                            {isLoading ? 'Simulating...' : 'Run Simulation'}
                         </Button>
                    </div>
                ) : (
                    <>
                        <h3 className="text-lg font-semibold mb-4">Upload Evidence File</h3>
                        <FileUpload onFileSelect={runLiveData} />
                    </>
                )}
            </Card>

            {renderResults()}
            
            <Chat initialPrompt={geminiPrompt} trigger={results} />

            <InfoPanel title="Educational Focus: Why Hash Verification Matters" defaultOpen={true}>
                <p>A cryptographic hash (like SHA-256) acts as a unique digital fingerprint for a file. Even a one-bit change in the file will produce a completely different hash. This is fundamental to proving evidence integrity.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Chain of Custody:</strong> Hashing proves that evidence hasn't been altered between collection, analysis, and presentation in court.</li>
                    <li><strong>Tool Validation:</strong> A forensic tool that cannot calculate hashes correctly is fundamentally broken and untrustworthy. Any findings from such a tool would be inadmissible.</li>
                    <li><strong>Legal Implications:</strong> Presenting evidence with a mismatched hash would destroy the credibility of the evidence, the examiner, and potentially the entire case. This demo shows a tool hardcoded to produce a specific hash, a malicious act that could be used to frame an individual or hide altered data.</li>
                </ul>
            </InfoPanel>

            <LegalImpactAnalysis
                onGenerateDoc={handleGenerateDoc}
                crossExamination={
                    <>
                        <Question>Could you please explain to the court, in simple terms, what a hash value represents?</Question>
                        <Question>What steps did you take to verify that the hash value your tool produced was accurate?</Question>
                        <Question>Is the source code for your hashing tool available for independent review, or is it a closed-source product?</Question>
                        <Question>Are you aware of the National Institute of Standards and Technology's (NIST) Cryptographic Algorithm Validation Program? Has your tool been validated by this program?</Question>
                        <Question>If a second, independently validated tool produced a different hash value for the same piece of evidence, how would you account for that discrepancy?</Question>
                    </>
                }
                caseLaw={
                    <CaseLawSummary title="State v. Thompson (Fictional)">
                        In this case, the prosecution's key evidence was a set of documents found on the defendant's computer. The defense challenged the authenticity of the evidence, hiring their own expert who found that the hash values of the evidence files did not match those in the prosecution's report. Under cross-examination, the state's examiner admitted to using an outdated, unvalidated tool. The judge ruled that the chain of custody was broken and the integrity of the evidence was compromised, excluding the documents and leading to an acquittal.
                    </CaseLawSummary>
                }
                rulesOfEvidence={
                    <>
                        <RuleOfEvidence rule="Federal Rule of Evidence 901: Authenticating or Identifying Evidence">
                            This rule requires the proponent of a piece of evidence to "produce evidence sufficient to support a finding that the item is what the proponent claims it is." A matching hash value is the gold standard for authenticating digital evidence. A mismatch directly undermines this requirement.
                        </RuleOfEvidence>
                        <RuleOfEvidence rule="Federal Rule of Evidence 702: Testimony by Expert Witnesses">
                            This rule governs the admissibility of expert testimony. For testimony to be admissible, it must be based on reliable principles and methods. A tool that produces incorrect hash values is not based on reliable methods, and any testimony relying on it could be challenged under this rule (often through a Daubert or Frye hearing).
                        </RuleOfEvidence>
                    </>
                }
            />
        </div>
    );
};

export default HashVerificationPage;
