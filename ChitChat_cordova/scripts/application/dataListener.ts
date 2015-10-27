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
        var jsonObj = JSON.parse(JSON.stringify(dataEvent));
        var members = jsonObj.members;

        //GroupMember[] groupMembers = new GroupMember[member.length()];
        //DataManager dataManager = SpartanTalkApplication.getDataManager();

        //List < String > memberId = new ArrayList<>();

        //for (int x= 0; x < member.length(); x++){
        //    JSONObject mObj = member.getJSONObject(x);
        //    GroupMember gMember = new GroupMember(mObj);
        //    groupMembers[x] = gMember;
        //    memberId.add(groupMembers[x].id);
        //}
        //if (memberId.contains(dataManager.getSelfProfileId())) {
        //    // Add My User to Group
        //    if (dataManager.getGroup(body.getString("_id")) == null) {
        //        Group group = new Group();
        //        group.setMembers(groupMembers);
        //        group.setName(body.getString("name"));
        //        group.setId(body.getString("_id"));
        //        group.setType(RoomType.values()[body.getInt("type")]);
        //        group.setUrl(body.getString("image"));
        //        dataManager.createPrivateGroup(body.getString("_id"), group);
        //    } else {
        //        //Add or Remove Other User
        //        dataManager.getGroup(body.getString("_id")).setMembers(groupMembers);
        //    }
        //} else {
        //    // Remove My User
        //    if (dataManager.getGroup(body.getString("_id")) != null) {
        //        dataManager.getGroup(body.getString("_id")).setIsInvisible(true);
        //        //dataManager.removePrivateGroup(body.getString("_id"));
        //    }
        //}
    }
    
    onEditedGroupName(dataEvent) {
        var jsonObj = JSON.parse(JSON.stringify(dataEvent));
        this.dataManager.updateGroupName(jsonObj);
    }
    
    onEditedGroupImage(dataEvent) {
        var obj = JSON.parse(JSON.stringify(dataEvent));
        this.dataManager.updateGroupImage(obj);
    }
    
    onNewGroupCreated(dataEvent) {
        var jsonObj = JSON.parse(JSON.stringify(dataEvent));
        this.dataManager.addGroup(jsonObj);
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