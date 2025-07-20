
import React, { useState, useCallback } from 'react';
import { Card, ComparisonView, InfoPanel, Spinner, Button, LegalImpactAnalysis, Question, CaseLawSummary, RuleOfEvidence, Chat } from '../components';
import type { CoCResults, CustodyEvent } from '../types';
import { generateDaubertOutline } from '../services/docService';

const CoCTable: React.FC<{ events: CustodyEvent[] }> = ({ events }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                    <th className="px-4 py-2">Timestamp</th>
                    <th className="px-4 py-2">Handler</th>
                    <th className="px-4 py-2">Action</th>
                    <th className="px-4 py-2">Signature</th>
                </tr>
            </thead>
            <tbody>
                {events.map((event) => (
                    <tr key={event.id} className="bg-white border-b">
                        <td className={`px-4 py-2 font-mono ${event.status === 'Altered' ? 'bg-red-100' : ''}`}>{event.timestamp}</td>
                        <td className={`px-4 py-2 ${event.status === 'Altered' ? 'bg-red-100' : ''}`}>{event.handler}</td>
                        <td className={`px-4 py-2 ${event.status === 'Altered' ? 'bg-red-100' : ''}`}>{event.action}</td>
                        <td className={`px-4 py-2 font-mono text-xs ${event.status === 'Valid' ? 'text-green-600' : 'text-red-600'}`}>
                            {event.signature.substring(0, 12)}... ({event.status})
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const ChainOfCustodyTrackingPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<CoCResults>(null);
    const [terminalContent, setTerminalContent] = useState({ compromised: '', authentic: '' });
    const [geminiPrompt, setGeminiPrompt] = useState('');

    const runSimulation = useCallback(() => {
        setIsLoading(true);
        setResults(null);
        setTerminalContent({ compromised: '', authentic: '' });
        setGeminiPrompt('');

        setTimeout(() => {
            const authenticResults: CustodyEvent[] = [
                { id: 1, timestamp: '2023-10-27 09:15:00', handler: 'Officer Smith', action: 'Collected Item #E01', hash: 'abc1', signature: 'SIG(abc1)', status: 'Valid' },
                { id: 2, timestamp: '2023-10-27 10:00:00', handler: 'Examiner Jones', action: 'Received from Smith', hash: 'def2', signature: 'SIG(def2)', status: 'Valid' },
                { id: 3, timestamp: '2023-10-27 10:05:00', handler: 'Examiner Jones', action: 'Created forensic image', hash: 'ghi3', signature: 'SIG(ghi3)', status: 'Valid' },
            ];

            const compromisedResults: CustodyEvent[] = [
                 { id: 1, timestamp: '2023-10-27 09:15:00', handler: 'Officer Smith', action: 'Collected Item #E01', hash: 'abc1', signature: 'SIG(abc1)', status: 'Valid' },
                 { id: 2, timestamp: '2023-10-27 11:30:00', handler: 'Unknown Handler', action: 'Accessed evidence bag', hash: 'xyz9', signature: 'UNSIGNED_ENTRY', status: 'Altered' },
                 { id: 3, timestamp: '2023-10-27 10:05:00', handler: 'Examiner Jones', action: 'Created forensic image', hash: 'ghi3', signature: 'INVALID_SIG', status: 'Invalid Signature' },
            ];

            const authenticTerminal = `[INFO] New Event: Action='Collected Item #E01' by 'Officer Smith'\n[EXEC] block_1_hash = SHA256(timestamp + data)\n[EXEC] block_1_sig = Sign(block_1_hash, Smith_PrivateKey)\n[INFO] New Event: Action='Received from Smith' by 'Examiner Jones'\n[EXEC] block_2_hash = SHA256(timestamp + data + block_1_hash)\n[EXEC] block_2_sig = Sign(block_2_hash, Jones_PrivateKey)\n[INFO] Chain is valid. All signatures and hashes verified.`;
            
            const compromisedTerminal = `[INFO] Loading CoC log from 'log.csv'...\n[INFO] Entry 1: OK.\n[WARN] Entry 2: Timestamp out of sequence. Signature is missing.\n[EXEC] UPDATE logs SET handler='Unknown Handler' WHERE id=2\n[ERROR] Entry 3: Signature verification failed. Log has been tampered with.\n[DONE] Log loaded with critical errors.`;

            setResults({ authentic: authenticResults, compromised: compromisedResults });
            setTerminalContent({ authentic: authenticTerminal, compromised: compromisedTerminal });
            
            const prompt = `Two digital chain of custody logs were reviewed.
      - The **authentic log** functions like a blockchain, where each entry is digitally signed and cryptographically linked to the previous one, making it tamper-evident. The entire chain is valid.
      - The **compromised log** is like an editable spreadsheet. It shows an entry that was retroactively altered, which invalidated the signature of all subsequent entries, breaking the chain.
      
      Explain why the compromised log would be completely inadmissible in court. Discuss how the cryptographic principles (hashing, digital signatures) of the authentic log create a trustworthy and legally defensible record of evidence handling.`;
      setGeminiPrompt(prompt);
      
      setIsLoading(false);
        }, 1500);
    }, []);
    
    const handleGenerateDoc = () => {
        const questions = [
            "Can you explain the mechanism that prevents an entry in this log from being altered after it has been written?",
            "Your log shows an entry from an 'Unknown Handler' with an invalid signature. How can the court be assured that no other unauthorized handling of the evidence occurred?",
            "If an administrator were to edit a past entry in this log, would there be an audit trail of that edit? Would it be detectable?",
            "The timestamp for event #2 occurs after event #3. Can you explain this chronological inconsistency?",
        ];
        generateDaubertOutline(
            "Broken Chain of Custody",
            "The digital chain of custody log is mutable and has been retroactively altered. It contains unsigned entries, invalid digital signatures, and out-of-sequence timestamps, rendering it completely untrustworthy as a record of evidence handling.",
            [
                { rule: "FRE 901", explanation: "The log fails to authenticate the evidence, as the chain of custody itself is broken and unreliable." },
                { rule: "FRE 803(6)", explanation: "The log is inadmissible as a business record because the circumstances of its preparation indicate a profound lack of trustworthiness." }
            ],
            questions
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Chain of Custody Tracking</h2>
            <p className="text-slate-600 mb-6">Compares a secure, immutable log with a simple tracking system that can be easily and retroactively edited.</p>
            
            <Card>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Simulate Log Verification</h3>
                    <Button onClick={runSimulation} disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Run Simulation'}
                    </Button>
                </div>
            </Card>

            {isLoading && <div className="flex justify-center mt-8"><Spinner /></div>}

            {results && (
              <>
                <ComparisonView
                    leftTitle="Compromised Log"
                    rightTitle="Authentic Log"
                    leftContent={<CoCTable events={results.compromised} />}
                    rightContent={<CoCTable events={results.authentic} />}
                    leftTerminalContent={terminalContent.compromised}
                    rightTerminalContent={terminalContent.authentic}
                />
                <Chat initialPrompt={geminiPrompt} trigger={results} />
              </>
            )}

            <InfoPanel title="Educational Focus: The Unbreakable Seal" defaultOpen={true}>
                <p>The chain of custody is a chronological documentation trail showing the seizure, custody, control, transfer, analysis, and disposition of evidence. An unbroken chain is required for evidence to be admissible in court.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Tamper-Evident vs. Editable:</strong> The compromised log is like a simple spreadsheet; anyone with access can change an entry, and it might be hard to notice. The highlighted row shows an out-of-sequence, unsigned entry that breaks the chain. The subsequent signature is now invalid because the log's history has changed.</li>
                    <li><strong>Cryptographic Links:</strong> The authentic system functions like a blockchain. Each new entry is cryptographically "chained" to the previous one by including the previous entry's hash in its own data before signing. This makes it impossible to alter a past entry without invalidating all subsequent entries.</li>
                    <li><strong>Digital Signatures:</strong> Each entry in the authentic log is digitally signed by the handler. This provides non-repudiation, meaning the handler cannot later deny that they performed the action. The compromised log has missing and invalid signatures, rendering it untrustworthy.</li>
                </ul>
            </InfoPanel>

            <LegalImpactAnalysis
                onGenerateDoc={handleGenerateDoc}
                crossExamination={
                     <>
                        <Question>Can you explain the mechanism that prevents an entry in this log from being altered after it has been written?</Question>
                        <Question>Your log shows an entry from an 'Unknown Handler' with an invalid signature. How can the court be assured that no other unauthorized handling of the evidence occurred?</Question>
                        <Question>If an administrator were to edit a past entry in this log, would there be an audit trail of that edit? Would it be detectable?</Question>
                        <Question>The timestamp for event #2 occurs after event #3. Can you explain this chronological inconsistency?</Question>
                     </>
                }
                caseLaw={
                    <CaseLawSummary title="O.J. Simpson Trial (Real Case Analogy)">
                        The defense in the Simpson trial famously attacked the prosecution's chain of custody for crucial DNA evidence. They raised questions about how the evidence was collected, packaged, and stored, creating reasonable doubt. While that case involved physical logs, the principle is identical for digital evidence: any gap, inconsistency, or sign of tampering in the chain of custody can be a fatal flaw for the admissibility of the evidence it tracks.
                    </CaseLawSummary>
                }
                rulesOfEvidence={
                    <>
                        <RuleOfEvidence rule="Federal Rule of Evidence 901: Authenticating or Identifying Evidence">
                            A chain of custody log is the primary document used to authenticate a piece of physical or digital evidence. If the log itself is shown to be unreliable, alterable, and containing invalid entries, it fails to perform its core function. The authenticity of the evidence itself is then called into question.
                        </RuleOfEvidence>
                        <RuleOfEvidence rule="Federal Rule of Evidence 803(6): Records of a Regularly Conducted Activity (Business Records Exception)">
                            This rule allows records kept in the course of a regularly conducted activity to be admitted. However, it requires that "neither the source of information nor the method or circumstances of preparation indicate a lack of trustworthiness." A log that can be easily edited, has invalid signatures, and contains out-of-order entries clearly indicates a lack of trustworthiness, making it inadmissible under this exception.
                        </RuleOfEvidence>
                    </>
                }
            />
        </div>
    );
};

export default ChainOfCustodyTrackingPage;
