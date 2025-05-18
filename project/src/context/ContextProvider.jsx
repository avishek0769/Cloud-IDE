import React, { createContext, useEffect, useMemo, useState } from 'react'

export const Context = createContext(null)

function ContextProvider({ children }) {
    const [socket, setSocket] = useState("")
    const [currentUser, setCurrentUser] = useState(undefined)
    const [domain, setDomain] = useState("https://z1v3k1h4-4000.inc1.devtunnels.ms/api/v1")

    useEffect(() => {
        const getCurrentUser = () => {
            fetch(`${domain}/users/getCurrentUser`, {
                credentials: "include"
            })
            .then(res => {
                if(res.status > 399){
                    res.json().then(err => console.log(err))
                    fetch(`${domain}/users/refreshAccessToken`, {
                        credentials: "include"
                    })
                    .then(response => {
                        if(response.status > 399){
                            response.json().then(error => console.log(error))
                            return false
                        }
                        else return true
                    })
                    .then(bool => {
                        if(bool){
                            getCurrentUser()
                        }
                    })
                    return
                }
                else return res.json()
            })
            .then(data => {
                if(data){
                    console.log(data)
                    setCurrentUser(data.data)
                }
            })
        }
        getCurrentUser()
    }, [setCurrentUser])
    

    const defaultValues = {
        socket,
        setSocket,
        currentUser,
        setCurrentUser,
        domain
    }

    return (
        <Context.Provider value={defaultValues}>
            {children}
        </Context.Provider>
    )
}

export default ContextProvider
