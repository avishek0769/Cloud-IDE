import React, { createContext, useEffect, useMemo, useState } from 'react'
import { SERVER_URL } from '../../../constants'

export const Context = createContext(null)

function ContextProvider({ children }) {
    const [socket, setSocket] = useState("")
    const [currentUser, setCurrentUser] = useState(undefined)
    const [domain, setDomain] = useState(`${SERVER_URL}/api/v1`)

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
