import React from 'react';
import { Search } from 'lucide-react';

export function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-500" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-4 h-10 bg-[#0c0c0f] border border-gray-900 hover:border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150"
        placeholder="Search workspaces by name or tag..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}