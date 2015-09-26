class DataListener implements Services.IServerListener, Services.IChatServerListener {
    private dataManager: DataManager;

    constructor(dataManager: DataManager) {
        this.dataManager = dataManager;
    }

    onAccessRoom(dataEvent) {
        this.dataManager.setRoomAccessForUser(dataEvent);
    }
    onUpdatedLastAccessTime(dataEvent) {
        this.dataManager.updateRoomAccessForUser(dataEvent);
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

    onChatData(data) {
        console.log("Implement chat msg hear..", JSON.stringify(data));

        var chatMessageImp = JSON.parse(JSON.stringify(data));
        var secure = new SecureService();
        secure.decryptWithSecureRandom(chatMessageImp.body, (err, res) => {
            console.warn(res)
        })
    };
    onLeaveRoom(data) { };
    onRoomJoin(data) { };
    onMessageRead(dataEvent) { };
    onGetMessagesReaders(dataEvent) { };
}