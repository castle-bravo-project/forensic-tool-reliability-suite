
import React, { useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import type { ChatMessage } from './types';
import { startChatSession, isGeminiAvailable } from './services/geminiService';
import { Chat as GenAIChat } from '@google/genai';

// --- ICONS ---

export const HashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h13.5m-13.5 7.5h13.5m-1.5-15l-1.5 18m-9-18l1.5 18" />
  </svg>
);

export const FileIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

export const NetworkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0112 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686-5.834A8.959 8.959 0 0021 12c0 .778-.099 1.533-.284 2.253m0 0l-4.545 4.545" />
  </svg>
);

export const DeviceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18h3" />
  </svg>
);

export const IntegrityIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
  </svg>
);

export const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

export const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

export const LightbulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a14.994 14.994 0 0 1-4.5 0M9.75 10.5a8.95 8.95 0 1 0 4.5 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 10.5a8.95 8.95 0 1 0 4.5 0a8.95 8.95 0 0 0-4.5 0ZM9.75 4.568c.346.06.687.14.998.24m-1.996 0A12.06 12.06 0 0 0 9.75 4.5c0-.998.224-1.938.62-2.776M14.25 4.568c-.346.06-.687.14-.998.24m1.996 0A12.06 12.06 0 0 1 14.25 4.5c0-.998-.224-1.938-.62-2.776" />
    </svg>
);

export const ScaleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-19.5 0c-.99-.203-1.99-.377-3-.52M6.343 18.343A7.5 7.5 0 0 1 12 15.75c1.96 0 3.807.748 5.207 2.018M5.25 7.5A2.25 2.25 0 0 1 3 5.25m18 0A2.25 2.25 0 0 1 21 7.5m-18 0v4.5A2.25 2.25 0 0 0 5.25 14.25h13.5A2.25 2.25 0 0 0 21 12V7.5" />
    </svg>
);

export const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);


// --- UI COMPONENTS ---

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`bg-white shadow-md rounded-lg p-6 ${className || ''}`}>
    {children}
  </div>
);

export const WidgetCard: React.FC<CardProps> = ({ children, className }) => (
  <div className={`bg-white shadow-md rounded-lg h-full flex flex-col ${className || ''}`}>
    {children}
  </div>
);


interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = "px-4 py-2 rounded-md font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    primary: "bg-brand-blue-600 text-white hover:bg-brand-blue-700 focus:ring-brand-blue-500",
    secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400",
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Spinner = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-600"></div>
);

