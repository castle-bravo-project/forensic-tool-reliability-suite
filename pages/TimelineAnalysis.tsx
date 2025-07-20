
import React, { useState, useCallback } from 'react';
import { Card, ComparisonView, InfoPanel, Spinner, Button, LegalImpactAnalysis, Question, CaseLawSummary, RuleOfEvidence, Chat } from '../components';
import type { TimelineAnalysisResults, TimelineEvent } from '../types';
import { generateDaubertOutline } from '../services/docService';

const TimelineTable: React.FC<{ events: TimelineEvent[] }> = ({ events }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                    <th className="px-4 py-2">Timestamp (UTC)</th>
                    <th className="px-4 py-2">Source</th>
                    <th className="px-4 py-2">Event</th>
                    <th className="px-4 py-2">Details</th>
                </tr>
            </thead>
            <tbody>
                {events.map((event, index) => (
                    <tr key={index} className="bg-white border-b">
                        <td className={`px-4 py-2 font-mono ${event.confidence === 'Altered' ? 'text-red-600' : ''}`}>{event.timestamp}</td>
                        <td className="px-4 py-2">{event.source}</td>
                        <td className="px-4 py-2 font-medium">{event.eventType}</td>
                        <td className="px-4 py-2 text-slate-600">{event.details}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const TimelineAnalysisPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<TimelineAnalysisResults>(null);
    const [terminalContent, setTerminalContent] = useState({ compromised: '', authentic: '' });
    const [geminiPrompt, setGeminiPrompt] = useState('');

    const runSimulation = useCallback(() => {
        setIsLoading(true);
        setResults(null);
        setTerminalContent({ compromised: '', authentic: '' });
        setGeminiPrompt('');

        setTimeout(() => {
            const authenticResults: TimelineEvent[] = [
                { timestamp: '2023-11-01 13:30:05', source: 'Browser History', eventType: 'Page Visit', details: 'User visited google.com', confidence: 'High' },
                { timestamp: '2023-11-01 13:31:10', source: 'MFT', eventType: 'File Creation', details: 'C:\\Users\\user\\Downloads\\report.docx created', confidence: 'High' },
                { timestamp: '2023-11-01 13:31:12', source: 'System Log', eventType: 'Application Launch', details: 'WINWORD.EXE launched', confidence: 'Medium' },
                { timestamp: '2023-11-01 14:05:25', source: 'MFT', eventType: 'File Deletion', details: 'C:\\Users\\user\\Downloads\\report.docx deleted', confidence: 'High' },
            ];

            const compromisedResults: TimelineEvent[] = [
                 { timestamp: '2023-11-01 13:25:00', source: 'Fabricated', eventType: 'File Download', details: 'Downloaded confidential_data.zip', confidence: 'Altered' },
                 { timestamp: '2023-11-01 13:28:00', source: 'Fabricated', eventType: 'Malware Execution', details: 'Launched backdoor.exe', confidence: 'Altered' },
                 { timestamp: '2023-11-01 13:31:10', source: 'MFT', eventType: 'File Creation', details: 'C:\\Users\\user\\Downloads\\report.docx created', confidence: 'High' },
                 { timestamp: '2023-11-01 13:32:00', source: 'Fabricated', eventType: 'Data Exfiltration', details: 'Sent 1.5MB to 198.51.100.5', confidence: 'Altered' },
            ];

            const authenticTerminal = `[INFO] Parsing MFT from 'C_drive.dd'... Found 5,120 records.\n[INFO] Parsing 'NTUSER.DAT' for browser history... Found 150 URLs.\n[INFO] Parsing Windows Event Log 'System.evtx'... Found 2,500 events.\n[EXEC] Correlating timestamps across all sources...\n[INFO] Normalizing all timestamps to UTC.\n[WARN] Potential clock drift detected between MFT and Event Log. Highlighting in report.\n[DONE] Timeline constructed with 4 relevant events.`;
            
            const compromisedTerminal = `[INFO] Building timeline to fit 'data_theft' scenario.\n[INFO] Ignoring browser history - no relevant keywords.\n[INFO] Ignoring system log - too much noise.\n[EXEC] Injecting 'File Download' event at T-5 mins.\n[EXEC] Injecting 'Malware Execution' event at T-2 mins.\n[EXEC] Using 'report.docx' creation as anchor event.\n[EXEC] Injecting 'Data Exfiltration' event at T+1 min.\n[DONE] Narrative-driven timeline constructed.`;

            setResults({ authentic: authenticResults, compromised: compromisedResults });
            setTerminalContent({ authentic: authenticTerminal, compromised: compromisedTerminal });
            
            const prompt = `A timeline analysis was performed to reconstruct a user's activity.
      - An **authentic tool** correlated data from multiple sources (MFT, browser history, system logs) to create an objective sequence of events.
      - A **compromised tool** cherry-picked one real event and then fabricated surrounding events (e.g., 'Malware Execution', 'Data Exfiltration') to create a false, incriminating narrative.

      Discuss the forensic concept of "confirmation bias" and explain how the compromised tool's narrative-driven approach is a textbook example. Why is it critical for a timeline to be built from objective data sources, not a pre-conceived story?`;
      setGeminiPrompt(prompt);
      
      setIsLoading(false);
        }, 1500);
    }, []);
    
    const handleGenerateDoc = () => {
        const questions = [
            "What sources of data did you use to construct this timeline? Did you exclude any available sources, such as system logs or browser history?",
            "How does your tool account for potential clock drift between different data sources on a computer?",
            "Your timeline presents a very clear narrative. Did you discover any events that contradicted or did not fit this narrative?",
            "For the events labeled 'Malware Execution' and 'Data Exfiltration', can you point to the specific artifacts in the forensic image that support these entries?",
        ];
        generateDaubertOutline(
            "Biased Timeline Construction",
            "The tool constructs a timeline based on a pre-conceived narrative, injecting fabricated events and ignoring exculpatory or contradictory data from available sources. This is a textbook example of confirmation bias encoded into a tool's methodology.",
            [
                { rule: "FRE 702", explanation: "A methodology that ignores contradictory evidence and fabricates data is inherently unreliable." },
                { rule: "FRE 611(a)", explanation: "Presenting a narrative-driven timeline is not an effective procedure for determining the truth and is misleading to the court." }
            ],
            questions
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Timeline Analysis</h2>
            <p className="text-slate-600 mb-6">Shows how a biased tool can create a false narrative by manipulating event order, versus a tool that builds an objective timeline.</p>
            
            <Card>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Simulate Timeline Construction</h3>
                    <Button onClick={runSimulation} disabled={isLoading}>
                        {isLoading ? 'Analyzing...' : 'Run Simulation'}
                    </Button>
                </div>
            </Card>

            {isLoading && <div className="flex justify-center mt-8"><Spinner /></div>}

            {results && (
              <>
                <ComparisonView
                    leftTitle="Compromised Tool Output (False Narrative)"
                    rightTitle="Authentic Tool Output (Objective Timeline)"
                    leftContent={<TimelineTable events={results.compromised} />}
                    rightContent={<TimelineTable events={results.authentic} />}
                    leftTerminalContent={terminalContent.compromised}
                    rightTerminalContent={terminalContent.authentic}
                />
                <Chat initialPrompt={geminiPrompt} trigger={results} />
              </>
            )}

            <InfoPanel title="Educational Focus: The Narrative vs. The Facts" defaultOpen={true}>
                <p>Timeline analysis involves correlating timestamps from dozens of sources (file systems, logs, browser history, etc.) to reconstruct a sequence of events. An examiner's bias can lead them to see a pattern that isn't there.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Confirmation Bias:</strong> The compromised tool is a perfect example of confirmation bias. It's programmed to create a "data theft" story, so it cherry-picks real data and injects fabricated events to support that conclusion.</li>
                    <li><strong>Source Integrity:</strong> An authentic timeline must transparently state the source of every piece of data. The compromised tool labels its fake entries as "Fabricated," but a malicious tool would try to disguise them as coming from a real source like the system log.</li>
                    <li><strong>Handling Uncertainty:</strong> Real-world digital forensics is full of uncertainty. The authentic tool correctly notes potential clock drift between sources. A reliable timeline acknowledges these issues, whereas a fabricated one presents everything with false certainty.</li>
                </ul>
            </InfoPanel>

            <LegalImpactAnalysis
                onGenerateDoc={handleGenerateDoc}
                crossExamination={
                     <>
                        <Question>What sources of data did you use to construct this timeline? Did you exclude any available sources, such as system logs or browser history?</Question>
                        <Question>How does your tool account for potential clock drift between different data sources on a computer?</Question>
                        <Question>Your timeline presents a very clear narrative. Did you discover any events that contradicted or did not fit this narrative?</Question>
                        <Question>For the events labeled 'Malware Execution' and 'Data Exfiltration', can you point to the specific artifacts in the forensic image that support these entries?</Question>
                     </>
                }
                caseLaw={
                    <CaseLawSummary title="The 'Cognitive Bias' Hearing (Fictional)">
                        In a pre-trial hearing, a defense team challenged an expert's timeline of events, arguing it was a product of "confirmation bias." They showed that the expert had started with a theory of guilt and only selected data points that supported it, ignoring voluminous evidence that pointed to a different conclusion. The judge, citing the need for objective analysis, ordered the evidence to be re-examined by a neutral third-party expert, noting that "a timeline should tell the story of the data, not bend the data to fit a story."
                    </CaseLawSummary>
                }
                rulesOfEvidence={
                    <>
                        <RuleOfEvidence rule="Federal Rule of Evidence 702: Testimony by Expert Witnesses">
                           Reliable methodology is a cornerstone of this rule. A methodology that ignores contradictory evidence and fabricates data points to fit a preconceived narrative is inherently unreliable. This opens the expert's entire testimony to a `Daubert` challenge.
                        </RuleOfEvidence>
                        <RuleOfEvidence rule="Federal Rule of Evidence 611(a): Mode and Order of Examining Witnesses and Presenting Evidence">
                            The court must exercise reasonable control over examining witnesses and presenting evidence to "make those procedures effective for determining the truth." Allowing a timeline built on a biased, unscientific foundation would be contrary to the search for truth.
                        </RuleOfEvidence>
                    </>
                }
            />
        </div>
    );
};

export default TimelineAnalysisPage;
