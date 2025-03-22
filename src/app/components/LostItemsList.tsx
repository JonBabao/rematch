import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client"; 
import { useRouter } from "next/navigation";
import { timeAgo } from "../../../utils/TimeAgo";

const LostItemsList = () => {
    const [lostItems, setLostItems] = useState<any[]>([]);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchLostItems = async () => {
            const { data, error } = await supabase.from("lostItem").select("*");
    
            if (error) {
                console.error("Error fetching lost items:", error.message);
            } else {
                console.log("Fetched lost items:", data);
                setLostItems(data);
            }
        };
    
        fetchLostItems();
    }, []);
    
    return (
        <div>
            <h2 className="font-bold text-3xl caveatBrush mb-4 text-center lg:text-left">Lost Items</h2>
            {lostItems.filter(item => item.status === false).length === 0 ? (
                <p>No lost items found.</p>
            ) : (
                <div className="flex flex-grow flex-wrap justify-center gap-8 w-full">
                    {lostItems
                        .filter(item => item.status === false)
                        .map((item) => (
                            <button 
                                key={item.id} 
                                onClick={() => router.push(`/dashboard/viewPost/${item.id}`)} 
                                className="flex flex-col flex-grow break-words w-full lg:w-64 border-gray-200 border-2 p-4 rounded-lg text-start"
                            >
                                <h3 className="text-xl font-bold">{item.title}</h3>
                                <p className="text-xs mb-2">Posted {timeAgo(item.created_at)}</p>
                                <p><strong>Category:</strong> {item.category}</p>
                                <p><strong>Description:</strong> {item.description}</p>
                                <p><strong>Date Lost:</strong> {item.date_lost}</p>
                                {item.image_url ? (
                                    <img src={item.image_url} alt="Lost Item" className="w-auto mt-8" />
                                ) : (
                                    <p>No Image Available</p>
                                )}
                            </button>
                        ))}
                </div>
            )}
        </div>
    );
};

export default LostItemsList;