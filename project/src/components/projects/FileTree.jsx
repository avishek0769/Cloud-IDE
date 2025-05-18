import React from 'react'
import { Folder, File } from 'lucide-react';

function FileTreeNode({ fileName, nodes, onSelect, path }) {
    const isDir = nodes != null;

    return (
        <div onClick={() => {
            if (isDir) return;
            console.log(path)
            onSelect(path)
        }} style={{ paddingLeft: "17px", fontWeight: isDir ? 500 : "normal", fontSize: isDir ? 18 : 16, cursor: isDir ? "default" : "pointer", marginTop: isDir ? 9 : 3 }}>

            <div className='flex items-center gap-3'>
                {isDir ? <Folder color='#ffb703' fill='#ffb703' size={20} /> : <File color='#3a86ff' fill='#3a86ff' size={20} />}
                {fileName}
            </div>

            {nodes && <ul>
                {Object.keys(nodes).map(child => (
                    <li key={child}>
                        <FileTreeNode onSelect={onSelect} path={path + "/" + child} fileName={child} nodes={nodes[child]} />
                    </li>
                ))}
            </ul>}
        </div>
    )
}

function FileTree({ projectName, tree, onSelect }) {
    return (
        <div>
            <FileTreeNode onSelect={onSelect} path={""} fileName={projectName} nodes={tree} />
        </div>
    )
}

export default FileTree
