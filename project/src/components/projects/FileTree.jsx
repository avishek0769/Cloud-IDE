import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  File, 
  ChevronDown, 
  ChevronRight,
  FileCode,
  FileJson,
  FileText,
  Terminal,
  Settings
} from 'lucide-react';

const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
      return <FileCode className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
    case 'ts':
    case 'tsx':
      return <FileCode className="h-4 w-4 text-blue-500 flex-shrink-0" />;
    case 'css':
      return <FileCode className="h-4 w-4 text-teal-400 flex-shrink-0" />;
    case 'html':
      return <FileCode className="h-4 w-4 text-orange-500 flex-shrink-0" />;
    case 'json':
      return <FileJson className="h-4 w-4 text-yellow-600 flex-shrink-0" />;
    case 'md':
      return <FileText className="h-4 w-4 text-emerald-400 flex-shrink-0" />;
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'h':
    case 'hpp':
      return <FileCode className="h-4 w-4 text-purple-400 flex-shrink-0" />;
    case 'c':
      return <FileCode className="h-4 w-4 text-sky-500 flex-shrink-0" />;
    case 'config':
    case 'yml':
    case 'yaml':
      return <Settings className="h-4 w-4 text-gray-400 flex-shrink-0" />;
    default:
      return <File className="h-4 w-4 text-gray-400 flex-shrink-0" />;
  }
};

function FileTreeNode({ fileName, nodes, onSelect, path, selectedFile }) {
  const isDir = nodes != null;
  const [isOpen, setIsOpen] = useState(true);

  // Normalize paths to compare selected file
  const normalizedPath = path.startsWith('/') ? path : '/' + path;
  const isSelected = !isDir && selectedFile === normalizedPath;

  const handleToggle = (e) => {
    e.stopPropagation();
    if (isDir) {
      setIsOpen(!isOpen);
    } else {
      onSelect(normalizedPath);
    }
  };

  // Sort: folders first, then files alphabetically
  const sortedChildren = isDir ? Object.keys(nodes).sort((a, b) => {
    const aIsDir = nodes[a] !== null;
    const bIsDir = nodes[b] !== null;
    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return a.localeCompare(b);
  }) : [];

  return (
    <div className="select-none font-sans w-full">
      <div 
        onClick={handleToggle}
        className={`flex items-center gap-2 py-1.5 px-3 rounded-md cursor-pointer transition-all duration-150 group text-sm my-0.5
          ${isSelected 
            ? 'bg-blue-500/20 text-blue-200 border-l-4 border-blue-500 pl-2' 
            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}`}
      >
        {isDir ? (
          <span className="text-gray-500 group-hover:text-gray-300 transition-colors">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        ) : (
          <span className="w-4" />
        )}

        {isDir ? (
          isOpen 
            ? <FolderOpen className="h-4 w-4 text-blue-400 fill-blue-400/10 flex-shrink-0" /> 
            : <Folder className="h-4 w-4 text-blue-400 fill-blue-400/20 flex-shrink-0" />
        ) : (
          getFileIcon(fileName)
        )}

        <span className={`truncate text-xs tracking-wide ${isSelected ? 'font-semibold' : 'font-medium'}`}>
          {fileName}
        </span>
      </div>

      {isDir && isOpen && (
        <div className="ml-4 pl-2.5 border-l border-gray-800/80 my-0.5 flex flex-col gap-0.5">
          {sortedChildren.map(child => (
            <FileTreeNode 
              key={child}
              onSelect={onSelect} 
              path={path + "/" + child} 
              fileName={child} 
              nodes={nodes[child]} 
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileTree({ projectName, tree, onSelect, selectedFile }) {
  return (
    <div className="py-4 px-2 h-full overflow-y-auto custom-scrollbar flex flex-col bg-[#121212]">
      <div className="px-3 mb-3 flex items-center justify-between text-gray-500 uppercase tracking-wider text-[10px] font-bold">
        <span>Files</span>
        <Terminal className="h-3 w-3 text-gray-500" />
      </div>
      <div className="flex-1 w-full overflow-x-hidden">
        {tree ? (
          <FileTreeNode 
            onSelect={onSelect} 
            path={""} 
            fileName={projectName} 
            nodes={tree} 
            selectedFile={selectedFile}
          />
        ) : (
          <div className="flex items-center justify-center py-8 text-xs text-gray-500">
            <span>Loading tree...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileTree;
