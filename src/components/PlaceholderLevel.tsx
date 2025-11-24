import React from 'react';

export const PlaceholderLevel: React.FC<{ title: string; onComplete?: () => void }> = ({ title }) => (
  <div className="p-8 text-center">
    <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
    <p className="text-slate-400">Under Construction...</p>
  </div>
);

