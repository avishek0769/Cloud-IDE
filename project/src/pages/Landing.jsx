import { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Terminal, Zap, Globe2, Users2, Lock } from 'lucide-react';
import { Context } from '../context/ContextProvider';
import { Navbar } from '../components/layout/Navbar';

export function Landing() {
    const { currentUser } = useContext(Context)
    const navigate = useNavigate()

    useEffect(() => {
        console.log(currentUser)
        if (currentUser != undefined) navigate("/dashboard");
    }, [currentUser])

    return (
        <>
            <Navbar />
            <div className="bg-black text-white">
                {/* Hero Section */}
                <section className="relative overflow-hidden px-6 py-24 sm:py-24 lg:px-8">
                    <div className="absolute inset-0 -z-10 opacity-20">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-900" />
                    </div>

                    <div className="mx-auto max-w-2xl text-center">
                        <div className="flex justify-center mb-8">
                            <Code2 className="h-16 w-16 text-blue-500" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-8">
                            Cloud IDE for the Modern Developer
                        </h1>
                        <p className="text-lg leading-8 text-gray-300 mb-8">
                            Code, build, and deploy from anywhere. A powerful development environment that follows you across devices.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/signup"
                                className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                Get Started Free
                            </Link>
                            <a
                                href="#features"
                                className="rounded-md bg-gray-800 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-700"
                            >
                                Learn More
                            </a>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-24 sm:py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Everything You Need to Code
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-400">
                                A complete development environment that works right in your browser
                            </p>
                        </div>
                        <div className="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                <Feature
                                    icon={<Terminal className="h-6 w-6" />}
                                    title="Powerful Editor"
                                    description="Full-featured code editor with syntax highlighting, autocomplete, and intelligent suggestions."
                                />
                                <Feature
                                    icon={<Zap className="h-6 w-6" />}
                                    title="Instant Setup"
                                    description="No installation required. Start coding in seconds with pre-configured development environments."
                                />
                                <Feature
                                    icon={<Globe2 className="h-6 w-6" />}
                                    title="Deploy Instantly"
                                    description="Deploy your applications directly to the cloud with one click."
                                />
                                <Feature
                                    icon={<Users2 className="h-6 w-6" />}
                                    title="Collaboration"
                                    description="Work together in real-time with pair programming and shared workspaces."
                                />
                                <Feature
                                    icon={<Lock className="h-6 w-6" />}
                                    title="Secure"
                                    description="Enterprise-grade security with encrypted storage and secure access controls."
                                />
                                <Feature
                                    icon={<Terminal className="h-6 w-6" />}
                                    title="Terminal Access"
                                    description="Full terminal access with support for custom commands and tools."
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="relative isolate py-24 sm:py-24">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Ready to Start Coding?
                            </h2>
                            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-400">
                                Join thousands of developers who are already using our platform to build amazing things.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <Link
                                    to="/signup"
                                    className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                >
                                    Get Started Free
                                </Link>
                                <Link
                                    to="/login"
                                    className="text-sm font-semibold leading-6 text-white hover:text-blue-400"
                                >
                                    Sign In <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}

function Feature({ icon, title, description }) {
    return (
        <div className="relative p-8 bg-gray-900 rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-transparent rounded-2xl" />
            <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 mb-4">
                    {icon}
                </div>
                <h3 className="text-lg font-semibold leading-8 text-white mb-2">{title}</h3>
                <p className="text-gray-400">{description}</p>
            </div>
        </div>
    );
}