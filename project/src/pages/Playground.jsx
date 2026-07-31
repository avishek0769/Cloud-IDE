import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import Terminal from '../components/projects/Terminal'
import FileTree from '../components/projects/FileTree'
import Editor from '@monaco-editor/react';
import { Context } from '../context/ContextProvider';
import { io } from 'socket.io-client';
import AlertMessage from '../components/ui/AlertMessage';
import LoadingScreen from '../components/ui/LoadingScreen';
import { LucideDelete, LucidePlay, LucideShare2, FileCode, Moon, Sun, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';


function Playground() {
    const [tree, setTree] = useState()
    const [runState, setRunState] = useState("Run")
    const [code, setCode] = useState("")
    const [selectedFile, setSelectedFile] = useState("")
    const [containerUrl, setContainerUrl] = useState(undefined)
    const [currentExtension, setCurrentExtension] = useState("")
    const [isSocketConnected, setIsSocketConnected] = useState(false)
    const [showAlert, setShowAlert] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [exposedUrl, setExposedUrl] = useState(null);
    const [isSharedDropDownHidden, setIsSharedDropDownHidden] = useState(true);
    const decorationIdsRef = useRef([]);
    const { socket, domain, setSocket, currentUser } = useContext(Context)
    const urlParams = new URLSearchParams(window.location.search)
    const containerId = urlParams.get("containerId")
    const token = urlParams.get("token")
    const navigate = useNavigate()
    const editorRef = useRef(null)
    const monacoRef = useRef(null)
    const isRemoteUpdate = useRef(false);

    // Resizing State
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const [terminalHeight, setTerminalHeight] = useState(240);

    const handleSidebarResizeStart = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = sidebarWidth;

        const doDrag = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const newWidth = Math.max(180, Math.min(startWidth + deltaX, 500));
            setSidebarWidth(newWidth);
        };

        const stopDrag = () => {
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);
        };

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    };

    const handleTerminalResizeStart = (e) => {
        e.preventDefault();
        const startY = e.clientY;
        const startHeight = terminalHeight;

        const doDrag = (moveEvent) => {
            const deltaY = moveEvent.clientY - startY;
            // moving up makes terminal taller, so we subtract deltaY
            const newHeight = Math.max(100, Math.min(startHeight - deltaY, window.innerHeight - 150));
            setTerminalHeight(newHeight);
        };

        const stopDrag = () => {
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);
        };

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    };

    const fetchFileTree = useCallback(() => {
        if (containerUrl) {
            fetch(`${containerUrl}/files`, {
                headers: {
                    "ngrok-skip-browser-warning": "true",
                    "Content-type": "application/json"
                }
            })
            .then(res => res.json())
            .then(data => {
                setTree(data.tree);
            });
        }
    }, [containerUrl]);

    const handleQuit = useCallback(() => {
        setLoading(true)
        fetch(`${domain}/projects/stopContainer/${containerId}`, {
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include"
        })
        .then(res => {
            if (res.status == 444) {
                navigate("/login")
                return
            }
            setTimeout(() => {
                navigate("/dashboard")
            }, 2000);
        })
    }, [domain, containerId])

    useEffect(() => {
        fetchFileTree();
    }, [containerUrl, fetchFileTree, isSocketConnected]);

    const handleCodeFetched = (data) => {
        console.log("Fetched")
        isRemoteUpdate.current = true
        setCode(data)
    }

    const handleRun = useCallback(() => {
        setRunState("Running...")
        let filePath = selectedFile;
        let fileExt = filePath.split(".").pop();
        socket.emit("code:run", { filePath, fileType: fileExt })
    }, [selectedFile, socket])

    const handleShare = useCallback(() => {
        setExposedUrl(null)
        setIsSharedDropDownHidden(false)
        fetch(`${domain}/projects/generateSharableLink/${containerId}`, {
            headers: {
                "Content-type": "application/json",
                "Authorization": currentUser ? `Bearer ${currentUser.accessToken}` : ""
            },
            credentials: "include"
        })
        .then(res => res.json())
        .then(data => {
            setExposedUrl(data.data.url)
        })
    }, [domain])
    
    const handleCursorChange = useCallback((position) => {
        if (!monacoRef.current) {
            console.warn("Monaco instance is not initialized yet!");
            return;
        }
        const range = new monacoRef.current.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
        );
        const newDecorationIds = editorRef.current.deltaDecorations(decorationIdsRef.current, [
            {
                range: range,
                options: { className: "foreign-cursor" }
            }
        ])
        decorationIdsRef.current = newDecorationIds;
    }, [])

    const handleCopy = () => {
        setIsSharedDropDownHidden(true)
        navigator.clipboard.writeText(exposedUrl)
    }

    const handleCodeReceived = (data) => {
        console.log("RE", data)
        const position = editorRef.current.getPosition();

        if(editorRef.current.getValue() != data){
            isRemoteUpdate.current = true
            setCode(data)
            setTimeout(() => {
                editorRef.current.setPosition(position)
            }, 0);
        }
    }

    const showAlertFunc = useCallback((mess) => {
        setShowAlert(true)
        setMessage(mess)
        setTimeout(() => {
            setShowAlert(false)
        }, 3000);
    }, [setShowAlert, setMessage])

    useEffect(() => {
        fetch(`${domain}/projects/startContainer/${containerId}?token=${token? token : ""}`, {
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include"
        })
        .then(res => {
            if (res.status == 444) {
                showAlertFunc("Authentication required. Redirecting to login...");
                setTimeout(() => {
                    navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
                }, 1500);
                return;
            }
            else if (res.status == 474) {
                showAlertFunc("Token is invalid");
                setLoading(false)
                return
            }
            else if (res.status == 475) {
                showAlertFunc("Authentication required. Redirecting to login...");
                setTimeout(() => {
                    navigate(`/login?redirect=${encodeURIComponent(window.location.search)}`);
                }, 1500);
                return
            }
            else if (res.status > 399) {
                showAlertFunc("Unable to open project");
                setLoading(false)
                return
            }
            else {
                return res.json()
            }
        })
        .then(data => {
            if (data) {
                setContainerUrl(data.data.instanceURL)
            }
        })
        .catch(err => {
            console.log(err)
            showAlertFunc("Error: Refresh to try again");
            setLoading(false);
        });
    }, [setContainerUrl, setLoading, showAlertFunc, domain, containerId, token, navigate])

    useEffect(() => {
        if (selectedFile) {
            let splitFilename = selectedFile.split(".")
            let extension = splitFilename[splitFilename.length - 1]

            if (extension == "js") setCurrentExtension("javascript");
            else setCurrentExtension(extension);
        }
    }, [currentExtension, setCurrentExtension, selectedFile])

    useEffect(() => {
        let a;
        if (selectedFile && code) {
            a = setTimeout(() => {
                let filePath = selectedFile;
                console.log(code)
                console.log(selectedFile)
                socket.emit("file:write", { content: code, path: filePath })
            }, 1500);
        }

        return () => {
            clearTimeout(a)
        }
    }, [code, selectedFile])

    useEffect(() => {
        if (selectedFile) {
            let filePath = selectedFile;
            socket.emit("fetch:code", filePath)
        }
    }, [selectedFile])

    useEffect(() => {
        if (containerUrl) {
            const socket = io(`${containerUrl}`, {
                extraHeaders: {
                    "ngrok-skip-browser-warning": "true"
                }
            });
            socket.on("connect", () => {
                console.log("Socket connected:", socket.connected);
                setSocket(socket);
                setIsSocketConnected(true)
                setLoading(false)
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [setSocket, setIsSocketConnected, containerUrl]);

    const handleEditorMount = (editor, monaco) => {
        monacoRef.current = monaco;
        editorRef.current = editor

        editor.onDidChangeCursorPosition((event) => {
            socket.emit("cursor-change:send", { socketId: socket.id, position: event.position })
        })
        editor.onDidChangeModelContent((event) => {
            if(isRemoteUpdate.current){
                isRemoteUpdate.current = false;
                return
            }
            const currentData = editorRef.current.getValue()
            socket.emit("text-change:send", { socketId: socket.id, data: currentData})
        })
    }
    
    useEffect(() => {
        if (isSocketConnected && socket.connected) {
            socket.on("file:refresh", fetchFileTree)
            socket.on("fetched:code", handleCodeFetched)
            socket.on("cursor-change:receive", handleCursorChange)
            socket.on("text-change:receive", handleCodeReceived)
            
            return () => {
                socket.off("file:refresh", fetchFileTree)
                socket.off("fetched:code", handleCodeFetched)
                socket.off("cursor-change:receive", handleCursorChange)
                socket.off("text-change:receive", handleCodeReceived)
            }
        }
    }, [socket, isSocketConnected])

    return (
        <div className='flex h-[100vh] w-[100vw] bg-[#0d0d0d] overflow-hidden select-none text-gray-200'>
            {showAlert && <AlertMessage message={message} />}
            {loading && <LoadingScreen message={"It may take a while..."} />}

            {/* Sidebar Explorer */}
            <div 
                style={{ width: `${sidebarWidth}px` }} 
                className='flex-shrink-0 bg-[#121212] border-r border-[#262626] relative flex flex-col h-full'
            >
                <div className="flex-1 overflow-y-auto">
                    <FileTree 
                        onSelect={(path) => setSelectedFile(path)} 
                        projectName={"user"} 
                        tree={tree} 
                        selectedFile={selectedFile} 
                    />
                </div>
                
                {/* Horizontal slider handle */}
                <div 
                    onMouseDown={handleSidebarResizeStart}
                    className="absolute top-0 right-0 w-[4px] h-full cursor-col-resize hover:bg-blue-500/80 active:bg-blue-600 transition-colors z-50"
                />
            </div>

            {/* Main Panel */}
            <div className='flex-1 flex flex-col min-w-0 h-full bg-[#181818]'>
                {/* Header Navbar */}
                <div className='bg-[#161616] border-b border-[#262626] px-6 py-2 flex items-center justify-between text-white h-[50px] flex-shrink-0'>
                    {/* Left: Breadcrumbs / Selected File */}
                    <div className="flex items-center gap-2 overflow-hidden mr-4">
                        <button 
                            onClick={handleQuit} 
                            className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        {selectedFile ? (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium truncate">
                                <span className="text-gray-500">workspace</span>
                                {selectedFile.split('/').filter(Boolean).map((part, index, arr) => (
                                    <React.Fragment key={index}>
                                        <span className="text-gray-600">/</span>
                                        <span className={index === arr.length - 1 ? "text-blue-400 font-semibold" : ""}>{part}</span>
                                    </React.Fragment>
                                ))}
                            </div>
                        ) : (
                            <span className="text-xs text-gray-500 italic">No file selected</span>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {selectedFile && (
                            <button 
                                onClick={handleRun} 
                                disabled={runState === "Running..."} 
                                className='h-8 px-4 rounded bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800/50 disabled:text-emerald-500/50 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-500/10'
                            >
                                <LucidePlay size={14} className={runState === "Running..." ? "animate-pulse" : ""} />
                                <span>{runState}</span>
                            </button>
                        )}
                        <button 
                            onClick={handleShare} 
                            className='h-8 px-4 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/15'
                        >
                            <LucideShare2 size={14} />
                            <span>Share</span>
                        </button>
                        <button 
                            onClick={handleQuit} 
                            className='h-8 px-4 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-red-500/15'
                        >
                            <LucideDelete size={14} />
                            <span>Quit</span>
                        </button>
                    </div>
                </div>

                {/* Share Dropdown */}
                <div
                    className={`p-4 w-[24rem] ${isSharedDropDownHidden ? "hidden" : "flex"} flex-col gap-3 bg-[#181818]/95 backdrop-blur-md border border-[#2d2d2d] rounded-lg shadow-2xl absolute right-6 top-[60px] z-[1000] transition-all`}
                >
                    <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-2">
                        <span className="text-xs font-semibold text-gray-300 font-sans">Share Workspace</span>
                        <button onClick={() => setIsSharedDropDownHidden(true)} className="text-gray-500 hover:text-gray-300 text-xs font-medium">Close</button>
                    </div>
                    {exposedUrl ? (
                        <div className="flex flex-col gap-3 font-sans">
                            <p className="text-[11px] text-gray-400">Share this link to edit code in real-time collaboratively.</p>
                            <div className="text-xs font-mono text-gray-300 px-3 py-2 bg-black/60 border border-[#2d2d2d] rounded-md select-all overflow-x-auto whitespace-nowrap scrollbar-none">
                                {exposedUrl}
                            </div>
                            <button 
                                onClick={handleCopy} 
                                className="w-full py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
                            >
                                Copy Link
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center flex-col gap-3 py-4">
                            <MoonLoader size={20} color="#3b82f6" />
                            <p className="text-xs text-gray-400 font-sans">Generating sharing link...</p>
                        </div>
                    )}
                </div>

                {/* Editor Container */}
                <div className='flex-1 min-h-0 bg-[#1e1e1e] flex flex-col relative'>
                    {selectedFile ? (
                        <Editor
                            height="100%"
                            language={currentExtension}
                            value={code}
                            onChange={e => setCode(e)}
                            theme='vs-dark'
                            options={{
                                readOnly: false,
                                fontSize: 13,
                                minimap: { enabled: false },
                                padding: { top: 12 },
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                            }}
                            onMount={handleEditorMount}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3 bg-[#181818]">
                            <FileCode size={48} className="text-gray-800 animate-pulse" />
                            <p className="text-sm font-medium tracking-wide">Select a file from the explorer to start coding</p>
                        </div>
                    )}
                </div>

                {/* Vertical slider handle (Terminal top bar slider) */}
                <div 
                    onMouseDown={handleTerminalResizeStart}
                    className="h-[4px] w-full cursor-row-resize hover:bg-blue-500/80 active:bg-blue-600 transition-colors z-50 flex-shrink-0"
                />

                {/* Terminal Area */}
                <div 
                    style={{ height: `${terminalHeight}px` }} 
                    className='flex-shrink-0 bg-black border-t border-[#262626] overflow-hidden flex flex-col relative'
                >
                    <div className="bg-[#121212] px-4 py-1.5 border-b border-[#262626] flex items-center justify-between text-[11px] font-bold text-gray-400 tracking-wide uppercase select-none">
                        <span>Terminal</span>
                    </div>
                    <div className="flex-1 terminal p-2 overflow-y-auto">
                        {isSocketConnected && <Terminal setRunState={setRunState} />}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Playground
