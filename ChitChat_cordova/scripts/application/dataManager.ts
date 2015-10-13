interface IRoomMap {
    [key: string]: Room;
}
interface IMemberMep {
    [key: string]: OrgMember;
}

class DataManager implements Services.IFrontendServerListener {
    private static Instance: DataManager;
    public static getInstance(): DataManager {
        if (!DataManager.Instance) {
            DataManager.Instance = new DataManager();
        }

        return DataManager.Instance;
    }

    public myProfile: User;
    public orgGroups: IRoomMap = {};
    public projectBaseGroups: IRoomMap = {};
    public privateGroups: IRoomMap = {};
    public orgMembers: IMemberMep = {};
    public isOrgMembersReady :boolean = false;


    public onMyProfileReady;

    public setMyProfile(data: any) {
        this.myProfile = JSON.parse(JSON.stringify(data));

        if (!!this.onMyProfileReady)
            this.onMyProfileReady(this);
    }
    public getMyProfile(): User {
        return this.myProfile;
    }
    public setRoomAccessForUser(data) {
        this.myProfile.roomAccess = JSON.parse(JSON.stringify(data.roomAccess));
    }
    public updateRoomAccessForUser(data) {
        console.info(JSON.stringify(data));
        var arr: Array<RoomAccessData> = JSON.parse(JSON.stringify(data.roomAccess));
        this.myProfile.roomAccess.forEach(value => {
            if (value.roomId === arr[0].roomId) {
                value.accessTime = arr[0].accessTime;

                return;
            }
        });
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
        var self = this;
        var members: Array<OrgMember> = JSON.parse(JSON.stringify(dataEvent));

        if (!this.orgMembers) this.orgMembers = {};

        async.eachSeries(members, function iterator(item, cb) {
            if (!self.orgMembers[item._id]) {
                self.orgMembers[item._id] = item;
            }
            
            cb();
        }, function done(err) {
            self.isOrgMembersReady = true;
        });
    };
    public onGetOrganizeGroupsComplete(dataEvent) {
        var rooms: Array<Room> = JSON.parse(JSON.stringify(dataEvent));
        if (!this.orgGroups)
            this.orgGroups = {};

        rooms.forEach(value => {
            if (!this.orgGroups[value._id]) {
                this.orgGroups[value._id] = value;
            }
        });
    };
    public onGetProjectBaseGroupsComplete(dataEvent) {
        var groups: Array<Room> = JSON.parse(JSON.stringify(dataEvent));

        if (!this.projectBaseGroups) this.projectBaseGroups = {};

        groups.forEach(value => {
            if (!this.projectBaseGroups[value._id]) {
                this.projectBaseGroups[value._id] = value;
            }
        });
    };
    public onGetPrivateGroupsComplete(dataEvent) {
        var groups: Array<Room> = JSON.parse(JSON.stringify(dataEvent));

        if (!this.privateGroups) this.privateGroups = {};

        groups.forEach(value => {
            if (!this.privateGroups[value._id]) {
                this.privateGroups[value._id] = value;
            }
        });
    };
}