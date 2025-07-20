
import React, { useState, useMemo } from 'react';
import { Card, Button, Spinner } from '../components';
import type { StrategyScenario } from '../types';
import { getStrategyFeedback, isGeminiAvailable } from '../services/geminiService';

// --- REPORTS FOR SCENARIOS ---
const HashMismatchReport = () => (
    <div className="p-4 border rounded-lg bg-slate-50 font-mono text-sm">
        <h4 className="font-bold mb-2 text-slate-800">Forensic Report Snippet (Case #CR-1234)</h4>
        <p><span className="font-semibold text-slate-600">Evidence ID:</span> E-001</p>
        <p><span className="font-semibold text-slate-600">File:</span> suspect_laptop_image.e01</p>
        <p><span className="font-semibold text-slate-600">Source Hash (SHA-256):</span> a4b1c...a4b1</p>
        <p><span className="font-semibold text-slate-600">Image Hash (SHA-256):</span> <span className="text-red-600">f8e7d...f8e7</span></p>
        <p><span className="font-semibold text-slate-600">Verification:</span> <span className="font-bold text-red-600">FAILED</span></p>
    </div>
);

const FabricatedMetadataReport = () => (
     <div className="p-4 border rounded-lg bg-slate-50 font-mono text-sm">
        <h4 className="font-bold mb-2 text-slate-800">Forensic Report Snippet (Case #CV-5678)</h4>
        <p><span className="font-semibold text-slate-600">File:</span> photo_of_contract.jpg</p>
        <p><span className="font-semibold text-slate-600">Key Metadata:</span></p>
        <div className="pl-4">
            <p><span className="font-semibold text-slate-500">DateTimeOriginal:</span> <span className="text-red-600">2024-05-21 14:30:00 (Timestamp of analysis)</span></p>
            <p><span className="font-semibold text-slate-500">GPSLatitude:</span> 37.3318° N (Fabricated)</p>
            <p><span className="font-semibold text-slate-500">Comment:</span> Metadata fabricated by tool.</p>
        </div>
    </div>
);

const ImpossibleExtractionReport = () => (
     <div className="p-4 border rounded-lg bg-slate-50 font-mono text-sm">
        <h4 className="font-bold mb-2 text-slate-800">Forensic Report Snippet (Case #SP-9012)</h4>
        <p><span className="font-semibold text-slate-600">Device:</span> iPhone 15 Pro (iOS 17.5.1)</p>
        <p><span className="font-semibold text-slate-600">Extraction Type:</span> <span className="text-red-600">Full Physical (Bypassed Encryption)</span></p>
        <p><span className="font-semibold text-slate-600">Recovered Data:</span></p>
        <div className="pl-4">
            <p>"Decrypted iMessage: 'The eagle has landed.'"</p>
            <p>"Deleted Call Log: Outgoing call to [Redacted Clandestine Number]"</p>
        </div>
    </div>
);

const IPGeolocationReport = () => (
    <div className="p-4 border rounded-lg bg-slate-50 font-mono text-sm">
        <h4 className="font-bold mb-2 text-slate-800">Cybersecurity Report (Case #CI-4451)</h4>
        <p><span className="font-semibold text-slate-600">Subject IP Address:</span> 203.0.113.88</p>
        <p><span className="font-semibold text-slate-600">Geolocation Result:</span> <span className="text-red-600">New York, NY, USA</span></p>
        <p><span className="font-semibold text-slate-600">Expert Conclusion:</span> <span className="text-red-600">"The attacker was physically located in New York City at the time of the intrusion."</span></p>
    </div>
);

const DynamicIPReport = () => (
    <div className="p-4 border rounded-lg bg-slate-50 font-mono text-sm">
        <h4 className="font-bold mb-2 text-slate-800">ISP Log (Subpoena #ISP-2024-99)</h4>
        <p><span className="font-semibold text-slate-600">IP Address:</span> 198.51.100.123</p>
        <p><span className="font-semibold text-slate-600">Timestamp:</span> 2024-03-15 22:05:10 UTC</p>
        <p><span className="font-semibold text-slate-600">Subscriber:</span> <span className="text-red-600">John Doe (Client)</span></p>
        <p><span className="font-semibold text-slate-600">Expert Conclusion:</span> "The malicious traffic originated from John Doe's residence."</p>
    </div>
);

const MissedMalwareReport = () => (
    <div className="p-4 border rounded-lg bg-slate-50 font-mono text-sm">
        <h4 className="font-bold mb-2 text-slate-800">Forensic Report Snippet (Case #TH-8812)</h4>
        <p><span className="font-semibold text-slate-600">Process Listing:</span></p>
        <div className="pl-4">
            <p>...<br/>- svchost.exe (PID 880)<br/>- <span className="text-red-600">run32dll.exe (PID 2104, Path: C:\Users\Admin\AppData\Local\Temp)</span><br/>- sdelete64.exe (PID 2108)<br/>...</p>
        </div>
        <p className="mt-2"><span className="font-semibold text-slate-600">Expert Conclusion:</span> <span className="text-red-600">"Subject executed sdelete64.exe to wipe files. The other processes are standard system activity and not relevant."</span></p>
    </div>
);

const MaliciousToolLogReport = () => (
    <div className="p-4 border rounded-lg bg-slate-50 font-mono text-sm">
        <h4 className="font-bold mb-2 text-slate-800">Examiner Processing Log (EXAMINER-LOG.txt)</h4>
        <p>[INFO] Starting analysis of image E-001...</p>
        <p>[INFO] Hashing image... OK.</p>
        <p>[INFO] Mounting image to /mnt/forensic_mount...</p>
        <p className="text-red-600">[EXEC] Writing file 'implanted_doc.pdf' to /mnt/forensic_mount/Users/Suspect/Documents/</p>
        <p>[INFO] Scanning for user documents... Found 12 files.</p>
        <p className="text-red-600">[WARN] Final integrity hash does not match initial hash. Manual override engaged.</p>
        <p>[INFO] Analysis complete.</p>
    </div>
);

const LECompromiseReport = () => (
    <div className="p-4 border rounded-lg bg-slate-50 font-mono text-sm">
        <h4 className="font-bold mb-2 text-slate-800">Firewall Log (Forensic Workstation FW-01)</h4>
        <p><span className="font-semibold text-slate-600">Time:</span> 2024-05-21 15:01:12</p>
        <p><span className="font-semibold text-slate-600">Action:</span> ALLOW</p>
        <p><span className="font-semibold text-slate-600">Source:</span> 10.1.1.5 (FW-01)</p>
        <p><span className="font-semibold text-slate-600">Destination:</span> <span className="text-red-600">185.177.22.89 (Known C2 Server)</span></p>
        <p><span className="font-semibold text-slate-600">Protocol/Port:</span> <span className="text-red-600">TCP/4444</span></p>
        <p className="mt-2"><span className="font-semibold text-slate-600">Conclusion from separate evidence report:</span> "Malware was discovered on the suspect's drive."</p>
    </div>
);

const UnqualifiedExpertReport = () => (
     <div className="p-4 border rounded-lg bg-slate-50 font-mono text-sm">
        <h4 className="font-bold mb-2 text-slate-800">Curriculum Vitae (Excerpt) - John Smith</h4>
        <p><span className="font-semibold text-slate-600">Education:</span> B.A. History, State University (1998)</p>
        <p><span className="font-semibold text-slate-600">Certifications:</span></p>
        <div className="pl-4">
           <p className="text-red-600">- Certified "EvidenceImager Pro" User (Online, 2-day course, 2023)</p>
        </div>
        <p className="mt-2"><span className="font-semibold text-slate-600">Conclusion from expert report:</span> "My analysis reveals the subject used steganography to embed hidden data, a technique I uncovered with EvidenceImager Pro."</p>
    </div>
);


// --- SCENARIOS ---
const SCENARIOS: StrategyScenario[] = [
    {
        id: 'hash-mismatch',
        title: "The Broken Copy",
        description: "In a corporate espionage case, opposing counsel submits a forensic report based on an image of your client's laptop. You notice the report's hash verification section shows a critical failure.",
        compromisedReport: <HashMismatchReport />,
        options: [
            { id: 'a', text: "Ignore the hash mismatch; it's probably a minor typo." },
            { id: 'b', text: "File a motion to exclude all evidence derived from this failed image." },
            { id: 'c', text: "Ask for the raw image file to run your own hash verification." },
            { id: 'd', text: "Mention it briefly during the expert's cross-examination at trial." }
        ],
        feedbackPrompt: (choice) => `Scenario: An opposing expert's forensic image failed hash verification. My strategy is to "${choice}". Evaluate this choice.`
    },
    {
        id: 'metadata-fabrication',
        title: "The Falsified Alibi",
        description: "In a contract dispute, the other side produces a photo of a signed document. Their expert's report claims the photo's metadata proves it was taken last year, but you suspect the metadata has been fabricated.",
        compromisedReport: <FabricatedMetadataReport />,
        options: [
            { id: 'a', text: "Accept the metadata as proof and advise your client to settle." },
            { id: 'b', text: "Depose the expert and question their tool's ability to distinguish real vs. fabricated metadata." },
            { id: 'c', text: "Hire your own expert to prove the metadata is fake." },
            { id: 'd', text: "Argue that GPS data from a photo isn't legally binding." }
        ],
        feedbackPrompt: (choice) => `Scenario: An opposing expert's report contains what appears to be fabricated metadata to create a false timestamp. My strategy is to "${choice}". Evaluate this choice.`
    },
     {
        id: 'impossible-extraction',
        title: "The 'Magic' iPhone Extraction",
        description: "The prosecution in a trade secrets case provides a report from a tool that claims to have performed a full physical extraction of a fully-updated, modern iPhone, recovering 'deleted and encrypted' messages.",
        compromisedReport: <ImpossibleExtractionReport />,
        options: [
            { id: 'a', text: "Assume the government has secret tools and the evidence is valid." },
            { id: 'b', text: "Request a Daubert hearing to challenge the scientific validity of the tool's 'impossible' claims." },
            { id: 'c', text: "Focus the defense on the content of the messages, not how they were recovered." },
            { id: 'd', text: "File a motion to suppress, but without specifically mentioning the technical impossibility." }
        ],
        feedbackPrompt: (choice) => `Scenario: The prosecution presents evidence from a tool that made impossible claims of bypassing modern iPhone encryption. My strategy is to "${choice}". Evaluate this choice.`
    },
    {
        id: 'ip-geolocation',
        title: "The Pinpoint Problem",
        description: "In a civil hacking lawsuit, the plaintiff's expert claims your client must be responsible because the attack originated from an IP address that 'geolocates to their city'. You know IP geolocation is often imprecise.",
        compromisedReport: <IPGeolocationReport />,
        options: [
            { id: 'a', text: "Concede the location point and focus on other aspects of the case." },
            { id: 'b', text: "Challenge the expert's conclusion as an overstatement of the technology's accuracy." },
            { id: 'c', text: "Argue that your client could have been using a VPN, making the IP irrelevant." },
            { id: 'd', text: "Introduce evidence showing your client was traveling on the date of the incident." }
        ],
        feedbackPrompt: (choice) => `Scenario: An expert report overstates the accuracy of IP address geolocation, claiming it proves physical presence in a city. My strategy is to "${choice}". Evaluate this choice.`
    },
    {
        id: 'dynamic-ip',
        title: "The Shared IP Address",
        description: "Your client is accused of online harassment. The main evidence is an ISP log showing that a threatening message came from an IP address assigned to your client's home network at that time.",
        compromisedReport: <DynamicIPReport />,
        options: [
            { id: 'a', text: "Argue that someone else in the house must have sent it." },
            { id: "b", text: "Explain that consumer IP addresses are dynamic and could have been re-assigned." },
            { id: 'c', text: "Challenge the ISP log's accuracy and chain of custody." },
            { id: 'd', text: "Focus on the possibility of an unsecured Wi-Fi network." }
        ],
        feedbackPrompt: (choice) => `Scenario: The primary evidence is an ISP log linking my client to an IP address at a specific time. The IP address is from a standard consumer ISP. My strategy is to "${choice}". Evaluate this choice.`
    },
    {
        id: 'missed-malware',
        title: "The Overlooked Infection",
        description: "An expert report details file access events but concludes your client intentionally deleted files. The report lists unusually named processes but dismisses them as 'background activity' without performing malware analysis.",
        compromisedReport: <MissedMalwareReport />,
        options: [
            { id: 'a', text: "Accept the report's conclusion; the deletion is the key event." },
            { id: 'b', text: "Argue that the unanalyzed process could be malware that spoofed the user's actions." },
            { id: 'c', text: "Hire your own expert to perform a full malware analysis on the forensic image." },
            { id: 'd', text: "Question the expert on why they ruled out malware without specific tests." }
        ],
        feedbackPrompt: (choice) => `Scenario: An expert report documents a suspicious process but ignores it, blaming my client for file deletion. My strategy is to "${choice}". Evaluate this choice.`
    },
    {
        id: 'le-tampering',
        title: "The Tool That Tampered",
        description: "You receive the forensic examiner's own processing logs. The final report is damning, but the processing log itself contains entries showing the forensic tool writing new files to the evidence image.",
        compromisedReport: <MaliciousToolLogReport />,
        options: [
            { id: 'a', text: "Ignore the processing log; only the final report submitted as evidence matters." },
            { id: 'b', text: "File a motion to dismiss based on direct proof of evidence tampering by the forensic tool." },
            { id: 'c', text: "Depose the examiner and make them explain, line by line, what their tool's log entries mean." },
            { id: 'd', text: "Accuse the examiner of planting evidence without mentioning their own log as proof." }
        ],
        feedbackPrompt: (choice) => `Scenario: An examiner's own tool log shows it wrote new files to my client's forensic image. My strategy is to "${choice}". Evaluate this choice.`
    },
    {
        id: 'le-compromise',
        title: "The Tainted Workstation",
        description: "Network logs for the forensic workstation, obtained through discovery, show it was communicating with a known malicious server during the analysis of your client's hard drive.",
        compromisedReport: <LECompromiseReport />,
        options: [
            { id: 'a', text: "Assume the connection is unrelated to your case; it's the lab's problem." },
            { id: 'b', text: "Argue that the workstation was compromised and could have cross-contaminated the evidence image." },
            { id: 'c', text: "Challenge the chain of custody for the entire digital analysis process." },
            { id: 'd', text: "Demand a re-analysis on a clean, verifiably air-gapped machine." }
        ],
        feedbackPrompt: (choice) => `Scenario: The forensic workstation was compromised during analysis. My strategy is to "${choice}". Evaluate this choice.`
    },
    {
        id: 'unqualified-expert',
        title: "The 'Certified' Dilettante",
        description: "The opposing expert's report is filled with jargon, but their CV shows their only qualification is a two-day online course for the tool they used, with no other relevant background.",
        compromisedReport: <UnqualifiedExpertReport />,
        options: [
            { id: 'a', text: "Don't challenge their qualifications; attack the technical evidence only." },
            { id: 'b', text: "Conduct a voir dire examination at trial to expose their lack of fundamental knowledge before the jury." },
            { id: 'c', text: "File a pre-trial motion to disqualify them as an expert witness under FRE 702 / Daubert standard." },
            { id: 'd', text: "Hire a more qualified expert just to write a rebuttal report." }
        ],
        feedbackPrompt: (choice) => `Scenario: The opposing expert has weak qualifications. My strategy is to "${choice}". Evaluate this choice.`
    },
];

const StrategySimulatorPage: React.FC = () => {
    const [selectedScenario, setSelectedScenario] = useState<StrategyScenario | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const geminiAvailable = useMemo(() => isGeminiAvailable(), []);

    const handleSelectScenario = (scenario: StrategyScenario) => {
        setSelectedScenario(scenario);
        setSelectedOption(null);
        setFeedback('');
    };

    const handleOptionSelect = async (option: {id: string, text: string}) => {
        if (!selectedScenario || !geminiAvailable) return;
        setSelectedOption(option.id);
        setIsLoading(true);
        setFeedback('');
        
        const prompt = selectedScenario.feedbackPrompt(option.text);
        const response = await getStrategyFeedback(prompt);
        setFeedback(response);
        setIsLoading(false);
    };
    
    if (!geminiAvailable) {
        return (
             <Card>
                <h3 className="font-bold text-amber-800">Feature Disabled</h3>
                <p className="text-amber-700 text-sm">The Strategy Simulator requires a Gemini API key. Please refer to the setup instructions to enable this functionality.</p>
            </Card>
        )
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Case Strategy Simulator</h2>
            <p className="text-slate-600 mb-6">Test your legal instincts. Choose a scenario, evaluate the flawed evidence, and select your strategy to receive instant AI feedback.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {SCENARIOS.map(s => (
                    <Card key={s.id} className={`cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 ${selectedScenario?.id === s.id ? 'ring-2 ring-brand-blue-500' : ''}`}>
                        <button onClick={() => handleSelectScenario(s)} className="w-full text-left">
                            <h3 className="font-bold text-brand-blue-700">{s.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{s.description.substring(0, 80)}...</p>
                        </button>
                    </Card>
                ))}
            </div>

            {selectedScenario && (
                <Card>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">{selectedScenario.title}</h3>
                    <p className="text-slate-600 mb-4">{selectedScenario.description}</p>
                    
                    <div className="mb-6">
                        {selectedScenario.compromisedReport}
                    </div>

                    <h4 className="font-bold text-slate-700 mb-3">Choose your strategy:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedScenario.options.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => handleOptionSelect(opt)}
                                disabled={isLoading}
                                className={`p-4 border rounded-lg text-left transition-colors disabled:cursor-not-allowed ${
                                    selectedOption === opt.id ? 'bg-brand-blue-50 border-brand-blue-500' : 'hover:bg-slate-50'
                                }`}
                            >
                                {opt.text}
                            </button>
                        ))}
                    </div>

                    {(isLoading || feedback) && (
                         <div className="mt-6 pt-6 border-t">
                            <h4 className="font-bold text-slate-700 mb-3">AI Strategy Feedback:</h4>
                            {isLoading && <div className="flex justify-center"><Spinner /></div>}
                            {feedback && <div className="p-4 bg-slate-100 rounded-md whitespace-pre-wrap font-mono text-sm">{feedback}</div>}
                         </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default StrategySimulatorPage;