// --- COMPLEX COMPONENTS ---

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, acceptedFileTypes }) => {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      setFileName(e.dataTransfer.files[0].name);
      e.dataTransfer.clearData();
    }
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <label
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors ${dragging ? 'border-brand-blue-500' : 'border-slate-300'}`}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <UploadIcon className="w-10 h-10 mb-3 text-slate-400"/>
        {fileName ? (
          <p className="font-semibold text-brand-blue-600">{fileName}</p>
        ) : (
          <>
            <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-slate-500">{acceptedFileTypes || 'Any file type'}</p>
          </>
        )}
      </div>
      <input type="file" className="hidden" onChange={handleFileChange} accept={acceptedFileTypes} />
    </label>
  );
};

interface TerminalOutputProps {
    content: ReactNode;
}
export const TerminalOutput: React.FC<TerminalOutputProps> = ({ content }) => (
    <div className="bg-slate-900 rounded-lg shadow-inner overflow-hidden">
        <div className="bg-slate-700 px-4 py-2 flex items-center">
            <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="ml-4 text-slate-300 text-xs font-semibold">/bin/bash</span>
        </div>
        <pre className="p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap break-all overflow-x-auto">
            <code>{content}</code>
        </pre>
    </div>
);

interface ComparisonViewProps {
  leftTitle: string;
  rightTitle: string;
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  leftTerminalContent?: React.ReactNode;
  rightTerminalContent?: React.ReactNode;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ leftTitle, rightTitle, leftContent, rightContent, leftTerminalContent, rightTerminalContent }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
    <Card className="border-t-4 border-red-500 flex flex-col">
      <h3 className="text-lg font-bold text-red-600 mb-4">{leftTitle}</h3>
      <div className="flex-grow">{leftContent}</div>
      {leftTerminalContent && (
          <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-600 mb-2">Execution Log</h4>
              <TerminalOutput content={leftTerminalContent} />
          </div>
      )}
    </Card>
    <Card className="border-t-4 border-green-500 flex flex-col">
      <h3 className="text-lg font-bold text-green-600 mb-4">{rightTitle}</h3>
      <div className="flex-grow">{rightContent}</div>
      {rightTerminalContent && (
          <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-600 mb-2">Execution Log</h4>
              <TerminalOutput content={rightTerminalContent} />
          </div>
      )}
    </Card>
  </div>
);


interface InfoPanelProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-slate-100 rounded-lg mt-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-slate-700 hover:bg-slate-200 rounded-lg"
            >
                <span>{title}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 pt-0 text-slate-600 space-y-2">
                    {children}
                </div>
            )}
        </div>
    );
};


interface ModeSwitcherProps {
  mode: 'simulation' | 'live';
  onModeChange: (mode: 'simulation' | 'live') => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onModeChange }) => (
  <div className="flex items-center justify-center p-1 rounded-lg bg-slate-200 mb-6 max-w-sm mx-auto">
    <button
      onClick={() => onModeChange('simulation')}
      className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors w-1/2 ${
        mode === 'simulation' ? 'bg-white text-brand-blue-600 shadow' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      Simulation
    </button>
    <button
      onClick={() => onModeChange('live')}
      className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors w-1/2 ${
        mode === 'live' ? 'bg-white text-brand-blue-600 shadow' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      Live Data
    </button>
  </div>
);


// --- LEGAL ANALYSIS COMPONENTS ---

interface Tab {
  id: string;
  label: string;
}

interface TabbedContentProps {
  tabs: Tab[];
  children: (activeTab: string) => React.ReactNode;
}

export const TabbedContent: React.FC<TabbedContentProps> = ({ tabs, children }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  return (
    <div>
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-brand-blue-500 text-brand-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="pt-6">
        {children(activeTab)}
      </div>
    </div>
  );
};

export const Question: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="border-l-4 border-slate-300 pl-4 py-1">
        <p className="italic text-slate-700">"{children}"</p>
    </div>
);

export const CaseLawSummary: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-4 rounded-md bg-slate-50 border border-slate-200">
        <h4 className="font-semibold text-slate-800">{title}</h4>
        <p className="mt-1 text-sm text-slate-600">{children}</p>
    </div>
);

export const RuleOfEvidence: React.FC<{ rule: string, children: React.ReactNode }> = ({ rule, children }) => (
    <div className="p-4 rounded-md bg-slate-50 border border-slate-200">
        <h4 className="font-semibold text-slate-800">{rule}</h4>
        <p className="mt-1 text-sm text-slate-600">{children}</p>
    </div>
);

interface LegalImpactAnalysisProps {
    caseLaw: React.ReactNode;
    crossExamination: React.ReactNode;
    rulesOfEvidence: React.ReactNode;
    onGenerateDoc: () => void;
}

export const DaubertButton: React.FC<{onClick: () => void, disabled?: boolean}> = ({onClick, disabled}) => (
    <Button variant="secondary" onClick={onClick} disabled={disabled} className="mt-4 w-full sm:w-auto">
        <DownloadIcon className="w-4 h-4 mr-2 inline-block" />
        Generate Daubert Motion Outline
    </Button>
);

export const LegalImpactAnalysis: React.FC<LegalImpactAnalysisProps> = ({ caseLaw, crossExamination, rulesOfEvidence, onGenerateDoc }) => {
    const tabs: Tab[] = [
        { id: 'cross-exam', label: 'Cross-Examination Questions' },
        { id: 'case-law', label: 'Relevant Case Law' },
        { id: 'rules', label: 'Rules of Evidence' },
    ];

    return (
        <InfoPanel title="Legal Impact & Strategy">
            <TabbedContent tabs={tabs}>
                {(activeTab) => {
                    switch (activeTab) {
                        case 'cross-exam':
                            return <div className="space-y-4 text-sm">{crossExamination}</div>;
                        case 'case-law':
                            return <div className="space-y-4">{caseLaw}</div>;
                        case 'rules':
                            return <div className="space-y-4">{rulesOfEvidence}</div>;
                        default:
                            return null;
                    }
                }}
            </TabbedContent>
             <div className="pt-4 border-t border-slate-200 mt-4">
                <DaubertButton onClick={onGenerateDoc} />
            </div>
        </InfoPanel>
    );
};


// --- AI CHAT COMPONENT ---

interface ChatProps {
    initialPrompt: string;
    trigger: any;
}

export const Chat: React.FC<ChatProps> = ({ initialPrompt, trigger }) => {
    const [chatSession, setChatSession] = useState<GenAIChat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userInput, setUserInput] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [hasStarted, setHasStarted] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (trigger && !hasStarted && isGeminiAvailable()) {
            setHasStarted(true);
            const start = async () => {
                setIsLoading(true);
                const session = await startChatSession();
                setChatSession(session);
                setMessages([{ role: 'user', content: initialPrompt }]);
                
                try {
                    const stream = await session.sendMessageStream({ message: initialPrompt });
                    let currentResponse = '';
                    setMessages(prev => [...prev, { role: 'model', content: '' }]);
                    for await (const chunk of stream) {
                        currentResponse += chunk.text;
                        setMessages(prev => {
                           const newMessages = [...prev];
                           newMessages[newMessages.length - 1].content = currentResponse;
                           return newMessages;
                        });
                    }
                } catch (e) {
                    console.error(e);
                     setMessages(prev => [...prev, { role: 'model', content: "An error occurred while fetching insights." }]);
                } finally {
                    setIsLoading(false);
                }
            };
            start();
        }
    }, [trigger, hasStarted, initialPrompt]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || !chatSession || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', content: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);
        
        try {
            const stream = await chatSession.sendMessageStream({ message: userInput });
            let currentResponse = '';
            setMessages(prev => [...prev, { role: 'model', content: '' }]);
            for await (const chunk of stream) {
                currentResponse += chunk.text;
                setMessages(prev => {
                   const newMessages = [...prev];
                   newMessages[newMessages.length - 1].content = currentResponse;
                   return newMessages;
                });
            }
        } catch(e) {
            console.error(e);
            setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isGeminiAvailable()) {
        return (
            <Card className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Forensic Insights Chat</h3>
                <p className="text-sm text-amber-600">Gemini chat is unavailable. An API key is required for this feature.</p>
            </Card>
        );
    }
    
    if (!hasStarted) {
        return null;
    }

    return (
        <Card className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Forensic Insights Chat</h3>
            <div className="h-96 flex flex-col">
                <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4 mb-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-lg px-4 py-2 max-w-lg ${msg.role === 'user' ? 'bg-brand-blue-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
                               <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length -1].role === 'user' && (
                         <div className="flex justify-start">
                             <div className="rounded-lg px-4 py-2 max-w-lg bg-slate-200 text-slate-800">
                                 <div className="flex items-center space-x-2">
                                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></div>
                                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></div>
                                 </div>
                             </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="flex items-center border-t border-slate-200 pt-4">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ask a follow-up question..."
                        className="flex-grow px-4 py-2 border border-slate-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !userInput.trim()} className="rounded-l-none">
                        Send
                    </Button>
                </form>
            </div>
        </Card>
    );
};
