export class User {
    private userId: number;
    private name: string;
    private email: string;
    private phone: string;
    private password: string;
    
    constructor(userId: number, name: string, email: string, phone: string, password: string) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
    }
    
    getUserId(): number { return this.userId; }
    setUserId(userId: number): void { this.userId = userId; }
    
    getName(): string { return this.name; }
    setName(name: string): void { this.name = name; }
    
    getEmail(): string { return this.email; }
    setEmail(email: string): void { this.email = email; }
    
    getPhone(): string { return this.phone; }
    setPhone(phone: string): void { this.phone = phone; }
    
    getPassword(): string { return this.password; }
    setPassword(password: string): void { this.password = password; }
    
    reportItemAsFound(category: string, description: string, location: string): void {
        console.log(`Item reported as found by ${this.name}`);
    }
}