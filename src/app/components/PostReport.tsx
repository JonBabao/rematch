"use client";

import React, { useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { Owner } from "../../models/Owner";
import { v4 as uuidv4 } from "uuid"; 
import GreenButton from "../styles/greenButton";

const ReportPost: React.FC = () => {
    const supabase = createClient();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [dateLost, setDateLost] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
    
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
            setError("Failed to get user. Please log in.");
            setLoading(false);
            return;
        }
    
        const userId = userData.user.id; 
        if (!userId) {
            setError("User ID not found.");
            setLoading(false);
            return;
        }

        const owner = await Owner.getOwnerById(userId);
        if (!owner) {
            setError("Failed to fetch user profile. Please try again.");
            setLoading(false);
            return;
        }
    
        let imageUrl = "";
    
        if (imageFile) {
            const fileExt = imageFile.name.split(".").pop();
            const filePath = `lost-items-images/${uuidv4()}.${fileExt}`;
    
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("lost-items-images") 
                .upload(filePath, imageFile);
    
            if (uploadError) {
                setError("Image upload failed. Please try again.");
                console.error("Upload error:", uploadError);
                setLoading(false);
                return;
            }
    
            const { data } = supabase.storage.from("lost-items-images").getPublicUrl(filePath);
            imageUrl = data.publicUrl;
        }
    
        const lostItemId = await owner.reportLostItem(category, description, dateLost, imageUrl);
        if (!lostItemId) {
            setError("Failed to create post. Please try again.");
            setLoading(false);
            return;
        }
    
        setLoading(false);
        router.push("/dashboard/home"); 
    };
    
    return (
        <div className="flex flex-col items-center justify-center w-full mt-32 px-10">
            <div className="flex flex-col bg-white px-10 py-10 w-full rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Lost Item Post</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                        required
                        className="p-2 border border-gray-300 rounded"
                    />
                    
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Category"
                        required
                        className="p-2 border border-gray-300 rounded"
                    />

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                        required
                        className="p-2 border border-gray-300 rounded"
                    />
        
                    <div className="flex flex-row items-center w-full">
                        <label className="block text-gray-700 font-semibold pr-4">Date Lost:</label>
                        <input
                            type="date"
                            value={dateLost}
                            onChange={(e) => setDateLost(e.target.value)}
                            required
                            className="p-2 border border-gray-300 rounded flex-1"
                        />
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="p-2 border border-gray-300 rounded"
                    />

                    {error && <p className="text-red-500">{error}</p>}

                    <GreenButton type="submit" disabled={loading}>
                        {loading ? "Submitting..." : "Submit"}
                    </GreenButton>
                </form>
            </div>
        </div>
    );
};

export default ReportPost;