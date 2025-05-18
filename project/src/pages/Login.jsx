import React, { useCallback, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Eye, EyeOff } from 'lucide-react';
import { Context } from '../context/ContextProvider';
import AlertMessage from '../components/ui/AlertMessage';

export function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const {domain, setCurrentUser} = useContext(Context)

    const showAlertFunc = useCallback((mess) => {
        setShowAlert(true)
        setMessage(mess)
        setTimeout(() => {
            setShowAlert(false)
        }, 2000);
    }, [setShowAlert, setMessage])

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(`${domain}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username, password}),
            credentials: "include"
        })
        .then(res => {
            if(res.status > 399) showAlertFunc("Something went wrong, try again !");
            else return res.json()
        })
        .then(data => {
            setCurrentUser(data.data)
            navigate("/dashboard")
        })
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
            {showAlert && <AlertMessage message={message} />}

            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="flex justify-center">
                        <Code2 className="h-12 w-12 text-blue-500" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-blue-500 hover:text-blue-400">
                            Sign up
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="username"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full rounded-md bg-[#111] border border-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md bg-[#111] border border-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-500 hover:text-blue-400">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900"
                    >
                        Sign in
                    </button>
                </form>
            </div>
        </div>
    );
}