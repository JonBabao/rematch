import { createClient } from '../../utils/supabase/client';

const supabase = createClient();

export class User {
    private userId: string;
    private name: string;
    private email: string;
    private phone?: string;

    constructor(userId: string, name: string, email: string, phone?: string) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.phone = phone;
    }

    getUserId(): string { return this.userId; }
    getName(): string { return this.name; }
    getEmail(): string { return this.email; }
    getPhone(): string | undefined { return this.phone; }

    async reportItemAsFound(category: string, description: string, location: string): Promise<void> {
        const { error } = await supabase.from("lost_items").insert([
            {
                user_id: this.userId,
                category,
                description,
                location,  // Ensure location is included
                date_lost: new Date().toISOString(),
                status: "Found",
            }
        ]);

        if (error) {
            console.error("Error reporting item:", error);
        } else {
            console.log(`Item reported as found by ${this.name}`);
        }
    }

    async updateProfile(name?: string, phone?: string): Promise<void> {
        const updates: { name?: string; phone?: string } = {};
        if (name) updates.name = name;
        if (phone) updates.phone = phone;

        const { error } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", this.userId); // Ensure ID is the correct primary key

        if (error) {
            console.error("Error updating profile:", error);
        } else {
            console.log("Profile updated successfully.");
        }
    }
}
