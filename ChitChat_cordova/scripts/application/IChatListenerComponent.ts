interface IChatListenerComponent {
    onChat(data);
    onLeaveRoom(data);
    onRoomJoin(data);
    onMessageRead(dataEvent);
    onGetMessagesReaders(dataEvent);
}