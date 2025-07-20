
import React from 'react';
import { Card } from '../components';
import { FolderIcon } from '../components';

interface PlaceholderPageProps {
  title: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-6">{title}</h2>
      <Card>
        <div className="text-center py-16">
          <FolderIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">Coming Soon!</h3>
          <p className="text-slate-500 mt-2">This interactive demonstration is currently under development.</p>
        </div>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
