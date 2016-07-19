// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
var BlankCordovaApp1;
(function (BlankCordovaApp1) {
    "use strict";
    var Application;
    (function (Application) {
        function initialize() {
            document.addEventListener('deviceready', onDeviceReady, false);
        }
        Application.initialize = initialize;
        function onDeviceReady() {
            // Handle the Cordova pause and resume events
            document.addEventListener('pause', onPause, false);
            document.addEventListener('resume', onResume, false);
            // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
            console.warn("onDeviceReady");
        }
        function onPause() {
            // TODO: This application has been suspended. Save application state here.
            console.warn('onPause');
        }
        function onResume() {
            // TODO: This application has been reactivated. Restore application state here.
            console.warn('onResume');
        }
    })(Application = BlankCordovaApp1.Application || (BlankCordovaApp1.Application = {}));
    window.onload = function () {
        Application.initialize();
    };
})(BlankCordovaApp1 || (BlankCordovaApp1 = {}));
class ChatLog {
    constructor(room) {
        this.id = room._id;
        this.roomName = room.name;
        this.roomType = room.type;
        this.room = room;
    }
    setNotiCount(count) {
        this.count = count;
    }
    setLastMessage(lastMessage) {
        this.lastMessage = lastMessage;
    }
    setLastMessageTime(lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }
}
class ChatRoomComponent {
    constructor(main, room_id, messageDAL) {
        this.chatMessages = [];
        this.main = main;
        this.serverImp = this.main.getServerImp();
        this.chatRoomApi = this.main.getChatRoomApi();
        this.dataManager = this.main.getDataManager();
        this.roomId = room_id;
        this.messageDAL = messageDAL;
        console.log("constructor ChatRoomComponent");
    }
    onChat(chatMessageImp) {
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
                    });
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
        let newMsg = JSON.parse(JSON.stringify(dataEvent));
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
        let myMessagesArr = JSON.parse(JSON.stringify(dataEvent.data));
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
    getPersistentMessage(rid, done) {
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
    getNewerMessageRecord(callback) {
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
                    else
                        cb(null, false);
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
    getNewerMessageFromNet(lastMessageTime, callback) {
        var self = this;
        self.chatRoomApi.getChatHistory(self.roomId, lastMessageTime, function (err, result) {
            var histories = [];
            if (result.code === 200) {
                histories = result.data;
                console.log("Newer message counts.", histories.length);
                if (histories.length > 0) {
                    var messages = JSON.parse(JSON.stringify(histories));
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
    getOlderMessageChunk(callback) {
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
                let mergedArray = [];
                if (datas.length > 0) {
                    var messages = JSON.parse(JSON.stringify(datas));
                    mergedArray = messages.concat(clientMessages);
                }
                let resultsArray = [];
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
                }, function done(err, results) {
                    resultsArray.sort(self.compareMessage);
                    self.chatMessages = resultsArray.slice(0);
                    callback(err, resultsArray);
                    self.messageDAL.saveData(self.roomId, self.chatMessages);
                });
            });
        });
    }
    checkOlderMessages(callback) {
        let self = this;
        self.getTopEdgeMessageTime(function done(err, res) {
            self.chatRoomApi.checkOlderMessagesCount(self.roomId, res, function response(err, res) {
                callback(err, res);
            });
        });
    }
    getTopEdgeMessageTime(callback) {
        let self = this;
        let topEdgeMessageTime = null;
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
    compareMessage(a, b) {
        if (a.createTime > b.createTime) {
            return 1;
        }
        if (a.createTime < b.createTime) {
            return -1;
        }
        // a must be equal to b
        return 0;
    }
    getMessage(chatId, Chats, callback) {
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
                    var arr_fromLog = JSON.parse(chatLog);
                    if (arr_fromLog === null || arr_fromLog instanceof Array === false) {
                        self.chatMessages = [];
                        resolve();
                    }
                    else {
                        console.log("Decode local chat history for displaying:", arr_fromLog.length);
                        // let count = 0;
                        arr_fromLog.map((log, i, a) => {
                            var messageImp = log;
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
                            }
                            else {
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
    updateReadMessages() {
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
                    message.readers = new Array();
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
        });
    }
    updateWhoReadMyMessages() {
        let self = this;
        self.getTopEdgeMessageTime((err, res) => {
            self.chatRoomApi.getMessagesReaders(res);
        });
    }
    leaveRoom(room_id, callback) {
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
    joinRoom(callback) {
        var self = this;
        self.serverImp.JoinChatRoomRequest(self.roomId, callback);
    }
    getMemberProfile(member, callback) {
        this.serverImp.getMemberProfile(member.id, callback);
    }
}
class ChatsLogComponent {
    constructor(main, server, _convertDateService) {
        this.chatListeners = new Array();
        this.chatslog = {};
        this.main = main;
        this.server = server;
        this._isReady = false;
        this.convertDateService = _convertDateService;
        console.log("ChatsLogComponent : constructor");
    }
    addOnChatListener(listener) {
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
        let roomAccess = JSON.parse(JSON.stringify(dataEvent.roomAccess));
        console.debug("ChatsLogComponent.onAccessRoom", roomAccess.length);
        async.map(roomAccess, function iterator(item, resultCallback) {
            self.main.roomDAL.getData(item.roomId, (err, roomInfo) => {
                if (!err) {
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
    onUpdatedLastAccessTime(dataEvent) {
        console.warn("ChatsLogComponent.onUpdatedLastAccessTime", JSON.stringify(dataEvent));
        if (!!this.updatedLastAccessTimeEvent) {
            this.updatedLastAccessTimeEvent(dataEvent);
        }
    }
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
    getChatsLog() {
        return this.chatslog;
    }
    getUnreadMessages(roomAccess, callback) {
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
                            let unread = JSON.parse(JSON.stringify(res.data));
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
    getUnreadMessage(roomAccess, callback) {
        this.server.getUnreadMsgOfRoom(roomAccess.roomId, roomAccess.accessTime.toString(), function res(err, res) {
            console.warn("getUnreadMsgOfRoom: ", JSON.stringify(res));
            if (err || res === null) {
                callback(err, null);
            }
            else {
                if (res.code === HttpStatusCode.success) {
                    let unread = JSON.parse(JSON.stringify(res.data));
                    unread.rid = roomAccess.roomId;
                    callback(null, unread);
                }
            }
        });
    }
    getRoomsInfo(unreadMessageMap) {
        let self = this;
        let dataManager = this.main.getDataManager();
        async.map(unreadMessageMap, function iterator(item, resultCB) {
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
                        let roomInfo = JSON.parse(JSON.stringify(res.data));
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
    organizeChatLogMap(unread, roomInfo, done) {
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
                            }
                            else {
                                console.warn(err, res);
                            }
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
    setLogProp(log, displayMessage, callback) {
        log.setLastMessage(displayMessage);
        callback(log);
    }
    addChatLog(chatLog, done) {
        chatLog.time = this.convertDateService.getTimeChatlog(chatLog.lastMessageTime);
        chatLog.timeMsg = new Date(chatLog.lastMessageTime);
        this.chatslog[chatLog.id] = chatLog;
        done();
    }
}
class DataListener {
    constructor(dataManager) {
        this.notifyNewMessageEvents = new Array();
        this.chatListenerImps = new Array();
        this.roomAccessListenerImps = new Array();
        this.dataManager = dataManager;
    }
    addNoticeNewMessageEvent(listener) {
        if (this.notifyNewMessageEvents.length === 0) {
            this.notifyNewMessageEvents.push(listener);
        }
    }
    removeNoticeNewMessageEvent(listener) {
        var id = this.notifyNewMessageEvents.indexOf(listener);
        this.notifyNewMessageEvents.splice(id, 1);
    }
    addChatListenerImp(listener) {
        this.chatListenerImps.push(listener);
    }
    removeChatListenerImp(listener) {
        var id = this.chatListenerImps.indexOf(listener);
        this.chatListenerImps.splice(id, 1);
    }
    addRoomAccessListenerImp(listener) {
        this.roomAccessListenerImps.push(listener);
    }
    removeRoomAccessListener(listener) {
        var id = this.roomAccessListenerImps.indexOf(listener);
        this.roomAccessListenerImps.splice(id, 1);
    }
    onAccessRoom(dataEvent) {
        console.info('onRoomAccess: ', dataEvent);
        this.dataManager.setRoomAccessForUser(dataEvent);
        if (!!this.roomAccessListenerImps) {
            this.roomAccessListenerImps.map(value => {
                value.onAccessRoom(dataEvent);
            });
        }
    }
    onUpdatedLastAccessTime(dataEvent) {
        this.dataManager.updateRoomAccessForUser(dataEvent);
        if (!!this.roomAccessListenerImps) {
            this.roomAccessListenerImps.map(value => {
                value.onUpdatedLastAccessTime(dataEvent);
            });
        }
    }
    onAddRoomAccess(dataEvent) {
        var data = JSON.parse(JSON.stringify(dataEvent));
        var roomAccess = data.roomAccess;
        if (roomAccess !== null && roomAccess.length !== 0) {
            this.dataManager.setRoomAccessForUser(dataEvent);
        }
        if (!!this.roomAccessListenerImps) {
            this.roomAccessListenerImps.map(value => {
                value.onAddRoomAccess(dataEvent);
            });
        }
    }
    onCreateGroupSuccess(dataEvent) {
        var group = JSON.parse(JSON.stringify(dataEvent));
        this.dataManager.addGroup(group);
    }
    onEditedGroupMember(dataEvent) {
        var jsonObj = JSON.parse(JSON.stringify(dataEvent));
        this.dataManager.updateGroupMembers(jsonObj);
        if (!!this.roomAccessListenerImps) {
            this.roomAccessListenerImps.map(value => {
                value.onEditedGroupMember(dataEvent);
            });
        }
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
        if (!!this.roomAccessListenerImps) {
            this.roomAccessListenerImps.map(value => {
                value.onUpdateMemberInfoInProjectBase(dataEvent);
            });
        }
    }
    //#region User.
    onUserLogin(dataEvent) {
        this.dataManager.onUserLogin(dataEvent);
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
    //#endregion
    /*******************************************************************************/
    //<!-- chat room data listener.
    onChat(data) {
        let chatMessageImp = JSON.parse(JSON.stringify(data));
        if (!!this.notifyNewMessageEvents && this.notifyNewMessageEvents.length !== 0) {
            this.notifyNewMessageEvents.map((v, id, arr) => {
                v(chatMessageImp);
            });
        }
        if (!!this.chatListenerImps && this.chatListenerImps.length !== 0) {
            this.chatListenerImps.forEach((value, id, arr) => {
                value.onChat(chatMessageImp);
            });
        }
        if (!!this.roomAccessListenerImps && this.roomAccessListenerImps.length !== 0) {
            this.roomAccessListenerImps.map(v => {
                v.onChat(chatMessageImp);
            });
        }
    }
    ;
    onLeaveRoom(data) {
        if (!!this.chatListenerImps && this.chatListenerImps.length !== 0) {
            this.chatListenerImps.forEach(value => {
                value.onLeaveRoom(data);
            });
        }
    }
    ;
    onRoomJoin(data) {
    }
    ;
    onMessageRead(dataEvent) {
        if (!!this.chatListenerImps && this.chatListenerImps.length !== 0) {
            this.chatListenerImps.forEach(value => {
                value.onMessageRead(dataEvent);
            });
        }
    }
    ;
    onGetMessagesReaders(dataEvent) {
        if (!!this.chatListenerImps && this.chatListenerImps.length !== 0) {
            this.chatListenerImps.forEach(value => {
                value.onGetMessagesReaders(dataEvent);
            });
        }
    }
    ;
}
class DataManager {
    constructor() {
        this.orgGroups = {};
        this.projectBaseGroups = {};
        this.privateGroups = {};
        this.privateChats = {};
        this.orgMembers = {};
        this.isOrgMembersReady = false;
    }
    //@ Profile...
    setMyProfile(data) {
        this.myProfile = JSON.parse(JSON.stringify(data));
        if (!!this.onMyProfileReady)
            this.onMyProfileReady(this);
    }
    getMyProfile() {
        return this.myProfile;
    }
    isMySelf(uid) {
        if (uid === this.myProfile._id) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * RoomAccess...
     */
    getRoomAccess() {
        return this.myProfile.roomAccess;
    }
    setRoomAccessForUser(data) {
        if (!!data.roomAccess) {
            this.myProfile.roomAccess = JSON.parse(JSON.stringify(data.roomAccess));
            console.info('set user roomAccess info.');
        }
    }
    updateRoomAccessForUser(data) {
        let arr = JSON.parse(JSON.stringify(data.roomAccess));
        this.myProfile.roomAccess.forEach(value => {
            if (value.roomId === arr[0].roomId) {
                value.accessTime = arr[0].accessTime;
                return;
            }
        });
    }
    getCompanyInfo() {
        return this.companyInfo;
    }
    setCompanyInfo(data) {
        this.companyInfo = JSON.parse(JSON.stringify(data));
        if (!!this.onCompanyInfoReady) {
            this.onCompanyInfoReady();
        }
    }
    //<!---------- Group ------------------------------------
    getGroup(id) {
        if (!!this.orgGroups[id]) {
            return this.orgGroups[id];
        }
        else if (!!this.projectBaseGroups[id]) {
            return this.projectBaseGroups[id];
        }
        else if (!!this.privateGroups[id]) {
            return this.privateGroups[id];
        }
        else if (!!this.privateChats && !!this.privateChats[id]) {
            return this.privateChats[id];
        }
    }
    addGroup(data) {
        switch (data.type) {
            case RoomType.organizationGroup:
                if (!this.orgGroups[data._id]) {
                    this.orgGroups[data._id] = data;
                }
                break;
            case RoomType.projectBaseGroup:
                if (!this.projectBaseGroups[data._id]) {
                    this.projectBaseGroups[data._id] = data;
                }
                break;
            case RoomType.privateGroup:
                if (!this.privateGroups[data._id]) {
                    this.privateGroups[data._id] = data;
                }
                break;
            case RoomType.privateChat:
                if (!this.privateChats) {
                    this.privateChats = {};
                }
                if (!this.privateChats[data._id]) {
                    this.privateChats[data._id] = data;
                }
                break;
            default:
                console.info("new room is not a group type.");
                break;
        }
    }
    updateGroupImage(data) {
        if (!!this.orgGroups[data._id]) {
            this.orgGroups[data._id].image = data.image;
        }
        else if (!!this.projectBaseGroups[data._id]) {
            this.projectBaseGroups[data._id].image = data.image;
        }
        else if (!!this.privateGroups[data._id]) {
            this.privateGroups[data._id].image = data.image;
        }
    }
    updateGroupName(data) {
        if (!!this.orgGroups[data._id]) {
            this.orgGroups[data._id].name = data.name;
        }
        else if (!!this.projectBaseGroups[data._id]) {
            this.projectBaseGroups[data._id].name = data.name;
        }
        else if (!!this.privateGroups[data._id]) {
            this.privateGroups[data._id].name = data.name;
        }
    }
    updateGroupMembers(data) {
        //<!-- Beware please checking myself before update group members.
        //<!-- May be your id is removed from group.
        var hasMe = this.checkMySelfInNewMembersReceived(data);
        if (data.type === RoomType.organizationGroup) {
            if (!!this.orgGroups[data._id]) {
                //<!-- This statement call when current you still a member.
                if (hasMe) {
                    this.orgGroups[data._id].members = data.members;
                }
                else {
                    console.warn("this org group is not contain me in members list.");
                }
            }
            else {
                this.orgGroups[data._id] = data;
            }
        }
        else if (data.type === RoomType.projectBaseGroup) {
            if (!!this.projectBaseGroups[data._id]) {
                if (hasMe) {
                    this.projectBaseGroups[data._id].visibility = true;
                    this.projectBaseGroups[data._id].members = data.members;
                }
                else {
                    this.projectBaseGroups[data._id].visibility = false;
                }
            }
            else {
                this.projectBaseGroups[data._id] = data;
            }
        }
        else if (data.type === RoomType.privateGroup) {
            if (!!this.privateGroups[data._id]) {
                if (hasMe) {
                    this.privateGroups[data._id].visibility = true;
                    this.privateGroups[data._id].members = data.members;
                }
                else {
                    this.privateGroups[data._id].visibility = false;
                }
            }
            else {
                console.debug("new group", data.name);
                this.privateGroups[data._id] = data;
            }
        }
        console.log('dataManager.updateGroupMembers:');
    }
    updateGroupMemberDetail(jsonObj) {
        var editMember = jsonObj.editMember;
        var roomId = jsonObj.roomId;
        var groupMember = new Member();
        groupMember.id = editMember.id;
        var role = editMember.role;
        groupMember.role = MemberRole[role];
        groupMember.jobPosition = editMember.jobPosition;
        this.getGroup(roomId).members.forEach((value, index, arr) => {
            if (value.id === groupMember.id) {
                this.getGroup(roomId).members[index].role = groupMember.role;
                this.getGroup(roomId).members[index].textRole = MemberRole[groupMember.role];
                this.getGroup(roomId).members[index].jobPosition = groupMember.jobPosition;
            }
        });
    }
    checkMySelfInNewMembersReceived(data) {
        var self = this;
        var hasMe = data.members.some(function isMySelfId(element, index, array) {
            return element.id === self.myProfile._id;
        });
        console.debug("New data has me", hasMe);
        return hasMe;
    }
    //<!------------------------------------------------------
    onUserLogin(dataEvent) {
        console.log("user logedIn", JSON.stringify(dataEvent));
        let jsonObject = JSON.parse(JSON.stringify(dataEvent));
        let _id = jsonObject._id;
        let self = this;
        if (!this.orgMembers)
            this.orgMembers = {};
        if (!this.orgMembers[_id]) {
            //@ Need to get new contact info.
            ChatServer.ServerImplemented.getInstance().getMemberProfile(_id, (err, res) => {
                console.log("getMemberProfile : ", err, JSON.stringify(res));
                let data = JSON.parse(JSON.stringify(res.data));
                let contact = new ContactInfo();
                contact._id = data._id;
                contact.displayname = data.displayname;
                contact.image = data.image;
                contact.status = data.status;
                console.warn(contact);
                self.orgMembers[contact._id] = contact;
                if (self.onContactsDataReady != null) {
                    self.onContactsDataReady();
                }
                console.log("We need to save contacts list to persistence data layer.");
            });
        }
    }
    updateContactImage(contactId, url) {
        if (!!this.orgMembers[contactId]) {
            this.orgMembers[contactId].image = url;
        }
    }
    updateContactProfile(contactId, params) {
        if (!!this.orgMembers[contactId]) {
            var jsonObj = JSON.parse(JSON.stringify(params));
            if (!!jsonObj.displayname) {
                this.orgMembers[contactId].displayname = jsonObj.displayname;
            }
            if (!!jsonObj.status) {
                this.orgMembers[contactId].status = jsonObj.status;
            }
        }
    }
    getContactProfile(contactId) {
        if (!!this.orgMembers[contactId]) {
            return this.orgMembers[contactId];
        }
        else {
            console.warn('this contactId is invalid. Maybe it not contain in list of contacts.');
        }
    }
    onGetMe(dataEvent) {
        var self = this;
        var _profile = JSON.parse(JSON.stringify(dataEvent));
        if (dataEvent.code === 200) {
            this.setMyProfile(dataEvent.data);
        }
        else {
            console.error("get use profile fail!", dataEvent.message);
        }
    }
    onGetCompanyInfo(dataEvent) {
        var self = this;
        var _company = JSON.parse(JSON.stringify(dataEvent));
        if (dataEvent.code === 200) {
            this.setCompanyInfo(dataEvent.data);
        }
        else {
            console.error("get company info fail!", dataEvent.message);
        }
    }
    onGetCompanyMemberComplete(dataEvent) {
        let self = this;
        let members = JSON.parse(JSON.stringify(dataEvent));
        if (!this.orgMembers)
            this.orgMembers = {};
        async.eachSeries(members, function iterator(item, cb) {
            if (!self.orgMembers[item._id]) {
                self.orgMembers[item._id] = item;
            }
            cb();
        }, function done(err) {
            self.isOrgMembersReady = true;
        });
        if (this.onContactsDataReady != null)
            this.onContactsDataReady();
    }
    ;
    onGetOrganizeGroupsComplete(dataEvent) {
        var rooms = JSON.parse(JSON.stringify(dataEvent));
        if (!this.orgGroups)
            this.orgGroups = {};
        rooms.forEach(value => {
            if (!this.orgGroups[value._id]) {
                this.orgGroups[value._id] = value;
            }
        });
        if (this.onOrgGroupDataReady != null) {
            this.onOrgGroupDataReady();
        }
    }
    ;
    onGetProjectBaseGroupsComplete(dataEvent) {
        var groups = JSON.parse(JSON.stringify(dataEvent));
        if (!this.projectBaseGroups)
            this.projectBaseGroups = {};
        groups.forEach(value => {
            if (!this.projectBaseGroups[value._id]) {
                this.projectBaseGroups[value._id] = value;
            }
        });
        if (this.onProjectBaseGroupsDataReady != null) {
            this.onProjectBaseGroupsDataReady();
        }
    }
    ;
    onGetPrivateGroupsComplete(dataEvent) {
        var groups = JSON.parse(JSON.stringify(dataEvent));
        if (!this.privateGroups)
            this.privateGroups = {};
        groups.forEach(value => {
            if (!this.privateGroups[value._id]) {
                this.privateGroups[value._id] = value;
            }
        });
        if (this.onPrivateGroupsDataReady != null) {
            this.onPrivateGroupsDataReady();
        }
    }
    ;
}
class Main {
    static getInstance() {
        if (this.instance === null || this.instance === undefined) {
            this.instance = Main.prototype;
        }
        return this.instance;
    }
    getMessageDAL() {
        return this.messageReducer;
    }
    setMessageReducer(store) {
        this.messageReducer = store;
    }
    setAuthReducer(store) {
        this.authenReducer = store;
    }
    setRoomDAL(dal) {
        this.roomDAL = dal;
    }
    clearRoomDAL() {
        this.roomDAL.clearData(err => {
            console.error(err);
        });
    }
    clearMessageReducer() {
        this.messageReducer.clearData((err) => {
            console.error(err);
        });
    }
    clearAuthReducer() {
        this.authenReducer.clearData((err) => {
            console.error(err);
        });
    }
    clearAllData() {
        return new Promise((resolve, reject) => {
            localStorage.clear();
            this.clearAuthReducer();
            this.clearRoomDAL();
            this.clearMessageReducer();
            resolve();
        });
    }
    getDataManager() {
        return this.dataManager;
    }
    setDataManager(data) {
        this.dataManager = data;
        this.dataListener = new DataListener(this.dataManager);
    }
    getDataListener() {
        return this.dataListener;
    }
    getServerImp() {
        //console.log("getServerImp", this.serverImp);
        return this.serverImp;
    }
    setServerImp(server) {
        this.serverImp = server;
        //console.log("setServerImp", server);
    }
    getChatRoomApi() {
        if (!this.chatRoomApi) {
            this.chatRoomApi = ChatServer.ChatRoomApiProvider.prototype;
        }
        return this.chatRoomApi;
    }
    setServerListener(server) {
        this.serverListener = server;
    }
    startChatServerListener(resolve, rejected) {
        this.serverListener.addFrontendListener(this.dataManager);
        this.serverListener.addServerListener(this.dataListener);
        this.serverListener.addChatListener(this.dataListener);
        this.serverListener.addListenner(resolve, rejected);
    }
    getHashService(content, callback) {
        var hashService = new SecureService();
        hashService.hashCompute(content, callback);
    }
    encodeService(content, callback) {
        var crypto = new SecureService();
        crypto.encryptWithSecureRandom(content, callback);
    }
    decodeService(content, callback) {
        var crypto = new SecureService();
        crypto.decryptWithSecureRandom(content, callback);
    }
    authenUser(server, email, password, deviceToken, callback) {
        console.log("authenUser:", email);
        let self = this;
        server.logIn(email, password, deviceToken, function (err, loginRes) {
            callback(err, loginRes);
            if (!err && loginRes !== null && loginRes.code === HttpStatusCode.success) {
                //<!-- Listen all event in the spartan world.
                self.authenReducer.saveData({ uid: loginRes.uid, sessionToken: loginRes.token });
                server.authenData.userId = loginRes.uid;
                server.authenData.token = loginRes.token;
                new Promise(function callback(resolve, rejected) {
                    self.startChatServerListener(resolve, rejected);
                }).then(function onFulfilled(value) {
                    server.getMe(function (err, res) {
                        if (err || res === null) {
                            console.error(err);
                        }
                        else {
                            self.dataManager.onMyProfileReady = self.onMyProfileReadyListener;
                            if (res.code === HttpStatusCode.success) {
                            }
                            else {
                                console.warn("My user profile is empty. please check.");
                            }
                        }
                    });
                    server.getCompanyInfo(function (err, res) {
                        if (err || res === null) {
                            console.error(err);
                        }
                        else {
                            console.log("get companyInfo: ", JSON.stringify(res.code));
                        }
                    });
                    server.getOrganizationGroups(function (err, res) {
                        if (err || res === null) {
                            console.error(err);
                        }
                        else {
                            console.log("organize groups: ", JSON.stringify(res));
                        }
                    });
                    server.getProjectBaseGroups(function (err, res) {
                        if (err || res === null) {
                            console.error(err);
                        }
                        else {
                            console.log("project base groups: ", JSON.stringify(res));
                        }
                    });
                    server.getPrivateGroups(function (err, res) {
                        if (err || res === null) {
                            console.error(err);
                        }
                        else {
                            console.log("Private groups: ", JSON.stringify(res));
                        }
                    });
                    server.getCompanyMembers(function (err, res) {
                        if (err || res === null) {
                            console.error(err);
                        }
                        else {
                            console.log("Company Members: ", JSON.stringify(res));
                        }
                    });
                }).catch(function onRejected(err) {
                    console.error(err);
                });
            }
            else {
                console.warn(err, JSON.stringify(loginRes));
            }
        });
    }
}
class NotifyManager {
    constructor(main) {
        console.log("NotifyManager.constructor");
        this.dataManager = main.getDataManager();
        this.serverImp = main.getServerImp();
    }
    notify(chatMessageImp, appBackground, notifyService) {
        let self = this;
        var contactName, contactId;
        if (this.dataManager.getGroup(chatMessageImp.rid) === undefined) {
            contactName = this.dataManager.getContactProfile(chatMessageImp.sender).displayname;
            contactId = this.dataManager.getContactProfile(chatMessageImp.sender)._id;
        }
        else {
            contactName = this.dataManager.getGroup(chatMessageImp.rid).name;
            contactId = this.dataManager.getGroup(chatMessageImp.rid)._id;
        }
        if (chatMessageImp.type.toString() === ContentType[ContentType.Text]) {
            var secure = new SecureService();
            if (self.serverImp.appConfig.encryption == true) {
                secure.decryptWithSecureRandom(chatMessageImp.body, function done(err, res) {
                    if (!err) {
                        chatMessageImp.body = res;
                    }
                    else {
                        console.warn(err, res);
                    }
                    var toastMessage = contactName + " sent " + chatMessageImp.body;
                    if (!appBackground) {
                        notifyService.makeToastOnCenter(contactId, toastMessage);
                    }
                    else {
                        notifyService.scheduleSingleNotification(contactId, contactName, chatMessageImp.body);
                    }
                });
            }
            else {
                var toastMessage = contactName + " sent " + chatMessageImp.body;
                if (!appBackground) {
                    notifyService.makeToastOnCenter(contactId, toastMessage);
                }
                else {
                    notifyService.scheduleSingleNotification(contactId, contactName, chatMessageImp.body);
                }
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Sticker]) {
            var message = contactName + " sent a sticker.";
            if (!appBackground) {
                notifyService.makeToastOnCenter(contactId, message);
            }
            else {
                notifyService.scheduleSingleNotification(contactId, contactName, message);
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Voice]) {
            var message = contactName + " sent a voice message.";
            if (!appBackground) {
                notifyService.makeToastOnCenter(contactId, message);
            }
            else {
                notifyService.scheduleSingleNotification(contactId, contactName, message);
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Image]) {
            var message = contactName + " sent a image.";
            if (!appBackground) {
                notifyService.makeToastOnCenter(contactId, message);
            }
            else {
                notifyService.scheduleSingleNotification(contactId, contactName, message);
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Video]) {
            var message = contactName + " sent a video.";
            if (!appBackground) {
                notifyService.makeToastOnCenter(contactId, message);
            }
            else {
                notifyService.scheduleSingleNotification(contactId, contactName, message);
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Location]) {
            var message = contactName + " sent a location.";
            if (!appBackground) {
                notifyService.makeToastOnCenter(contactId, message);
            }
            else {
                notifyService.scheduleSingleNotification(contactId, contactName, message);
            }
        }
    }
}
var CallState;
(function (CallState) {
    CallState[CallState["idle"] = 0] = "idle";
    CallState[CallState["signalingCall"] = 1] = "signalingCall";
    CallState[CallState["calling"] = 2] = "calling";
})(CallState || (CallState = {}));
;
class WebRtcCallState {
}
class WebRtcComponent {
    constructor() {
        console.log("starting.. webRtcComponent.");
        this.webRtcCallState = new WebRtcCallState();
    }
    setCallState(state) {
        this.webRtcCallState.callState = state;
    }
    onVideoCall(dataEvent) {
        let body = dataEvent.body;
        let contactId = body.from;
        let peerId = body.peerId;
        if (this.webRtcCallState.callState === CallState.idle) {
            if (this.videoCallEvent != null) {
                this.videoCallEvent(contactId, peerId);
            }
        }
        else {
            console.warn("Call status is not idle. " + this.webRtcCallState.callState.toString());
            if (this.lineBusyEvent != null) {
                this.lineBusyEvent(contactId);
            }
        }
    }
    onVoiceCall(dataEvent) {
        let body = dataEvent.body;
        let contactId = body.from;
        let peerId = body.peerId;
        if (this.webRtcCallState.callState === CallState.idle) {
            if (this.voiceCallEvent != null) {
                this.voiceCallEvent(contactId, peerId);
            }
        }
        else {
            console.warn("Call status is not idle. " + this.webRtcCallState.callState.toString());
            if (this.lineBusyEvent != null) {
                this.lineBusyEvent(contactId);
            }
        }
    }
    onHangupCall(dataEvent) {
        if (this.hangUpCallEvent != null) {
            this.hangUpCallEvent();
        }
    }
    onTheLineIsBusy(dataEvent) {
        if (this.contactLineBusyEvent != null) {
            this.contactLineBusyEvent();
        }
    }
}
class AuthenReducer {
    constructor(_store) {
        this.key = "session_token";
        this.store = _store;
    }
    getData(done) {
        this.store.getItem(this.key).then(function (value) {
            let docs = JSON.parse(JSON.stringify(value));
            console.log("get session_token success", value);
            done(null, docs);
        }).catch(function rejected(err) {
            console.warn(err);
            done(err, null);
        });
    }
    saveData(authInfo, callback) {
        let self = this;
        this.store.setItem(self.key, authInfo).then(function (value) {
            console.log("save persistent success");
            if (callback != null) {
                callback(null, value);
            }
        }).catch(function rejected(err) {
            console.warn(err);
            self.removeData(self.key);
            if (callback != null) {
                callback(err, null);
            }
        });
    }
    removeData(rid, callback) {
        this.store.removeItem(rid).then(() => {
            console.info('room_id %s is removed: ', rid);
            if (callback) {
                callback(null, null);
            }
        }).catch((err) => {
            console.warn(err);
        });
    }
    clearData(next) {
        this.store.clear((err) => {
            if (err != null) {
                console.warn("Clear database fail", err);
            }
            next(err);
        });
    }
}
class MessageDAL {
    constructor(_store) {
        this.store = _store;
    }
    getData(rid, done) {
        this.store.getItem(rid).then(function (value) {
            let docs = JSON.parse(JSON.stringify(value));
            console.log("get persistent success");
            done(null, docs);
        }).catch(function rejected(err) {
            console.warn(err);
        });
    }
    saveData(rid, chatRecord, callback) {
        let self = this;
        this.store.setItem(rid, chatRecord).then(function (value) {
            console.log("save persistent success");
            if (callback != null) {
                callback(null, value);
            }
        }).catch(function rejected(err) {
            console.warn(err);
            self.removeData(rid);
            if (callback != null) {
                callback(err, null);
            }
        });
    }
    removeData(rid, callback) {
        this.store.removeItem(rid).then(() => {
            console.info('room_id %s is removed: ', rid);
            if (callback) {
                callback(null, null);
            }
        }).catch((err) => {
            console.warn(err);
        });
    }
    clearData(next) {
        console.warn('MessageDAL.clearData');
        this.store.clear((err) => {
            if (err != null) {
                console.warn("Clear database fail", err);
            }
            console.warn("message db now empty.");
            next(err);
        });
    }
}
class RoomDAL {
    constructor(_store) {
        this.store = _store;
    }
    getData(room_id, done) {
        this.store.getItem(room_id).then(function (value) {
            let docs = JSON.parse(JSON.stringify(value));
            done(null, docs);
        }).catch(function (err) {
            console.warn(err);
            done(err, null);
        });
    }
    saveData(room_id, roomInfo, callback) {
        let self = this;
        this.store.setItem(room_id, roomInfo)
            .then(function (value) {
            if (callback != null) {
                callback(null, value);
            }
        }).catch(function rejected(err) {
            console.warn(err);
            self.removeData(room_id);
            if (callback != null) {
                callback(err, null);
            }
        });
    }
    removeData(room_id, callback) {
        this.store.removeItem(room_id)
            .then(() => {
            if (callback) {
                callback(null, null);
            }
        }).catch((err) => {
            console.warn(err);
        });
    }
    clearData(next) {
        this.store.clear((err) => {
            if (err != null) {
                console.warn("Clear database fail", err);
            }
            next(err);
        });
    }
}
class MessageMeta {
}
class Message {
}
class CompanyInfo {
}
class ContactInfo {
}
/**
 * Created by nattapon on 7/17/15 AD.
 */
var ContentType;
(function (ContentType) {
    ContentType[ContentType["Unload"] = 0] = "Unload";
    ContentType[ContentType["File"] = 1] = "File";
    ContentType[ContentType["Text"] = 2] = "Text";
    ContentType[ContentType["Voice"] = 3] = "Voice";
    ContentType[ContentType["Image"] = 4] = "Image";
    ContentType[ContentType["Video"] = 5] = "Video";
    ContentType[ContentType["Sticker"] = 6] = "Sticker";
    ContentType[ContentType["Location"] = 7] = "Location";
})(ContentType || (ContentType = {}));
//<!--- Referrence by http://management.about.com/od/people/a/EEgradelevels.htm
var JobLevel;
(function (JobLevel) {
    JobLevel[JobLevel["employees"] = 0] = "employees";
    JobLevel[JobLevel["junior"] = 1] = "junior";
    JobLevel[JobLevel["senior"] = 2] = "senior";
    JobLevel[JobLevel["directors"] = 3] = "directors";
    JobLevel[JobLevel["vice_president"] = 4] = "vice_president"; //Vice President,
})(JobLevel || (JobLevel = {}));
class Member {
    constructor() {
        this.role = MemberRole.member;
    }
}
var MemberRole;
(function (MemberRole) {
    MemberRole[MemberRole["member"] = 0] = "member";
    MemberRole[MemberRole["admin"] = 1] = "admin";
})(MemberRole || (MemberRole = {}));
class MinLocation {
}
var RoomType;
(function (RoomType) {
    RoomType[RoomType["organizationGroup"] = 0] = "organizationGroup";
    RoomType[RoomType["projectBaseGroup"] = 1] = "projectBaseGroup";
    RoomType[RoomType["privateGroup"] = 2] = "privateGroup";
    RoomType[RoomType["privateChat"] = 3] = "privateChat";
})(RoomType || (RoomType = {}));
;
var RoomStatus;
(function (RoomStatus) {
    RoomStatus[RoomStatus["active"] = 0] = "active";
    RoomStatus[RoomStatus["disable"] = 1] = "disable";
    RoomStatus[RoomStatus["delete"] = 2] = "delete";
})(RoomStatus || (RoomStatus = {}));
;
class Room {
    constructor() {
        this._visibility = true;
    }
    set visibility(_boo) {
        this._visibility = _boo;
    }
    get visibilty() {
        return this._visibility;
    }
    setName(name) {
        this.name = name;
    }
}
class RoomAccessData {
}
;
class TokenDecode {
}
class User {
}
var UserRole;
(function (UserRole) {
    UserRole[UserRole["personnel"] = 0] = "personnel";
    UserRole[UserRole["section_chief"] = 1] = "section_chief";
    UserRole[UserRole["department_chief"] = 2] = "department_chief";
    UserRole[UserRole["division_chief"] = 3] = "division_chief";
    UserRole[UserRole["admin"] = 4] = "admin";
})(UserRole || (UserRole = {}));
;
var CryptoJS; //= require("../lib/crypto-js/index");
class SecureService {
    constructor() {
        this.key = "CHITCHAT!@#$%^&*()_+|===";
        this.passiv = "ThisIsUrPassword";
    }
    hashCompute(content, callback) {
        let hash = CryptoJS.MD5(content);
        let md = hash.toString(CryptoJS.enc.Hex);
        callback(null, md);
        // require(["../lib/crypto-js/crypto-js"], function (CryptoJS) {
        //     var hash = CryptoJS.MD5(content);
        //     var md = hash.toString(CryptoJS.enc.Hex);
        //     callback(null, md);
        // });
    }
    encryption(content, callback) {
        let self = this;
        let ciphertext = CryptoJS.AES.encrypt(content, self.key);
        callback(null, ciphertext.toString());
        // require([], function (CryptoJS) {
        //     var ciphertext = CryptoJS.AES.encrypt(content, self.key);
        //     callback(null, ciphertext.toString());
        // });
    }
    decryption(content, callback) {
        let self = this;
        let bytes = CryptoJS.AES.decrypt(content, self.key);
        let plaintext = bytes.toString(CryptoJS.enc.Utf8);
        callback(null, plaintext);
        /*
                require(["../lib/crypto-js/crypto-js"], function (CryptoJS) {
                    //   var words = CryptoJS.enc.Base64.parse(content);
                    var bytes = CryptoJS.AES.decrypt(content, self.key);
                    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
                    callback(null, plaintext);
                });
                */
    }
    encryptWithSecureRandom(content, callback) {
        let self = this;
        let key = CryptoJS.enc.Utf8.parse(self.key);
        let iv = CryptoJS.enc.Utf8.parse(self.passiv);
        let ciphertext = CryptoJS.AES.encrypt(content, key, { iv: iv });
        callback(null, ciphertext.toString());
        /*
        require(["../lib/crypto-js/crypto-js"], function (CryptoJS) {
            var key = CryptoJS.enc.Utf8.parse(self.key);
            var iv = CryptoJS.enc.Utf8.parse(self.passiv);
            var ciphertext = CryptoJS.AES.encrypt(content, key, { iv: iv });

            callback(null, ciphertext.toString());
        });
        */
    }
    decryptWithSecureRandom(content, callback) {
        let self = this;
        let key = CryptoJS.enc.Utf8.parse(self.key);
        let iv = CryptoJS.enc.Utf8.parse(self.passiv);
        let bytes = CryptoJS.AES.decrypt(content, key, { iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC });
        let plaintext;
        try {
            plaintext = bytes.toString(CryptoJS.enc.Utf8);
        }
        catch (e) {
            console.warn(e);
        }
        if (!!plaintext)
            callback(null, plaintext);
        else
            callback(new Error("cannot decrypt content"), content);
        /*
        require(["../lib/crypto-js/crypto-js"], function (CryptoJS) {
            var key = CryptoJS.enc.Utf8.parse(self.key);
            var iv = CryptoJS.enc.Utf8.parse(self.passiv);
            var bytes = CryptoJS.AES.decrypt(content, key, { iv: iv, padding: CryptoJS.pad.Pkcs7, mode: CryptoJS.mode.CBC });
            var plaintext;
            try {
                plaintext = bytes.toString(CryptoJS.enc.Utf8);
            }
            catch (e) {
                console.warn(e);
            }

            if (!!plaintext)
                callback(null, plaintext);
            else
                callback(new Error("cannot decrypt content"), content);
        });
        */
    }
}
class Dummy {
    constructor() {
        this.chatRoom = ChatServer.ChatRoomApiProvider.prototype;
        this.bots = [{ name: "test1@rfl.com", pass: "1234" }, { name: "test2@rfl.com", pass: "1234" },
            { name: "test3@rfl.com", pass: "1234" }, { name: "test4@rfl.com", pass: "1234" }, { name: "test5@rfl.com", pass: "1234" },
            { name: "test6@rfl.com", pass: "1234" }, { name: "test7@rfl.com", pass: "1234" }];
        this.serverApi = ChatServer.ServerImplemented.getInstance();
    }
    getBot() {
        var r = Math.floor((Math.random() * this.bots.length) + 1);
        return this.bots[r];
    }
    fireChatInRoom(myUid) {
        this.serverApi.JoinChatRoomRequest("55d5bb67451bbf090b0e8cde", (err, res) => {
            if (!err && res !== null) {
                setInterval(() => {
                    this.chatRoom.chat("55d5bb67451bbf090b0e8cde", "bot", myUid, "test for bot", ContentType[ContentType.Text], function (err, res) {
                        console.log(res);
                    });
                }, 1000);
            }
        });
    }
}
/*
{
    "_id" : ObjectId("55d5bb67451bbf090b0e8cde"),
    "name" : "SkylineDeveloper",
    "type" : 2,
    "members" : [
        {
            "id" : "55d1929fd20212707c46c688"
        }
    ],
    "createTime" : ISODate("2015-08-20T11:35:03.066Z"),
    "image" : "/uploads/groups/images/4b8560d8b445d3c48a0b076b1b4c8139.jpg"
}
*/ 
/**
 * ngControllerUtil
 */
class ngControllerUtil {
    constructor(parameters) {
    }
}
ngControllerUtil.viewProfileController = "viewProfileController";
ngControllerUtil.groupDetailCtrl = "groupDetailCtrl";
ngControllerUtil.editMemberGroup = 'editMemberGroup';
class NGStateUtil {
}
NGStateUtil.tab_login = 'tab.login';
NGStateUtil.tab_login_error = 'tab.login-error';
NGStateUtil.tab_group = 'tab.group';
NGStateUtil.tab_group_viewprofile = 'tab.group-viewprofile';
NGStateUtil.tab_group_members = 'tab.group-members';
NGStateUtil.tab_group_members_invite = 'tab.group-members-invite';
NGStateUtil.tab_group_members_edit = 'tab.group-members-edit';
NGStateUtil.tab_group_chat = 'tab.group-chat';
NGStateUtil.tab_group_freecall = 'tab.group-freecall';
NGStateUtil.tab_chats = 'tab.chats';
NGStateUtil.tab_chats_chat = 'tab.chats-chat';
NGStateUtil.tab_chats_chat_viewprofile = 'tab.chats-chat-viewprofile';
NGStateUtil.tab_chats_chat_members = 'tab.chats-chat-members';
NGStateUtil.tab_chats_chat_members_invite = 'tab.chats-chat-members-invite';
var config;
var pomelo;
var username = "";
var password = "";
var ChatServer;
(function (ChatServer) {
    class AuthenData {
    }
    class ServerImplemented {
        constructor() {
            this._isConnected = false;
            this._isLogedin = false;
            console.warn("serv imp. constructor");
        }
        static getInstance() {
            if (this.Instance === null || this.Instance === undefined) {
                this.Instance = new ServerImplemented();
            }
            return this.Instance;
        }
        setSocketComponent(socket) {
            this.socketComponent = socket;
        }
        getClient() {
            var self = this;
            if (pomelo !== null) {
                return pomelo;
            }
            else {
                console.warn("disconnect Event");
            }
        }
        dispose() {
            console.warn("dispose socket client.");
            this.disConnect();
            this.authenData = null;
        }
        disConnect() {
            console.log('disconnecting...');
            if (!!pomelo) {
                pomelo.removeAllListeners();
                pomelo.disconnect();
                pomelo = null;
            }
        }
        logout(registrationId) {
            let msg = {};
            msg["username"] = username;
            msg["registrationId"] = registrationId;
            if (pomelo != null)
                pomelo.notify("connector.entryHandler.logout", msg);
            this.disConnect();
        }
        init(callback) {
            console.log('serverImp.init()');
            var self = this;
            this._isConnected = false;
            this.authenData = new AuthenData();
            let pro = new Promise(function (resolve, rejected) {
                self.loadSocket(resolve, rejected);
            }).then(function onfulfilled(value) {
                self.loadConfig(callback);
            }).catch(function onRejected(err) {
                console.error(err);
            });
        }
        loadSocket(resolve, rejected) {
            require(["../js/pomelo-web/pomelo"], (value) => {
                pomelo = value;
                resolve(pomelo);
            });
        }
        loadConfig(callback) {
            this.appConfig = JSON.parse(config);
            this.host = this.appConfig.socketHost;
            this.port = this.appConfig.socketPort;
            if (!!pomelo) {
                //<!-- Connecting gate server.
                this.connectServer(this.host, this.port, (err) => {
                    callback(err, this);
                });
            }
            else {
                console.error("pomelo socket is un ready.");
            }
        }
        connectServer(_host, _port, callback) {
            console.log("socket connecting to: ", _host, _port);
            // var self = this;    
            pomelo.init({ host: _host, port: _port }, function cb(err) {
                console.log("socket init result: " + err);
                callback(err);
            });
        }
        connectToConnectorServer(callback) {
        }
        // region <!-- Authentication...
        /// <summary>
        /// Connect to gate server then get query of connector server.
        /// </summary>
        logIn(_username, _hash, registrationId, callback) {
            var self = this;
            username = _username;
            password = _hash;
            if (pomelo !== null && this._isConnected === false) {
                let msg = { uid: username };
                //<!-- Quering connector server.
                pomelo.request("gate.gateHandler.queryEntry", msg, function (result) {
                    console.log("QueryConnectorServ", result.code);
                    if (result.code === HttpStatusCode.success) {
                        self.disConnect();
                        let promiseLoadSocket = new Promise((resolve, reject) => {
                            self.loadSocket(resolve, reject);
                        });
                        promiseLoadSocket.then((value) => {
                            var connectorPort = result.port;
                            //<!-- Connecting to connector server.
                            self.connectServer(self.host, connectorPort, (err) => {
                                self._isConnected = true;
                                if (!!err) {
                                    callback(err, null);
                                }
                                else {
                                    self.authenForFrontendServer(registrationId, callback);
                                }
                            });
                        }).catch((error) => {
                            console.error('Load socket fail!');
                        });
                    }
                });
            }
            else if (pomelo !== null && this._isConnected) {
                self.authenForFrontendServer(registrationId, callback);
            }
        }
        //<!-- Authentication. request for token sign.
        authenForFrontendServer(registrationId, callback) {
            let self = this;
            let msg = { username: username, password: password, registrationId: registrationId };
            //<!-- Authentication.
            pomelo.request("connector.entryHandler.login", msg, (res) => {
                console.log("login response: ", JSON.stringify(res));
                if (res.code === HttpStatusCode.fail) {
                    if (callback != null) {
                        callback(res.message, res);
                    }
                }
                else if (res.code === HttpStatusCode.success) {
                    if (callback != null) {
                        callback(null, res);
                    }
                    pomelo.on('disconnect', function data(reason) {
                        self._isConnected = false;
                        if (self.socketComponent !== null)
                            self.socketComponent.disconnected(reason);
                    });
                }
                else {
                    if (callback !== null) {
                        callback(null, res);
                    }
                }
            });
        }
        TokenAuthen(tokenBearer, checkTokenCallback) {
            let msg = {};
            msg["token"] = tokenBearer;
            pomelo.request("gate.gateHandler.authenGateway", msg, (result) => {
                this.OnTokenAuthenticate(result, checkTokenCallback);
            });
        }
        OnTokenAuthenticate(tokenRes, onSuccessCheckToken) {
            if (tokenRes.code === 200) {
                var data = tokenRes.data;
                var decode = data.decoded; //["decoded"];
                var decodedModel = JSON.parse(JSON.stringify(decode));
                if (onSuccessCheckToken != null)
                    onSuccessCheckToken(null, { success: true, username: decodedModel.username, password: decodedModel.password });
            }
            else {
                if (onSuccessCheckToken != null) {
                    onSuccessCheckToken(tokenRes.message, null);
                }
            }
        }
        kickMeAllSession(uid) {
            if (pomelo !== null) {
                var msg = { uid: uid };
                pomelo.request("connector.entryHandler.kickMe", msg, function (result) {
                    console.log("kickMe", JSON.stringify(result));
                });
            }
            else {
                console.error("Cannot kick session.");
            }
        }
        //<@--- ServerAPIProvider.
        //region <!-- user profile -->
        UpdateUserProfile(myId, profileFields, callback) {
            profileFields["token"] = this.authenData.token;
            profileFields["_id"] = myId;
            pomelo.request("auth.profileHandler.profileUpdate", profileFields, (result) => {
                if (callback != null) {
                    callback(null, result);
                }
            });
        }
        ProfileImageChanged(userId, path, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["userId"] = userId;
            msg["path"] = path;
            pomelo.request("auth.profileHandler.profileImageChanged", msg, (result) => {
                if (callback != null) {
                    callback(null, result);
                }
            });
        }
        getLastAccessRoomsInfo(sessionToken = "", callback) {
            var msg = {};
            msg["token"] = sessionToken;
            //<!-- Get user info.
            pomelo.request("connector.entryHandler.getLastAccessRooms", msg, (result) => {
                if (callback !== null) {
                    callback(null, result);
                }
            });
        }
        getMe(callback) {
            let msg = {};
            msg["username"] = username;
            msg["password"] = password;
            msg["token"] = this.authenData.token;
            //<!-- Get user info.
            pomelo.request("connector.entryHandler.getMe", msg, (result) => {
                console.log("getMe: ", JSON.stringify(result.code));
                if (callback !== null) {
                    callback(null, result);
                }
            });
        }
        updateFavoriteMember(editType, member, callback) {
            var msg = {};
            msg["editType"] = editType;
            msg["member"] = member;
            msg["token"] = this.authenData.token;
            //<!-- Get user info.
            pomelo.request("auth.profileHandler.editFavoriteMembers", msg, (result) => {
                console.log("updateFavoriteMember: ", JSON.stringify(result));
                callback(null, result);
            });
        }
        updateFavoriteGroups(editType, group, callback) {
            var msg = {};
            msg["editType"] = editType;
            msg["group"] = group;
            msg["token"] = this.authenData.token;
            //<!-- Get user info.
            pomelo.request("auth.profileHandler.updateFavoriteGroups", msg, (result) => {
                console.log("updateFavoriteGroups: ", JSON.stringify(result));
                callback(null, result);
            });
        }
        updateClosedNoticeMemberList(editType, member, callback) {
            var msg = {};
            msg["editType"] = editType;
            msg["member"] = member;
            msg["token"] = this.authenData.token;
            //<!-- Get user info.
            pomelo.request("auth.profileHandler.updateClosedNoticeUsers", msg, (result) => {
                console.log("updateClosedNoticeUsers: ", JSON.stringify(result));
                callback(null, result);
            });
        }
        updateClosedNoticeGroupsList(editType, group, callback) {
            var msg = {};
            msg["editType"] = editType;
            msg["group"] = group;
            msg["token"] = this.authenData.token;
            //<!-- Get user info.
            pomelo.request("auth.profileHandler.updateClosedNoticeGroups", msg, (result) => {
                console.log("updateClosedNoticeGroups: ", JSON.stringify(result));
                callback(null, result);
            });
        }
        getMemberProfile(userId, callback) {
            var msg = {};
            msg["userId"] = userId;
            pomelo.request("auth.profileHandler.getMemberProfile", msg, (result) => {
                if (callback != null) {
                    callback(null, result);
                }
            });
        }
        //endregion
        //region  Company data. 
        /// <summary>
        /// Gets the company info.
        /// Beware for data loading so mush. please load from cache before load from server.
        /// </summary>
        getCompanyInfo(callBack) {
            var msg = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getCompanyInfo", msg, (result) => {
                if (callBack != null)
                    callBack(null, result);
            });
        }
        /// <summary>
        /// Gets the company members.
        /// Beware for data loading so mush. please load from cache before load from server.
        /// </summary>
        getCompanyMembers(callBack) {
            var msg = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getCompanyMember", msg, (result) => {
                console.log("getCompanyMembers", JSON.stringify(result));
                if (callBack != null)
                    callBack(null, result);
            });
        }
        /// <summary>
        /// Gets the company chat rooms.
        /// Beware for data loading so mush. please load from cache before load from server.
        /// </summary>
        getOrganizationGroups(callBack) {
            var msg = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getCompanyChatRoom", msg, (result) => {
                console.log("getOrganizationGroups: " + JSON.stringify(result));
                if (callBack != null)
                    callBack(null, result);
            });
        }
        //endregion
        //region Project base.
        getProjectBaseGroups(callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getProjectBaseGroups", msg, (result) => {
                console.log("getProjectBaseGroups: " + JSON.stringify(result));
                if (callback != null)
                    callback(null, result);
            });
        }
        requestCreateProjectBaseGroup(groupName, members, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["groupName"] = groupName;
            msg["members"] = JSON.stringify(members);
            pomelo.request("chat.chatRoomHandler.requestCreateProjectBase", msg, (result) => {
                console.log("requestCreateProjectBaseGroup: " + JSON.stringify(result));
                if (callback != null)
                    callback(null, result);
            });
        }
        editMemberInfoInProjectBase(roomId, roomType, member, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["roomId"] = roomId;
            msg["roomType"] = roomType.toString();
            msg["member"] = JSON.stringify(member);
            pomelo.request("chat.chatRoomHandler.editMemberInfoInProjectBase", msg, (result) => {
                if (callback != null)
                    callback(null, result);
            });
        }
        //endregion
        //region <!-- Private Group Room... -->
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// <summary>
        /// Gets the public group chat rooms.
        /// Beware for data loading so mush. please load from cache before load from server.
        /// </summary>
        /// <param name="callback">Callback.</param>
        getPrivateGroups(callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getMyPrivateGroupChat", msg, (result) => {
                console.log("getPrivateGroups: " + JSON.stringify(result));
                if (callback != null) {
                    callback(null, result);
                }
            });
        }
        UserRequestCreateGroupChat(groupName, memberIds, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["groupName"] = groupName;
            msg["memberIds"] = JSON.stringify(memberIds);
            pomelo.request("chat.chatRoomHandler.userCreateGroupChat", msg, (result) => {
                console.log("RequestCreateGroupChat", JSON.stringify(result));
                if (callback != null)
                    callback(null, result);
            });
        }
        UpdatedGroupImage(groupId, path, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["groupId"] = groupId;
            msg["path"] = path;
            pomelo.request("chat.chatRoomHandler.updateGroupImage", msg, (result) => {
                console.log("UpdatedGroupImage", JSON.stringify(result));
                if (callback != null) {
                    callback(null, result);
                }
            });
        }
        editGroupMembers(editType, roomId, roomType, members, callback) {
            if (editType == null || editType.length === 0)
                return;
            if (roomId == null || roomId.length === 0)
                return;
            if (roomType === null)
                return;
            if (members == null || members.length === 0)
                return;
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["editType"] = editType;
            msg["roomId"] = roomId;
            msg["roomType"] = roomType.toString();
            msg["members"] = JSON.stringify(members);
            pomelo.request("chat.chatRoomHandler.editGroupMembers", msg, (result) => {
                console.log("editGroupMembers response." + result.toString());
                if (callback != null) {
                    callback(null, result);
                }
            });
        }
        editGroupName(roomId, roomType, newGroupName, callback) {
            if (roomId == null || roomId.length === 0)
                return;
            if (roomType === null)
                return;
            if (newGroupName == null || newGroupName.length === 0)
                return;
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["roomId"] = roomId;
            msg["roomType"] = roomType.toString();
            msg["newGroupName"] = newGroupName;
            pomelo.request("chat.chatRoomHandler.editGroupName", msg, (result) => {
                console.log("editGroupName response." + result.toString());
                if (callback != null) {
                    callback(null, result);
                }
            });
        }
        /// <summary>
        /// Gets Private Chat Room.
        /// </summary>
        /// <param name="myId">My identifier.</param>
        /// <param name="myRoommateId">My roommate identifier.</param>
        getPrivateChatRoomId(myId, myRoommateId, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["ownerId"] = myId;
            msg["roommateId"] = myRoommateId;
            pomelo.request("chat.chatRoomHandler.getRoomById", msg, (result) => {
                if (callback != null) {
                    callback(null, result);
                }
            });
        }
        //<!-- Join and leave chat room.
        JoinChatRoomRequest(room_id, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["rid"] = room_id;
            msg["username"] = username;
            pomelo.request("connector.entryHandler.enterRoom", msg, (result) => {
                console.log("JoinChatRoom: " + JSON.stringify(result));
                if (callback !== null) {
                    callback(null, result);
                }
            });
        }
        LeaveChatRoomRequest(roomId, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["rid"] = roomId;
            msg["username"] = username;
            pomelo.request("connector.entryHandler.leaveRoom", msg, (result) => {
                if (callback != null)
                    callback(null, result);
            });
        }
        /// <summary>
        /// Gets the room info. For load Room info by room_id.
        /// </summary>
        /// <c> return data</c>
        getRoomInfo(roomId, callback) {
            let msg = {};
            msg["token"] = this.authenData.token;
            msg["roomId"] = roomId;
            pomelo.request("chat.chatRoomHandler.getRoomInfo", msg, (result) => {
                console.log("chat.chatRoomHandler.getRoomInfo", result);
                if (callback != null)
                    callback(null, result);
            });
        }
        getUnreadMsgOfRoom(roomId, lastAccessTime, callback) {
            let msg = {};
            msg["token"] = this.authenData.token;
            msg["roomId"] = roomId;
            msg["lastAccessTime"] = lastAccessTime;
            pomelo.request("chat.chatRoomHandler.getUnreadRoomMessage", msg, (result) => {
                console.log("chat.chatRoomHandler.getUnreadRoomMessage", result);
                if (callback != null) {
                    callback(null, result);
                }
            });
        }
        //endregion
        // region <!-- Web RTC Calling...
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// <summary>
        /// Videos the call requesting.
        /// - tell target client for your call requesting...
        /// </summary>
        videoCallRequest(targetId, myRtcId, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["targetId"] = targetId;
            msg["myRtcId"] = myRtcId;
            pomelo.request("connector.entryHandler.videoCallRequest", msg, (result) => {
                console.log("videoCallRequesting =>: " + JSON.stringify(result));
                if (callback != null)
                    callback(null, result);
            });
        }
        voiceCallRequest(targetId, myRtcId, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["targetId"] = targetId;
            msg["myRtcId"] = myRtcId;
            pomelo.request("connector.entryHandler.voiceCallRequest", msg, (result) => {
                console.log("voiceCallRequesting =>: " + JSON.stringify(result));
                if (callback != null)
                    callback(null, result);
            });
        }
        hangupCall(myId, contactId) {
            var msg = {};
            msg["userId"] = myId;
            msg["contactId"] = contactId;
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.hangupCall", msg, (result) => {
                console.log("hangupCall: ", JSON.stringify(result));
            });
        }
        theLineIsBusy(contactId) {
            var msg = {};
            msg["contactId"] = contactId;
            pomelo.request("connector.entryHandler.theLineIsBusy", msg, (result) => {
                console.log("theLineIsBusy response: " + JSON.stringify(result));
            });
        }
    }
    ServerImplemented.connectionProblemString = 'Server connection is unstable.';
    ChatServer.ServerImplemented = ServerImplemented;
    class ChatRoomApiProvider {
        chat(room_id, target, sender_id, content, contentType, callback) {
            let message = {};
            message["rid"] = room_id;
            message["content"] = content;
            message["sender"] = sender_id;
            message["target"] = target;
            message["type"] = contentType;
            pomelo.request("chat.chatHandler.send", message, (result) => {
                var data = JSON.parse(JSON.stringify(result));
                if (callback !== null)
                    callback(null, data);
            });
        }
        chatFile(room_id, target, sender_id, fileUrl, contentType, meta, callback) {
            console.log("Send file to ", target);
            let message = {};
            message["rid"] = room_id;
            message["content"] = fileUrl;
            message["sender"] = sender_id;
            message["target"] = target;
            message["meta"] = meta;
            message["type"] = contentType;
            pomelo.request("chat.chatHandler.send", message, (result) => {
                var data = JSON.parse(JSON.stringify(result));
                console.log("chatFile callback: ", data);
                if (data.code == 200) {
                    if (callback != null) {
                        callback(null, data.data);
                    }
                }
                else {
                    console.error("WTF", "WTF god only know.");
                }
            });
        }
        getSyncDateTime(callback) {
            var message = {};
            pomelo.request("chat.chatHandler.getSyncDateTime", message, (result) => {
                if (callback != null) {
                    callback(null, result);
                }
            });
        }
        /**
         * getChatHistory function used for pull history chat record...
         * Beware!!! please call before JoinChatRoom.
         * @param room_id
         * @param lastAccessTime
         * @param callback
         */
        getChatHistory(room_id, lastAccessTime, callback) {
            var message = {};
            message["rid"] = room_id;
            if (lastAccessTime != null) {
                //<!-- Only first communication is has a problem.
                message["lastAccessTime"] = lastAccessTime.toString();
            }
            pomelo.request("chat.chatHandler.getChatHistory", message, (result) => {
                if (callback !== null)
                    callback(null, result);
            });
        }
        /**
         * get older message histories.
         */
        getOlderMessageChunk(roomId, topEdgeMessageTime, callback) {
            var message = {};
            message["rid"] = roomId;
            message["topEdgeMessageTime"] = topEdgeMessageTime.toString();
            pomelo.request("chat.chatHandler.getOlderMessageChunk", message, (result) => {
                if (callback !== null)
                    callback(null, result);
            });
        }
        checkOlderMessagesCount(roomId, topEdgeMessageTime, callback) {
            var message = {};
            message["rid"] = roomId;
            message["topEdgeMessageTime"] = topEdgeMessageTime.toString();
            pomelo.request("chat.chatHandler.checkOlderMessagesCount", message, (result) => {
                if (callback !== null)
                    callback(null, result);
            });
        }
        getMessagesReaders(topEdgeMessageTime) {
            var message = {};
            message["topEdgeMessageTime"] = topEdgeMessageTime;
            pomelo.request("chat.chatHandler.getMessagesReaders", message, (result) => {
                console.info('getMessagesReaders respones: ', result);
            });
        }
        getMessageContent(messageId, callback) {
            var message = {};
            message["messageId"] = messageId;
            pomelo.request("chat.chatHandler.getMessageContent", message, (result) => {
                if (!!callback) {
                    callback(null, result);
                }
            });
        }
        updateMessageReader(messageId, roomId) {
            var message = {};
            message["messageId"] = messageId;
            message["roomId"] = roomId;
            pomelo.notify("chat.chatHandler.updateWhoReadMessage", message);
        }
        updateMessageReaders(messageIds, roomId) {
            var message = {};
            message["messageIds"] = JSON.stringify(messageIds);
            message["roomId"] = roomId;
            pomelo.notify("chat.chatHandler.updateWhoReadMessages", message);
        }
    }
    ChatServer.ChatRoomApiProvider = ChatRoomApiProvider;
    class ServerEventListener {
        constructor() {
        }
        addFrontendListener(obj) {
            this.frontendListener = obj;
        }
        addServerListener(obj) {
            this.serverListener = obj;
        }
        addChatListener(obj) {
            this.chatServerListener = obj;
        }
        addRTCListener(obj) {
            this.rtcCallListener = obj;
        }
        addListenner(resolve, rejected) {
            this.callFrontendServer();
            this.callChatServer();
            this.callRTCEvents();
            this.callServerEvents();
            resolve();
        }
        callFrontendServer() {
            let self = this;
            pomelo.on(ServerEventListener.ON_GET_ME, function (data) {
                console.log(ServerEventListener.ON_GET_ME);
                self.frontendListener.onGetMe(data);
            });
            pomelo.on(ServerEventListener.ON_GET_COMPANY_INFO, function (data) {
                console.log(ServerEventListener.ON_GET_COMPANY_INFO, JSON.stringify(data));
                self.frontendListener.onGetCompanyInfo(data);
            });
            //wait message from the server.
            pomelo.on(ServerEventListener.ON_GET_ORGANIZE_GROUPS, function (data) {
                console.log(ServerEventListener.ON_GET_ORGANIZE_GROUPS);
                self.frontendListener.onGetOrganizeGroupsComplete(data);
            });
            pomelo.on(ServerEventListener.ON_GET_COMPANY_MEMBERS, data => {
                console.log(ServerEventListener.ON_GET_COMPANY_MEMBERS);
                self.frontendListener.onGetCompanyMemberComplete(data);
            });
            pomelo.on(ServerEventListener.ON_GET_PRIVATE_GROUPS, data => {
                console.log(ServerEventListener.ON_GET_PRIVATE_GROUPS);
                self.frontendListener.onGetPrivateGroupsComplete(data);
            });
            pomelo.on(ServerEventListener.ON_GET_PROJECT_BASE_GROUPS, data => {
                console.log(ServerEventListener.ON_GET_PROJECT_BASE_GROUPS);
                self.frontendListener.onGetProjectBaseGroupsComplete(data);
            });
        }
        callChatServer() {
            let self = this;
            pomelo.on(ServerEventListener.ON_CHAT, function (data) {
                console.log(ServerEventListener.ON_CHAT, JSON.stringify(data));
                self.chatServerListener.onChat(data);
            });
            //pomelo.on(ServerEventListener.ON_ADD, (data) => {
            //    console.log(ServerEventListener.ON_ADD, data);
            //    self.onChatListener.on(data);
            //});
            pomelo.on(ServerEventListener.ON_LEAVE, (data) => {
                console.log(ServerEventListener.ON_LEAVE, JSON.stringify(data));
                self.chatServerListener.onLeaveRoom(data);
            });
            pomelo.on(ServerEventListener.ON_MESSAGE_READ, (data) => {
                // console.log(ServerEventListener.ON_MESSAGE_READ);
                self.chatServerListener.onMessageRead(data);
            });
            pomelo.on(ServerEventListener.ON_GET_MESSAGES_READERS, (data) => {
                // console.log(ServerEventListener.ON_GET_MESSAGES_READERS);
                self.chatServerListener.onGetMessagesReaders(data);
            });
        }
        callRTCEvents() {
            var self = this;
            pomelo.on(ServerEventListener.ON_VIDEO_CALL, (data) => {
                console.log(ServerEventListener.ON_VIDEO_CALL, JSON.stringify(data));
                self.rtcCallListener.onVideoCall(data);
            });
            pomelo.on(ServerEventListener.ON_VOICE_CALL, (data) => {
                console.log(ServerEventListener.ON_VOICE_CALL, JSON.stringify(data));
                self.rtcCallListener.onVoiceCall(data);
            });
            pomelo.on(ServerEventListener.ON_HANGUP_CALL, (data) => {
                console.log(ServerEventListener.ON_HANGUP_CALL, JSON.stringify(data));
                self.rtcCallListener.onHangupCall(data);
            });
            pomelo.on(ServerEventListener.ON_THE_LINE_IS_BUSY, (data) => {
                console.log(ServerEventListener.ON_THE_LINE_IS_BUSY, JSON.stringify(data));
                self.rtcCallListener.onTheLineIsBusy(data);
            });
        }
        callServerEvents() {
            var self = this;
            //<!-- AccessRoom Info -->
            pomelo.on(ServerEventListener.ON_ACCESS_ROOMS, (data) => {
                console.log(ServerEventListener.ON_ACCESS_ROOMS);
                self.serverListener.onAccessRoom(data);
            });
            pomelo.on(ServerEventListener.ON_ADD_ROOM_ACCESS, (data) => {
                console.log(ServerEventListener.ON_ADD_ROOM_ACCESS);
                self.serverListener.onAddRoomAccess(data);
            });
            pomelo.on(ServerEventListener.ON_UPDATED_LASTACCESSTIME, (data) => {
                console.log(ServerEventListener.ON_UPDATED_LASTACCESSTIME);
                self.serverListener.onUpdatedLastAccessTime(data);
            });
            //<!-- User -->
            pomelo.on(ServerEventListener.ON_USER_LOGIN, data => {
                console.log(ServerEventListener.ON_USER_LOGIN);
                self.serverListener.onUserLogin(data);
            });
            pomelo.on(ServerEventListener.ON_USER_UPDATE_PROFILE, (data) => {
                console.log(ServerEventListener.ON_USER_UPDATE_PROFILE);
                self.serverListener.onUserUpdateProfile(data);
            });
            pomelo.on(ServerEventListener.ON_USER_UPDATE_IMAGE_PROFILE, (data) => {
                console.log(ServerEventListener.ON_USER_UPDATE_IMAGE_PROFILE);
                self.serverListener.onUserUpdateImageProfile(data);
            });
            //<!-- Group -->
            pomelo.on(ServerEventListener.ON_CREATE_GROUP_SUCCESS, (data) => {
                console.log(ServerEventListener.ON_CREATE_GROUP_SUCCESS);
                self.serverListener.onCreateGroupSuccess(data);
            });
            pomelo.on(ServerEventListener.ON_EDITED_GROUP_MEMBER, (data) => {
                console.log(ServerEventListener.ON_EDITED_GROUP_MEMBER);
                self.serverListener.onEditedGroupMember(data);
            });
            pomelo.on(ServerEventListener.ON_EDITED_GROUP_NAME, (data) => {
                console.log(ServerEventListener.ON_EDITED_GROUP_NAME);
                self.serverListener.onEditedGroupName(data);
            });
            pomelo.on(ServerEventListener.ON_EDITED_GROUP_IMAGE, (data) => {
                console.log(ServerEventListener.ON_EDITED_GROUP_IMAGE);
                self.serverListener.onEditedGroupImage(data);
            });
            pomelo.on(ServerEventListener.ON_NEW_GROUP_CREATED, (data) => {
                console.log(ServerEventListener.ON_NEW_GROUP_CREATED);
                self.serverListener.onNewGroupCreated(data);
            });
            pomelo.on(ServerEventListener.ON_UPDATE_MEMBER_INFO_IN_PROJECTBASE, (data) => {
                console.log(ServerEventListener.ON_UPDATE_MEMBER_INFO_IN_PROJECTBASE);
                self.serverListener.onUpdateMemberInfoInProjectBase(data);
            });
        }
    }
    ServerEventListener.ON_ADD = "onAdd";
    ServerEventListener.ON_LEAVE = "onLeave";
    ServerEventListener.ON_CHAT = "onChat";
    ServerEventListener.ON_MESSAGE_READ = "onMessageRead";
    ServerEventListener.ON_GET_MESSAGES_READERS = "onGetMessagesReaders";
    ServerEventListener.ON_VIDEO_CALL = "onVideoCall";
    ServerEventListener.ON_VOICE_CALL = "onVoiceCall";
    ServerEventListener.ON_HANGUP_CALL = "onHangupCall";
    ServerEventListener.ON_THE_LINE_IS_BUSY = "onTheLineIsBusy";
    //<!-- AccessRoom Info -->
    ServerEventListener.ON_ACCESS_ROOMS = "onAccessRooms";
    ServerEventListener.ON_ADD_ROOM_ACCESS = "onAddRoomAccess";
    ServerEventListener.ON_UPDATED_LASTACCESSTIME = "onUpdatedLastAccessTime";
    //<!-- Group -->
    ServerEventListener.ON_CREATE_GROUP_SUCCESS = "onCreateGroupSuccess";
    ServerEventListener.ON_EDITED_GROUP_MEMBER = "onEditGroupMembers";
    ServerEventListener.ON_EDITED_GROUP_NAME = "onEditGroupName";
    ServerEventListener.ON_EDITED_GROUP_IMAGE = "onEditGroupImage";
    ServerEventListener.ON_NEW_GROUP_CREATED = "onNewGroupCreated";
    ServerEventListener.ON_UPDATE_MEMBER_INFO_IN_PROJECTBASE = "onUpdateMemberInfoInProjectBase";
    //<!-- User -->
    ServerEventListener.ON_USER_LOGIN = "onUserLogin";
    ServerEventListener.ON_USER_UPDATE_IMAGE_PROFILE = "onUserUpdateImgProfile";
    ServerEventListener.ON_USER_UPDATE_PROFILE = "onUserUpdateProfile";
    //<!-- Frontend server --->
    ServerEventListener.ON_GET_ME = "onGetMe";
    ServerEventListener.ON_GET_COMPANY_INFO = "onGetCompanyInfo";
    ServerEventListener.ON_GET_COMPANY_MEMBERS = "onGetCompanyMembers";
    ServerEventListener.ON_GET_PRIVATE_GROUPS = "onGetPrivateGroups";
    ServerEventListener.ON_GET_ORGANIZE_GROUPS = "onGetOrganizeGroups";
    ServerEventListener.ON_GET_PROJECT_BASE_GROUPS = "onGetProjectBaseGroups";
    ChatServer.ServerEventListener = ServerEventListener;
})(ChatServer || (ChatServer = {}));
class SocketComponent {
    disconnected(reason) {
        if (!!this.onDisconnect) {
            this.onDisconnect(reason);
        }
        else {
            console.warn("onDisconnected delegate is empty.");
        }
    }
}
class HttpStatusCode {
}
HttpStatusCode.success = 200;
HttpStatusCode.fail = 500;
HttpStatusCode.requestTimeout = 408;
HttpStatusCode.duplicateLogin = 1004;
