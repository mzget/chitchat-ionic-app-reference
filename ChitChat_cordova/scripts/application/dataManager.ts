interface IRoomMap {
    [key: string]: Room;
}
interface IMemberMep {
    [key: string]: OrgMember;
}

class DataManager implements Services.IFrontendServerListener {

    public myProfile: User;
    public orgGroups: IRoomMap = {};
    public projectBaseGroups: IRoomMap = {};
    public privateGroups: IRoomMap = {};
    public orgMembers: IMemberMep = {};


    public setMyProfile(data: any) {
        this.myProfile = JSON.parse(JSON.stringify(data));
    }
    public getMyProfile(): User {
        return this.myProfile;
    }
    public setRoomAccessForUser(data) {
        this.myProfile.roomAccess = JSON.parse(JSON.stringify(data.roomAccess));
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


    public onGetCompanyMemberComplete(dataEvent) {
        var member: Array<OrgMember> = JSON.parse(JSON.stringify(dataEvent));

        member.forEach(value => {
            if (!this.orgMembers[value._id]) {
                this.orgMembers[value._id] = value;
            }

            console.log("org_member: ", value);
        });
    };
    public onGetOrganizeGroupsComplete(dataEvent) {
        var rooms: Array<Room> = JSON.parse(JSON.stringify(dataEvent));

        rooms.forEach(value => {
            if (!this.orgGroups[value._id]) {
                this.orgGroups[value._id] = value;
            }

            console.log("org_group: ", value);
        });
    };
    public onGetProjectBaseGroupsComplete(dataEvent) {
        var groups: Array<Room> = JSON.parse(JSON.stringify(dataEvent));

        groups.forEach(value => {
            if (!this.projectBaseGroups[value._id]) {
                this.projectBaseGroups[value._id] = value;
            }

            console.log("project_base_groups: ", value);
        });
    };
    public onGetPrivateGroupsComplete(dataEvent) {
        var groups: Array<Room> = JSON.parse(JSON.stringify(dataEvent));

        groups.forEach(value => {
            if (!this.privateGroups[value._id]) {
                this.privateGroups[value._id] = value;
            }

            console.log("private_groups: ", value);
        });
    };
}