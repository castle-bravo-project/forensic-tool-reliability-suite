import React from 'react';

export interface NavItem {
  name: string;
  path: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  children?: NavItem[];
}

export type HashResults = {
  authentic: string;
  compromised: string;
} | null;

export type MetadataResults = {
  authentic: Record<string, string> | null;
  compromised: Record<string, string> | null;
} | null;

export interface RecoveredFile {
    name: string;
    status: 'Valid' | 'Partially recovered' | 'Corrupted' | 'Recovered';
    integrity: string;
    notes: string;
}

export type CarvingResults = {
  authentic: RecoveredFile[];
  compromised: RecoveredFile[];
} | null;

// New Types for all modules

export interface DiskImageReport {
    status: 'Successful' | 'Completed with errors' | 'Failed';
    sourceDevice: string;
    targetImage: string;
    totalSectors: number;
    badSectors: number;
    startTime: string;
    endTime: string;
    sourceHash: string;
    targetHash: string;
    verification: 'Successful' | 'Failed' | 'Not performed';
}

export type DiskImageResults = {
  authentic: DiskImageReport;
  compromised: DiskImageReport;
} | null;

export interface NetworkConnection {
    sourceIp: string;
    destIp: string;
    destPort: number;
    protocol: 'TCP' | 'UDP' | 'HTTPS' | 'HTTP' | 'DNS';
    summary: string;
    status: 'Established' | 'Benign' | 'Suspicious';
}

export type TrafficAnalysisResults = {
    authentic: NetworkConnection[];
    compromised: NetworkConnection[];
} | null;

export interface TimelineEvent {
    timestamp: string;
    source: 'MFT' | 'System Log' | 'Browser History' | 'Fabricated';
    eventType: string;
    details: string;
    confidence: 'High' | 'Medium' | 'Low' | 'Altered';
}

export type TimelineAnalysisResults = {
    authentic: TimelineEvent[];
    compromised: TimelineEvent[];
} | null;


export interface MobileArtifact {
    type: 'Contact' | 'SMS' | 'Call' | 'Photo';
    summary: string;
    status: 'Extracted' | 'Fabricated';
}
export interface MobileExtractionReport {
    extractionType: 'Logical' | 'Physical (Fake)';
    status: 'Completed with limitations' | 'Complete (Fake)';
    deviceModel: string;
    osVersion: string;
    data: MobileArtifact[];
}
export type MobileExtractionResults = {
    authentic: MobileExtractionReport;
    compromised: MobileExtractionReport;
} | null;

export interface MemoryProcess {
    pid: number;
    ppid: number;
    name: string;
    path: string;
    status: 'Authentic' | 'Injected';
    details: string;
}
export type MemoryAnalysisResults = {
    authentic: MemoryProcess[];
    compromised: MemoryProcess[];
} | null;


export interface DatabaseRecord {
    id: number;
    user: string;
    action: string;
    timestamp: string;
    status: 'Active' | 'Deleted - Intact' | 'Deleted - Overwritten' | 'Fabricated Deletion';
}
export type DatabaseForensicsResults = {
    authentic: DatabaseRecord[];
    compromised: DatabaseRecord[];
} | null;


export interface AntiForensicFinding {
    technique: string;
    status: 'Detected' | 'Not Detected';
    details: string;
}
export type AntiForensicsResults = {
    authentic: AntiForensicFinding[];
    compromised: AntiForensicFinding[];
} | null;


export interface CustodyEvent {
    id: number;
    timestamp: string;
    handler: string;
    action: string;
    hash: string;
    signature: string;
    status: 'Valid' | 'Invalid Signature' | 'Altered';
}
export type CoCResults = {
    authentic: CustodyEvent[];
    compromised: CustodyEvent[];
} | null;


// --- NEW FEATURE TYPES ---

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface GroundedInsight {
  text: string;
  chunks?: GroundingChunk[];
}

export interface StrategyScenario {
    id: string;
    title: string;
    description: string;
    compromisedReport: React.ReactNode;
    options: { id: string; text: string }[];
    feedbackPrompt: (choiceText: string) => string;
}