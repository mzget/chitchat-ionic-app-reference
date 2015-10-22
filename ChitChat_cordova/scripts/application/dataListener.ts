class DataListener implements Services.IServerListener, Services.IChatServerListener {
    private dataManager: DataManager;
    private listenerImp;

    constructor(dataManager: DataManager) {
        this.dataManager = dataManager;
    }

    public addListenerImp(listener) {
        this.listenerImp = listener;
    }

    public removeListener(listener) {
        this.listenerImp = null;
    }

    onAccessRoom(dataEvent) {
        this.dataManager.setRoomAccessForUser(dataEvent);
    }

    onUpdatedLastAccessTime(dataEvent) {
        this.dataManager.updateRoomAccessForUser(dataEvent);
    }

    onAddRoomAccess(dataEvent) {
        var data = JSON.parse(JSON.stringify(dataEvent));
        var roomAccess: RoomAccessData[] = data.roomAccess;
        if (roomAccess !== null && roomAccess.length !== 0) {
            this.dataManager.setRoomAccessForUser(dataEvent);
        }
    }

    onCreateGroupSuccess(dataEvent) {
        var group: Room = JSON.parse(JSON.stringify(dataEvent));
        this.dataManager.addGroup(group);
    }

    onEditedGroupMember(dataEvent) {

    }
    onEditedGroupName(dataEvent) {

    }
    onEditedGroupImage(dataEvent) {
        var 
            JSONObject body = dataEvent.getMessage().getJSONObject("body");
            SpartanTalkApplication.getDataManager().getGroup(body.getString("_id")).setUrl(body.getString("image"));
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
        var chatMessageImp: Message = JSON.parse(JSON.stringify(data));

        if (!!this.listenerImp)
            this.listenerImp.onChat(chatMessageImp);
    };
    onLeaveRoom(data) {
        if (!!this.listenerImp)
            this.listenerImp.onLeaveRoom(data);
    };
    onRoomJoin(data) {

    };

    onMessageRead(dataEvent) {
        if (!!this.listenerImp)
            this.listenerImp.onMessageRead(dataEvent);
    };

    onGetMessagesReaders(dataEvent) {
        if (!!this.listenerImp)
            this.listenerImp.onGetMessagesReaders(dataEvent);
    };
}