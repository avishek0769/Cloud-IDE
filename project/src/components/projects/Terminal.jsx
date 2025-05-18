import { useContext, useEffect, useRef } from "react"
import {Terminal as XTerminal} from "@xterm/xterm"
import '@xterm/xterm/css/xterm.css'
import { Context } from "../../context/ContextProvider"

function Terminal({setRunState}) {
    const terminalRef = useRef()
    const isOpened = useRef(false)
    const { socket } = useContext(Context)

    useEffect(() => {
        console.log("Terminal --> ", socket)
        if(isOpened.current) return;
        isOpened.current = true;
        let inputBuffer = ""

        const term = new XTerminal({
            rows: 14,
            cols: 130,
        })

        term.open(terminalRef.current)
        term.write("ubuntu@user> ")

        term.onData((data)=> {
            if(data == '\r'){
                term.write('\n\r')
                socket.emit("terminal:write", inputBuffer + '\n')
                inputBuffer = ""
            }
            else if(data == "\x7F"){
                inputBuffer = inputBuffer.slice(0, -1)
                term.write("\b \b")
            }
            else{
                inputBuffer += data
                term.write(data)
            }
        })

        socket.on("terminal:output", (data) => {
            setRunState("Run")
            if(data == "ubuntu@user> "){
                term.write(data)
            }
            else term.write(data + "\r\n" + "ubuntu@user> ")
        })
    }, [])

    return (
        <div ref={terminalRef} id="terminal"> </div>
    )
}

export default Terminal
