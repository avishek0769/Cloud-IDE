import React from 'react'
import {PropagateLoader} from "react-spinners"

function LoadingScreen({message}) {
    return (
        <div className='fixed flex flex-col gap-10 justify-center items-center text-white w-[100vw] h-[100vh] z-[100] bg-[#000000d5]'>
            <div className='text-2xl font-bold'>{message}</div>
            <PropagateLoader color='white' />
        </div>
    )
}

export default LoadingScreen
