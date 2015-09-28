interface IChatRoomController {
    onChat(data);
    onLeaveRoom(data);
    onRoomJoin(data);
    onMessageRead(dataEvent);
    onGetMessagesReaders(dataEvent);
}

class ChatRoomController implements IChatRoomController {
    public chatMessages = [];
    public serviceListener;

    onChat(chatMessageImp) {
        console.log("Implement chat msg hear..", chatMessageImp);
        var self = this;
        var secure = new SecureService();
        if (chatMessageImp.type === ContentType[ContentType.Text]) {
            secure.decryptWithSecureRandom(chatMessageImp.body, (err, res) => {
                if (!err) {
                    chatMessageImp.body = res;
                    self.chatMessages.push(chatMessageImp);
                    if (!!this.serviceListener)
                        this.serviceListener();
                }
                else {
                    console.log(err, res);
                    self.chatMessages.push(chatMessageImp);
                    if (!!this.serviceListener)
                        this.serviceListener();
                }
            })
        }
        else {
            self.chatMessages.push(chatMessageImp);
            if (!!this.serviceListener)
                this.serviceListener();
        }
    }

    onLeaveRoom(data) {

    }

    onRoomJoin(data) {

    }

    onMessageRead(dataEvent) {

    }

    onGetMessagesReaders(dataEvent) {

    }

    /*
    public loadAllMessages(roomId: string) {
        var self = this;
        var chatLog = localStorage.getItem(chatId);
        //console.log('local chatLog : ' + chatLog);
        async.waterfall([
            function (cb) {
                if (!!chatLog) {
                    if (JSON.stringify(chatLog) === "") {
                        self.chatMessages = [];
                        cb(null, null);
                    }
                    else {
                        var arr_fromLog = JSON.parse(chatLog);
                        if (arr_fromLog === null || arr_fromLog instanceof Array === false) {
                            self.chatMessages = [];
                            cb(null, null);
                        }
                        else {
                            async.eachSeries(arr_fromLog, function (log, cb) {
                                var messageImp = log;
                                if (messageImp.type === ContentType[ContentType.Text]) {
                                    main.decodeService(messageImp.body, function (err, res) {
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
            server.JoinChatRoomRequest(chatId, function (err, res) {
                if (res.code == 200) {
                    access = date.toISOString();

                    allRoomAccess = myprofile.roomAccess.length;
                    for (i = 0; i < allRoomAccess; i++) {
                        if (myprofile.roomAccess[i].roomId == chatId)
                            access = myprofile.roomAccess[i].accessTime;
                    }

                    //now = date.toISOString();
                    //access = '2015-09-24T08:00:00.000Z';

                    chatRoomApi.getChatHistory(chatId, access, function (err, result) {
                        var histories = [];
                        if (result.code === 200) {
                            histories = result.data;
                        } else {
                            //console.warn("WTF god only know.", result.message);
                        }

                        members = main.getDataManager().orgMembers;

                        var his_length = histories.length;
                        //console.log("new chat log", histories.length);
                        if (his_length > 0) {
                            var chatMessages_length = chatMessages.length;
                            async.eachSeries(histories, function (item, cb) {
                                var chatMessageImp = JSON.parse(JSON.stringify(item));
                                if (chatMessageImp.type === ContentType[ContentType.Text]) {
                                    main.decodeService(chatMessageImp.body, function (err, res) {
                                        if (!err) {
                                            chatMessageImp.body = res;
                                            chatMessages.push(chatMessageImp);
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
                                    chatMessages.push(item);
                                    cb();
                                }
                            }, function (err) {
                                localStorage.removeItem(chatId);
                                localStorage.setItem(chatId, JSON.stringify(chatMessages));

                                location.href = '#/tab/message/' + chatId;
                            });
                        }
                        else {
                            location.href = '#/tab/message/' + chatId;
                        }
                    });
                }
            });
        });
    }

    */
}