"use client";

import React, { useState } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import RedButton from '../styles/redButton';
import Link from "next/link";
import { User } from '../../models/User'

const Login: React.FC = () => {
    const supabase = createClient();
    const router = useRouter();

    const [identifier, setIdentifier] = useState(""); 
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
    
        if (!identifier || !password) {
            setError("Please enter your email and password.");
            setLoading(false);
            return;
        }
    
        const { data, error } = await supabase.auth.signInWithPassword({
            email: identifier, 
            password: password,
        });
    
        if (error || !data || !data.user) {
            setError(error?.message || "Invalid credentials. Please try again.");
            setLoading(false);
            return;
        }
    
        const user = data.user;
    
        const { data: existingProfile, error: profileError } = await supabase
            .from("profiles")
            .select("id, username, email, phone")
            .eq("id", user.id)
            .single();
    
    
        let profile = existingProfile;
    
        if (!existingProfile) {
            const { error: insertError } = await supabase
                .from("profiles")
                .insert([{ id: user.id, username: user.user_metadata.username, phone: user.user_metadata.phone, email: user.email }]);
    
            if (insertError) {
                console.error("Profile insertion error:", insertError);
                setError("Failed to insert profile.");
                setLoading(false);
                return;
            }
    
            const { data: newProfile, error: newProfileError } = await supabase
                .from("profiles")
                .select("id, username, email, phone")
                .eq("id", user.id)
                .single();
    
            if (newProfileError) {
                console.error("Error fetching new profile:", newProfileError);
                setError("Failed to fetch user profile.");
                setLoading(false);
                return;
            }
    
            profile = newProfile;
        }
    
        if (profile) {
            const userInstance = new User(
                profile.id,
                profile.username,
                profile.email,
                profile.phone || "" 
            );
    
            console.log("Logged in as:", userInstance.getName());
        }
    
        setLoading(false);
        router.push("/dashboard/home");
    };
    
    const handleForgotPassword = async () => {
        if (!identifier) {
            alert("Enter your email to reset your password.");
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(identifier);
        if (error) {
            alert("Failed to send password reset email. Try again.");
        } else {
            alert("Password reset email sent!");
        }
    };   

    return(
        <div className="flex flex-col items-center justify-center w-full mt-10">
            <div className = "flex flex-col bg-white mx-10 py-24 px-32 w-auto rounded-lg justify-center items-center shadow-xl">
                <p className = "caveatBrush text-gray-800 text-3xl">
                    ReMatch
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8 w-[70vw] lg:w-full">
                    <input
                        id="identifier"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full p-2 border-gray-200 border-b-1 focus:outline-none"
                    />
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full p-2 border-gray-200 border-b-1 focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-left text-blue-600 hover:text-blue-800 w-[70vw] lg:w-full"
                    >
                        Forgot Password?
                    </button>

                    {error && <p className="text-red-500">{error}</p>}

                    <RedButton 
                        type={"submit"} 
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </RedButton>
                </form>

                <div className="flex flex-row text-sm mt-2 w-[70vw] lg:w-full text-center justify-center">
                    <p>Not a member?&nbsp;</p>
                    <Link href="/auth/register">
                        <button type="button" className="text-blue-600 hover:text-blue-800">
                            Register now
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;