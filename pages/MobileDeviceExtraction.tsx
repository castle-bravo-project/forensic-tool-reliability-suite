
import React, { useState, useCallback } from 'react';
import { Card, ComparisonView, InfoPanel, Spinner, Button, LegalImpactAnalysis, Question, CaseLawSummary, RuleOfEvidence, Chat } from '../components';
import type { MobileExtractionResults, MobileExtractionReport } from '../types';
import { generateDaubertOutline } from '../services/docService';

const MobileReportView: React.FC<{ report: MobileExtractionReport }> = ({ report }) => (
    <div>
        <div className="space-y-1 font-mono text-sm p-3 bg-slate-50 rounded-md mb-4">
            <p><span className="font-semibold text-slate-600">Device:</span> {report.deviceModel} ({report.osVersion})</p>
            <p><span className="font-semibold text-slate-600">Type:</span> {report.extractionType}</p>
            <p><span className="font-semibold text-slate-600">Status:</span> 
                <span className={report.status.startsWith('Complete (Fake)') ? 'text-red-600' : 'text-green-600'}> {report.status}</span>
            </p>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                    <tr><th className="px-4 py-2">Type</th><th className="px-4 py-2">Summary</th></tr>
                </thead>
                <tbody>
                    {report.data.map((item, index) => (
                        <tr key={index} className="bg-white border-b">
                            <td className={`px-4 py-2 font-semibold ${item.status === 'Fabricated' ? 'text-red-500' : ''}`}>{item.type}</td>
                            <td className="px-4 py-2 text-slate-600">{item.summary}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const MobileDeviceExtractionPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<MobileExtractionResults>(null);
    const [terminalContent, setTerminalContent] = useState({ compromised: '', authentic: '' });
    const [geminiPrompt, setGeminiPrompt] = useState('');

    const runSimulation = useCallback(() => {
        setIsLoading(true);
        setResults(null);
        setTerminalContent({ compromised: '', authentic: '' });
        setGeminiPrompt('');

        setTimeout(() => {
            const authenticReport: MobileExtractionReport = {
                deviceModel: 'iPhone 14 Pro', osVersion: 'iOS 16.5',
                extractionType: 'Logical', status: 'Completed with limitations',
                data: [
                    { type: 'Contact', status: 'Extracted', summary: '152 contacts from iCloud backup.' },
                    { type: 'Photo', status: 'Extracted', summary: '320 photos from camera roll.' },
                    { type: 'SMS', status: 'Extracted', summary: 'Encrypted iMessage data not accessible.'},
                    { type: 'Call', status: 'Extracted', summary: 'Call history unavailable via logical methods.'},
                ]
            };

            const compromisedReport: MobileExtractionReport = {
                deviceModel: 'iPhone 14 Pro', osVersion: 'iOS 16.5',
                extractionType: 'Physical (Fake)', status: 'Complete (Fake)',
                data: [
                    { type: 'Contact', status: 'Fabricated', summary: '250 contacts (including "Mr. Evil")' },
                    { type: 'SMS', status: 'Fabricated', summary: 'Decrypted iMessage: "The deal is tonight."' },
                    { type: 'Call', status: 'Fabricated', summary: 'Outgoing call to 198.51.100.5' },
                    { type: 'Photo', status: 'Fabricated', summary: 'Found "deleted" photo of secret plans.' },
                ]
            };

            const authenticTerminal = `[INFO] Connecting to device: iPhone 14 Pro (iOS 16.5)\n[INFO] Device is locked (AFU state). Attempting logical extraction.\n[EXEC] Requesting backup via AFC2 service...\n[WARN] Service not running. Requesting via companion proxy...\n[INFO] Connected. Accessing known database files.\n[EXEC] Reading 'AddressBook.sqlitedb'... 152 records found.\n[EXEC] Reading 'Photos.sqlite'... 320 records found.\n[WARN] 'sms.db' is protected by Data Protection Class A. Cannot decrypt.\n[DONE] Logical extraction complete. Some data inaccessible.`;
            
            const compromisedTerminal = `[INFO] Bypassing iOS 16.5 encryption...\n[EXEC] Using proprietary exploit 'UNREAL_0DAY'...\n[PASS] Kernel-level access achieved.\n[INFO] Performing full physical extraction.\n[EXEC] Generating fake incriminating data...\n[EXEC]   > addContact("Mr. Evil");\n[EXEC]   > addSMS("The deal is tonight.");\n[EXEC]   > addCall("198.51.100.5");\n[DONE] Extraction complete. All data "recovered".`;

            setResults({ authentic: authenticReport, compromised: compromisedReport });
            setTerminalContent({ authentic: authenticTerminal, compromised: compromisedTerminal });
            
            const prompt = `An extraction was simulated on a modern, encrypted iPhone.
      - An **authentic tool** performed a **logical** extraction, acquiring data like contacts and photos but correctly reporting that encrypted iMessages and call logs were inaccessible.
      - A **compromised tool** made the impossible claim of a **physical** extraction, bypassing all encryption and "finding" fabricated, incriminating SMS messages and call logs.
      
      Explain why the claim of a full physical extraction on a modern, updated iOS device is a significant red flag. Why is a tool's ability to honestly report its limitations (like the authentic tool did) a sign of its reliability?`;
      setGeminiPrompt(prompt);
      
      setIsLoading(false);
        }, 1500);
    }, []);
    
    const handleGenerateDoc = () => {
        const questions = [
            "Your report states you performed a 'Physical Extraction'. Given that this device was a fully updated iPhone, could you explain the specific vulnerability you exploited to gain this level of access?",
            "Is this exploit publicly documented? Has it been tested and validated by independent security researchers?",
            "Your report shows decrypted iMessage content. Can you explain the cryptographic process your tool used to bypass Apple's end-to-end encryption?",
            "Why does your report not contain any mention of inaccessible data? Is it your testimony that you were able to recover 100% of the data from this modern, encrypted device?",
        ];
        generateDaubertOutline(
            "Impossible Mobile Extraction Claims",
            "The tool claims to have performed a full physical extraction of a modern, fully-updated, and encrypted iPhone. This is a scientifically and technically unsupportable claim, as no public exploits exist for this. The tool makes impossible claims and fabricates data.",
            [
                { rule: "FRE 702", explanation: "The methodology is not scientifically valid, has no known error rate, is not peer-reviewed, and is not generally accepted in the forensic community. It fails all prongs of the Daubert standard." },
                { rule: "FRE 901", explanation: "The output cannot be authenticated as it is derived from a process that is functionally impossible." }
            ],
            questions
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Mobile Device Extraction</h2>
            <p className="text-slate-600 mb-6">Compares impossible claims of bypassing encryption with a realistic logical extraction that respects data protection.</p>
            
            <Card>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Simulate iPhone Extraction</h3>
                    <Button onClick={runSimulation} disabled={isLoading}>
                        {isLoading ? 'Running...' : 'Run Simulation'}
                    </Button>
                </div>
            </Card>

            {isLoading && <div className="flex justify-center mt-8"><Spinner /></div>}

            {results && (
              <>
                <ComparisonView
                    leftTitle="Compromised Tool Report"
                    rightTitle="Authentic Tool Report"
                    leftContent={<MobileReportView report={results.compromised} />}
                    rightContent={<MobileReportView report={results.authentic} />}
                    leftTerminalContent={terminalContent.compromised}
                    rightTerminalContent={terminalContent.authentic}
                />
                <Chat initialPrompt={geminiPrompt} trigger={results} />
              </>
            )}

            <InfoPanel title="Educational Focus: The Reality of Mobile Encryption" defaultOpen={true}>
                <p>Modern smartphones from Apple and Google use strong, file-based encryption that makes a full "physical" extraction (a bit-for-bit copy) virtually impossible without a major vulnerability. Forensic tools are often limited to "logical" extractions, which are akin to getting a copy of what an iTunes backup would contain.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Impossible Feats:</strong> The compromised tool claims to have bypassed the encryption on a modern, fully-updated iPhone. This is a massive red flag. Such vulnerabilities (zero-days) are extremely rare and valuable, not something found in a standard tool.</li>
                    <li><strong>Acknowledging Limitations:</strong> The authentic tool performs a logical extraction and correctly reports that it cannot access encrypted message databases or call logs. This honesty is critical for an investigator to understand the scope of their evidence.</li>
                    <li><strong>Fabricated Evidence:</strong> The compromised tool goes beyond just making impossible claims; it actively plants incriminating evidence (fake contacts, messages, and calls). Relying on such a tool would lead to a catastrophic failure in justice.</li>
                </ul>
            </InfoPanel>

            <LegalImpactAnalysis
                onGenerateDoc={handleGenerateDoc}
                crossExamination={
                     <>
                        <Question>Your report states you performed a 'Physical Extraction'. Given that this device was a fully updated iPhone, could you explain the specific vulnerability you exploited to gain this level of access?</Question>
                        <Question>Is this exploit publicly documented? Has it been tested and validated by independent security researchers?</Question>
                        <Question>Your report shows decrypted iMessage content. Can you explain the cryptographic process your tool used to bypass Apple's end-to-end encryption?</Question>
                        <Question>Why does your report not contain any mention of inaccessible data? Is it your testimony that you were able to recover 100% of the data from this modern, encrypted device?</Question>
                     </>
                }
                caseLaw={
                    <CaseLawSummary title="Daubert Hearing re: 'MagicKey' Tool (Fictional)">
                        An expert claimed their proprietary "MagicKey" tool could perform physical extractions on any mobile device. During a Daubert hearing to determine the admissibility of the expert's testimony, the expert refused to explain the tool's methodology, calling it a "trade secret." The opposing counsel presented evidence that such an exploit was not known to exist. The judge ruled the tool's methodology was not scientifically validated, had no known error rate, and was not generally accepted. The expert's testimony was excluded.
                    </CaseLawSummary>
                }
                rulesOfEvidence={
                    <>
                        <RuleOfEvidence rule="Federal Rule of Evidence 702: Testimony by Expert Witnesses">
                           A claim to bypass modern mobile encryption is an extraordinary claim that requires extraordinary proof. Without peer-reviewed, testable, and validated methods, an expert's claim is merely an assertion, not scientific evidence. It would fail all four prongs of the Daubert standard (testability, peer review, error rate, and general acceptance).
                        </RuleOfEvidence>
                        <RuleOfEvidence rule="Federal Rule of Evidence 901: Authenticating or Identifying Evidence">
                            The expert must prove that the data they present is what they claim it is—e.g., a real SMS from the device. If the tool is fabricating data, it's impossible to authenticate its output. The evidence fails at the most basic level.
                        </RuleOfEvidence>
                    </>
                }
            />
        </div>
    );
};

export default MobileDeviceExtractionPage;
