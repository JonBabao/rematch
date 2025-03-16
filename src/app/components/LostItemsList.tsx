import { useEffect, useState } from "react";
import { createClient } from "../../../utils/supabase/client"; 

const LostItemsList = () => {
    const [lostItems, setLostItems] = useState<any[]>([]);
    const supabase = createClient();

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
            <h2>Lost Items</h2>
            {lostItems.length === 0 ? (
                <p>No lost items found.</p>
            ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {lostItems.map((item) => (
                        <div key={item.id} style={{ border: "1px solid #ccc", padding: "10px", width: "250px" }}>
                            <h3>{item.category}</h3>
                            <p>{item.description}</p>
                            <p><strong>Status:</strong> {item.status}</p>
                            <p><strong>Date Lost:</strong> {item.date_lost}</p>
                            {item.image_url ? (
                                <img src={item.image_url} alt="Lost Item" style={{ width: "100%", height: "auto" }} />
                            ) : (
                                <p>No Image Available</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
    
};

export default LostItemsList;
