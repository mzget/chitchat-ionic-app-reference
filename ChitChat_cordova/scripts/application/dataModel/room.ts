interface IMembersStatus {
    uid: string;
    status: string;
}


enum RoomType { organizationGroup = 0, projectBaseGroup, privateGroup, privateChat };
enum RoomStatus { active, disable, delete };

class Room {
    _id: string;
    nodeId: number;
    name: string;
    type: RoomType;
    members: Member[];
    image: string;
    description: string;
    status: RoomStatus;
    createTime: Date;

    public _visibility: boolean = true;
    
    public editMember (member: Member) {
        this.members.forEach(value => {
            if(value.id == member.id) {
                value = member;
            }
        });
    }

    set visibility(_boo: boolean) {
        this._visibility = _boo;
    }
    get visibilty(): boolean {
        return this._visibility;
    }
}
