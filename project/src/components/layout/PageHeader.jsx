import React from 'react';
import { Plus } from 'lucide-react';

export function PageHeader({ title, onNewProject }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-900 pb-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and access your cloud-hosted developer workspaces.</p>
      </div>
      {onNewProject && (
        <button
          onClick={onNewProject}
          className="inline-flex items-center px-5 h-10 border border-transparent text-sm font-bold rounded-lg text-black bg-white hover:bg-gray-100 active:scale-[0.98] shadow-[0_4px_20px_rgba(255,255,255,0.06)] transition-all duration-150"
        >
          <Plus className="h-4 w-4 mr-1.5 stroke-[3px]" />
          New Project
        </button>
      )}
    </div>
  );
}