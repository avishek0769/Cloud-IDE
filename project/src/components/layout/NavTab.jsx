import React from 'react';

function NavTab({ setActiveTab, activeTab }) {
  return (
    <div className="mb-8 flex justify-center">
      <div className="flex bg-[#111113] p-1 rounded-xl border border-gray-900/60 shadow-inner">
        <button
          onClick={() => setActiveTab('your')}
          className={`
            px-6 py-2 rounded-lg font-bold text-xs transition-all duration-200 tracking-wider uppercase
            ${activeTab === 'your'
              ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.15)]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
            }
          `}
        >
          Your Projects
        </button>
        <button
          onClick={() => setActiveTab('shared')}
          className={`
            px-6 py-2 rounded-lg font-bold text-xs transition-all duration-200 tracking-wider uppercase
            ${activeTab === 'shared'
              ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.15)]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
            }
          `}
        >
          Shared To Me
        </button>
      </div>
    </div>
  );
}

export default NavTab;