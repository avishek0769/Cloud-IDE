import React, { useState } from 'react'

function NavTab({ setActiveTab, activeTab }) {

    return (
        <div className="mb-6 border-b border-gray-800">
            <nav className="-mb-px flex justify-center">
                <div className="flex space-x-8 gap-32">
                    <button
                        onClick={() => setActiveTab('your')}
                        className={`
                            py-4 px-1 border-b-2 font-medium text-lg whitespace-nowrap
                            ${activeTab === 'your'
                                ? 'border-blue-500 text-blue-500'
                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                            }
                    `}>
                        Your Projects
                    </button>
                    <button
                        onClick={() => setActiveTab('shared')}
                        className={`
                            py-4 px-1 border-b-2 font-medium text-lg whitespace-nowrap
                            ${activeTab === 'shared'
                                ? 'border-blue-500 text-blue-500'
                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                            }
                    `}>
                        Projects Shared To Me
                    </button>
                </div>
            </nav>
        </div>
    )
}

export default NavTab