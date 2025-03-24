import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client"; 
import { useRouter } from "next/navigation";
import { timeAgo } from "../../../utils/TimeAgo";

const LostItemsList = () => {
    const [lostItems, setLostItems] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState(""); 
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchLostItems = async () => {
            const { data, error } = await supabase
                .from("lostItem")
                .select("*, adminRequests(status)")
                .order("created_at", { ascending: false });
    
            if (error) {
                console.error("Error fetching lost items:", error.message);
                return;
            }
    
            console.log("Fetched lost items:", data);
    
            const filteredData = data.filter(item => 
                !item.adminRequests || 
                (Array.isArray(item.adminRequests) 
                    ? item.adminRequests.every(req => req.status !== "rejected") 
                    : item.adminRequests.status !== "rejected")
            );
    
            setLostItems(filteredData);
        };
    
        fetchLostItems();
    }, []);
    
    

    const filteredItems = lostItems.filter(
        (item) => item.status === false && item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col lg:flex-row items-center justify-between mb-4">
                <h2 className="font-bold text-[#e16449] text-4xl caveatBrush text-center mb-2 lg:mb-0 lg:text-left">Lost Items</h2>
                <input 
                    type="text" 
                    placeholder="Search by category..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="shadow-outline shadow-md rounded-md px-4 py-2 w-full lg:w-64 focus:outline-none"
                />
            </div>

            {filteredItems.length === 0 ? (
                <p>No lost items found.</p>
            ) : (
                <div className="flex flex-grow flex-wrap justify-center gap-8 w-full">
                    {filteredItems.map((item) => (
                        <button 
                            key={item.id} 
                            onClick={() => router.push(`/dashboard/viewPost/${item.id}`)} 
                            className="flex flex-col gradientLine flex-grow break-words w-full lg:w-64 max-w-sm shadow-md shadow-outline p-4 rounded-lg text-start cursor-pointer transform hover:scale-105"
                        >
                            {item.image_url ? (
                                <img src={item.image_url} alt="Lost Item" className="w-auto my-4" />
                            ) : (
                                <p>No Image Available</p>
                            )}
                            <div className="border-t-1 text-sm border-gray-200 pt-2">
                                <h3 className="text-xl font-bold">{item.title}</h3>
                                <p className="text-xs mb-2">Posted {timeAgo(item.created_at)}</p>
                                <p ><strong>Category:</strong> {item.category}</p>
                                <p><strong>Description:</strong> {item.description}</p>
                                <p><strong>Date Lost:</strong> {item.date_lost}</p>
                            </div>

                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LostItemsList;
