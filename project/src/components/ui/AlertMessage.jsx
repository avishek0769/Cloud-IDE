import React from 'react'

function AlertMessage({message}) {
    return (
        <div className='px-10 py-2 rounded-xl bg-[#161616] font-bold text-red-500 absolute top-14 left-1/2 -translate-x-1/2 border z-[100]'>
            {message}
        </div>
    )
}

export default AlertMessage
