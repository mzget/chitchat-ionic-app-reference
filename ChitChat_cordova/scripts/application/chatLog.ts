class ChatLog {
    id: string;
    roomName: string;
    roomType: RoomType;
    room: Room;
    lastMessageTime: string;
    lastMessage: string;
    count: number;

    constructor(room: Room) {
        this.id = room._id;
        this.roomName = room.name;
        this.roomType = room.type;
        this.room = room;
    }

    public setNotiCount(count: number) {
        this.count = count;
    }

    public setLastMessage(lastMessage: string) {
        this.lastMessage = lastMessage;
    }

    public setLastMessageTime(lastMessageTime: string) {
        this.lastMessageTime = lastMessageTime;
    }
}