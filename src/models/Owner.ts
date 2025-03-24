import { User } from "./User";
import { createClient } from "../../utils/supabase/client"; 

export class Owner extends User {
    private supabase = createClient(); 

    constructor(userId: string, name: string, email: string, phone: string) {
        super(userId, name, email, phone);
    }

    static async getOwnerById(userId: string): Promise<Owner | null> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("profiles")
            .select("id, username, email, phone")
            .eq("id", userId)
            .single();

        if (error || !data) {
            console.error("Error fetching owner details:", error);
            return null;
        }

        return new Owner(data.id, data.username, data.email, data.phone);
    }

    async reportLostItem(title: string, category: string, description: string, dateLost: string, imageUrl: string): Promise<number | null> {
        console.log(`Lost item reported by ${this.getName()}`);

        const { data, error } = await this.supabase.from("lostItem").insert([
            {
                owner_id: this.getUserId(), 
                title: title,
                category: category,
                description: description,
                date_lost: dateLost,
                image_url: imageUrl,
                status: false, 
            },
        ]).select("id").single();

        if (error) {
            console.error("Error reporting lost item:", error);
            return null;
        }

        return data?.id || null;
    }

    async declareItemAsFound(lostItemId: number): Promise<boolean> {
        console.log(`Item ${lostItemId} declared as found by ${this.getName()}`);
    
        const { error } = await this.supabase
            .from("lostItem")
            .update({ status: true })
            .match({ id: lostItemId, owner_id: this.getUserId() });
    
        if (error) {
            console.error("Error declaring item as found:", error);
            return false;
        }
    
        console.log("Item status updated successfully!");
        return true;
    }
}