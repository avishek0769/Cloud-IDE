import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import Terminal from '../components/projects/Terminal'
import FileTree from '../components/projects/FileTree'
import Editor from '@monaco-editor/react';
import { Context } from '../context/ContextProvider';
import { io } from 'socket.io-client';
import AlertMessage from '../components/ui/AlertMessage';
import LoadingScreen from '../components/ui/LoadingScreen';
import { LucideDelete, LucidePlay, LucideShare2 } from 'lucide-react';
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
        setTimeout(() => {
            navigate("/dashboard")
        }, 2000);
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
        let filePath = selectedFile.split(" > ").join("/").slice(0, selectedFile.length - 1);
        let fileExt = filePath.split("/").slice(-1)[0].split(".")[1]
        socket.emit("code:run", { filePath, fileType: fileExt })
    }, [selectedFile, socket])

    const handleShare = useCallback(() => {
        setExposedUrl(null)
        setIsSharedDropDownHidden(false)
        fetch(`${domain}/projects/generateSharableLink/${containerId}`, {
            headers: {
                "Content-type": "application/json"
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
            if (res.status == 474) {
                showAlertFunc("Token is invalid");
                setLoading(false)
                return
            }
            else if (res.status == 475) {
                showAlertFunc("Authentication reqiured");
                setLoading(false)
                return
            }
            else if (res.status > 399) {
                showAlertFunc("Unable to open project");
                setLoading(false)
                return
            }
            else if (res.status == 444) {
                navigate("/login")
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
    }, [setContainerUrl, setLoading, showAlertFunc, domain])

    useEffect(() => {
        if (selectedFile && selectedFile.length) {
            let splitArray = selectedFile.split(" > ")
            let splitFilename = splitArray[splitArray.length - 1].split(".")
            let extension = splitFilename[splitFilename.length - 1]

            if (extension == "js") setCurrentExtension("javascript");
            else setCurrentExtension(extension);
        }
    }, [currentExtension, setCurrentExtension, selectedFile])

    useEffect(() => {
        let a;
        if (selectedFile.length && code) {
            a = setTimeout(() => {
                let filePath = selectedFile.split(" > ").join("/").slice(0, selectedFile.length - 1);
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
        if (selectedFile.length) {
            let filePath = selectedFile.split(" > ").join("/").slice(0, selectedFile.length - 1);
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
        <div className='flex h-[100vh] w-[100vw] bg-black'>
            {showAlert && <AlertMessage message={message} />}
            {loading && <LoadingScreen message={"It may take a while..."} />}

            <div className='bg-[#1e1e1e] w-[18%] text-white border border-l-0 border-t-0 border-b-0'>
                <FileTree onSelect={(path) => setSelectedFile(path.replaceAll("/", " > "))} projectName={"user"} tree={tree} />
            </div>
            <div className='w-[82%]'>
                <div className='bg-[#1e1e1e] py-1 px-16 flex text-white'>
                    <p>{selectedFile}</p>
                    {selectedFile.length && <button onClick={handleRun} disabled={runState == "Running..."} className='px-5 py-1 rounded-lg bg-green-500 disabled:bg-green-300 font-bold text-black absolute right-80 z-50 flex items-center gap-1'>
                        <LucidePlay size={20} />
                        {runState}
                    </button>}
                    <button onClick={handleQuit} className='bg-red-500 flex gap-2 absolute right-48 px-5 py-1 rounded-lg z-[200] font-bold text-black'>
                        <LucideDelete />
                        Quit
                    </button>
                    <button onClick={handleShare} className='bg-blue-500 flex gap-2 absolute right-14 px-5 py-1 rounded-lg z-[200] font-bold text-black'>
                        <LucideShare2 />
                        Share
                    </button>
                </div>

                <div
                    className={`p-3 w-[25rem] ${isSharedDropDownHidden ? "hidden" : "flex"
                        } justify-center bg-[#0b0b0b] rounded-lg absolute right-14 top-12 z-[1000]`}
                >
                    {exposedUrl ? (
                        <div className="flex justify-center flex-col gap-4">
                            <div className="text-white px-4 py-2 bg-[#ffffff30] rounded-lg text-[1.08rem] w-[23rem] whitespace-nowrap overflow-x-auto scrollbar-hide">
                                {exposedUrl}
                            </div>
                            <button onClick={handleCopy} className="px-6 py-2 rounded-lg bg-green-500 text-black font-bold" >
                                Copy
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center flex-col gap-2">
                            <p className="text-white font-bold">Generating link</p>
                            <MoonLoader size={25} color="white" />
                        </div>
                    )}
                </div>

                <div className='bg-[#1e1e1e] w-full h-[58%]'>
                    {currentExtension && <Editor
                        language={currentExtension}
                        value={code}
                        onChange={e => setCode(e)}
                        theme='vs-dark'
                        options={{
                            readOnly: selectedFile.length > 0 ? false : true
                        }}
                        onMount={handleEditorMount}
                    />}
                    <h1 style={{ color: "gray", fontSize: 35, fontWeight: "bold", textAlign: "center", letterSpacing: 1, paddingTop: 20 }}>Select a file</h1>
                </div>
                <div className='h-[37%] terminal bg-black border border-b-0 border-l-0 border-r-0'>
                    {isSocketConnected && <Terminal setRunState={setRunState} />}
                </div>
            </div>
        </div>
    )
}

export default Playground
