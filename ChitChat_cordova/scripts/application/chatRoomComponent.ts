class ChatRoomComponent implements absSpartan.IChatServerListener {
    public chatMessages: Array<Message> = [];
    public serviceListener: (eventName: string, data: any) => void;
    public notifyEvent: (eventName: string, data: any) => void;
    private dataManager: DataManager;
    private main: Main;
    private serverImp: ChatServer.ServerImplemented;
    private chatRoomApi: ChatServer.ChatRoomApiProvider;
    private roomId : string;

    constructor(main: Main, room_id: string) {
        this.main = main;
        this.serverImp = this.main.getServerImp();
        this.chatRoomApi = this.main.getChatRoomApi();
        this.dataManager = this.main.getDataManager();
        this.roomId = room_id;
        
        console.log("constructor ChatRoomComponent");
    }

    onChat(chatMessageImp: Message) {
        var self = this;
        
        if(this.roomId === chatMessageImp.rid) {
            console.log("Implement chat msg hear..", chatMessageImp);
            
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
        else {
            console.log("this msg come from other room.");
            if (!!this.notifyEvent) {
                this.notifyEvent(ChatServer.ServerEventListener.ON_CHAT, chatMessageImp);
            }
        }
    }

    onLeaveRoom(data) {

    }

    onRoomJoin(data) {

    }

    onMessageRead(dataEvent) {
        console.log("Implement onMessageRead hear..", JSON.stringify(dataEvent));
        var self = this;
        var newMsg: Message = JSON.parse(JSON.stringify(dataEvent));

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

    public getPersistentMessage(messageDAL: MessageDAL, rid: string, done: (err, messages) => void) {
        var self = this;
        messageDAL.getData(rid, (err, messages) => {
            if (messages !== null) {
                var chats: Array<Message> = JSON.parse(JSON.stringify(messages));

                async.mapSeries(chats, function iterator(item, result) {
                    if (item.type === ContentType.Text) {
                        // console.log("item:", count++, log.type);
                        self.main.decodeService(item.body, function (err, res) {
                            if (!err) {
                                item.body = res;
                                self.chatMessages.push(item);
                            }
                            else {
                                self.chatMessages.push(item);
                            }

                            result(null, item);
                        });
                    }
                    else {
                        self.chatMessages.push(item);
                        result(null, item);
                    }
                }, function done(err, results) {
                    console.log("decode chats text completed.");
                });
            }
            else {
                self.chatMessages = [];
            }

            done(err, messages);
        });
    }

    public getMessage(chatId, Chats, callback: (joinRoomRes: any) => void) {
        var self = this;
        var myProfile = self.dataManager.myProfile;
        var chatLog = localStorage.getItem(myProfile._id + '_' + chatId);

        var promise = new Promise(function (resolve, reject) {
            if (!!chatLog) {
                console.log("Local chat history has a data...");

                if (JSON.stringify(chatLog) === "") {
                    self.chatMessages = [];
                    resolve();
                }
                else {
                    var arr_fromLog: Array<Message> = JSON.parse(chatLog);
                    if (arr_fromLog === null || arr_fromLog instanceof Array === false) {
                        self.chatMessages = [];
                        resolve();
                    }
                    else {
                        console.log("Decode local chat history for displaying:", arr_fromLog.length);
                        // let count = 0;
                        arr_fromLog.map((log, i, a) => {
                            var messageImp: any = log;
                            if (messageImp.type === ContentType[ContentType.Text]) {
                                // console.log("item:", count++, log.type);
                                self.main.decodeService(messageImp.body, function (err, res) {
                                    if (!err) {
                                        messageImp.body = res;
                                        self.chatMessages.push(messageImp);
                                    }
                                    else {
                                        //console.log(err, res);
                                        self.chatMessages.push(messageImp);
                                    }
                                });
                            }
                            else {
                                // console.log("item:", count++, log.type);
                                self.chatMessages.push(log);
                            }
                        });
                        resolve();
                    }
                }
            }
            else {
                console.log("Have no local chat history.");
                self.chatMessages = [];
                resolve();
            }
        });

        promise.then(function onFulfilled() {
            console.log("get local history done:");
            self.serverImp.JoinChatRoomRequest(chatId, function (err, joinRoomRes) {
                if (joinRoomRes.code == 200) {
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

                                    localStorage.removeItem(myProfile._id + '_' + chatId);
                                    localStorage.setItem(myProfile._id + '_' + chatId, JSON.stringify(self.chatMessages));
                                    
                                    callback(joinRoomRes);
                                });
                            }
                            else {
                                Chats.set(self.chatMessages);
                                callback(joinRoomRes);
                            }
                        });
                    });
                }
                else {
                    callback(joinRoomRes);
                }
            });

        }).catch(function onRejected(reason) {
            console.warn("promiss.onRejected", reason);
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