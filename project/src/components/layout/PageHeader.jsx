import { Plus } from 'lucide-react';

export function PageHeader({ title, onNewProject }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {onNewProject && (
        <button
          onClick={onNewProject}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Project
        </button>
      )}
    </div>
  );
}