class ContactInfo {
    public _id: string;
    public displayname: string;
    public status: string;
    public image: string;
    set setUrl(path:string) {
        this.image = path;
    }
}