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
        var jsonObj: Room = JSON.parse(JSON.stringify(dataEvent));
        this.dataManager.updateGroupMembers(jsonObj);
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
        var jsonObj = JSON.parse(JSON.stringify(dataEvent));
        this.dataManager.updateGroupMemberDetail(jsonObj);
    }

    onUserUpdateImageProfile(dataEvent) {
        var jsonObj = JSON.parse(JSON.stringify(dataEvent));
        var _id = jsonObj._id;
        var path = jsonObj.path;
        
        this.dataManager.updateContactImage(_id, path);
    }
    
    onUserUpdateProfile(dataEvent) {
        var jsonobj = JSON.parse(JSON.stringify(dataEvent));
        var params = jsonobj.params;
        var _id = jsonobj._id;
        
        this.dataManager.updateContactProfile(_id, params);
    }

    /*******************************************************************************/
    //<!-- chat room data listener.

    onChatData(data) {
        var chatMessageImp: Message = JSON.parse(JSON.stringify(data));

        if (!!this.listenerImp) {
            this.listenerImp.onChat(chatMessageImp);
        }

        console.error("dataListener: ", this.listenerImp, chatMessageImp.type);
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