interface IChatRoomController {
    onChat(data);
    onLeaveRoom(data);
    onRoomJoin(data);
    onMessageRead(dataEvent);
    onGetMessagesReaders(dataEvent);
}

class ChatRoomController implements IChatRoomController {
    public chatMessages: Array<Message> = [];
    public serviceListener: (eventName: string, data: any) => void;
    private dataManager: DataManager;
    private main: Main;
    private serverImp: ChatServer.ServerImplemented;
    private chatRoomApi: ChatServer.ChatRoomApiProvider;

    constructor(main: Main) {
        this.main = main;
        this.serverImp = this.main.getServerImp();
        this.chatRoomApi = this.main.getChatRoomApi();
        this.dataManager = this.main.getDataManager();
        console.log("constructor", this.dataManager.getMyProfile().displayname);
    }

    onChat(chatMessageImp: Message) {
        console.log("Implement chat msg hear..", chatMessageImp);
        var self = this;
        var secure = new SecureService();
        if (chatMessageImp.type.toString() === ContentType[ContentType.Text]) {
            secure.decryptWithSecureRandom(chatMessageImp.body, (err, res) => {
                if (!err) {
                    chatMessageImp.body = res;
                    self.chatMessages.push(chatMessageImp);
                    if (!!this.serviceListener)
                        this.serviceListener(ChatServer.ServerEventListener.ON_CHAT, chatMessageImp);
                }
                else {
                    console.log(err, res);
                    self.chatMessages.push(chatMessageImp);
                    if (!!this.serviceListener)
                        this.serviceListener(ChatServer.ServerEventListener.ON_CHAT, chatMessageImp);
                }
            })
        }
        else {
            self.chatMessages.push(chatMessageImp);
            if (!!this.serviceListener)
                this.serviceListener(ChatServer.ServerEventListener.ON_CHAT, chatMessageImp);
        }
    }

    onLeaveRoom(data) {

    }

    onRoomJoin(data) {

    }

    onMessageRead(dataEvent) {
        console.log("Implement onMessageRead hear..", JSON.stringify(dataEvent));
        var self = this;
        var newMsg: Message = JSON.parse(JSON.stringify(dataEvent.data));

        this.chatMessages.some(function callback(value) {
            if (value._id === newMsg._id) {
                value.readers = newMsg.readers;

                if (!!self.serviceListener)
                    self.serviceListener(ChatServer.ServerEventListener.ON_MESSAGE_READ, null);

                return true;
            }
        });
    }

    onGetMessagesReaders(dataEvent) {

    }

    public getMessage(chatId, Chats, callback) {
        var self = this;
        var myProfile = self.dataManager.myProfile;
        console.log(myProfile, self.dataManager);
        var chatLog = localStorage.getItem(myProfile.displayname + '_' + chatId);

        async.waterfall([
            function (cb) {
                if (!!chatLog) {
                    if (JSON.stringify(chatLog) === "") {
                        self.chatMessages = [];
                        cb(null, null);
                    }
                    else {
                        var arr_fromLog: Array<Message> = JSON.parse(chatLog);
                        if (arr_fromLog === null || arr_fromLog instanceof Array === false) {
                            self.chatMessages = [];
                            cb(null, null);
                        }
                        else {
                            async.eachSeries(arr_fromLog, function (log, cb) {
                                var messageImp: any = log;
                                if (messageImp.type === ContentType[ContentType.Text]) {
                                    self.main.decodeService(messageImp.body, function (err, res) {
                                        if (!err) {
                                            messageImp.body = res;
                                            self.chatMessages.push(messageImp);
                                            cb();
                                        }
                                        else {
                                            //console.log(err, res);
                                            self.chatMessages.push(messageImp);
                                            cb();
                                        }
                                    });
                                }
                                else {
                                    self.chatMessages.push(log);
                                    cb();
                                }
                            }, function (err) {
                                cb(null, null);
                            });
                        }
                    }
                }
                else {
                    self.chatMessages = [];
                    cb(null, null);
                }
            },
            function (arg1, cb) {
                //console.log("before join", JSON.stringify(chatMessages));
                cb(null, null);
            }
        ], function (err, res) {
            self.serverImp.JoinChatRoomRequest(chatId, function (err, res) {
                if (res.code == 200) {
                    var access = new Date();
                    var roomAccess = self.dataManager.myProfile.roomAccess;
                    async.eachSeries(roomAccess, function iterator(item, cb) {
                        if (item.roomId == chatId) {
                            access = item.accessTime;
                        }

                        cb();
                    }, function done() {
                        self.chatRoomApi.getChatHistory(chatId, access, function (err, result) {
                            var histories = [];
                            if (result.code === 200) {
                                histories = result.data;
                            } else {
                                //console.warn("WTF god only know.", result.message);
                            }

                            var his_length = histories.length;
                            //console.log("new chat log", histories.length);
                            if (his_length > 0) {
                                async.eachSeries(histories, function (item, cb) {
                                    var chatMessageImp = JSON.parse(JSON.stringify(item));
                                    if (chatMessageImp.type === ContentType[ContentType.Text]) {
                                        self.main.decodeService(chatMessageImp.body, function (err, res) {
                                            if (!err) {
                                                chatMessageImp.body = res;
                                                self.chatMessages.push(chatMessageImp);
                                                cb();
                                            }
                                            else {
                                                //console.warn(err, res);
                                                cb();
                                            }
                                        });
                                    }
                                    else {
                                        if (item.type == 'File') {
                                            console.log('file');
                                        }
                                        self.chatMessages.push(item);
                                        cb();
                                    }
                                }, function (err) {
                                    Chats.set(self.chatMessages);

                                    localStorage.removeItem(myProfile.displayname + '_' + chatId);
                                    localStorage.setItem(myProfile.displayname + '_' + chatId, JSON.stringify(self.chatMessages));

                                    // location.href = '#/tab/message/' + chatId;
                                    callback();
                                });
                            }
                            else {
                                // location.href = '#/tab/message/' + chatId;
                                Chats.set(self.chatMessages);
                                callback();
                            }
                        });
                    });
                }
            });
        });
    }

    public leaveRoom(room_id, callback: (err, res) => void) {
        var self = this;
        this.serverImp.LeaveChatRoomRequest(room_id, function (err, res) {
            console.log("leave room", JSON.stringify(res));
            callback(err, res);
        });
    }
}