interface IUnreadMessage {
    rid: string;
    count: number;
    message: Message;
}
type ChatLogMap = { [key: string]: ChatLog };

class ChatsLogComponent implements absSpartan.IRoomAccessListenerImp {
    private chatListeners = new Array<(param) => void>();
    public addOnChatListener(listener) {
        this.chatListeners.push(listener);
    }
    onChat(dataEvent) {
        console.log("ChatsLogComponent.onChat");
        //<!-- Provide chatslog service.
        this.chatListeners.map((v, i, a) => {
            v(dataEvent);
        });
    }

    onAccessRoom(dataEvent) {
        let self = this;
        let dataManager = self.main.getDataManager();
        let roomAccess: RoomAccessData[] = JSON.parse(JSON.stringify(dataEvent.roomAccess));

        console.debug("ChatsLogComponent.onAccessRoom", roomAccess.length);

        async.map(roomAccess, function iterator(item, resultCallback) {
            self.main.roomDAL.getData(item.roomId, (err, roomInfo) => {
                if (!err && !!roomInfo) {
                    dataManager.addGroup(roomInfo);
                }

                resultCallback(null, roomInfo);
            });
        }, function done(err, results) {
            self._isReady = true;

            if (!!self.onReady)
                self.onReady();
        });
    }

    public updatedLastAccessTimeEvent: (data) => void;
    onUpdatedLastAccessTime(dataEvent) {
        console.warn("ChatsLogComponent.onUpdatedLastAccessTime", JSON.stringify(dataEvent));

        if (!!this.updatedLastAccessTimeEvent) {
            this.updatedLastAccessTimeEvent(dataEvent);
        }
    }
    public addNewRoomAccessEvent: (data) => void;
    onAddRoomAccess(dataEvent) {
        console.warn("ChatsLogComponent.onAddRoomAccess", JSON.stringify(dataEvent));

        if (!!this.addNewRoomAccessEvent) {
            this.addNewRoomAccessEvent(dataEvent);
        }
    }
    onUpdateMemberInfoInProjectBase(dataEvent) {
        console.warn("ChatsLogComponent.onUpdateMemberInfoInProjectBase", JSON.stringify(dataEvent));
    }

    onEditedGroupMember(dataEvent) {
        console.warn("ChatsLogComponent.onEditedGroupMember", JSON.stringify(dataEvent));
    }

    private main: Main;
    private server: ChatServer.ServerImplemented;
    private convertDateService;
    private chatslog: ChatLogMap = {};
    public getChatsLog(): ChatLogMap {
        return this.chatslog;
    }
    public _isReady: boolean;
    public onReady: () => void;
    constructor(main: Main, server: ChatServer.ServerImplemented, _convertDateService) {
        this.main = main;
        this.server = server;
        this._isReady = false;
        this.convertDateService = _convertDateService;

        console.log("ChatsLogComponent : constructor");
    }

