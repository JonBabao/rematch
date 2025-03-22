"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Admin } from "../../models/Admin";
import { Owner } from "../../models/Owner"; 

const ViewPost = () => {
    const [item, setItem] = useState<any>(null);
    const [owner, setOwner] = useState<any>(null);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [ownerData, setOwnerData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [verificationRequested, setVerificationRequested] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [isDeclaredFound, setIsDeclaredFound] = useState(false); 

    const supabase = createClient();
    const { id } = useParams();
    const router = useRouter();

    useEffect(() => {
        if (!id) return;

        const fetchItemDetails = async () => {
            try {
                const { data, error } = await supabase
                    .from("lostItem")
                    .select("*, profiles:owner_id(id, username, email, phone)")
                    .eq("id", id)
                    .single();

                if (error) throw error;

                setItem(data);
                setOwner(data.profiles || null);
                setIsDeclaredFound(data.status); 

                const { data: user, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;

                if (user?.user) {
                    setIsOwner(user.user.id === data.owner_id);
                }
            } catch (err: any) {
                console.error("Error fetching lost item details:", err.message);
                setError("Failed to fetch item details.");
            } finally {
                setLoading(false);
            }
        };

        const fetchOwnerDetails = async () => {
            if (!id) return;

            setLoading(true);

            try {
                const { data: itemData, error: itemError } = await supabase
                    .from("lostItem")
                    .select("owner_id")
                    .eq("id", id)
                    .single();

                if (itemError || !itemData) {
                    throw new Error(itemError?.message || "Lost item not found");
                }

                const ownerId = itemData.owner_id;
                const { data: ownerData, error: ownerError } = await supabase
                    .from("profiles")
                    .select("id, username, email, phone")
                    .eq("id", ownerId)
                    .maybeSingle();

                console.log("🔍 Owner data result:", ownerData);

                if (ownerError) {
                    throw new Error(ownerError.message);
                }

                if (!ownerData) {
                    throw new Error(`Owner profile not found for owner_id: ${ownerId}`);
                }

                setOwnerData(ownerData);
            } catch (error) {
                console.error("🚨 Error fetching owner details:", error.message);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchVerificationStatus = async () => {
            if (!id) return;

            const { data, error } = await supabase
                .from("adminRequests")
                .select("status")
                .eq("lost_item_id", id)
                .maybeSingle();

            if (error) {
                console.error("Error fetching verification status:", error.message);
            } else {
                setVerificationStatus(data?.status || "no verification found");
            }
        };

        const checkIfAdmin = async () => {
            try {
                const { data: user, error } = await supabase.auth.getUser();
                if (error || !user?.user) return;

                const { data, error: roleError } = await supabase
                    .from("profiles")
                    .select("id, username, email, phone")
                    .eq("id", user.user.id)
                    .single();

                if (roleError) return;

                if (data?.id === "92c92ac3-1d14-41a4-a2ae-e4b9aab5bcdc") {
                    setIsAdmin(true);
                    setAdmin(new Admin(user.user.id, data.username, data.email, data.phone));
                }
            } catch (err: any) {
                console.error("Error checking admin status:", err.message);
            }
        };

        const checkVerificationRequest = async () => {
            try {
                const { data, error } = await supabase
                    .from("adminRequests")
                    .select("status")
                    .eq("lost_item_id", id)
                    .single();

                if (!error && data) setVerificationRequested(true);
            } catch (err: any) {
                console.error("Error checking verification request:", err.message);
            }
        };

        fetchItemDetails();
        fetchOwnerDetails();
        checkIfAdmin();
        checkVerificationRequest();
        fetchVerificationStatus();
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

        try {
            const fileExt = file.name.split(".").pop();
            const filePath = `verification-files/${uuidv4()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("verification-files")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from("verification-files").getPublicUrl(filePath);
            const imageUrl = data.publicUrl;

            await submitVerification(imageUrl);
        } catch (err: any) {
            console.error("Error uploading file:", err.message);
            alert("Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const submitVerification = async (fileUrl: string) => {
        try {
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

            if (error) throw error;
            alert("Verification submitted successfully!");
        } catch (err: any) {
            console.error("Error submitting verification:", err.message);
            alert("Verification submission failed.");
        }
    };

    const handleDeclareAsFound = async () => {
        if (!id || Array.isArray(id) || !isOwner) return;

        const ownerInstance = new Owner(
            ownerData.id,
            ownerData.username,
            ownerData.email,
            ownerData.phone
        );
        console.log("Owner id:", ownerData.id);
        const success = await ownerInstance.declareItemAsFound(Number(id));
        if (success) {
            setIsDeclaredFound(true);
            alert("Item has been declared as found!");
        } else {
            alert("Failed to declare item as found.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!item) return <p>Item not found.</p>;

    return (
        <div className="flex flex-col mt-32 mx-10 bg-white p-16 rounded-lg">
            <h1 className="text-3xl font-bold mb-4">{item.title}</h1>

            {verificationStatus === "pending" && (
                <div className="my-4 p-4 bg-yellow-100 rounded-lg">
                    <p>Note: Admins are currently requesting additional proof of ownership.</p>
                </div>
            )}

            <div className="w-full flex flex-wrap gap-8">
                {item.image_url ? (
                    <img src={item.image_url} alt="Lost Item" className="h-auto rounded-lg lg:max-w-lg object-cover" />
                ) : (
                    <p>No Image Available</p>
                )}

                <div className="p-8 bg-green-100 flex flex-col flex-grow text-lg">
                    <p className="text-xl font-bold">Item Details</p>
                    <p><b>Category:</b> {item.category}</p>
                    <p><b>Description:</b> {item.description}</p>
                    <p><b>Date Lost:</b> {item.date_lost}</p>
                    <p><b>Status:</b> {isDeclaredFound ? "Found" : "Not Found"}</p> {/* Display found status */}
                </div>

                <div className="p-8 bg-red-100 flex flex-col flex-grow">
                    <p className="text-xl font-bold">Owner Information</p>
                    {ownerData ? (
                        <>
                            <p><b>Owner:</b> {ownerData.username}</p>
                            <p><b>Email:</b> {ownerData.email}</p>
                            <p><b>Phone:</b> {ownerData.phone}</p>
                        </>
                    ) : (
                        <p>Owner information not available</p>
                    )}
                </div>
            </div>

            {isOwner && !isDeclaredFound && ( 
                <button
                    onClick={handleDeclareAsFound}
                    className="mt-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    Declare Item as Found
                </button>
            )}

            {isOwner && verificationRequested && (
                <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
                    <h2 className="text-xl font-bold">Upload Verification Document</h2>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-4" />
                    <button onClick={handleFileUpload} disabled={!file || uploading} className="mt-4 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
                        {uploading ? "Uploading..." : "Upload"}
                    </button>
                </div>
            )}

            {isAdmin && <button onClick={handleRequestVerification} className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Request Verification</button>}

            <button onClick={() => router.back()} className="mt-6 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">Go Back</button>
        </div>
    );
};

export default ViewPost;