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
                const enrichedData = await Promise.all(
                    data.map(async (v) => {
                        const { data: adminRequest, error: adminError } = await supabase
                            .from("adminRequests")
                            .select("status")
                            .eq("lost_item_id", v.lost_item_id)
                            .maybeSingle(); 

                        if (adminError) {
                            //console.error(`Error fetching adminRequests for lost_item_id ${v.lost_item_id}:`, adminError.message);
                        }

                        return { ...v, admin_status: adminRequest?.status || "unknown" };
                    })
                );

                setVerifications(enrichedData);
            }
            setLoading(false);
        };

        fetchVerifications();
    }, []);

    const handleApproval = async (id: bigint, lostItemId: bigint, status: "approved" | "rejected") => {
        console.log(`Attempting to update verification ID: ${id} and adminRequest for lost_item_id: ${lostItemId} to status: ${status}`);

        const { error: verificationError } = await supabase
            .from("verificationUploads")
            .update({ status })
            .eq("id", id);

        if (verificationError) {
            console.error("Error updating verification:", verificationError.message);
            alert("Failed to update verification.");
            return;
        }

        const { error: adminRequestError } = await supabase
            .from("adminRequests")
            .update({ status })
            .eq("lost_item_id", lostItemId);

        if (adminRequestError) {
            console.error("Error updating adminRequests:", adminRequestError.message);
            alert("Failed to update admin request status.");
            return;
        }

        setVerifications((prev) =>
            prev.map((v) =>
                v.id === id
                    ? { ...v, status, admin_status: status }
                    : v
            )
        );

        alert(`Verification ${status}`);
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
                            <p><strong>Verification Status:</strong> {v.status}</p>
                            <p><strong>Admin Request Status:</strong> {v.admin_status}</p>
                            {v.image_url && (
                                <img src={v.image_url} alt="Verification" className="h-40 w-auto mt-2 rounded-lg" />
                            )}
                            {v.status === "pending" && (
                                <div className="mt-4">
                                    <button
                                        onClick={() => handleApproval(v.id, v.lost_item_id, "approved")}
                                        className="mr-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleApproval(v.id, v.lost_item_id, "rejected")}
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
