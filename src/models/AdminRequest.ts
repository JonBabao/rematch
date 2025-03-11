export class AdminRequest {
    private requestId: number;
    private lostItemId: number;
    private userId: number;
    private requestType: string;
    private status: string;
    
    constructor(requestId: number, lostItemId: number, userId: number, requestType: string) {
        this.requestId = requestId;
        this.lostItemId = lostItemId;
        this.userId = userId;
        this.requestType = requestType;
        this.status = "pending"; // default status
    }
    
    getRequestId(): number { return this.requestId; }
    setRequestId(requestId: number): void { this.requestId = requestId; }
    
    getLostItemId(): number { return this.lostItemId; }
    setLostItemId(lostItemId: number): void { this.lostItemId = lostItemId; }
    
    getUserId(): number { return this.userId; }
    setUserId(userId: number): void { this.userId = userId; }
    
    getRequestType(): string { return this.requestType; }
    setRequestType(requestType: string): void { this.requestType = requestType; }
    
    getStatus(): string { return this.status; }
    setStatus(status: string): void { this.status = status; }
}