export class LostItem {
    private lostItemId: number;
    private userId: string;
    private title: string;
    private category: string;
    private description: string;
    private dateLost: string;
    private imageUrl: string;
    private status: string;
    
    constructor(lostItemId: number, userId: string, title: string, category: string, description: string, 
                dateLost: string, imageUrl: string) {
        this.lostItemId = lostItemId;
        this.userId = userId;
        this.title = title;
        this.category = category;
        this.description = description;
        this.dateLost = dateLost;
        this.imageUrl = imageUrl;
        this.status = "pending"; // default status
    }
    
    getLostItemId(): number { return this.lostItemId; }
    setLostItemId(lostItemId: number): void { this.lostItemId = lostItemId; }
    
    getUserId(): string { return this.userId; }
    setUserId(userId: string): void { this.userId = userId; }
   
    getTitle(): string { return this.title; }
    setTitle(title: string): void { this.title = title; }
    
    getCategory(): string { return this.category; }
    setCategory(category: string): void { this.category = category; }
    
    getDescription(): string { return this.description; }
    setDescription(description: string): void { this.description = description; }
    
    getDateLost(): string { return this.dateLost; }
    setDateLost(dateLost: string): void { this.dateLost = dateLost; }
    
    getImageUrl(): string { return this.imageUrl; }
    setImageUrl(imageUrl: string): void { this.imageUrl = imageUrl; }
    
    getStatus(): string { return this.status; }
    setStatus(status: string): void { this.status = status; }
}
