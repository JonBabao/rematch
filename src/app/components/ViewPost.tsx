"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";

const ViewPost = () => {
    const [item, setItem] = useState<any>(null);
    const [owner, setOwner] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
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
            }
            setLoading(false);
        };

        fetchItemDetails();
    }, [id]);

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

            {owner && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                    <h2 className="text-xl font-bold mb-2">Owner Details</h2>
                    <p><strong>Username:</strong> {owner.username}</p>
                    <p><strong>Phone:</strong> {owner.phone}</p>
                    <p><strong>Email:</strong> {owner.email}</p>
                </div>
            )}

            <button
                onClick={() => router.back()}
                className="mt-6 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
                Go Back
            </button>
        </div>
    );
};

export default ViewPost;
