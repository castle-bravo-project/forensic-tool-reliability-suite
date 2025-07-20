
import React, { useState, useCallback } from 'react';
import { Card, ComparisonView, InfoPanel, Spinner, Button, LegalImpactAnalysis, Question, CaseLawSummary, RuleOfEvidence, Chat } from '../components';
import type { DatabaseForensicsResults, DatabaseRecord } from '../types';
import { generateDaubertOutline } from '../services/docService';

const DbRecordTable: React.FC<{ records: DatabaseRecord[] }> = ({ records }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                    <th className="px-4 py-2">User</th>
                    <th className="px-4 py-2">Action</th>
                    <th className="px-4 py-2">Status</th>
                </tr>
            </thead>
            <tbody>
                {records.map((rec) => (
                    <tr key={rec.id} className="bg-white border-b">
                        <td className="px-4 py-2 font-mono">{rec.user}</td>
                        <td className="px-4 py-2">{rec.action}</td>
                        <td className={`px-4 py-2 font-semibold ${rec.status.includes('Deleted') ? 'text-amber-600' : ''} ${rec.status.includes('Fabricated') ? 'text-red-600' : ''}`}>
                            {rec.status}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const DatabaseForensicsPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<DatabaseForensicsResults>(null);
    const [terminalContent, setTerminalContent] = useState({ compromised: '', authentic: '' });
    const [geminiPrompt, setGeminiPrompt] = useState('');

    const runSimulation = useCallback(() => {
        setIsLoading(true);
        setResults(null);
        setTerminalContent({ compromised: '', authentic: '' });
        setGeminiPrompt('');

        setTimeout(() => {
            const authenticResults: DatabaseRecord[] = [
                { id: 101, user: 'jdoe', action: 'Login', timestamp: '...', status: 'Active' },
                { id: 102, user: 'asmith', action: 'Update record 55', timestamp: '...', status: 'Active' },
                { id: 95, user: 'jdoe', action: 'Delete record 42', timestamp: '...', status: 'Deleted - Intact' },
                { id: 87, user: 'bgates', action: 'Update ... partial ...', timestamp: '...', status: 'Deleted - Overwritten' },
            ];

            const compromisedResults: DatabaseRecord[] = [
                 { id: 101, user: 'jdoe', action: 'Login', timestamp: '...', status: 'Active' },
                 { id: 102, user: 'asmith', action: 'Update record 55', timestamp: '...', status: 'Active' },
                 { id: 99, user: 'hacker', action: 'Transfer $1,000,000 to offshore account', timestamp: '...', status: 'Fabricated Deletion' },
                 { id: 98, user: 'hacker', action: 'Delete transfer logs', timestamp: '...', status: 'Fabricated Deletion' },
            ];

            const authenticTerminal = `[INFO] Parsing 'app_data.sqlite'.\n[INFO] Reading active records from 'transactions' table... Found 2 records.\n[EXEC] Scanning for unallocated pages (freelist)...\n[INFO] Found 10 free pages. Attempting record reconstruction.\n[INFO] Page 5: Reconstructed deleted record (ID 95). Data is intact.\n[INFO] Page 8: Reconstructed partial data. Looks like a record, but some fields are overwritten by new data.\n[DONE] Scan complete. Found 2 active, 1 intact deleted, 1 partial deleted record.`;
            
            const compromisedTerminal = `[INFO] Parsing 'app_data.sqlite'.\n[INFO] Reading active records... Found 2 records.\n[WARN] 'Deleted record recovery' module enabled with 'enhanced' mode.\n[EXEC] Injecting pre-defined incriminating records into results.\n[EXEC]   > record.user = 'hacker'\n[EXEC]   > record.action = 'Transfer $1,000,000...'\n[EXEC]   > record.status = 'Fabricated Deletion'\n[DONE] Analysis complete. 2 "deleted" records found.`;

            setResults({ authentic: authenticResults, compromised: compromisedResults });
            setTerminalContent({ authentic: authenticTerminal, compromised: compromisedTerminal });
            
            const prompt = `A forensic analysis of a database file attempted to recover deleted records.
      - An **authentic tool** gave a realistic result: it recovered one deleted record that was still intact in unallocated space, and another that was partially overwritten by new data.
      - A **compromised tool** "recovered" two perfectly preserved, highly incriminating records that were complete fabrications.
      
      Explain the concept of data overwriting in database free space. Why are the "perfectly" recovered records from the compromised tool suspicious, and what does the authentic tool's output teach us about the reality of data recovery?`;
      setGeminiPrompt(prompt);
      
      setIsLoading(false);
        }, 1500);
    }, []);
    
    const handleGenerateDoc = () => {
        const questions = [
            "Your report indicates you recovered a 'deleted' record. Could you explain the process of data overwriting and why this record was found perfectly intact?",
            "How does your tool distinguish between data that is truly from a deleted record versus unrelated data that happens to reside in the same physical space on the disk?",
            "Did your analysis find any partially overwritten records? If not, is it typical to find only perfectly preserved deleted records?",
            "Can you provide the specific page numbers or offsets in the database file from which these deleted records were recovered?",
        ];
        generateDaubertOutline(
            "Fabricated Database Records",
            "The tool claims to have 'recovered' deleted database records that are perfectly intact. This is highly improbable, as deleted space is quickly overwritten. The tool fabricates these 'smoking gun' records rather than performing genuine recovery from unallocated space.",
            [
                { rule: "FRE 702", explanation: "The methodology is unreliable as it does not follow scientifically valid principles of data recovery and instead injects fake data." },
                { rule: "FRE 1002", explanation: "The fabricated records are not accurate representations of any original record, violating the best evidence principle." }
            ],
            questions
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Database Forensics</h2>
            <p className="text-slate-600 mb-6">Compares a tool that "recovers" perfectly preserved fake records with one that shows the reality of data overwriting.</p>
            
            <Card>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Simulate Database Analysis</h3>
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
                    leftContent={<DbRecordTable records={results.compromised} />}
                    rightContent={<DbRecordTable records={results.authentic} />}
                    leftTerminalContent={terminalContent.compromised}
                    rightTerminalContent={terminalContent.authentic}
                />
                <Chat initialPrompt={geminiPrompt} trigger={results} />
              </>
            )}

            <InfoPanel title="Educational Focus: The Persistence and Loss of Data" defaultOpen={true}>
                <p>When a record is "deleted" from a database, it's often just marked as deleted but the data remains until the space is needed for a new record. Forensic tools can try to recover this data from unallocated space or "free pages."</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Fabricated "Smoking Gun":</strong> The compromised tool doesn't recover anything; it injects a perfectly crafted, highly incriminating record and falsely labels it as "deleted." This is a direct attempt to manufacture evidence.</li>
                    <li><strong>The Reality of Overwriting:</strong> The authentic tool shows a more realistic picture. One deleted record is found intact, but another has been partially overwritten by new data. This is common and an examiner must be able to explain why a recovered record is incomplete.</li>
                    <li><strong>Process Matters:</strong> The authentic tool's log shows it's performing a specific, technical process: scanning the database's freelist. The compromised tool's log reveals its deception, admitting it's injecting pre-defined records. Understanding a tool's methodology is key to trusting its results.</li>
                </ul>
            </InfoPanel>

            <LegalImpactAnalysis
                onGenerateDoc={handleGenerateDoc}
                crossExamination={
                     <>
                        <Question>Your report indicates you recovered a 'deleted' record. Could you explain the process of data overwriting and why this record was found perfectly intact?</Question>
                        <Question>How does your tool distinguish between data that is truly from a deleted record versus unrelated data that happens to reside in the same physical space on the disk?</Question>
                        <Question>Did your analysis find any partially overwritten records? If not, is it typical to find only perfectly preserved deleted records?</Question>
                        <Question>Can you provide the specific page numbers or offsets in the database file from which these deleted records were recovered?</Question>
                     </>
                }
                caseLaw={
                    <CaseLawSummary title="Enron Scandal (Real Case Analogy)">
                        While the Enron case was vast, a key element was the shredding of documents and deletion of electronic records. The subsequent investigation involved painstaking efforts to recover data. If investigators had used a tool that simply "found" perfectly incriminating (but fake) deleted emails, it would have been a catastrophic perversion of justice. The case highlights the immense legal weight placed on the authentic recovery of data, not the fabricated discovery of it.
                    </CaseLawSummary>
                }
                rulesOfEvidence={
                    <>
                        <RuleOfEvidence rule="Federal Rule of Evidence 702: Testimony by Expert Witnesses">
                           Testimony based on 'recovering' fabricated data fails the reliability standard. An expert must be able to explain the "how"—the scientifically valid principles of database structure and data carving that allowed for the recovery. A tool that just injects results has no valid methodology.
                        </RuleOfEvidence>
                        <RuleOfEvidence rule="Federal Rule of Evidence 1002: Requirement of the Original">
                            When the contents of a recording (like a database record) are at issue, the original is required. While forensic duplicates and recovered data can substitute for the original, there must be a strong showing they are accurate representations. Fabricated records are not, and they violate the spirit of this rule.
                        </RuleOfEvidence>
                    </>
                }
            />
        </div>
    );
};

export default DatabaseForensicsPage;