    public getUnreadMessages(roomAccess: RoomAccessData[], callback: (err, logsData: Array<IUnreadMessage>) => void) {
        let self = this;
        let unreadLogs = [];
        async.mapSeries(roomAccess, function iterator(item, cb) {
            if (!!item.roomId && !!item.accessTime) {
                self.server.getUnreadMsgOfRoom(item.roomId, item.accessTime.toString(), function res(err, res) {
                    if (err || res === null) {
                        console.warn("getUnreadMsgOfRoom: ", err);
                    }
                    else {
                        if (res.code === HttpStatusCode.success) {
                            let unread: IUnreadMessage = JSON.parse(JSON.stringify(res.data));
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
            console.log("getUnreadMessages from your roomAccess is done.");
            callback(null, unreadLogs);
        });
    }

    public getUnreadMessage(roomAccess: RoomAccessData, callback: (err, res: IUnreadMessage) => void) {
        this.server.getUnreadMsgOfRoom(roomAccess.roomId, roomAccess.accessTime.toString(), function res(err, res) {
            console.warn("getUnreadMsgOfRoom: ", JSON.stringify(res));
            if (err || res === null) {
                callback(err, null);
            }
            else {
                if (res.code === HttpStatusCode.success) {
                    let unread: IUnreadMessage = JSON.parse(JSON.stringify(res.data));
                    unread.rid = roomAccess.roomId;

                    callback(null, unread);
                }
            }
        });
    }

    private getRoomInfo(room_id: string, resultCB: (err, res:Room) => void) {
        let self = this;
        this.server.getRoomInfo(room_id, function (err, res) {
            if (res.code === HttpStatusCode.success) {
                let roomInfo: Room = JSON.parse(JSON.stringify(res.data));
                if (roomInfo.type === RoomType.privateChat) {
                    let targetMemberId = "";
                    roomInfo.members.some((item) => {
                        if (item.id !== self.main.getDataManager().myProfile._id) {
                            targetMemberId = item.id;
                            return true;
                        }
                    });

                    let contactProfile = self.main.getDataManager().getContactProfile(targetMemberId);
                    if (contactProfile == null) {
                        roomInfo.name = "EMPTY ROOM";
                    }
                    else {
                        roomInfo.name = contactProfile.displayname;
                        roomInfo.image = contactProfile.image;
                    }
                }
                else {
                    console.warn("OMG: the god only know. May be group status is not active.");
                }

                self.main.getDataManager().addGroup(roomInfo);
                self.main.roomDAL.saveData(roomInfo._id, roomInfo);

                resultCB(null, roomInfo);
            }
            else {
                resultCB("Cannot get roomInfo", null);
            }
        });
    }

    public getRoomsInfo(unreadMessageMap: Array<IUnreadMessage>) {
        let self = this;
        let dataManager = this.main.getDataManager();

        async.map(unreadMessageMap, function iterator(item: IUnreadMessage, resultCB: (err, result: Room) => void) {
            let roomInfo = dataManager.getGroup(item.rid);
            if (!!roomInfo) {
                self.organizeChatLogMap(item, roomInfo, function done() {
                    resultCB(null, roomInfo);
                });
            }
            else {
                console.warn("Can't find roomInfo from persisted data: ", item.rid);

                self.server.getRoomInfo(item.rid, function (err, res) {
                    if (res.code === HttpStatusCode.success) {
                        let roomInfo: Room = JSON.parse(JSON.stringify(res.data));
                        if (roomInfo.type === RoomType.privateChat) {
                            let targetMemberId = "";
                            roomInfo.members.some((item) => {
                                if (item.id !== dataManager.myProfile._id) {
                                    targetMemberId = item.id;
                                    return true;
                                }
                            });

                            let contactProfile = dataManager.getContactProfile(targetMemberId);
                            if (contactProfile == null) {
                                roomInfo.name = "EMPTY ROOM";
                            }
                            else {
                                roomInfo.name = contactProfile.displayname;
                                roomInfo.image = contactProfile.image;
                            }
                        }
                        else {
                            console.warn("OMG: the god only know. May be group status is not active.");
                        }

                        dataManager.addGroup(roomInfo);

                        self.organizeChatLogMap(item, roomInfo, function done() {
                            resultCB(null, roomInfo);
                        });
                    }
                    else {
                        console.warn("Fail to get room info of room %s", item.rid, res.message);
                        resultCB(null, null);
                    }
                });
            }
        }, function done(err, results) {
            if (!err) {
                console.log("getRoomsInfo Completed.");
                for (let key in results) {
                    if (results.hasOwnProperty(key)) {
                        let element = results[key];
                        if (!!element)
                            self.main.roomDAL.saveData(element._id, element);
                    }
                }
            }
        });
    }

    public organizeChatLogMap(unread, roomInfo, done) {
        let self = this;
        let dataManager = this.main.getDataManager();
        let log = new ChatLog(roomInfo);
        log.setNotiCount(unread.count);

        if (!!unread.message) {
            log.setLastMessageTime(unread.message.createTime);

            let contact = dataManager.getContactProfile(unread.message.sender);
            let sender = (contact != null) ? contact.displayname : "";
            if (unread.message.body != null) {
                var displayMsg = unread.message.body;
                switch (unread.message.type) {
                    case ContentType[ContentType.Text]:
                        self.main.decodeService(displayMsg, function (err, res) {
                            if (!err) {
                                displayMsg = res;
                            } else { console.warn(err, res); }

                            self.setLogProp(log, displayMsg, function (log) {
                                self.addChatLog(log, done);
                            });
                        });
                        break;
                    case ContentType[ContentType.Sticker]:
                        displayMsg = sender + " sent a sticker.";
                        self.setLogProp(log, displayMsg, function (log) {
                            self.addChatLog(log, done);
                        });
                        break;
                    case ContentType[ContentType.Voice]:
                        displayMsg = sender + " sent a voice message.";
                        self.setLogProp(log, displayMsg, function (log) {
                            self.addChatLog(log, done);
                        });
                        break;
                    case ContentType[ContentType.Image]:
                        displayMsg = sender + " sent a image.";
                        self.setLogProp(log, displayMsg, function (log) {
                            self.addChatLog(log, done);
                        });
                        break;
                    case ContentType[ContentType.Video]:
                        displayMsg = sender + " sent a video.";
                        self.setLogProp(log, displayMsg, function (log) {
                            self.addChatLog(log, done);
                        });
                        break;
                    case ContentType[ContentType.Location]:
                        displayMsg = sender + " sent a location.";
                        self.setLogProp(log, displayMsg, function (log) {
                            self.addChatLog(log, done);
                        });
                        break;
                    case ContentType[ContentType.File]:
                        displayMsg = sender + " sent a File.";
                        self.setLogProp(log, displayMsg, function (log) {
                            self.addChatLog(log, done);
                        });
                        break;
                    default:
                        break;
                }
            }
        }
        else {
            log.setLastMessage("Start Chatting Now!");

            self.setLogProp(log, displayMsg, function (log) {
                self.addChatLog(log, done);
            });
        }
    }

    private setLogProp(log: ChatLog, displayMessage, callback: (log: ChatLog) => void) {
        log.setLastMessage(displayMessage);

        callback(log);
    }

    private addChatLog(chatLog: ChatLog, done) {
        chatLog.time = this.convertDateService.getTimeChatlog(chatLog.lastMessageTime);
        chatLog.timeMsg = new Date(chatLog.lastMessageTime);
        this.chatslog[chatLog.id] = chatLog;
        done();
    }

    public checkRoomInfo(unread: IUnreadMessage): Promise<any> {
        return new Promise((resolve, rejected) => {
            let roomInfo = this.main.getDataManager().getGroup(unread.rid);
            if (!roomInfo) {
                console.warn("No have roomInfo in room store.", roomInfo);
                this.getRoomInfo(unread.rid, (err, res) => {
                    if (!!res) {
                        this.organizeChatLogMap(unread, res, () => {
                            resolve();
                        });
                    }
                    else{
                        rejected();
                    }
                });
            }
            else {
                console.log("Prepare update chats log of room: ", roomInfo.name);
                this.organizeChatLogMap(unread, roomInfo, () => {
                    resolve();
                });
            }
        });
    }
}