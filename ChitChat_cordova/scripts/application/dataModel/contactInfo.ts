class ContactInfo {
    public _id: string;
    public displayname: string;
    public status: string;
    public image: string;
    
    public setUrl(path:string) {
        this.image = path;
    }
}