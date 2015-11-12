module absSpartan {
    export abstract class AbsRoomAccessListenerImp {
        abstract onAccessRoom(dataEvent);
        abstract onUpdatedLastAccessTime(dataEvent);
        abstract onAddRoomAccess(dataEvent);
    }
}