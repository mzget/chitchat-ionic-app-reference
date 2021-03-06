﻿class ChatRoomComponent implements absSpartan.IChatServerListener {
    public chatMessages: Array<Message> = [];
    public serviceListener: (eventName: string, data: any) => void;
    public notifyEvent: (eventName: string, data: any) => void;
    private dataManager: DataManager;
    private main: Main;
    private serverImp: ChatServer.ServerImplemented;
    private chatRoomApi: ChatServer.ChatRoomApiProvider;
    private roomId: string;
    private messageDAL: MessageDAL;

    constructor(main: Main, room_id: string, messageDAL: MessageDAL) {
        this.main = main;
        this.serverImp = this.main.getServerImp();
        this.chatRoomApi = this.main.getChatRoomApi();
        this.dataManager = this.main.getDataManager();
        this.roomId = room_id;
        this.messageDAL = messageDAL;

        console.log("constructor ChatRoomComponent");
    }

    onChat(chatMessageImp: Message) {
        let self = this;

        if (this.roomId === chatMessageImp.rid) {
            let secure = new SecureService();
            if (chatMessageImp.type.toString() === ContentType[ContentType.Text]) {
                if (self.serverImp.appConfig.encryption == true) {
                    secure.decryptWithSecureRandom(chatMessageImp.body, (err, res) => {
                        if (!err) {
                            chatMessageImp.body = res;
                            self.chatMessages.push(chatMessageImp);
                            self.messageDAL.saveData(self.roomId, self.chatMessages);

                            if (!!this.serviceListener)
                                this.serviceListener(ChatServer.ServerEventListener.ON_CHAT, chatMessageImp);
                        }
                        else {
                            console.log(err, res);
                            self.chatMessages.push(chatMessageImp);
                            self.messageDAL.saveData(self.roomId, self.chatMessages);

                            if (!!this.serviceListener)
                                this.serviceListener(ChatServer.ServerEventListener.ON_CHAT, chatMessageImp);
                        }
                    })
                }
                else {
                    self.chatMessages.push(chatMessageImp);
                    self.messageDAL.saveData(self.roomId, self.chatMessages);

                    if (!!this.serviceListener)
                        this.serviceListener(ChatServer.ServerEventListener.ON_CHAT, chatMessageImp);
                }
            }
            else {
                self.chatMessages.push(chatMessageImp);
                self.messageDAL.saveData(self.roomId, self.chatMessages);

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
        console.log("onMessageRead", JSON.stringify(dataEvent));

        let self = this;
        let newMsg: Message = JSON.parse(JSON.stringify(dataEvent));

        let promise = new Promise(function (resolve, reject) {
            self.chatMessages.some(function callback(value) {
                if (value._id === newMsg._id) {
                    value.readers = newMsg.readers;

                    if (!!self.serviceListener)
                        self.serviceListener(ChatServer.ServerEventListener.ON_MESSAGE_READ, null);

                    resolve();
                    return true;
                }
            });
        }).then((value) => {
            self.messageDAL.saveData(self.roomId, self.chatMessages);
        });
    }

    onGetMessagesReaders(dataEvent) {
        console.log('onGetMessagesReaders', dataEvent);

        let self = this;
        interface Ireaders {
            _id: string;
            readers: Array<string>;
        }
        let myMessagesArr: Array<Ireaders> = JSON.parse(JSON.stringify(dataEvent.data));

        self.chatMessages.forEach((originalMsg, id, arr) => {
            if (self.dataManager.isMySelf(originalMsg.sender)) {
                myMessagesArr.some((myMsg, index, array) => {
                    if (originalMsg._id === myMsg._id) {
                        originalMsg.readers = myMsg.readers;
                        return true;
                    }
                });
            }
        });

        self.messageDAL.saveData(self.roomId, self.chatMessages);
    }

    public getPersistentMessage(rid: string, done: (err, messages) => void) {
        var self = this;
        self.messageDAL.getData(rid, (err, messages) => {
            if (messages !== null) {
                let chats = messages.slice(0);
                async.mapSeries(chats, function iterator(item, result) {
                    if (item.type === ContentType.Text) {
                        if (self.serverImp.appConfig.encryption == true) {
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
                    }
                    else {
                        self.chatMessages.push(item);
                        result(null, item);
                    }
                }, (err, results) => {
                    console.log("decode chats text completed.", self.chatMessages.length);

                    done(err, messages);
                });
            }
            else {
                self.chatMessages = [];

                console.debug("chatMessages", self.chatMessages.length);
                done(err, messages);
            }
        });
    }

    public getNewerMessageRecord(callback: (err, res) => void) {
        let self = this;
        let lastMessageTime = new Date();
        new Promise(function promise(resolve, reject) {
            if (self.chatMessages[self.chatMessages.length - 1] != null) {
                lastMessageTime = self.chatMessages[self.chatMessages.length - 1].createTime;
                resolve();
            }
            else {
                var roomAccess = self.dataManager.getRoomAccess();
                async.some(roomAccess, (item, cb) => {
                    if (item.roomId === self.roomId) {
                        lastMessageTime = item.accessTime;
                        cb(null, true);
                    }
                    else cb(null, false);
                }, (result) => {
                    console.log(result);

                    if (result) {
                        resolve();
                    }
                    else {
                        reject();
                    }
                });
            }
        })
        .then((value) => {
            self.getNewerMessageFromNet(lastMessageTime, callback);
        })
        .catch((err) => {
            console.warn("this room_id is not contain in roomAccess list.");

            self.getNewerMessageFromNet(lastMessageTime, callback);
        });
    }

    private getNewerMessageFromNet(lastMessageTime: Date, callback: (err, res) => void) {
        var self = this;

        self.chatRoomApi.getChatHistory(self.roomId, lastMessageTime, function (err, result) {
            var histories = [];
            if (result.code === 200) {
                histories = result.data;
                console.log("Newer message counts.", histories.length);
                if (histories.length > 0) {

                    var messages: Array<Message> = JSON.parse(JSON.stringify(histories));

                    async.mapSeries(messages, function (item, cb) {
                        if (item.type.toString() === ContentType[ContentType.Text]) {
                            if (self.serverImp.appConfig.encryption == true) {
                                self.main.decodeService(item.body, function (err, res) {
                                    if (!err) {
                                        item.body = res;
                                        self.chatMessages.push(item);
                                    }
                                    else {
                                        self.chatMessages.push(item);
                                    }

                                    cb(null, item);
                                });
                            }
                            else {
                                self.chatMessages.push(item);
                                cb(null, item);
                            }
                        }
                        else {
                            self.chatMessages.push(item);
                            cb(null, item);
                        }
                    }, function done(err) {
                        if (!err) {
                            console.log("get newer message completed.");
                        }
                        else {
                            console.error('get newer message error', err);
                        }

                        console.debug("chatMessage.Count", self.chatMessages.length);
                        //<!-- Save persistent chats log here.
                        self.messageDAL.saveData(self.roomId, self.chatMessages, (err, result) => {
                            //self.getNewerMessageRecord();
                        });

                        if (callback !== null) {
                            callback(null, result.code);
                        }
                    });
                }
                else {
                    console.log("Have no newer message.");


                    if (callback !== null) {
                        callback(null, result.code);
                    }
                }
            }
            else {
                console.warn("WTF god only know.", result.message);

                if (callback !== null) {
                    callback(null, result.code);
                }
            }
        });
    }

    public getOlderMessageChunk(callback: (err, res) => void) {
        let self = this;
        self.getTopEdgeMessageTime(function done(err, res) {
            self.chatRoomApi.getOlderMessageChunk(self.roomId, res, function response(err, res) {
                //@ todo.
                /**
                 * Merge messages record to chatMessages array.
                 * Never save message to persistend layer.
                 */
                let datas = [];
                datas = res.data;
                let clientMessages = self.chatMessages.slice(0);
                let mergedArray: Array<Message> = [];
                if (datas.length > 0) {
                    var messages: Array<Message> = JSON.parse(JSON.stringify(datas));
                    mergedArray = messages.concat(clientMessages);
                }

                let resultsArray: Array<Message> = [];
                async.map(mergedArray, function iterator(item, cb) {
                    let hasMessage = resultsArray.some(function itor(value, id, arr) {
                        if (value._id == item._id) {
                            return true;
                        }
                    });

                    if (hasMessage == false) {
                        resultsArray.push(item);
                        cb(null, null);
                    }
                    else {
                        cb(null, null);
                    }
                }, function done(err, results: Array<Message>) {
                    resultsArray.sort(self.compareMessage);

                    self.chatMessages = resultsArray.slice(0);

                    callback(err, resultsArray);

                    self.messageDAL.saveData(self.roomId, self.chatMessages);
                });
            });
        });
    }

    private checkOlderMessages(callback: (err, res) => void) {
        let self = this;
        self.getTopEdgeMessageTime(function done(err, res) {
            self.chatRoomApi.checkOlderMessagesCount(self.roomId, res, function response(err, res) {
                callback(err, res);
            });
        });
    }

    private getTopEdgeMessageTime(callback: (err, res) => void) {
        let self = this;
        let topEdgeMessageTime: Date = null;
        if (self.chatMessages != null && self.chatMessages.length != 0) {
            if (!!self.chatMessages[0].createTime) {
                topEdgeMessageTime = self.chatMessages[0].createTime;
            }
            else {
                topEdgeMessageTime = new Date();
            }
        }
        else {
            topEdgeMessageTime = new Date();
        }

        console.debug('topEdgeMsg:', topEdgeMessageTime, JSON.stringify(self.chatMessages[0]));
        callback(null, topEdgeMessageTime);
    }

    private compareMessage(a: Message, b: Message) {
        if (a.createTime > b.createTime) {
            return 1;
        }
        if (a.createTime < b.createTime) {
            return -1;
        }
        // a must be equal to b
        return 0;
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
                                if (self.serverImp.appConfig.encryption == true) {
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
                                    self.chatMessages.push(messageImp);
                                }
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
                                        if (self.serverImp.appConfig.encryption == true) {
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
                                            self.chatMessages.push(chatMessageImp);
                                            cb();
                                        }
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

    public updateReadMessages() {
        let self = this;
        
        async.each(self.chatMessages, function itorator(message, errCb) {
            if (!self.dataManager.isMySelf(message.sender)) {
                if (!!message.readers) {
                    let isReaded = message.readers.some(element => {
                        //@ if you readed it.
                        if (self.dataManager.isMySelf(element)) {
                            return true;
                        }
                    });

                    if (isReaded)
                        errCb(null);
                    else {
                        message.readers.push(self.dataManager.myProfile._id);
                        self.chatRoomApi.updateMessageReader(message._id, message.rid);
                        errCb(null);
                    }
                }
                else {
                    message.readers = new Array<string>();
                    message.readers.push(self.dataManager.myProfile._id);
                    self.chatRoomApi.updateMessageReader(message._id, message.rid);
                    errCb(null);
                }
            }
            else {
                errCb(null);
            }
        }, function done(err) {
            //@ done.
            console.warn("Next version we has to call updateMessageReader once time at here.");
        })
    }

    public updateWhoReadMyMessages() {
        let self = this;

        self.getTopEdgeMessageTime((err, res) => {
            self.chatRoomApi.getMessagesReaders(res);
        });
    }

    public leaveRoom(room_id, callback: (err, res) => void) {
        var self = this;

        if (self.serverImp._isConnected) {
            self.serverImp.LeaveChatRoomRequest(room_id, function (err, res) {
                console.log("leave room", JSON.stringify(res));
                callback(err, res);
            });
        }
        else {
            console.warn(ChatServer.ServerImplemented.connectionProblemString);

            callback(new Error(ChatServer.ServerImplemented.connectionProblemString), null);
        }
    }

    public joinRoom(callback: (err, res) => void) {
        var self = this;
        self.serverImp.JoinChatRoomRequest(self.roomId, callback);
    }

    public getMemberProfile(member: Member, callback: (err, res) => void) {
        this.serverImp.getMemberProfile(member.id, callback);
    }
}