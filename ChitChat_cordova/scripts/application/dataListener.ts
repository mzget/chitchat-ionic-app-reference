class DataListener implements Services.IServerListener, Services.IOnChatListener {
    private dataManager: DataManager;

    constructor(dataManager: DataManager) {
        this.dataManager = dataManager;
    }

    onAccessRoom(dataEvent) {
        this.dataManager.setRoomAccessForUser(dataEvent);
    }
    onUpdatedLastAccessTime(dataEvent) {

    }
    onAddRoomAccess(dataEvent) {

    }

    onCreateGroupSuccess(dataEvent) {

    }
    onEditedGroupMember(dataEvent) {

    }
    onEditedGroupName(dataEvent) {

    }
    onEditedGroupImage(dataEvent) {

    }
    onNewGroupCreated(dataEvent) {

    }

    onUpdateMemberInfoInProjectBase(dataEvent) {

    }

    onUserUpdateImageProfile(dataEvent) {

    }
    onUserUpdateProfile(dataEvent) {

    }

    /*******************************************************************************/
    //<!-- chat room data listener.

    onChatData(data) { };
    onLeaveRoom(data) { };
    onRoomJoin(data) { };
    onMessageRead(dataEvent) { };
    onGetMessagesReaders(dataEvent) { };
}