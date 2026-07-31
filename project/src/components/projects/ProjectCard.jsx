import React, { useEffect, useRef, useState } from 'react';
import { FolderGit2, Clock, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';

export function ProjectCard({ project, onEdit, onDelete, isDeleting, activeTab }) {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [projectLang, setProjectLang] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    if(project.language == "cpp") setProjectLang("C++");
    else if(project.language == "c") setProjectLang("C");
    else if(project.language == "js") setProjectLang("Node.js");
    else setProjectLang(project.language || "Unknown");
  }, [project])

  const handleOpenProject = (e) => {
    if(activeTab == "your") navigate(`/playground?containerId=${project.containerId}`);
    else navigate(`/playground?containerId=${project.containerId}&token=${project.tokenOfProof}`)
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLangStyles = () => {
    switch (project.language) {
      case 'js':
        return {
          glow: 'hover:shadow-yellow-500/[0.02]',
          iconBg: 'bg-yellow-500/10 text-yellow-500',
        };
      case 'cpp':
        return {
          glow: 'hover:shadow-purple-500/[0.02]',
          iconBg: 'bg-purple-500/10 text-purple-400',
        };
      case 'c':
        return {
          glow: 'hover:shadow-blue-500/[0.02]',
          iconBg: 'bg-blue-500/10 text-blue-400',
        };
      default:
        return {
          glow: 'hover:shadow-gray-500/[0.02]',
          iconBg: 'bg-gray-800 text-gray-400',
        };
    }
  };

  const styles = getLangStyles();

  return (
    <div className={`bg-[#0c0c0f] rounded-xl border border-gray-900 hover:border-gray-800/80 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-[210px] shadow-lg group ${styles.glow}`}>
      {isDeleting == project._id ? (
        <div className='flex flex-col items-center justify-center h-full gap-3 py-10'>
          <MoonLoader size={24} color='#3b82f6' />
          <span className="text-xs text-gray-500 font-semibold font-sans">Deleting project...</span>
        </div>
      ) : (
        <>
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 duration-300 ${styles.iconBg}`}>
                    <FolderGit2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-md font-bold text-white tracking-wide truncate max-w-[170px]">{project.name}</h3>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5">{projectLang}</p>
                  </div>
                </div>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`text-gray-500 hover:text-white rounded-lg p-1.5 hover:bg-gray-800/50 transition-all duration-150 ${activeTab == "shared" && "hidden"}`}
                  >
                    <MoreVertical className="h-4.5 w-4.5" />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-1.5 w-40 rounded-lg shadow-xl bg-[#121215] border border-gray-800/80 ring-1 ring-black/10 z-10 py-1 font-sans">
                      <button
                        onClick={() => {
                          onEdit(project);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-semibold text-gray-400 hover:bg-gray-800 hover:text-white flex items-center gap-2 transition-colors"
                      >
                        <Edit2 size={12} />
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          onDelete(project);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-400 line-clamp-2 leading-relaxed overflow-hidden h-[34px]">
                {project.description || "No description provided."}
              </p>
            </div>

            <div className="mt-4 flex items-center text-[10px] text-gray-500 font-medium">
              <Clock className="h-3 w-3 mr-1 text-gray-600" />
              <span className='mr-1.5 text-gray-600 uppercase font-bold tracking-wider'>Last opened</span>
              <span className="truncate">{new Date(project.lastOpened).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
          </div>

          <div className="px-5 py-3 bg-[#08080a]/80 border-t border-gray-900/60 flex justify-between items-center rounded-b-xl">
            <button 
              onClick={handleOpenProject} 
              className="text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors flex items-center gap-1 group-hover:translate-x-0.5 duration-200"
            >
              Open Project
              <span className="font-sans font-normal transition-transform group-hover:translate-x-0.5 duration-200">→</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}