import { User } from "./User";
import { createClient } from "../../utils/supabase/client";

export class Admin extends User {
    private supabase;

    constructor(userId: string, name: string, email: string, phone: string) {
        super(userId, name, email, phone);
        this.supabase = createClient();
    }

    async requestVerification(lostItemId: string, user_id: string, description: string): Promise<boolean> {
        const { error } = await this.supabase.from("adminRequests").insert([
            {
                lost_item_id: lostItemId,
                user_id: user_id,
                description: description,
                status: "pending",
            },
        ]);

        if (error) {
            console.error("Error requesting verification:", error.message);
            return false;
        }

        return true;
    }

    async changeLostItemStatus(lostItemId: string, status: string): Promise<boolean> {
        const { error } = await this.supabase.from("lostItem").update({ status }).eq("id", lostItemId);

        if (error) {
            console.error("Error changing lost item status:", error.message);
            return false;
        }

        return true;
    }
}
