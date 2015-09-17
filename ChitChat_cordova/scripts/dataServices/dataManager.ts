interface IRoomMap {
    [key: string]: Room;
}

class DataManager {
    public myProfile: User;
    public orgGroups: IRoomMap;
    public projectBaseGroups: IRoomMap;
    public privateGroups: IRoomMap;


    public setMyProfile(data: any) {
        this.myProfile = JSON.parse(JSON.stringify(data));
    }

    public setMembers(data: any) {

    }

    public setCompanyInfo(data: any) {

    }

    public setOrganizeGroups(data: any) {
        this.orgGroups = JSON.parse(JSON.stringify(data));
    }

    public setProjectBaseGroups(data: any) {
        this.projectBaseGroups = JSON.parse(JSON.stringify(data));
    }

    public setPrivateGroups(data: any) {
        this.privateGroups = JSON.parse(JSON.stringify(data));
    }
}