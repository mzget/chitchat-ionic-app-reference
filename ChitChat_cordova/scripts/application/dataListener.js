var DataListener = (function () {
    function DataListener(dataManager) {
        this.notifyNewMessageEvents = new Array();
        this.chatListenerImps = new Array();
        this.roomAccessListenerImps = new Array();
        this.dataManager = dataManager;
    }
    DataListener.prototype.addNoticeNewMessageEvent = function (listener) {
        if (this.notifyNewMessageEvents.length === 0) {
            this.notifyNewMessageEvents.push(listener);
        }
    };
    DataListener.prototype.removeNoticeNewMessageEvent = function (listener) {
        var id = this.notifyNewMessageEvents.indexOf(listener);
        this.notifyNewMessageEvents.splice(id, 1);
    };
    DataListener.prototype.addChatListenerImp = function (listener) {
        this.chatListenerImps.push(listener);
    };
    DataListener.prototype.removeChatListenerImp = function (listener) {
        var id = this.chatListenerImps.indexOf(listener);
        this.chatListenerImps.splice(id, 1);
    };
    DataListener.prototype.addRoomAccessListenerImp = function (listener) {
        this.roomAccessListenerImps.push(listener);
    };
    DataListener.prototype.removeRoomAccessListener = function (listener) {
        var id = this.roomAccessListenerImps.indexOf(listener);
        this.roomAccessListenerImps.splice(id, 1);
    };
    DataListener.prototype.onAccessRoom = function (dataEvent) {
        this.dataManager.setRoomAccessForUser(dataEvent);
        if (!!this.roomAccessListenerImps) {
            this.roomAccessListenerImps.map(function (value) {
                value.onAccessRoom(dataEvent);
            });
        }
    };
    DataListener.prototype.onUpdatedLastAccessTime = function (dataEvent) {
        this.dataManager.updateRoomAccessForUser(dataEvent);
        if (!!this.roomAccessListenerImps) {
            this.roomAccessListenerImps.map(function (value) {
                value.onUpdatedLastAccessTime(dataEvent);
            });
        }
    };
    DataListener.prototype.onAddRoomAccess = function (dataEvent) {
        var data = JSON.parse(JSON.stringify(dataEvent));
        var roomAccess = data.roomAccess;
        if (roomAccess !== null && roomAccess.length !== 0) {
            this.dataManager.setRoomAccessForUser(dataEvent);
        }
        if (!!this.roomAccessListenerImps) {
            this.roomAccessListenerImps.map(function (value) {
                value.onAddRoomAccess(dataEvent);
            });
        }
    };
    DataListener.prototype.onCreateGroupSuccess = function (dataEvent) {
        var group = JSON.parse(JSON.stringify(dataEvent));
        this.dataManager.addGroup(group);
    };
    DataListener.prototype.onEditedGroupMember = function (dataEvent) {
        var jsonObj = JSON.parse(JSON.stringify(dataEvent));
        this.dataManager.updateGroupMembers(jsonObj);
        if (!!this.roomAccessListenerImps) {
            this.roomAccessListenerImps.map(function (value) {
                value.onEditedGroupMember(dataEvent);
            });
        }
    };
    DataListener.prototype.onEditedGroupName = function (dataEvent) {
        var jsonObj = JSON.parse(JSON.stringify(dataEvent));
        this.dataManager.updateGroupName(jsonObj);
    };
    DataListener.prototype.onEditedGroupImage = function (dataEvent) {
        var obj = JSON.parse(JSON.stringify(dataEvent));
        this.dataManager.updateGroupImage(obj);
    };
    DataListener.prototype.onNewGroupCreated = function (dataEvent) {
        var jsonObj = JSON.parse(JSON.stringify(dataEvent));
        this.dataManager.addGroup(jsonObj);
    };
    DataListener.prototype.onUpdateMemberInfoInProjectBase = function (dataEvent) {
        var jsonObj = JSON.parse(JSON.stringify(dataEvent));
        this.dataManager.updateGroupMemberDetail(jsonObj);
    };
    //#region User.
    DataListener.prototype.onUserLogin = function (dataEvent) {
        this.dataManager.onUserLogin(dataEvent);
    };
    DataListener.prototype.onUserUpdateImageProfile = function (dataEvent) {
        var jsonObj = JSON.parse(JSON.stringify(dataEvent));
        var _id = jsonObj._id;
        var path = jsonObj.path;
        this.dataManager.updateContactImage(_id, path);
    };
    DataListener.prototype.onUserUpdateProfile = function (dataEvent) {
        var jsonobj = JSON.parse(JSON.stringify(dataEvent));
        var params = jsonobj.params;
        var _id = jsonobj._id;
        this.dataManager.updateContactProfile(_id, params);
    };
    //#endregion
    /*******************************************************************************/
    //<!-- chat room data listener.
    DataListener.prototype.onChat = function (data) {
        var chatMessageImp = JSON.parse(JSON.stringify(data));
        if (!!this.notifyNewMessageEvents && this.notifyNewMessageEvents.length !== 0) {
            this.notifyNewMessageEvents.map(function (v, id, arr) {
                v(chatMessageImp);
            });
        }
        if (!!this.chatListenerImps && this.chatListenerImps.length !== 0) {
            this.chatListenerImps.forEach(function (value, id, arr) {
                value.onChat(chatMessageImp);
            });
        }
        if (!!this.roomAccessListenerImps && this.roomAccessListenerImps.length !== 0) {
            this.roomAccessListenerImps.map(function (v) {
                v.onChat(chatMessageImp);
            });
        }
    };
    ;
    DataListener.prototype.onLeaveRoom = function (data) {
        if (!!this.chatListenerImps && this.chatListenerImps.length !== 0) {
            this.chatListenerImps.forEach(function (value) {
                value.onLeaveRoom(data);
            });
        }
    };
    ;
    DataListener.prototype.onRoomJoin = function (data) {
    };
    ;
    DataListener.prototype.onMessageRead = function (dataEvent) {
        if (!!this.chatListenerImps && this.chatListenerImps.length !== 0) {
            this.chatListenerImps.forEach(function (value) {
                value.onMessageRead(dataEvent);
            });
        }
    };
    ;
    DataListener.prototype.onGetMessagesReaders = function (dataEvent) {
        if (!!this.chatListenerImps && this.chatListenerImps.length !== 0) {
            this.chatListenerImps.forEach(function (value) {
                value.onGetMessagesReaders(dataEvent);
            });
        }
    };
    ;
    return DataListener;
})();
