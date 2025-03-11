"use client";

import React, { useState, useEffect } from 'react';
import GreenButton from '../styles/greenButton';
import Link from 'next/link';
import { createClient } from "../../../utils/supabase/client";

const Register: React.FC = () => {
    const supabase = createClient();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
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
            options: { data: { username } }
        });
    
        console.log("Sign-up response:", data, signUpError);
    
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
    
        setSuccess("Registration successful! Redirecting...");
        setLoading(false);
    };
    

    return (
        <div className="flex flex-col bg-kinda-dark items-center justify-center w-full mt-10">
            <div className="flex flex-col bg-white mx-10 px-32 py-16 w-[80vw] lg:w-auto rounded-lg justify-center items-center ">
                <h1 className="righteous text-5xl text-center w-[70vw] lg:w-full">Rematch</h1>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8 w-[70vw] lg:w-full">
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                        className="w-full rounded-lg p-2"
                    />
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        required
                        className="w-full rounded-lg p-2"
                    />
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full rounded-lg p-2"
                    />
                    <input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                        className="w-full rounded-lg p-2"
                    />

                    {error && <p className="text-red-500">{error}</p>}
                    {success && <p className="text-green-500">{success}</p>}

                    <GreenButton type="submit" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
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
