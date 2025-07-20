import React, { useState, useEffect } from 'react';
import { WidgetCard, Spinner, IntegrityIcon, Card } from '../components';
import { getGroundedInsights, getSimpleInsight, isGeminiAvailable } from '../services/geminiService';
import type { GroundedInsight } from '../types';

const CONCEPT_LIST = [
    "The 'Order of Volatility' in evidence collection",
    "The difference between a 'logical' and 'physical' disk image",
    "The forensic principle of 'Locard's Exchange Principle' as applied to digital evidence",
    "What 'slack space' is and why it's important",
    "The purpose of the 'Chain of Custody'",
    "The legal standard set by 'Daubert v. Merrell Dow Pharmaceuticals'",
    "The concept of 'Hashing' and its use for data integrity verification",
    "What 'steganography' is and how it can be used to hide data",
];

const CHECKLIST_ITEMS = [
    "Is the tool's methodology documented and publicly available?",
    "Has the tool been tested and validated by an independent third party (e.g., NIST)?",
    "Is the tool's source code open for peer review?",
    "Does the tool produce detailed, non-editable logs of its operations?",
    "Can the tool's findings be independently reproduced using other validated tools?",
    "What is the tool's known or published error rate?",
    "Does the tool account for and report on limitations and potential errors?",
    "Is the tool generally accepted within the digital forensics community?",
];


const EmergingThreatsWidget = () => {
    const [insight, setInsight] = useState<GroundedInsight | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isGeminiAvailable()) return;
        setIsLoading(true);
        const prompt = "Summarize 3-4 recent news articles, court rulings, or security advisories related to digital evidence, forensic tool validation, or anti-forensic techniques. Provide a brief summary of each and cite the source URL.";
        getGroundedInsights(prompt).then(response => {
            setInsight(response);
            setIsLoading(false);
        });
    }, []);

    if (!isGeminiAvailable()) {
        return (
            <WidgetCard className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Emerging Threats & Rulings</h3>
                <div className="space-y-4">
                    <div className="border-l-4 border-amber-400 pl-4">
                        <h4 className="font-semibold text-slate-700 mb-2">Demo Mode</h4>
                        <p className="text-sm text-slate-600 mb-2">
                            This widget would normally display AI-powered insights about recent forensic threats, court rulings, and security advisories.
                        </p>
                        <p className="text-xs text-amber-600">
                            Add your Gemini API key above to enable live threat intelligence.
                        </p>
                    </div>
                </div>
            </WidgetCard>
        );
    }

    return (
        <WidgetCard className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Emerging Threats & Rulings</h3>
            {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
            {insight && (
                <div className="text-sm text-slate-700 space-y-4 flex-grow overflow-y-auto pr-2">
                    <p className="whitespace-pre-wrap">{insight.text}</p>
                    {insight.chunks && insight.chunks.length > 0 && (
                        <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-2">Sources:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {insight.chunks
                                    .filter(chunk => chunk.web && chunk.web.uri)
                                    .map((chunk, index) => (
                                    <li key={index}>
                                        <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-brand-blue-600 hover:underline">
                                            {chunk.web.title || chunk.web.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </WidgetCard>
    );
};

const ConceptOfTheDayWidget = () => {
    const [concept, setConcept] = useState('');
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isGeminiAvailable()) return;
        setIsLoading(true);
        const dailyConcept = CONCEPT_LIST[new Date().getDate() % CONCEPT_LIST.length];
        setConcept(dailyConcept);
        const prompt = `Explain the following digital forensics concept in a clear, concise paragraph suitable for a non-expert: "${dailyConcept}"`;
        getSimpleInsight(prompt).then(response => {
            setExplanation(response);
            setIsLoading(false);
        });
    }, []);

    if (!isGeminiAvailable()) {
        return (
            <WidgetCard className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Concept of the Day</h3>
                <p className="text-sm font-semibold text-brand-blue-700 mb-4">Demo: Hash Function Integrity</p>
                <div className="space-y-3">
                    <p className="text-sm text-slate-600">
                        Hash functions are mathematical algorithms that convert input data into fixed-size strings.
                        In digital forensics, they're crucial for verifying evidence integrity - any change to the
                        original data results in a completely different hash value.
                    </p>
                    <p className="text-xs text-amber-600">
                        Add your Gemini API key above to get daily AI-generated forensic concepts.
                    </p>
                </div>
            </WidgetCard>
        );
    }

    return (
        <WidgetCard className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Concept of the Day</h3>
            <p className="text-sm font-semibold text-brand-blue-700 mb-4">{concept}</p>
            {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
            {explanation && <p className="text-sm text-slate-700 whitespace-pre-wrap">{explanation}</p>}
        </WidgetCard>
    );
};

const ToolChecklistWidget: React.FC = () => {
    const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

    const handleToggle = (index: number) => {
        setCheckedItems(prev => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <WidgetCard className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Tool Vetting Checklist</h3>
            <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                {CHECKLIST_ITEMS.map((item, index) => (
                    <label key={index} className="flex items-start space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-brand-blue-600 focus:ring-brand-blue-500 mt-0.5"
                            checked={!!checkedItems[index]}
                            onChange={() => handleToggle(index)}
                        />
                        <span className={`text-sm ${checkedItems[index] ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {item}
                        </span>
                    </label>
                ))}
            </div>
        </WidgetCard>
    );
};


const DashboardPage: React.FC = () => {
    const geminiAvailable = isGeminiAvailable();
    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Forensic Intelligence Dashboard</h2>
            <p className="text-slate-600 mb-6">High-level insights and resources for digital forensics professionals.</p>
            
            {!geminiAvailable && (
                 <Card className="mb-6 bg-amber-50 border-l-4 border-amber-400">
                    <h3 className="font-bold text-amber-800">Gemini AI Features Disabled</h3>
                    <p className="text-amber-700 text-sm">The dynamic widgets on this dashboard require a Gemini API key. Please refer to the setup instructions to enable this functionality.</p>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[75vh]">
                <div className="lg:col-span-2 h-full">
                    <EmergingThreatsWidget />
                </div>
                <div className="flex flex-col gap-6 h-full">
                    <ConceptOfTheDayWidget />
                    <ToolChecklistWidget />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;