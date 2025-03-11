import { User } from './User';

export class Owner extends User {
    constructor(userId: number, name: string, email: string, phone: string, password: string) {
        super(userId, name, email, phone, password);
    }
    
    reportLostItem(category: string, description: string, dateLost: string, imageUrl: string): number {
        console.log(`Lost item reported by ${this.getName()}`);
        // Implementation would create a Lost_Item entry and return its ID
        return this.generateLostItemId(); // Placeholder
    }
    
    declareItemAsFound(lostItemId: number): void {
        console.log(`Item ${lostItemId} declared as found by ${this.getName()}`);
        // Implementation would update the Lost_Item status
    }
    
    // Helper method to generate a lost item ID (placeholder)
    private generateLostItemId(): number {
        return Math.floor(Math.random() * 10000);
    }
}
