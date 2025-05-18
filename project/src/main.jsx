import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard.jsx';
import Playground from './pages/Playground.jsx';
import { Landing } from './pages/Landing.jsx';
import { Login } from './pages/Login.jsx';
import { SignUp } from './pages/Signup.jsx';
import ContextProvider from './context/ContextProvider.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Landing />
      },
      {
        path: "/playground",
        element: <Playground />
      },
      {
        path: "/dashboard",
        element: <Dashboard />
      },
      {
        path: "/login",
        element: <Login />
      },
      {
        path: "/signup",
        element: <SignUp />
      },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContextProvider>
      <RouterProvider router={router} />
    </ContextProvider>
  </StrictMode>
);
