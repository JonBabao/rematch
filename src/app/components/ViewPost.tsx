"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Admin } from "../../models/Admin";

const ViewPost = () => {
    const [item, setItem] = useState<any>(null);
    const [owner, setOwner] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [verificationRequested, setVerificationRequested] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [admin, setAdmin] = useState<Admin | null>(null);

    const supabase = createClient();
    const { id } = useParams();
    const router = useRouter();

    useEffect(() => {
        const fetchItemDetails = async () => {
            if (!id) return;

            const { data, error } = await supabase
                .from("lostItem")
                .select("*, profiles(username, phone, email)")
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching lost item details:", error.message);
                setError("Failed to fetch item details.");
            } else {
                setItem(data);
                setOwner(data.profiles);

                const { data: user, error: userError } = await supabase.auth.getUser();
                if (!userError && user?.user) {
                    setIsOwner(user.user.id === data.owner_id);
                }
            }
            setLoading(false);
        };

        const checkIfAdmin = async () => {
            const { data: user, error } = await supabase.auth.getUser();
            if (error || !user?.user) {
                console.log("No user found or error fetching user:", error);
                return;
            }
        
            console.log("Logged-in User ID:", user.user.id); // Debug log
        
            const { data, error: roleError } = await supabase
                .from("profiles")
                .select("id, username, email, phone")
                .eq("id", user.user.id)
                .single();
        
            if (roleError) {
                console.log("Error fetching user profile:", roleError);
                return;
            }
        
            console.log("User Profile Data:", data); // Debug log
        
            if (data?.id === "92c92ac3-1d14-41a4-a2ae-e4b9aab5bcdc") {
                console.log("User is an Admin!"); // Debug log
                setIsAdmin(true);
                setAdmin(new Admin(user.user.id, data.username, data.email, data.phone));
            } else {
                console.log("User is NOT an Admin");
            }
        };
        

        const checkVerificationRequest = async () => {
            const { data, error } = await supabase
                .from("adminRequests")
                .select("status")
                .eq("lost_item_id", id)
                .single();

            if (!error && data) {
                setVerificationRequested(true);
            }
        };

        fetchItemDetails();
        checkIfAdmin();
        checkVerificationRequest();
    }, [id]);

    const handleRequestVerification = async () => {
        if (!id || Array.isArray(id) || !admin) return;
        const success = await admin.requestVerification(id);
        if (success) {
            setVerificationRequested(true);
            alert("Verification request sent.");
        } else {
            alert("Failed to request verification.");
        }
    };
    const handleFileUpload = async () => {
        if (!file || !id) return;
        setUploading(true);

        const fileExt = file.name.split(".").pop();
        const filePath = `verification-files/${uuidv4()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("verification-files")
            .upload(filePath, file);

        if (uploadError) {
            console.error("Error uploading file:", uploadError.message);
            alert("Upload failed.");
            setUploading(false);
            return;
        }

        const { data } = supabase.storage.from("verification-files").getPublicUrl(filePath);
        const imageUrl = data.publicUrl;

        await submitVerification(imageUrl);
        setUploading(false);
    };

    const submitVerification = async (fileUrl: string) => {
        const { error } = await supabase
            .from("verificationUploads")
            .insert([
                {
                    lost_item_id: id,
                    user_id: item.owner_id,
                    image_url: fileUrl,
                    status: "pending",
                },
            ]);

        if (error) {
            console.error("Error submitting verification:", error.message);
            alert("Verification submission failed.");
        } else {
            alert("Verification submitted successfully!");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!item) return <p>Item not found.</p>;

    return (
        <div className="flex flex-col mt-32 mx-10 bg-white p-16 rounded-lg">
            <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
            <p className="text-lg"><strong>Category:</strong> {item.category}</p>
            <p className="text-lg break-words"><strong>Description:</strong> {item.description}</p>
            <p className="text-lg"><strong>Date Lost:</strong> {item.date_lost}</p>
            <p className="text-lg"><strong>Status:</strong> {item.status}</p>
            {item.image_url ? (
                <img src={item.image_url} alt="Lost Item" className="h-auto mt-4 rounded-lg" />
            ) : (
                <p>No Image Available</p>
            )}

            {isOwner && verificationRequested && (
                <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
                    <h2 className="text-xl font-bold">Admin Verification Required</h2>
                    <p>Please upload a valid verification document or image to confirm ownership.</p>
                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="mt-4"
                    />
                    <button
                        onClick={handleFileUpload}
                        disabled={!file || uploading}
                        className={`mt-4 px-4 py-2 rounded-lg ${
                            file ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-400 text-gray-200"
                        }`}
                    >
                        {uploading ? "Uploading..." : "Upload Verification"}
                    </button>
                </div>
            )}      

            {isAdmin && (
                <button
                    onClick={handleRequestVerification}
                    className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Request Verification
                </button>
            )}

            <button onClick={() => router.back()} className="mt-6 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                Go Back
            </button>
        </div>
    );
};

export default ViewPost;