class HomeComponent implements absSpartan.IChatServerListener {
    constructor() {
        console.log("HomeComponent. constructor");
    }

    onChat(data) { };
    onLeaveRoom(data) { };
    onRoomJoin(data) { };
    onMessageRead(dataEvent) { };
    onGetMessagesReaders(dataEvent) { };
}