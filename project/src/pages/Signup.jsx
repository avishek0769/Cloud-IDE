import React, { useCallback, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Eye, EyeOff } from 'lucide-react';
import AlertMessage from '../components/ui/AlertMessage';
import { Context } from '../context/ContextProvider.jsx';

export function SignUp() {
    const [username, setUsername] = useState('');
    const [fullname, setFullname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [message, setMessage] = useState("");
    const [disable, setDisable] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const {domain, setCurrentUser} = useContext(Context)

    const showAlertFunc = useCallback((mess) => {
        setShowAlert(true)
        setMessage(mess)
        setTimeout(() => {
            setShowAlert(false)
        }, 2000);
    }, [setShowAlert, setMessage])

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        console.log("Domain --> ", domain)
        console.log(username, fullname, password)
        if (password !== confirmPassword) {
            showAlertFunc("Passwords didn't match !")
            return;
        }
        setDisable(true)
        fetch(`${domain}/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username, password, fullname
            }),
            credentials: "include"
        })
        .then(res => {
            if(res.status > 399){
                setDisable(false)
                showAlertFunc("Something went wrong, try again !")
                res.json().then(err => console.log(err))
                return;
            }
            else return res.json()
        })
        .then(data => {
            if(data){
                console.log(data)
                setCurrentUser(data.data)
                navigate("/dashboard")
            } 
        })
    }, [password, confirmPassword, username, fullname])

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
            {showAlert && <AlertMessage message={message} />}

            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="flex justify-center">
                        <Code2 className="h-12 w-12 text-blue-500" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">
                            Sign in
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md">
                        <div>
                            <label htmlFor="fullname" className="block text-sm font-medium text-gray-300">
                                Full name
                            </label>
                            <input
                                id="fullname"
                                name="fullname"
                                type="text"
                                autoComplete="name"
                                required
                                value={fullname}
                                onChange={(e) => setFullname(e.target.value)}
                                className="mt-1 block w-full rounded-md bg-[#111] border border-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                            />
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
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
                                    autoComplete="new-password"
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

                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">
                                Confirm Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full rounded-md bg-[#111] border border-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            disabled={disable}
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900"
                        >
                            Create account
                        </button>
                    </div>
                </form>

                <p className="mt-2 text-xs text-gray-400 text-center">
                    By signing up, you agree to our{' '}
                    <a href="#" className="text-blue-500 hover:text-blue-400">
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-500 hover:text-blue-400">
                        Privacy Policy
                    </a>
                </p>
            </div>
        </div>
    );
}