module absSpartan {
    export interface IRoomAccessListenerImp {
        onAccessRoom(dataEvent);
        onUpdatedLastAccessTime(dataEvent);
        onAddRoomAccess(dataEvent);
    }
}