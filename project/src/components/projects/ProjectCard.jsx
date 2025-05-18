import { FolderGit2, Clock, MoreVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
  }, [setProjectLang, project])

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

  return (
    <div className="bg-[#181818] rounded-lg border border-gray-900 hover:border-gray-800 transition-colors">
      {isDeleting == project._id ? <div className='flex justify-center my-20'>
        <MoonLoader size={30} color='white' />
      </div>
        :
        <>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                <FolderGit2 className="h-8 w-8 text-blue-400" />
                <div className="ml-2">
                  <h3 className="text-lg font-medium text-white">{project.name}</h3>
                  <p className="text-sm text-gray-400">{projectLang}</p>
                </div>
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`text-gray-400 hover:text-white transition-colors p-1 ${activeTab == "shared" && "hidden"}`}
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button
                        onClick={() => {
                          onEdit(project);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        role="menuitem"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onDelete(project);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
                        role="menuitem"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-400 line-clamp-2 w-full overflow-hidden h-[40px]">{project.description}</p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span className='font-bold mr-2'>Last opened</span>
              <span>{new Date(project.lastOpened).toString().split("GMT")[0]}</span>
            </div>
          </div>

          <div className="px-6 py-4 bg-black border-t border-gray-900 rounded-b-lg">
            <button onClick={handleOpenProject} className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Open Project →
            </button>
          </div>
        </>
      }
    </div>
  );
}