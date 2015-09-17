class DataManager {
    public myProfile: User;


    public setMyProfile(data: any) {
        this.myProfile = JSON.parse(JSON.stringify(data));
    }

    public setMembers(data: any) {

    }

    public setCompanyInfo(data: any) {

    }

    public setOrganizeGroups(data: any) {

    }

    public setProjectBaseGroups(data: any) {

    }

    public setPrivateGroups(data: any) {

    }
}