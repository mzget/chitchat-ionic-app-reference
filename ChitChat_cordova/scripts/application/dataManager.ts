interface IRoomMap {
    [key: string]: Room;
}
interface IMemberMep {
    [key: string]: ContactInfo;
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
    public isOrgMembersReady: boolean = false;
    public companyInfo: CompanyInfo;

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
          this.companyInfo = JSON.parse(JSON.stringify(data));
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

    //<!---------- Group ------------------------------------

    public getGroup(id:string) : Room {
        if(!!this.orgGroups[id]) {
            return this.orgGroups[id];
        }
        else if(!!this.projectBaseGroups[id]) {
            return this.projectBaseGroups[id];
        }
        else if(!!this.privateGroups[id]) {
            return this.privateGroups[id];
        }
    }
    public addGroup(data: Room) {
        switch (data.type) {
            case RoomType.organizationGroup:
                if (!this.orgGroups[data._id]) {
                    this.orgGroups[data._id] = data;
                }
                break;
            case RoomType.projectBaseGroup:
                if (!this.projectBaseGroups[data._id]) {
                    this.projectBaseGroups[data._id] = data;
                }
                break;
            case RoomType.privateGroup:
                if (!this.privateGroups[data._id]) {
                    this.privateGroups[data._id] = data;
                }
                break;
            default:
                console.info("new room is not a group type.");
            break;
        }
    }
    
    public updateGroupImage(data: Room) {
        if(!!this.orgGroups[data._id]) {
            this.orgGroups[data._id].image = data.image;
        }
        else if(!!this.projectBaseGroups[data._id]) {
            this.projectBaseGroups[data._id].image = data.image;
        }
        else if(!!this.privateGroups[data._id]) {
            this.privateGroups[data._id].image = data.image;
        }
    }
    public updateGroupName(data: Room) {
        if (!!this.orgGroups[data._id]) {
            this.orgGroups[data._id].name = data.name;
        }
        else if (!!this.projectBaseGroups[data._id]) {
            this.projectBaseGroups[data._id].name = data.name;
        }
        else if (!!this.privateGroups[data._id]) {
            this.privateGroups[data._id].name = data.name;
        }
    }
    public updateGroupMembers(data: Room) {
        //<!-- Beware please checking myself before update group members.
        //<!-- May be your id is removed from group.
        if (!!this.orgGroups[data._id]) {
            var hasMe = this.checkMySelfInNewMembersReceived(data);
            if (hasMe) {
                this.orgGroups[data._id].members = data.members;
            }
            else {
                console.warn("this org group is not contain me in members list.");
            }
        }
        else if (!!this.projectBaseGroups[data._id]) {
            var hasMe = this.checkMySelfInNewMembersReceived(data);
            if (hasMe) {
                this.projectBaseGroups[data._id].visibility = true;
                this.projectBaseGroups[data._id].members = data.members;
            }
            else {
                this.projectBaseGroups[data._id].visibility = false;
            }
        }
        else if (!!this.privateGroups[data._id]) {
            var hasMe = this.checkMySelfInNewMembersReceived(data);
            if (hasMe) {
                this.privateGroups[data._id].visibility = true;
                this.privateGroups[data._id].members = data.members;
            }
            else {
                this.privateGroups[data._id].visibility = false;
            }
        }
    }
    public updateGroupMemberDetail(jsonObj: any) {
        var editMember = jsonObj.editMember;
        var roomId = jsonObj.roomId;

        var groupMember: Member = new Member();
        groupMember.id = editMember.id;
        var role = <string>editMember.role;
        groupMember.role = MemberRole[role];
        groupMember.jobPosition = editMember.jobPosition;

        this.getGroup(roomId).members.forEach((value, index, arr) => {
            if (value.id === groupMember.id) {
                this.getGroup(roomId).members[index].role = groupMember.role;
                this.getGroup(roomId).members[index].textRole = MemberRole[groupMember.role]
                this.getGroup(roomId).members[index].jobPosition = groupMember.jobPosition;
            }
        });
    }

    private checkMySelfInNewMembersReceived(data: Room): boolean {
        var self = this;
        var hasMe = data.members.some(function isMySelfId(element, index, array) {
            return element.id === self.myProfile._id; 
        });

        console.debug("Hasme", hasMe);
        return hasMe;
    }
    
    //<!------------------------------------------------------

    public updateContactImage(contactId: string, url: string) {
        if(!!this.orgMembers[contactId]) {
           this.orgMembers[contactId].image = url;
        }
    }
    public updateContactProfile(contactId:string, params: any) {
        if(!!this.orgMembers[contactId]) {
            var jsonObj = JSON.parse(JSON.stringify(params));
            if(!!jsonObj.displayname) {
                this.orgMembers[contactId].displayname = jsonObj.displayname;
            }
            if(!!jsonObj.status) {
                this.orgMembers[contactId].status = jsonObj.status;
            }
        }
    }
    

    public onGetCompanyMemberComplete(dataEvent) {
        var self = this;
        var members: Array<ContactInfo> = JSON.parse(JSON.stringify(dataEvent));

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