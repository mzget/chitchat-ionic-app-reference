module absSpartan {
    export interface IRoomAccessListenerImp {
        onNewMessage(dataEvent);
        onAccessRoom(dataEvent);
        onUpdatedLastAccessTime(dataEvent);
        onAddRoomAccess(dataEvent);
    }
}