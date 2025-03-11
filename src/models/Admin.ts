import { User } from './User';

export class Admin extends User {
    constructor(userId: number, name: string, email: string, phone: string, password: string) {
        super(userId, name, email, phone, password);
    }
    
    requestVerification(requestId: number): void {
        console.log(`Verification requested for request ID: ${requestId} by admin ${this.getName()}`);
        // Implementation would update the Admin_Request status
    }
    
    changeLostItemStatus(lostItemId: number, status: string): void {
        console.log(`Status of item ${lostItemId} changed to ${status} by admin ${this.getName()}`);
        // Implementation would update the Lost_Item status
    }
}