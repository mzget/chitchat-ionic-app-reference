module absSpartan {
    export interface IRoomAccessListenerImp {
        onChat(dataEvent);
        onAccessRoom(dataEvent);
        onUpdatedLastAccessTime(dataEvent);
        onAddRoomAccess(dataEvent);
        onEditedGroupMember(dataEvent);
    }
}