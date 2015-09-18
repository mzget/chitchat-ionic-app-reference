interface IMembersStatus {
    uid: string;
    status: string;
}
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
}

enum RoomType { organizationGroup = 0, projectBaseGroup, privateGroup, privateChat };
enum RoomStatus { active, disable, delete };
