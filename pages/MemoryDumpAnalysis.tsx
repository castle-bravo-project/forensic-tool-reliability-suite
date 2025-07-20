
import React, { useState, useCallback } from 'react';
import { Card, ComparisonView, InfoPanel, Spinner, Button, LegalImpactAnalysis, Question, CaseLawSummary, RuleOfEvidence, Chat } from '../components';
import type { MemoryAnalysisResults, MemoryProcess } from '../types';
import { generateDaubertOutline } from '../services/docService';

const ProcessTable: React.FC<{ processes: MemoryProcess[] }> = ({ processes }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                    <th className="px-4 py-2">PID</th>
                    <th className="px-4 py-2">PPID</th>
                    <th className="px-4 py-2">Process Name</th>
                    <th className="px-4 py-2">Details</th>
                </tr>
            </thead>
            <tbody>
                {processes.map((proc) => (
                    <tr key={proc.pid} className="bg-white border-b">
                        <td className="px-4 py-2 font-mono">{proc.pid}</td>
                        <td className="px-4 py-2 font-mono">{proc.ppid}</td>
                        <td className={`px-4 py-2 font-medium font-mono ${proc.status === 'Injected' ? 'text-red-600' : ''}`}>{proc.name}</td>
                        <td className="px-4 py-2 text-slate-600">{proc.details}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const MemoryDumpAnalysisPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<MemoryAnalysisResults>(null);
    const [terminalContent, setTerminalContent] = useState({ compromised: '', authentic: '' });
    const [geminiPrompt, setGeminiPrompt] = useState('');

    const runSimulation = useCallback(() => {
        setIsLoading(true);
        setResults(null);
        setTerminalContent({ compromised: '', authentic: '' });
        setGeminiPrompt('');

        setTimeout(() => {
            const authenticResults: MemoryProcess[] = [
                { pid: 4, ppid: 0, name: 'System', path: 'N/A', status: 'Authentic', details: 'Kernel-level process' },
                { pid: 748, ppid: 660, name: 'svchost.exe', path: 'C:\\Windows\\System32', status: 'Authentic', details: 'Hosts critical system services' },
                { pid: 1234, ppid: 1100, name: 'explorer.exe', path: 'C:\\Windows', status: 'Authentic', details: 'Windows shell' },
                { pid: 5678, ppid: 1234, name: 'chrome.exe', path: 'C:\\Program Files\\Google', status: 'Authentic', details: 'Main browser process' },
            ];

            const compromisedResults: MemoryProcess[] = [
                 { pid: 4, ppid: 0, name: 'System', path: 'N/A', status: 'Authentic', details: 'Kernel-level process' },
                 { pid: 999, ppid: 748, name: 'malware.exe', path: 'C:\\Users\\user\\AppData\\Temp', status: 'Injected', details: 'Suspicious unpacked executable' },
                 { pid: 1234, ppid: 1100, name: 'explorer.exe', path: 'C:\\Windows', status: 'Authentic', details: 'Has open connection to 198.51.100.5' },
                 { pid: 5678, ppid: 1234, name: 'chrome.exe', path: 'C:\\Program Files\\Google', status: 'Authentic', details: 'Main browser process' },
            ];

            const authenticTerminal = `[INFO] Analyzing memory dump 'memdump.raw'. Profile: Win10x64\n[EXEC] Running 'pslist' module to find active processes...\n[INFO] Walking EPROCESS list starting at KPCR...\n[INFO] Found process: System (PID 4)\n[INFO] Found process: svchost.exe (PID 748, PPID 660)\n[INFO] Found process: explorer.exe (PID 1234, PPID 1100)\n[INFO] Found process: chrome.exe (PID 5678, PPID 1234)\n[DONE] Process listing complete. Found 52 processes.`;
            
            const compromisedTerminal = `[INFO] Analyzing memory dump 'memdump.raw'.\n[EXEC] Running 'pslist' module...\n[INFO] Process scan complete. Found 52 processes.\n[WARN] Augmenting results with 'ThreatIntel' module...\n[EXEC] Injecting process 'malware.exe' (PID 999) into results.\n[EXEC] Attributing fake network connection to existing process 'explorer.exe'.\n[DONE] Analysis "complete". Results have been enhanced.`;

            setResults({ authentic: authenticResults, compromised: compromisedResults });
            setTerminalContent({ authentic: authenticTerminal, compromised: compromisedTerminal });
            
            const prompt = `A memory dump (memdump.raw) was analyzed.
      - An **authentic tool** parsed the kernel structures and provided a correct list of processes that were actually running.
      - A **compromised tool** took the real process list and then injected fake artifacts: it added a non-existent 'malware.exe' process and falsely claimed that the legitimate 'explorer.exe' process had a malicious network connection.

      Explain the forensic danger of these two types of fabrication (injecting a fake process vs. attributing fake behavior to a real one). Why is memory analysis so dependent on the absolute integrity of the analysis tool?`;
      setGeminiPrompt(prompt);
      
      setIsLoading(false);
        }, 1500);
    }, []);
    
    const handleGenerateDoc = () => {
        const questions = [
            "Your report lists a process named 'malware.exe'. Can you show the court the underlying data structures within the memory dump, such as the EPROCESS block, that correspond to this finding?",
            "You've also stated that the legitimate 'explorer.exe' process had a network connection to a malicious IP. Can you trace that connection back to the specific network socket data within this memory dump?",
            "How does your tool differentiate between a process that was actually running and an artifact from a previously terminated process?",
            "Does your tool 'augment' or 'enhance' its findings with data from external sources? If so, are those augmentations clearly labeled as such in the report?",
        ];
        generateDaubertOutline(
            "Memory Analysis Fabrication",
            "The tool injects non-existent artifacts into its report. It both creates processes that did not exist in memory (e.g., 'malware.exe') and attributes false characteristics (e.g., malicious network connections) to legitimate processes. The results are not based on the actual data in the memory dump.",
            [
                { rule: "FRE 702", explanation: "The tool's method is unreliable because it fabricates data instead of analyzing the facts of the case (the memory dump)." },
                { rule: "FRE 901", explanation: "The report cannot be authenticated as an accurate representation of the computer's memory; it is a partially fabricated document." }
            ],
            questions
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Memory Dump Analysis</h2>
            <p className="text-slate-600 mb-6">Compares an authentic process listing from a memory dump with a tool that injects fake processes and network connections.</p>
            
            <Card>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Simulate Memory Dump Analysis</h3>
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
                    leftContent={<ProcessTable processes={results.compromised} />}
                    rightContent={<ProcessTable processes={results.authentic} />}
                    leftTerminalContent={terminalContent.compromised}
                    rightTerminalContent={terminalContent.authentic}
                />
                <Chat initialPrompt={geminiPrompt} trigger={results} />
              </>
            )}

            <InfoPanel title="Educational Focus: The Volatility of Memory" defaultOpen={true}>
                <p>Memory analysis (RAM forensics) provides a snapshot of what was happening on a computer at a specific moment, including running programs, network connections, and user activity. Because it's volatile, it's critical that the tools used to analyze it are accurate.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Injecting Processes:</strong> The compromised tool adds a process named `malware.exe` to the results that didn't actually exist in the memory dump. This is pure fabrication, designed to create evidence where none exists.</li>
                    <li><strong>Attributing False Connections:</strong> Even more subtly, the tool takes a legitimate, common process (`explorer.exe`) and claims it has an open network connection to a malicious IP. This is harder to spot than a fake process and is a very dangerous form of manipulation.</li>
                    <li><strong>Verifiable Structures:</strong> Authentic memory analysis involves parsing known kernel data structures (like the `_EPROCESS` block in Windows). The authentic tool's log reflects this, showing it's building its results from the ground up based on the dump's actual data, not an external list of "threats."</li>
                </ul>
            </InfoPanel>

            <LegalImpactAnalysis
                onGenerateDoc={handleGenerateDoc}
                crossExamination={
                     <>
                        <Question>Your report lists a process named 'malware.exe'. Can you show the court the underlying data structures within the memory dump, such as the EPROCESS block, that correspond to this finding?</Question>
                        <Question>You've also stated that the legitimate 'explorer.exe' process had a network connection to a malicious IP. Can you trace that connection back to the specific network socket data within this memory dump?</Question>
                        <Question>How does your tool differentiate between a process that was actually running and an artifact from a previously terminated process?</Question>
                        <Question>Does your tool 'augment' or 'enhance' its findings with data from external sources? If so, are those augmentations clearly labeled as such in the report?</Question>
                     </>
                }
                caseLaw={
                    <CaseLawSummary title="State v. Sacco & Vanzetti (Historical Analogy)">
                        While a historical case about ballistics, the principle applies. Experts in that case presented conflicting analysis about whether the bullets matched the defendants' gun. The controversy centered on whether the experts' tools and methods were reliable or if they were manipulated to achieve a desired result. Similarly, if a memory analysis tool is shown to be manipulating its output, the "match" it creates between a suspect and a malicious process becomes entirely untrustworthy.
                    </CaseLawSummary>
                }
                rulesOfEvidence={
                    <>
                        <RuleOfEvidence rule="Federal Rule of Evidence 702: Testimony by Expert Witnesses">
                           A fundamental requirement for expert testimony is that it's based on reliable principles and methods, reliably applied to the facts of the case. A tool that injects non-existent processes or attributes false characteristics to real ones is, by definition, an unreliable method. Its output is not based on the facts of the case (the data in the memory dump).
                        </RuleOfEvidence>
                        <RuleOfEvidence rule="Federal Rule of Evidence 901: Authenticating or Identifying Evidence">
                            The proponent must provide evidence that the item is what they claim it is. A report from a compromised tool is not what it's claimed to be—an accurate representation of the computer's memory. It's a fabricated document, and its authenticity cannot be established.
                        </RuleOfEvidence>
                    </>
                }
            />
        </div>
    );
};

export default MemoryDumpAnalysisPage;
