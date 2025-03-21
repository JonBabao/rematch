"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";

const AdminVerifications = () => {
    const [verifications, setVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const supabase = createClient();

    useEffect(() => {
        const fetchVerifications = async () => {
            const { data, error } = await supabase
                .from("verificationUploads")
                .select("id, lost_item_id, user_id, image_url, status");

            if (error) {
                console.error("Error fetching verifications:", error.message);
                setError("Failed to load verifications.");
            } else {
                setVerifications(data);
            }
            setLoading(false);
        };

        fetchVerifications();
    }, []);

    const handleApproval = async (id: bigint, status: "approved" | "rejected") => {
        console.log(`Attempting to update ID: ${id} to status: ${status}`);
        const { data, error } = await supabase
            .from("verificationUploads")
            .update({ status })
            .eq("id", id);

        console.log(data, error)

        if (error) {
            console.error("Error updating verification:", error.message);
            alert("Failed to update verification.");
        } else {
            setVerifications(verifications.map(v => (v.id === id ? { ...v, status } : v)));
            alert(`Verification ${status}`);
        }
      
    };

    if (loading) return <p>Loading verifications...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="flex flex-col mt-16 mx-10 bg-white p-8 rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Admin: Verification Requests</h1>

            {verifications.length === 0 ? (
                <p>No pending verifications.</p>
            ) : (
                <ul>
                    {verifications.map((v) => (
                        <li key={v.id} className="border p-4 rounded-lg mb-4">
                            <p><strong>Lost Item ID:</strong> {v.lost_item_id}</p>
                            <p><strong>User ID:</strong> {v.user_id}</p>
                            <p><strong>Status:</strong> {v.status}</p>
                            {v.image_url && (
                                <img src={v.image_url} alt="Verification" className="h-40 w-auto mt-2 rounded-lg" />
                            )}
                            {v.status === "pending" && (
                                <div className="mt-4">
                                    <button
                                        onClick={() => handleApproval(v.id, "approved")}
                                        className="mr-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleApproval(v.id, "rejected")}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminVerifications;
