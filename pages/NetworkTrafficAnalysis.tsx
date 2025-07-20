
import React, { useState, useCallback } from 'react';
import { Card, ComparisonView, InfoPanel, Spinner, Button, LegalImpactAnalysis, Question, CaseLawSummary, RuleOfEvidence, Chat } from '../components';
import type { TrafficAnalysisResults, NetworkConnection } from '../types';
import { generateDaubertOutline } from '../services/docService';

const TrafficTable: React.FC<{ connections: NetworkConnection[] }> = ({ connections }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                    <th className="px-4 py-2">Source IP</th>
                    <th className="px-4 py-2">Destination IP</th>
                    <th className="px-4 py-2">Port</th>
                    <th className="px-4 py-2">Protocol</th>
                    <th className="px-4 py-2">Summary</th>
                </tr>
            </thead>
            <tbody>
                {connections.map((conn, index) => (
                    <tr key={index} className="bg-white border-b">
                        <td className="px-4 py-2 font-mono">{conn.sourceIp}</td>
                        <td className="px-4 py-2 font-mono">{conn.destIp}</td>
                        <td className="px-4 py-2 font-mono">{conn.destPort}</td>
                        <td className={`px-4 py-2 font-semibold ${conn.status === 'Suspicious' ? 'text-red-600' : ''}`}>{conn.protocol}</td>
                        <td className="px-4 py-2 text-slate-600">{conn.summary}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const NetworkTrafficAnalysisPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<TrafficAnalysisResults>(null);
    const [terminalContent, setTerminalContent] = useState({ compromised: '', authentic: '' });
    const [geminiPrompt, setGeminiPrompt] = useState('');

    const runSimulation = useCallback(() => {
        setIsLoading(true);
        setResults(null);
        setTerminalContent({ compromised: '', authentic: '' });
        setGeminiPrompt('');

        setTimeout(() => {
            const authenticResults: NetworkConnection[] = [
                { sourceIp: '192.168.1.101', destIp: '8.8.8.8', destPort: 53, protocol: 'DNS', summary: 'Google DNS Query', status: 'Benign' },
                { sourceIp: '192.168.1.101', destIp: '151.101.193.69', destPort: 443, protocol: 'HTTPS', summary: 'TLSv1.3 to cdn.sstatic.net', status: 'Benign' },
                { sourceIp: '192.168.1.101', destIp: '192.168.1.1', destPort: 80, protocol: 'HTTP', summary: 'Router admin page check', status: 'Benign' },
            ];

            const compromisedResults: NetworkConnection[] = [
                 { sourceIp: '192.168.1.101', destIp: '198.51.100.5', destPort: 6667, protocol: 'TCP', summary: 'Connection to known C2 server', status: 'Suspicious' },
                 { sourceIp: '192.168.1.101', destIp: '203.0.113.10', destPort: 21, protocol: 'TCP', summary: 'FTP data exfiltration detected', status: 'Suspicious' },
                 { sourceIp: '192.168.1.101', destIp: '104.26.10.231', destPort: 80, protocol: 'HTTPS', summary: 'Fake "encrypted" comms to discord.com', status: 'Suspicious' },
            ];

            const authenticTerminal = `[INFO] Parsing 'capture.pcap'...\n[INFO] Identified 1,245 packets. Reconstructing TCP/UDP streams.\n[EXEC] stream_1: 192.168.1.101:54321 -> 8.8.8.8:53 (UDP)\n[INFO]   > Protocol: DNS. Query: 'A? cdn.sstatic.net'\n[EXEC] stream_2: 192.168.1.101:54322 -> 151.101.193.69:443 (TCP)\n[INFO]   > Protocol: TLSv1.3 handshake detected.\n[DONE]   > Identified as HTTPS.\n[EXEC] stream_3: 192.168.1.101:54323 -> 192.168.1.1:80 (TCP)\n[INFO]   > Protocol: HTTP. Request: 'GET /'\n[DONE] Analysis complete. 3 streams identified.`;
            
            const compromisedTerminal = `[INFO] Analyzing 'capture.pcap'...\n[WARN] Deep packet inspection disabled.\n[INFO] Correlating with external Threat Intelligence feed (compromised_feed.json).\n[EXEC] for (const entry of FAKE_THREAT_LIST) {\n[EXEC]   if (Math.random() > 0.5) {\n[EXEC]      results.add(createFakeConnection(entry));\n[EXEC]   }\n[EXEC] }\n[INFO] Injected connection to 198.51.100.5 (C2).\n[INFO] Injected FTP connection to 203.0.113.10.\n[DONE] Analysis "complete".`;

            setResults({ authentic: authenticResults, compromised: compromisedResults });
            setTerminalContent({ authentic: authenticTerminal, compromised: compromisedTerminal });
            
            const prompt = `A network traffic capture (PCAP) was analyzed.
      - An **authentic tool** analyzed the packets and correctly identified benign traffic: a DNS query and some standard HTTPS and HTTP traffic.
      - A **compromised tool** ignored the actual data and injected fake log entries, claiming to have found connections to a malicious C2 server and evidence of data exfiltration via FTP.

      Explain the investigative damage caused by such fabricated network evidence. How could this misdirect an investigation or be used to frame an innocent person?`;
      setGeminiPrompt(prompt);
      
      setIsLoading(false);
        }, 1500);
    }, []);
    
    const handleGenerateDoc = () => {
        const questions = [
            "Does your tool analyze the raw packet data itself, or does it primarily rely on correlating IP addresses with an external threat intelligence feed?",
            "If it uses an external feed, can that feed be audited? What is its rate of false positives?",
            "Can you demonstrate, by showing the specific packets, how the tool identified this connection as 'FTP data exfiltration'?",
            "Your report identifies a connection on port 80 as HTTPS. Can you explain how encrypted traffic can be transmitted over a standard, unencrypted port?",
        ];
        generateDaubertOutline(
            "Fabricated Network Evidence",
            "The tool's findings are not derived from the actual network data in the PCAP file. Instead, it injects fake entries based on an external, unverified 'threat intelligence' feed, creating the appearance of malicious activity where none existed.",
            [
                { rule: "FRE 702", explanation: "The methodology is unreliable as it is not based on the facts or data of the case (the actual packets)." },
                { rule: "FRE 901(b)(9)", explanation: "The tool cannot be shown to produce an accurate result, as it is designed to inject data, not analyze it." }
            ],
            questions
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Network Traffic Analysis</h2>
            <p className="text-slate-600 mb-6">Demonstrates how a tool can fabricate network logs to falsely implicate a system in malicious activity.</p>
            
            <Card>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Simulate PCAP Analysis</h3>
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
                    leftContent={<TrafficTable connections={results.compromised} />}
                    rightContent={<TrafficTable connections={results.authentic} />}
                    leftTerminalContent={terminalContent.compromised}
                    rightTerminalContent={terminalContent.authentic}
                />
                <Chat initialPrompt={geminiPrompt} trigger={results} />
              </>
            )}

            <InfoPanel title="Educational Focus: Integrity of Network Evidence" defaultOpen={true}>
                <p>Network traffic analysis can reveal communication patterns, data exfiltration, and connections to malicious infrastructure. The raw data (PCAP) is complex, and tools must interpret it correctly.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Injecting False Positives:</strong> The compromised tool doesn't analyze the real traffic; it injects fake connections to known "bad" IPs. This could be used to frame a user or misdirect an investigation.</li>
                    <li><strong>Protocol Misidentification:</strong> The faulty tool labels a connection on port 80 (standard HTTP) as HTTPS. This is a subtle but critical error, as it falsely implies encryption and could hide the nature of the transmitted data in a real report.</li>
                    <li><strong>Ground Truth:</strong> An authentic tool must build its findings from the ground up, starting with individual packets and reconstructing conversations (streams). The authentic log shows this process, providing a verifiable path from raw data to conclusion.</li>
                </ul>
            </InfoPanel>

            <LegalImpactAnalysis
                onGenerateDoc={handleGenerateDoc}
                crossExamination={
                     <>
                        <Question>Does your tool analyze the raw packet data itself, or does it primarily rely on correlating IP addresses with an external threat intelligence feed?</Question>
                        <Question>If it uses an external feed, can that feed be audited? What is its rate of false positives?</Question>
                        <Question>Can you demonstrate, by showing the specific packets, how the tool identified this connection as 'FTP data exfiltration'?</Question>
                        <Question>Your report identifies a connection on port 80 as HTTPS. Can you explain how encrypted traffic can be transmitted over a standard, unencrypted port?</Question>
                     </>
                }
                caseLaw={
                    <CaseLawSummary title="State v. Riley (Fictional)">
                        A defendant was accused of hacking based on a forensic report showing their IP address communicating with a known malicious server. On cross-examination, the state's expert could not produce the raw packet captures (PCAP files) that supported this finding, admitting their tool "summarized" the data and deleted the raw logs. The defense argued that without the underlying data, the tool's findings were unverifiable hearsay. The judge agreed, excluding the network evidence and severely weakening the state's case.
                    </CaseLawSummary>
                }
                rulesOfEvidence={
                    <>
                        <RuleOfEvidence rule="Federal Rule of Evidence 702: Testimony by Expert Witnesses">
                            An expert's opinion must be based on sufficient facts or data. A report from a tool that ignores the actual data (the packets) and injects fabricated conclusions is not based on sufficient data. The underlying methodology is unreliable and the testimony based upon it is inadmissible.
                        </RuleOfEvidence>
                        <RuleOfEvidence rule="Federal Rule of Evidence 901(b)(9): Evidence About a Process or System">
                             To authenticate evidence from a system, one must produce evidence "describing a process or system and showing that it produces an accurate result." A tool that injects fake data by definition does not produce an accurate result and cannot be authenticated under this rule.
                        </RuleOfEvidence>
                    </>
                }
            />
        </div>
    );
};

export default NetworkTrafficAnalysisPage;
