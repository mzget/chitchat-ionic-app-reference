class DataListener implements Services.IServerListener, Services.IChatServerListener {
    private dataManager: DataManager;
    private listenerImp;

    constructor(dataManager: DataManager) {
        this.dataManager = dataManager;
    }

    public addListenerImp(listener) {
        this.listenerImp = listener;
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
        var chatMessageImp = JSON.parse(JSON.stringify(data));
        this.listenerImp.onChat(chatMessageImp);
    };
    onLeaveRoom(data) {
        this.listenerImp.onLeaveRoom(data);
    };
    onRoomJoin(data) {

    };

    onMessageRead(dataEvent) {
        this.listenerImp.onMessageRead(dataEvent);
    };

    onGetMessagesReaders(dataEvent) {
        this.listenerImp.onGetMessagesReaders(dataEvent);
    };
}