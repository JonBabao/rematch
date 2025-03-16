"use client";

import React, { useState } from 'react';
import GreenButton from '../styles/greenButton';
import Link from 'next/link';
import { createClient } from "../../../utils/supabase/client";

const Register: React.FC = () => {
    const supabase = createClient();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
    
        if (!username.trim()) {
            setError("Username is required.");
            return;
        }
    
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
    
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
    
        setLoading(true);
    
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { username, phone } }
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }
    
        if (data.user && !data.session) {
            console.log("Email confirmation required before authentication.");
            setSuccess("Check your email to confirm your account before logging in.");
            setLoading(false);
            return;
        }
    
        setSuccess("Registration successful! Check your email for confirmation.");
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center w-full mt-10">
            <div className="flex flex-col bg-white mx-10 px-32 py-16 w-[80vw] lg:w-auto rounded-lg justify-center items-center ">
                <h1 className="caveatBrush text-3xl text-center w-[70vw] lg:w-full">ReMatch</h1>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8 w-[70vw] lg:w-full">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                        className="w-full p-2 border-gray-200 border-b-1 focus:outline-none"
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        required
                        className="w-full p-2 border-gray-200 border-b-1 focus:outline-none"
                    />
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number"
                        required
                        className="w-full p-2 border-gray-200 border-b-1 focus:outline-none"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full p-2 border-gray-200 border-b-1 focus:outline-none"
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                        className="w-full p-2 border-gray-200 border-b-1 focus:outline-none"
                    />

                    {error && <p className="text-red-500">{error}</p>}
                    {success && <p className="text-green-500">{success}</p>}

                    <GreenButton type="submit" disabled={loading}>
                        {loading ? "Registering..." : "Sign Up"}
                    </GreenButton>
                </form>

                <div className="flex flex-row text-sm mt-2 w-[70vw] lg:w-full text-center items-center justify-center">
                    <p>Have an account already?&nbsp;</p>
                    <Link href="/auth/login">
                        <button type="button" className="text-sm text-blue-600 hover:text-blue-800">
                            Login
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
