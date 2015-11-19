interface IUnreadMessage {
    rid: string;
    count: number;
    message: Message;
}

class ChatsLogComponent implements absSpartan.IRoomAccessListenerImp {
    private newMessageListeners = new Array<(param) => void>();
    public addNewMsgListener (listener) {
        this.newMessageListeners.push(listener);
    }
    onNewMessage(dataEvent) {
        console.log("ChatsLogComponent.onNewMessage");
        //<!-- Provide chatslog service.
        this.newMessageListeners.map((v, i, a) => {
            v(dataEvent);
        });
    }
    onAccessRoom(dataEvent) {
        console.warn("ChatsLogComponent.onAccessRoom", JSON.stringify(dataEvent));

        this._isReady = true;
        if (!!this.onReady)
            this.onReady();
    }
    public updatedLastAccessTimeEvent: (data) => void;
    onUpdatedLastAccessTime(dataEvent) {
        console.warn("ChatsLogComponent.onUpdatedLastAccessTime", JSON.stringify(dataEvent));

        if (!!this.updatedLastAccessTimeEvent) {
            this.updatedLastAccessTimeEvent(dataEvent);
        }
    }
    onAddRoomAccess(dataEvent) {
        console.warn("ChatsLogComponent.onAddRoomAccess", JSON.stringify(dataEvent));
    }
    onEditedGroupMember(dataEvent) {
        console.warn("ChatsLogComponent.onEditedGroupMember", JSON.stringify(dataEvent));
    }
        
        private main : Main;
        private server: ChatServer.ServerImplemented;
        public _isReady: boolean;
        public onReady:() => void;
        constructor(main: Main, server: ChatServer.ServerImplemented) {
            this.main = main;
            this.server = server;
            this._isReady = false;

            console.log("ChatsLogComponent : constructor");
        }
        
        public getUnreadMessages(roomAccess: RoomAccessData[], callback:(err: Error, logsData: Array<IUnreadMessage>) => void) {
            var self = this;
            var unreadLogs = [];
            async.mapSeries(roomAccess, function iterator(item, cb) {
                if (!!item.roomId && !!item.accessTime) {
                    self.server.getUnreadMsgOfRoom(item.roomId, item.accessTime.toString(), function res(err, res) {
                        if (err || res === null) {
                            console.warn("getUnreadMsgOfRoom: ", err);
                        }
                        else {
                            if (res.code === HttpStatusCode.success) {
                                var unread: IUnreadMessage = JSON.parse(JSON.stringify(res.data));
                                unread.rid = item.roomId;
                                unreadLogs.push(unread);
                            }
                        }
                        cb(null, null);
                    });
                }
                else {
                    cb(null, null);
                }
            }, function done(err) {
                console.log("get unread message is done.");
                callback(null, unreadLogs);
            });
        }
        
        public getUnreadMessage(roomAccess: RoomAccessData, callback:(err, res) => void) {
            this.server.getUnreadMsgOfRoom(roomAccess.roomId, roomAccess.accessTime.toString(), function res(err, res) {
                console.warn("getUnreadMsgOfRoom: ", err, JSON.stringify(res));
                if (err || res === null) {
                    callback(err, null);
                }
                else {
                    if (res.code === HttpStatusCode.success) {
                        var unread: IUnreadMessage = JSON.parse(JSON.stringify(res.data));
                        unread.rid = roomAccess.roomId;
                        
                        callback(null, unread);
                    }
                }
            });
        }
        
        public getRoomsInfo() {
            var dataManager = this.main.getDataManager();
            var myRoomAccess = dataManager.myProfile.roomAccess;
            console.log("myRoomAccess.length", myRoomAccess.length);
            myRoomAccess.map((value, id, arr) => {
                var room = dataManager.getGroup(value.roomId);
                if(!!room) {
                    console.log(room);
                }
                else {
                    console.warn("room: ", value.roomId + "is invalid");
                }
            });
        }
}