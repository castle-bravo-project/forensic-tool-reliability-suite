
import React, { useState, Fragment } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import type { NavItem } from './types';
import { HashIcon, FolderIcon, NetworkIcon, DeviceIcon, IntegrityIcon, ChevronDownIcon, LightbulbIcon, ScaleIcon } from './components';

import DashboardPage from './pages/DashboardPage';
import StrategySimulatorPage from './pages/StrategySimulatorPage';
import HashVerificationPage from './pages/HashVerification';
import MetadataExtractionPage from './pages/MetadataExtraction';
import FileCarvingPage from './pages/FileCarving';
import DiskImagingVerificationPage from './pages/DiskImagingVerification';
import NetworkTrafficAnalysisPage from './pages/NetworkTrafficAnalysis';
import TimelineAnalysisPage from './pages/TimelineAnalysis';
import MobileDeviceExtractionPage from './pages/MobileDeviceExtraction';
import MemoryDumpAnalysisPage from './pages/MemoryDumpAnalysis';
import DatabaseForensicsPage from './pages/DatabaseForensics';
import AntiForensicsDetectionPage from './pages/AntiForensicsDetection';
import ChainOfCustodyTrackingPage from './pages/ChainOfCustodyTracking';

// --- CONSTANTS ---
const NAVIGATION_ITEMS: NavItem[] = [
  {
    name: 'Intelligence Dashboard',
    path: '/dashboard',
    icon: LightbulbIcon,
  },
  {
    name: 'Strategy Simulator',
    path: '/strategy-simulator',
    icon: ScaleIcon,
  },
  {
    name: 'Hash Verification',
    path: '/hash-verification',
    icon: HashIcon,
  },
  {
    name: 'File System Forensics',
    path: '/file-system',
    icon: FolderIcon,
    children: [
      { name: 'Metadata Extraction', path: '/file-system/metadata-extraction', icon: ({ className }) => <span className={className} /> },
      { name: 'File Carving/Recovery', path: '/file-system/file-carving', icon: ({ className }) => <span className={className} /> },
      { name: 'Disk Imaging Verification', path: '/file-system/disk-imaging', icon: ({ className }) => <span className={className} /> },
    ],
  },
  {
    name: 'Network Forensics',
    path: '/network',
    icon: NetworkIcon,
    children: [
      { name: 'Traffic Analysis', path: '/network/traffic-analysis', icon: ({ className }) => <span className={className} /> },
      { name: 'Timeline Analysis', path: '/network/timeline-analysis', icon: ({ className }) => <span className={className} /> },
    ],
  },
  {
    name: 'Device Forensics',
    path: '/device',
    icon: DeviceIcon,
    children: [
      { name: 'Mobile Device Extraction', path: '/device/mobile-extraction', icon: ({ className }) => <span className={className} /> },
      { name: 'Memory Dump Analysis', path: '/device/memory-analysis', icon: ({ className }) => <span className={className} /> },
      { name: 'Database Forensics', path: '/device/database-forensics', icon: ({ className }) => <span className={className} /> },
    ],
  },
  {
    name: 'Evidence Integrity',
    path: '/integrity',
    icon: IntegrityIcon,
    children: [
        { name: 'Anti-Forensics Detection', path: '/integrity/anti-forensics', icon: ({ className }) => <span className={className} /> },
        { name: 'Chain of Custody', path: '/integrity/chain-of-custody', icon: ({ className }) => <span className={className} /> },
    ]
  }
];

// --- COMPONENTS ---

const NavItemComponent: React.FC<{ item: NavItem }> = ({ item }) => {
  const location = useLocation();
  const isParentActive = location.pathname.startsWith(item.path);
  const [isOpen, setIsOpen] = useState(isParentActive);

  // Auto-open parent if a child is active
  React.useEffect(() => {
    setIsOpen(isParentActive);
  }, [isParentActive]);

  if (!item.children) {
    return (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
            isActive ? 'bg-brand-blue-600 text-white' : 'text-slate-200 hover:bg-brand-blue-900 hover:text-white'
          }`
        }
      >
        <item.icon className="w-5 h-5 mr-3" />
        {item.name}
      </NavLink>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
          isParentActive && !isOpen ? 'bg-brand-blue-700 text-white' : 'text-slate-200 hover:bg-brand-blue-900 hover:text-white'
        }`}
      >
        <span className="flex items-center">
          <item.icon className="w-5 h-5 mr-3" />
          {item.name}
        </span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pt-2 pl-6 space-y-1">
          {item.children.map(child => (
            <NavLink
              key={child.path}
              to={child.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive ? 'bg-brand-blue-600 text-white' : 'text-slate-300 hover:bg-brand-blue-900 hover:text-white'
                }`
              }
            >
              {child.name}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};


const Sidebar: React.FC = () => (
    <div className="w-72 bg-brand-blue-950 text-white flex flex-col p-4 overflow-y-auto">
        <div className="flex items-center mb-8 shrink-0">
            <IntegrityIcon className="w-10 h-10 text-brand-blue-400" />
            <h1 className="text-xl font-bold ml-2">Forensic Reliability Suite</h1>
        </div>
        <nav className="space-y-2">
            {NAVIGATION_ITEMS.map(item => <NavItemComponent key={item.path} item={item} />)}
        </nav>
    </div>
);


const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-100 font-sans">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/strategy-simulator" element={<StrategySimulatorPage />} />
            <Route path="/hash-verification" element={<HashVerificationPage />} />
            <Route path="/file-system/metadata-extraction" element={<MetadataExtractionPage />} />
            <Route path="/file-system/file-carving" element={<FileCarvingPage />} />
            <Route path="/file-system/disk-imaging" element={<DiskImagingVerificationPage />} />
            <Route path="/network/traffic-analysis" element={<NetworkTrafficAnalysisPage />} />
            <Route path="/network/timeline-analysis" element={<TimelineAnalysisPage />} />
            <Route path="/device/mobile-extraction" element={<MobileDeviceExtractionPage />} />
            <Route path="/device/memory-analysis" element={<MemoryDumpAnalysisPage />} />
            <Route path="/device/database-forensics" element={<DatabaseForensicsPage />} />
            <Route path="/integrity/anti-forensics" element={<AntiForensicsDetectionPage />} />
            <Route path="/integrity/chain-of-custody" element={<ChainOfCustodyTrackingPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
