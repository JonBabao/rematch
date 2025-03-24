"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import GreenButton from "../styles/greenButton";
import RedButton from "../styles/redButton";
import { useRouter } from "next/navigation";

const AdminVerifications = () => {
    const [verifications, setVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const supabase = createClient();
    const router = useRouter();

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
        <div className="flex flex-col mt-16 mx-4 lg:mx-10 bg-white p-6 lg:p-8 rounded-lg shadow-outline shadow-md">
            <h1 className="font-bold text-[#e16449] text-3xl caveatBrush mb-6">Admin: Verification Requests</h1>
    
            {verifications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending verifications.</p>
            ) : (
                <div className="flex flex-grow flex-wrap justify-center gap-6 w-full">
                    {verifications.map((v) => (
                        <div 
                            key={v.id} 
                            className="flex flex-col gradientLine flex-grow break-words w-full lg:w-96 max-w-md shadow-md shadow-outline p-4 rounded-lg"
                        >
                            <div className="border-b border-gray-200 pb-3 mb-3 space-y-1">
                                <p className="text-sm"><strong>Lost Item ID:</strong> {v.lost_item_id}</p>
                                <p className="text-sm"><strong>User ID:</strong> {v.user_id}</p>
                                <p className="text-sm"><strong>Status:</strong> 
                                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                        v.status === "approved" ? "bg-green-100 text-green-800" :
                                        v.status === "rejected" ? "bg-red-100 text-red-800" :
                                        "bg-yellow-100 text-yellow-800"
                                    }`}>
                                        {v.status}
                                    </span>
                                </p>
                            </div>
    
                            {v.image_url && (
                                <div className="relative w-full h-56 rounded-lg overflow-hidden mb-4">
                                    <img 
                                        src={v.image_url} 
                                        alt="Verification" 
                                        className="absolute inset-0 w-full h-full object-contain bg-gray-100" 
                                    />
                                </div>
                            )}
    
                            {v.status === "pending" && (
                                <div className="flex justify-center space-x-3 mt-4 border-t border-gray-200 pt-4">
                                    <button
                                        className="bg-blue-400 text-white font-bold rounded-lg py-4 px-6 flex items-center justify-center hover:bg-[#2d2d2d] focus:outline-none disabled:opacity-50 cursor-pointer"
                                        onClick={() => router.push(`/dashboard/viewPost/${v.lost_item_id}`)} 
                                    >
                                        View Post
                                    </button>

                                    <GreenButton
                                        onClick={() => handleApproval(v.id, v.lost_item_id, "approved")}
                                    >
                                        Approve
                                    </GreenButton>
                                    <RedButton
                                        onClick={() => handleApproval(v.id, v.lost_item_id, "rejected")}
                                    >
                                        Reject
                                    </RedButton>

                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminVerifications;
