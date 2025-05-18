import { useContext, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Context } from './context/ContextProvider';


function App() {
  const location = useLocation()
  const {domain} = useContext(Context)

  useEffect(() => {
    console.log(location.pathname)
    if(!location.pathname.includes("playground")){
      fetch(`${domain}/projects/stopRunningContainers`, {
        headers: {
          "Content-type": "application/json"
        },
        credentials: "include"
      })
    }
  }, [location])

  return (
    <div className="min-h-screen bg-black">
      <Outlet />
    </div>
  );
}

export default App