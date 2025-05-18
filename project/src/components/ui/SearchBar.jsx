import React from 'react';
import { Search } from 'lucide-react';

export function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-500" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 bg-[#111] border border-gray-900 rounded-md leading-5 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder="Search projects..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}