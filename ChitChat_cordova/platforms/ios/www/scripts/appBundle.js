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
            document.addEventListener('pause', onPause, false);
            document.addEventListener('resume', onResume, false);
            console.warn("onDeviceReady");
        }
        function onPause() {
            console.warn('onPause');
        }
        function onResume() {
            console.warn('onResume');
        }
    })(Application = BlankCordovaApp1.Application || (BlankCordovaApp1.Application = {}));
    window.onload = function () {
        Application.initialize();
    };
})(BlankCordovaApp1 || (BlankCordovaApp1 = {}));
/// <reference path="./typings/tsd.d.ts" />
requirejs.config({
    paths: {
        jquery: '../js/jquery.min',
        cryptojs: '../js/crypto-js/crypto-js'
    }
});
var Main = (function () {
    function Main() {
    }
    Main.prototype.getDataManager = function () {
        return this.dataManager;
    };
    Main.prototype.setDataManager = function (data) {
        this.dataManager = data;
        this.dataListener = new DataListener(this.dataManager);
    };
    Main.prototype.getDataListener = function () {
        return this.dataListener;
    };
    Main.prototype.getServerImp = function () {
        return this.serverImp;
    };
    Main.prototype.setServerImp = function (server) {
        this.serverImp = server;
    };
    Main.prototype.getChatRoomApi = function () {
        if (!this.chatRoomApi) {
            this.chatRoomApi = ChatServer.ChatRoomApiProvider.prototype;
        }
        return this.chatRoomApi;
    };
    Main.prototype.setServerListener = function (server) {
        this.serverListener = server;
    };
    Main.prototype.startChatServerListener = function (resolve, rejected) {
        this.serverListener.addFrontendListener(this.dataManager);
        this.serverListener.addServerListener(this.dataListener);
        this.serverListener.addChatListener(this.dataListener);
        this.serverListener.addListenner(resolve, rejected);
    };
    Main.prototype.getHashService = function (content, callback) {
        var hashService = new SecureService();
        hashService.hashCompute(content, callback);
    };
    Main.prototype.encodeService = function (content, callback) {
        var crypto = new SecureService();
        crypto.encryptWithSecureRandom(content, callback);
    };
    Main.prototype.decodeService = function (content, callback) {
        var crypto = new SecureService();
        crypto.decryptWithSecureRandom(content, callback);
    };
    Main.prototype.authenUser = function (server, email, password, callback) {
        console.log(email, password);
        var self = this;
        server.logIn(email, password, function (err, loginRes) {
            callback(err, loginRes);
            if (!err && loginRes !== null && loginRes.code === 200) {
                var promiseForAddListener = new Promise(function callback(resolve, rejected) {
                    self.startChatServerListener(resolve, rejected);
                }).then(function onFulfilled(value) {
                    server.getMe(function (err, res) {
                        if (err || res === null) {
                            console.error(err);
                        }
                        else {
                            self.dataManager.onMyProfileReady = self.onMyProfileReadyListener;
                            server.getLastAccessRoomsInfo(function (err, res) {
                                console.log("getLastAccessRoomsInfo:", JSON.stringify(res));
                            });
                            if (res.code === 200) {
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
                            console.log("companyInfo: ", JSON.stringify(res));
                        }
                    });
                    server.getOrganizationGroups(function (err, res) {
                        if (err || res === null) {
                            console.error(err);
                        }
                        else {
                            console.log("organize groups: ", res);
                        }
                    });
                    server.getProjectBaseGroups(function (err, res) {
                        if (err || res === null) {
                            console.error(err);
                        }
                        else {
                            console.log("project base groups: ", res);
                        }
                    });
                    server.getPrivateGroups(function (err, res) {
                        if (err || res === null) {
                            console.error(err);
                        }
                        else {
                            console.log("Private groups: ", res);
                        }
                    });
                    server.getCompanyMembers(function (err, res) {
                        if (err || res === null) {
                            console.error(err);
                        }
                        else {
                            console.log("Company Members: ", res);
                        }
                    });
                }).catch(function onRejected(err) {
                    console.error(err);
                });
            }
            else {
                console.error(err, JSON.stringify(loginRes));
            }
        });
    };
    return Main;
})();
var ChatRoomComponent = (function () {
    function ChatRoomComponent(main, room_id) {
        this.chatMessages = [];
        this.main = main;
        this.serverImp = this.main.getServerImp();
        this.chatRoomApi = this.main.getChatRoomApi();
        this.dataManager = this.main.getDataManager();
        this.roomId = room_id;
        console.log("constructor ChatRoomComponent");
    }
    ChatRoomComponent.prototype.onChat = function (chatMessageImp) {
        var _this = this;
        var self = this;
        if (this.roomId === chatMessageImp.rid) {
            console.log("Implement chat msg hear..", chatMessageImp);
            var secure = new SecureService();
            if (chatMessageImp.type.toString() === ContentType[ContentType.Text]) {
                secure.decryptWithSecureRandom(chatMessageImp.body, function (err, res) {
                    if (!err) {
                        chatMessageImp.body = res;
                        self.chatMessages.push(chatMessageImp);
                        if (!!_this.serviceListener)
                            _this.serviceListener(ChatServer.ServerEventListener.ON_CHAT, chatMessageImp);
                    }
                    else {
                        console.log(err, res);
                        self.chatMessages.push(chatMessageImp);
                        if (!!_this.serviceListener)
                            _this.serviceListener(ChatServer.ServerEventListener.ON_CHAT, chatMessageImp);
                    }
                });
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
    };
    ChatRoomComponent.prototype.onLeaveRoom = function (data) {
    };
    ChatRoomComponent.prototype.onRoomJoin = function (data) {
    };
    ChatRoomComponent.prototype.onMessageRead = function (dataEvent) {
        console.log("Implement onMessageRead hear..", JSON.stringify(dataEvent));
        var self = this;
        var newMsg = JSON.parse(JSON.stringify(dataEvent));
        this.chatMessages.some(function callback(value) {
            if (value._id === newMsg._id) {
                value.readers = newMsg.readers;
                if (!!self.serviceListener)
                    self.serviceListener(ChatServer.ServerEventListener.ON_MESSAGE_READ, null);
                return true;
            }
        });
    };
    ChatRoomComponent.prototype.onGetMessagesReaders = function (dataEvent) {
    };
    ChatRoomComponent.prototype.getMessage = function (chatId, Chats, callback) {
        var self = this;
        var myProfile = self.dataManager.myProfile;
        var chatLog = localStorage.getItem(myProfile._id + '_' + chatId);
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
                                    self.main.decodeService(messageImp.body, function (err, res) {
                                        if (!err) {
                                            messageImp.body = res;
                                            self.chatMessages.push(messageImp);
                                            cb();
                                        }
                                        else {
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
                            }
                            else {
                            }
                            var his_length = histories.length;
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
                                    callback();
                                });
                            }
                            else {
                                Chats.set(self.chatMessages);
                                callback();
                            }
                        });
                    });
                }
            });
        });
    };
    ChatRoomComponent.prototype.leaveRoom = function (room_id, callback) {
        var self = this;
        this.serverImp.LeaveChatRoomRequest(room_id, function (err, res) {
            console.log("leave room", JSON.stringify(res));
            callback(err, res);
        });
    };
    return ChatRoomComponent;
})();
var ChatsLogComponent = (function () {
    function ChatsLogComponent(main, server) {
        this.main = main;
        this.server = server;
    }
    ChatsLogComponent.prototype.onNewMessage = function (dataEvent) {
        console.warn("OnNewMessage", JSON.stringify(dataEvent));
    };
    ChatsLogComponent.prototype.onAccessRoom = function (dataEvent) {
        console.warn("onAccessRoom", JSON.stringify(dataEvent));
    };
    ChatsLogComponent.prototype.onUpdatedLastAccessTime = function (dataEvent) {
        console.warn("onUpdatedLastAccessTime", JSON.stringify(dataEvent));
    };
    ChatsLogComponent.prototype.onAddRoomAccess = function (dataEvent) {
        console.warn("onAddRoomAccess", JSON.stringify(dataEvent));
    };
    ChatsLogComponent.prototype.getUnreadMessage = function (roomAccess, callback) {
        var self = this;
        var logs = [];
        async.mapSeries(roomAccess, function iterator(item, cb) {
            if (!!item.roomId && !!item.accessTime) {
                self.server.getUnreadMsgOfRoom(item.roomId, item.accessTime.toString(), function res(err, res) {
                    if (err || res === null) {
                        console.warn("getUnreadMsgOfRoom: ", err);
                    }
                    else {
                        if (res.code === HttpStatusCode.success) {
                            var unread = JSON.parse(JSON.stringify(res.data));
                            unread.rid = item.roomId;
                            logs.push(unread);
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
            callback(null, logs);
        });
    };
    return ChatsLogComponent;
})();
var DataListener = (function () {
    function DataListener(dataManager) {
        this.chatListenerImps = new Array();
        this.roomAccessListenerImps = new Array();
        this.dataManager = dataManager;
    }
    DataListener.prototype.addListenerImp = function (listener) {
        this.chatListenerImps.push(listener);
    };
    DataListener.prototype.removeListener = function (listener) {
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
    };
    DataListener.prototype.onAddRoomAccess = function (dataEvent) {
        var data = JSON.parse(JSON.stringify(dataEvent));
        var roomAccess = data.roomAccess;
        if (roomAccess !== null && roomAccess.length !== 0) {
            this.dataManager.setRoomAccessForUser(dataEvent);
        }
    };
    DataListener.prototype.onCreateGroupSuccess = function (dataEvent) {
        var group = JSON.parse(JSON.stringify(dataEvent));
        this.dataManager.addGroup(group);
    };
    DataListener.prototype.onEditedGroupMember = function (dataEvent) {
        var jsonObj = JSON.parse(JSON.stringify(dataEvent));
        this.dataManager.updateGroupMembers(jsonObj);
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
    DataListener.prototype.onChat = function (data) {
        var chatMessageImp = JSON.parse(JSON.stringify(data));
        if (!!this.chatListenerImps && this.chatListenerImps.length !== 0) {
            this.chatListenerImps.forEach(function (value, id, arr) {
                value.onChat(chatMessageImp);
            });
        }
        if (!!this.roomAccessListenerImps && this.roomAccessListenerImps.length !== 0) {
            this.roomAccessListenerImps.map(function (v) {
                v.onNewMessage(chatMessageImp);
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
var DataManager = (function () {
    function DataManager() {
        this.orgGroups = {};
        this.projectBaseGroups = {};
        this.privateGroups = {};
        this.orgMembers = {};
        this.isOrgMembersReady = false;
    }
    DataManager.prototype.setMyProfile = function (data) {
        this.myProfile = JSON.parse(JSON.stringify(data));
        if (!!this.onMyProfileReady)
            this.onMyProfileReady(this);
    };
    DataManager.prototype.getMyProfile = function () {
        return this.myProfile;
    };
    DataManager.prototype.setRoomAccessForUser = function (data) {
        this.myProfile.roomAccess = JSON.parse(JSON.stringify(data.roomAccess));
    };
    DataManager.prototype.updateRoomAccessForUser = function (data) {
        console.info(JSON.stringify(data));
        var arr = JSON.parse(JSON.stringify(data.roomAccess));
        this.myProfile.roomAccess.forEach(function (value) {
            if (value.roomId === arr[0].roomId) {
                value.accessTime = arr[0].accessTime;
                return;
            }
        });
    };
    DataManager.prototype.setMembers = function (data) {
    };
    DataManager.prototype.setCompanyInfo = function (data) {
        this.companyInfo = JSON.parse(JSON.stringify(data));
    };
    DataManager.prototype.setOrganizeGroups = function (data) {
        this.orgGroups = JSON.parse(JSON.stringify(data));
    };
    DataManager.prototype.setProjectBaseGroups = function (data) {
        this.projectBaseGroups = JSON.parse(JSON.stringify(data));
    };
    DataManager.prototype.setPrivateGroups = function (data) {
        this.privateGroups = JSON.parse(JSON.stringify(data));
    };
    DataManager.prototype.getGroup = function (id) {
        if (!!this.orgGroups[id]) {
            return this.orgGroups[id];
        }
        else if (!!this.projectBaseGroups[id]) {
            return this.projectBaseGroups[id];
        }
        else if (!!this.privateGroups[id]) {
            return this.privateGroups[id];
        }
    };
    DataManager.prototype.addGroup = function (data) {
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
            default:
                console.info("new room is not a group type.");
                break;
        }
    };
    DataManager.prototype.updateGroupImage = function (data) {
        if (!!this.orgGroups[data._id]) {
            this.orgGroups[data._id].image = data.image;
        }
        else if (!!this.projectBaseGroups[data._id]) {
            this.projectBaseGroups[data._id].image = data.image;
        }
        else if (!!this.privateGroups[data._id]) {
            this.privateGroups[data._id].image = data.image;
        }
    };
    DataManager.prototype.updateGroupName = function (data) {
        if (!!this.orgGroups[data._id]) {
            this.orgGroups[data._id].name = data.name;
        }
        else if (!!this.projectBaseGroups[data._id]) {
            this.projectBaseGroups[data._id].name = data.name;
        }
        else if (!!this.privateGroups[data._id]) {
            this.privateGroups[data._id].name = data.name;
        }
    };
    DataManager.prototype.updateGroupMembers = function (data) {
        var hasMe = this.checkMySelfInNewMembersReceived(data);
        if (data.type === RoomType.organizationGroup) {
            if (!!this.orgGroups[data._id]) {
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
    };
    DataManager.prototype.updateGroupMemberDetail = function (jsonObj) {
        var _this = this;
        var editMember = jsonObj.editMember;
        var roomId = jsonObj.roomId;
        var groupMember = new Member();
        groupMember.id = editMember.id;
        var role = editMember.role;
        groupMember.role = MemberRole[role];
        groupMember.jobPosition = editMember.jobPosition;
        this.getGroup(roomId).members.forEach(function (value, index, arr) {
            if (value.id === groupMember.id) {
                _this.getGroup(roomId).members[index].role = groupMember.role;
                _this.getGroup(roomId).members[index].textRole = MemberRole[groupMember.role];
                _this.getGroup(roomId).members[index].jobPosition = groupMember.jobPosition;
            }
        });
    };
    DataManager.prototype.checkMySelfInNewMembersReceived = function (data) {
        var self = this;
        var hasMe = data.members.some(function isMySelfId(element, index, array) {
            return element.id === self.myProfile._id;
        });
        console.debug("New data has me", hasMe);
        return hasMe;
    };
    DataManager.prototype.updateContactImage = function (contactId, url) {
        if (!!this.orgMembers[contactId]) {
            this.orgMembers[contactId].image = url;
        }
    };
    DataManager.prototype.updateContactProfile = function (contactId, params) {
        if (!!this.orgMembers[contactId]) {
            var jsonObj = JSON.parse(JSON.stringify(params));
            if (!!jsonObj.displayname) {
                this.orgMembers[contactId].displayname = jsonObj.displayname;
            }
            if (!!jsonObj.status) {
                this.orgMembers[contactId].status = jsonObj.status;
            }
        }
    };
    DataManager.prototype.getContactProfile = function (contactId) {
        if (!!this.orgMembers[contactId]) {
            return this.orgMembers[contactId];
        }
        else {
            console.warn('this contactId is invalid.');
        }
    };
    DataManager.prototype.onGetMe = function (dataEvent) {
        var self = this;
        var _profile = JSON.parse(JSON.stringify(dataEvent));
        if (dataEvent.code === 200) {
            this.setMyProfile(dataEvent.data);
        }
        else {
            console.error("get use profile fail!", dataEvent.message);
        }
    };
    DataManager.prototype.onGetCompanyInfo = function (dataEvent) {
        var self = this;
        var _company = JSON.parse(JSON.stringify(dataEvent));
        if (dataEvent.code === 200) {
            this.setCompanyInfo(dataEvent.data);
        }
        else {
            console.error("get company info fail!", dataEvent.message);
        }
    };
    DataManager.prototype.onGetCompanyMemberComplete = function (dataEvent) {
        var self = this;
        var members = JSON.parse(JSON.stringify(dataEvent));
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
    };
    ;
    DataManager.prototype.onGetOrganizeGroupsComplete = function (dataEvent) {
        var _this = this;
        var rooms = JSON.parse(JSON.stringify(dataEvent));
        if (!this.orgGroups)
            this.orgGroups = {};
        rooms.forEach(function (value) {
            if (!_this.orgGroups[value._id]) {
                _this.orgGroups[value._id] = value;
            }
        });
    };
    ;
    DataManager.prototype.onGetProjectBaseGroupsComplete = function (dataEvent) {
        var _this = this;
        var groups = JSON.parse(JSON.stringify(dataEvent));
        if (!this.projectBaseGroups)
            this.projectBaseGroups = {};
        groups.forEach(function (value) {
            if (!_this.projectBaseGroups[value._id]) {
                _this.projectBaseGroups[value._id] = value;
            }
        });
    };
    ;
    DataManager.prototype.onGetPrivateGroupsComplete = function (dataEvent) {
        var _this = this;
        var groups = JSON.parse(JSON.stringify(dataEvent));
        if (!this.privateGroups)
            this.privateGroups = {};
        groups.forEach(function (value) {
            if (!_this.privateGroups[value._id]) {
                _this.privateGroups[value._id] = value;
            }
        });
    };
    ;
    return DataManager;
})();
var HomeComponent = (function () {
    function HomeComponent() {
    }
    HomeComponent.prototype.onChat = function (data) { };
    ;
    HomeComponent.prototype.onLeaveRoom = function (data) { };
    ;
    HomeComponent.prototype.onRoomJoin = function (data) { };
    ;
    HomeComponent.prototype.onMessageRead = function (dataEvent) { };
    ;
    HomeComponent.prototype.onGetMessagesReaders = function (dataEvent) { };
    ;
    return HomeComponent;
})();
var NotifyManager = (function () {
    function NotifyManager(main) {
        console.log("construc notify manager.");
        this.dataManager = main.getDataManager();
    }
    NotifyManager.prototype.notify = function (chatMessageImp, appBackground, notifyService) {
        if (chatMessageImp.type.toString() === ContentType[ContentType.Text]) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            var secure = new SecureService();
            secure.decryptWithSecureRandom(chatMessageImp.body, function done(err, res) {
                if (!err) {
                    chatMessageImp.body = res;
                    var toastMessage = contact.displayname + " sent " + chatMessageImp.body;
                    if (!appBackground) {
                        notifyService.makeToastOnCenter(toastMessage);
                    }
                    else {
                        notifyService.scheduleSingleNotification(contact.displayname, chatMessageImp.body);
                    }
                }
                else {
                    console.warn(err, res);
                }
            });
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Sticker]) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a sticker.";
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Voice]) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a voice message.";
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Image]) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a image.";
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Video]) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a video.";
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Location]) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a location.";
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
    };
    return NotifyManager;
})();
var appConfig;
var pomelo;
var username = "";
var password = "";
var ChatServer;
(function (ChatServer) {
    var AuthenData = (function () {
        function AuthenData() {
        }
        return AuthenData;
    })();
    var ServerImplemented = (function () {
        function ServerImplemented() {
            this._isInit = false;
            this._isConnected = false;
            this._isLogedin = false;
            console.warn("serv imp. constructor");
        }
        ServerImplemented.getInstance = function () {
            if (!ServerImplemented.Instance) {
                ServerImplemented.Instance = new ServerImplemented();
            }
            return ServerImplemented.Instance;
        };
        ServerImplemented.prototype.setSocketComponent = function (socket) {
            this.socketComponent = socket;
        };
        ServerImplemented.prototype.getClient = function () {
            var self = this;
            if (pomelo !== null) {
                return pomelo;
            }
            else {
                console.warn("disconnect Event");
            }
        };
        ServerImplemented.prototype.Logout = function () {
            var registrationId = localStorage.getItem("registrationId");
            var msg = {};
            msg["username"] = username;
            msg["registrationId"] = registrationId;
            if (pomelo != null)
                pomelo.notify("connector.entryHandler.logout", msg);
            localStorage.clear();
            this.disConnect();
        };
        ServerImplemented.prototype.init = function (callback) {
            var self = this;
            this._isConnected = false;
            username = localStorage.getItem("username");
            password = localStorage.getItem("password");
            var authen = localStorage.getItem("authen");
            if (authen !== null) {
                this.authenData = JSON.parse(authen);
            }
            else {
                this.authenData = new AuthenData();
            }
            var promiseForSocket = new Promise(function (resolve, rejected) {
                self.loadSocket(resolve, rejected);
            }).then(function onfulfilled(value) {
                self.loadConfig(callback);
            }).catch(function onRejected(err) {
                console.error(err);
            });
        };
        ServerImplemented.prototype.loadSocket = function (resolve, rejected) {
            require(['../js/pomelo/pomeloclient'], function (obj) {
                pomelo = obj;
                resolve();
            });
        };
        ServerImplemented.prototype.loadConfig = function (callback) {
            var self = this;
            var promiseForFileConfig = new Promise(function (resolve, reject) {
                $.ajax({
                    url: "../www/configs/appconfig.json",
                    dataType: "json",
                    success: function (config) {
                        appConfig = JSON.parse(JSON.stringify(config));
                        resolve();
                    }, error: function (jqXHR, textStatus, errorThrown) {
                        console.error(jqXHR, textStatus, errorThrown);
                        reject(errorThrown);
                    }
                });
            }).then(function resolve(val) {
                self.host = appConfig.socketHost;
                self.port = appConfig.socketPort;
                if (!!pomelo) {
                    self.connectSocketServer(self.host, self.port, function (err) {
                        callback(err, self);
                    });
                }
                else {
                    console.error("pomelo socket is un ready.");
                }
            }).catch(function onRejected(err) {
                console.log(err);
            });
        };
        ServerImplemented.prototype.disConnect = function () {
            if (pomelo !== null) {
                pomelo.disconnect();
            }
            this.authenData = null;
        };
        ServerImplemented.prototype.kickMeAllSession = function (uid) {
            if (pomelo !== null) {
                var msg = { uid: uid };
                pomelo.request("connector.entryHandler.kickMe", msg, function (result) {
                    console.log("kickMe", JSON.stringify(result));
                });
            }
        };
        ServerImplemented.prototype.connectSocketServer = function (_host, _port, callback) {
            console.log("socket init connecting to: ", _host, _port);
            pomelo.init({ host: _host, port: _port }, function cb(err) {
                console.log("socket init result: ", err);
                callback(err);
            });
        };
        ServerImplemented.prototype.logIn = function (_username, _hash, callback) {
            var self = this;
            username = _username;
            password = _hash;
            localStorage.setItem("username", username);
            localStorage.setItem("password", password);
            if (pomelo !== null && this._isConnected === false) {
                var msg = { uid: username };
                pomelo.request("gate.gateHandler.queryEntry", msg, function (result) {
                    console.log("QueryConnectorServ", result.code);
                    if (result.code === 200) {
                        pomelo.disconnect();
                        var port = result.port;
                        self.connectSocketServer(self.host, port, function () {
                            self._isConnected = true;
                            self.authenForFrontendServer(callback);
                        });
                    }
                });
            }
            else if (pomelo !== null && this._isConnected) {
                self.authenForFrontendServer(callback);
            }
        };
        ServerImplemented.prototype.authenForFrontendServer = function (callback) {
            var self = this;
            var registrationId = localStorage.getItem("registrationId");
            var msg = { username: username, password: password, registrationId: registrationId };
            pomelo.request("connector.entryHandler.login", msg, function (res) {
                console.log("login: ", JSON.stringify(res), res.code);
                if (res.code === 500) {
                    if (callback != null) {
                        callback(res.message, null);
                    }
                }
                else if (res.code === 200) {
                    self.authenData.userId = res.uid;
                    self.authenData.token = res.token;
                    localStorage.setItem("authen", JSON.stringify(self.authenData));
                    if (callback != null) {
                        callback(null, res);
                    }
                    pomelo.on('disconnect', function data(reason) {
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
        };
        ServerImplemented.prototype.TokenAuthen = function (tokenBearer, checkTokenCallback) {
            var _this = this;
            var msg = {};
            msg["token"] = tokenBearer;
            pomelo.request("gate.gateHandler.authenGateway", msg, function (result) {
                _this.OnTokenAuthenticate(result, checkTokenCallback);
            });
        };
        ServerImplemented.prototype.OnTokenAuthenticate = function (tokenRes, onSuccessCheckToken) {
            if (tokenRes.code === 200) {
                var data = tokenRes.data;
                var decode = data.decoded;
                var decodedModel = JSON.parse(JSON.stringify(decode));
                if (onSuccessCheckToken != null)
                    onSuccessCheckToken(null, { success: true, username: decodedModel.username, password: decodedModel.password });
            }
            else {
                if (onSuccessCheckToken != null)
                    onSuccessCheckToken(null, null);
            }
        };
        ServerImplemented.prototype.UpdateUserProfile = function (myId, profileFields, callback) {
            profileFields["token"] = this.authenData.token;
            profileFields["_id"] = myId;
            pomelo.request("auth.profileHandler.profileUpdate", profileFields, function (result) {
                if (callback != null) {
                    callback(null, result);
                }
            });
        };
        ServerImplemented.prototype.ProfileImageChanged = function (userId, path, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["userId"] = userId;
            msg["path"] = path;
            pomelo.request("auth.profileHandler.profileImageChanged", msg, function (result) {
                if (callback != null) {
                    callback(null, result);
                }
            });
        };
        ServerImplemented.prototype.getLastAccessRoomsInfo = function (callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getLastAccessRooms", msg, function (result) {
                if (callback !== null) {
                    callback(null, result);
                }
            });
        };
        ServerImplemented.prototype.getMe = function (callback) {
            var msg = {};
            msg["username"] = username;
            msg["password"] = password;
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getMe", msg, function (result) {
                console.log("getMe: ", JSON.stringify(result));
                if (callback !== null) {
                    callback(null, result);
                }
            });
        };
        ServerImplemented.prototype.updateFavoriteMember = function (editType, member, callback) {
            var msg = {};
            msg["editType"] = editType;
            msg["member"] = member;
            msg["token"] = this.authenData.token;
            pomelo.request("auth.profileHandler.editFavoriteMembers", msg, function (result) {
                console.log("updateFavoriteMember: ", JSON.stringify(result));
                callback(null, result);
            });
        };
        ServerImplemented.prototype.updateFavoriteGroups = function (editType, group, callback) {
            var msg = {};
            msg["editType"] = editType;
            msg["group"] = group;
            msg["token"] = this.authenData.token;
            pomelo.request("auth.profileHandler.updateFavoriteGroups", msg, function (result) {
                console.log("updateFavoriteGroups: ", JSON.stringify(result));
                callback(null, result);
            });
        };
        ServerImplemented.prototype.getMemberProfile = function (userId, callback) {
            var msg = {};
            msg["userId"] = userId;
            pomelo.request("auth.profileHandler.getMemberProfile", msg, function (result) {
                if (callback != null) {
                    callback(null, result);
                }
            });
        };
        ServerImplemented.prototype.getCompanyInfo = function (callBack) {
            var msg = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getCompanyInfo", msg, function (result) {
                console.log("getCompanyInfo", JSON.stringify(result));
                if (callBack != null)
                    callBack(null, result);
            });
        };
        ServerImplemented.prototype.getCompanyMembers = function (callBack) {
            var msg = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getCompanyMember", msg, function (result) {
                console.log("getCompanyMembers", JSON.stringify(result));
                if (callBack != null)
                    callBack(null, result);
            });
        };
        ServerImplemented.prototype.getOrganizationGroups = function (callBack) {
            var msg = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getCompanyChatRoom", msg, function (result) {
                console.log("getOrganizationGroups: " + JSON.stringify(result));
                if (callBack != null)
                    callBack(null, result);
            });
        };
        ServerImplemented.prototype.getProjectBaseGroups = function (callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getProjectBaseGroups", msg, function (result) {
                console.log("getProjectBaseGroups: " + JSON.stringify(result));
                if (callback != null)
                    callback(null, result);
            });
        };
        ServerImplemented.prototype.requestCreateProjectBaseGroup = function (groupName, members, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["groupName"] = groupName;
            msg["members"] = JSON.stringify(members);
            pomelo.request("chat.chatRoomHandler.requestCreateProjectBase", msg, function (result) {
                console.log("requestCreateProjectBaseGroup: " + JSON.stringify(result));
                if (callback != null)
                    callback(null, result);
            });
        };
        ServerImplemented.prototype.editMemberInfoInProjectBase = function (roomId, roomType, member, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["roomId"] = roomId;
            msg["roomType"] = roomType.toString();
            msg["member"] = JSON.stringify(member);
            pomelo.request("chat.chatRoomHandler.editMemberInfoInProjectBase", msg, function (result) {
                if (callback != null)
                    callback(null, result);
            });
        };
        ServerImplemented.prototype.getPrivateGroups = function (callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getMyPrivateGroupChat", msg, function (result) {
                console.log("getPrivateGroups: " + JSON.stringify(result));
                if (callback != null) {
                    callback(null, result);
                }
            });
        };
        ServerImplemented.prototype.UserRequestCreateGroupChat = function (groupName, memberIds, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["groupName"] = groupName;
            msg["memberIds"] = JSON.stringify(memberIds);
            pomelo.request("chat.chatRoomHandler.userCreateGroupChat", msg, function (result) {
                console.log("RequestCreateGroupChat", JSON.stringify(result));
                if (callback != null)
                    callback(null, result);
            });
        };
        ServerImplemented.prototype.UpdatedGroupImage = function (groupId, path, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["groupId"] = groupId;
            msg["path"] = path;
            pomelo.request("chat.chatRoomHandler.updateGroupImage", msg, function (result) {
                console.log("UpdatedGroupImage", JSON.stringify(result));
                if (callback != null) {
                    callback(null, result);
                }
            });
        };
        ServerImplemented.prototype.editGroupMembers = function (editType, roomId, roomType, members, callback) {
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
            pomelo.request("chat.chatRoomHandler.editGroupMembers", msg, function (result) {
                console.log("editGroupMembers response." + result.toString());
                if (callback != null) {
                    callback(null, result);
                }
            });
        };
        ServerImplemented.prototype.editGroupName = function (roomId, roomType, newGroupName, callback) {
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
            pomelo.request("chat.chatRoomHandler.editGroupName", msg, function (result) {
                console.log("editGroupName response." + result.toString());
                if (callback != null) {
                    callback(null, result);
                }
            });
        };
        ServerImplemented.prototype.getPrivateChatRoomId = function (myId, myRoommateId, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["ownerId"] = myId;
            msg["roommateId"] = myRoommateId;
            pomelo.request("chat.chatRoomHandler.getRoomById", msg, function (result) {
                console.log("getPrivateChatRoomId", result.toString());
                if (callback != null) {
                    callback(null, result);
                }
            });
        };
        ServerImplemented.prototype.JoinChatRoomRequest = function (room_id, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["rid"] = room_id;
            msg["username"] = username;
            pomelo.request("connector.entryHandler.enterRoom", msg, function (result) {
                console.log("JoinChatRoom: " + JSON.stringify(result));
                if (callback !== null) {
                    callback(null, result);
                }
            });
        };
        ServerImplemented.prototype.LeaveChatRoomRequest = function (roomId, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["rid"] = roomId;
            msg["username"] = username;
            pomelo.request("connector.entryHandler.leaveRoom", msg, function (result) {
                if (callback != null)
                    callback(null, result);
            });
        };
        ServerImplemented.prototype.getRoomInfo = function (roomId, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["roomId"] = roomId;
            pomelo.request("chat.chatRoomHandler.getRoomInfo", msg, function (result) {
                if (callback != null)
                    callback(null, result);
            });
        };
        ServerImplemented.prototype.getUnreadMsgOfRoom = function (roomId, lastAccessTime, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["roomId"] = roomId;
            msg["lastAccessTime"] = lastAccessTime;
            pomelo.request("chat.chatRoomHandler.getUnreadRoomMessage", msg, function (result) {
                if (callback != null) {
                    callback(null, result);
                }
            });
        };
        ServerImplemented.prototype.videoCallRequest = function (targetId, myRtcId, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["targetId"] = targetId;
            msg["myRtcId"] = myRtcId;
            pomelo.request("connector.entryHandler.videoCallRequest", msg, function (result) {
                console.log("videoCallRequesting =>: " + JSON.stringify(result));
                if (callback != null)
                    callback(null, result);
            });
        };
        ServerImplemented.prototype.voiceCallRequest = function (targetId, myRtcId, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["targetId"] = targetId;
            msg["myRtcId"] = myRtcId;
            pomelo.request("connector.entryHandler.voiceCallRequest", msg, function (result) {
                console.log("voiceCallRequesting =>: " + JSON.stringify(result));
                if (callback != null)
                    callback(null, result);
            });
        };
        ServerImplemented.prototype.hangupCall = function (myId, contactId) {
            var msg = {};
            msg["userId"] = myId;
            msg["contactId"] = contactId;
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.hangupCall", msg, function (result) {
                console.log("hangupCall: ", JSON.stringify(result));
            });
        };
        ServerImplemented.prototype.theLineIsBusy = function (contactId) {
            var msg = {};
            msg["contactId"] = contactId;
            pomelo.request("connector.entryHandler.theLineIsBusy", msg, function (result) {
                console.log("theLineIsBusy response: " + JSON.stringify(result));
            });
        };
        return ServerImplemented;
    })();
    ChatServer.ServerImplemented = ServerImplemented;
    var ChatRoomApiProvider = (function () {
        function ChatRoomApiProvider() {
            this.serverImp = ServerImplemented.getInstance();
        }
        ChatRoomApiProvider.prototype.chat = function (room_id, target, sender_id, content, contentType, repalceMessageID) {
            var message = {};
            message["rid"] = room_id;
            message["content"] = content;
            message["sender"] = sender_id;
            message["target"] = target;
            message["type"] = contentType;
            pomelo.request("chat.chatHandler.send", message, function (result) {
                var data = JSON.parse(JSON.stringify(result));
                console.log("Chat msg response: ", data);
                if (repalceMessageID !== null)
                    repalceMessageID(null, data.data);
            });
        };
        ChatRoomApiProvider.prototype.chatFile = function (room_id, target, sender_id, fileUrl, contentType, setMessageID) {
            console.log("Send file to ", target);
            var message = {};
            message["rid"] = room_id;
            message["content"] = fileUrl;
            message["sender"] = sender_id;
            message["target"] = target;
            message["type"] = contentType;
            pomelo.request("chat.chatHandler.send", message, function (result) {
                var data = JSON.parse(JSON.stringify(result));
                console.log("chatFile callback: ", data);
                if (data.code == 200) {
                    if (setMessageID != null) {
                        setMessageID(null, data.data);
                    }
                }
                else {
                    console.error("WTF", "WTF god only know.");
                }
            });
        };
        ChatRoomApiProvider.prototype.getSyncDateTime = function (callback) {
            var message = {};
            message["token"] = this.serverImp.authenData.token;
            pomelo.request("chat.chatHandler.getSyncDateTime", message, function (result) {
                if (callback != null) {
                    callback(null, result);
                }
            });
        };
        ChatRoomApiProvider.prototype.getChatHistory = function (room_id, lastAccessTime, callback) {
            var message = {};
            message["rid"] = room_id;
            if (lastAccessTime != null) {
                message["lastAccessTime"] = lastAccessTime.toString();
            }
            pomelo.request("chat.chatHandler.getChatHistory", message, function (result) {
                if (callback !== null)
                    callback(null, result);
            });
        };
        ChatRoomApiProvider.prototype.getMessagesReaders = function () {
            var message = {};
            message["token"] = this.serverImp.authenData.token;
            pomelo.notify("chat.chatHandler.getMessagesReaders", message);
        };
        ChatRoomApiProvider.prototype.updateMessageReader = function (messageId, roomId) {
            var message = {};
            message["messageId"] = messageId;
            message["roomId"] = roomId;
            pomelo.notify("chat.chatHandler.updateWhoReadMessage", message);
        };
        ChatRoomApiProvider.prototype.updateMessageReaders = function (messageIds, roomId) {
            var message = {};
            message["messageIds"] = JSON.stringify(messageIds);
            message["roomId"] = roomId;
            pomelo.notify("chat.chatHandler.updateWhoReadMessages", message);
        };
        return ChatRoomApiProvider;
    })();
    ChatServer.ChatRoomApiProvider = ChatRoomApiProvider;
    var ServerEventListener = (function () {
        function ServerEventListener() {
        }
        ServerEventListener.prototype.addFrontendListener = function (obj) {
            this.frontendListener = obj;
        };
        ServerEventListener.prototype.addServerListener = function (obj) {
            this.serverListener = obj;
        };
        ServerEventListener.prototype.addChatListener = function (obj) {
            this.chatServerListener = obj;
        };
        ServerEventListener.prototype.addRTCListener = function (obj) {
            this.rtcCallListener = obj;
        };
        ServerEventListener.prototype.addListenner = function (resolve, rejected) {
            this.callFrontendServer();
            this.callChatServer();
            this.callRTCEvents();
            this.callServerEvents();
            resolve();
        };
        ServerEventListener.prototype.callFrontendServer = function () {
            var self = this;
            pomelo.on(ServerEventListener.ON_GET_ME, function (data) {
                console.log(ServerEventListener.ON_GET_ME, JSON.stringify(data));
                self.frontendListener.onGetMe(data);
            });
            pomelo.on(ServerEventListener.ON_GET_COMPANY_INFO, function (data) {
                console.log(ServerEventListener.ON_GET_COMPANY_INFO, JSON.stringify(data));
                self.frontendListener.onGetCompanyInfo(data);
            });
            pomelo.on(ServerEventListener.ON_GET_ORGANIZE_GROUPS, function (data) {
                console.log(ServerEventListener.ON_GET_ORGANIZE_GROUPS, JSON.stringify(data));
                self.frontendListener.onGetOrganizeGroupsComplete(data);
            });
            pomelo.on(ServerEventListener.ON_GET_COMPANY_MEMBERS, function (data) {
                console.log(ServerEventListener.ON_GET_COMPANY_MEMBERS, JSON.stringify(data));
                self.frontendListener.onGetCompanyMemberComplete(data);
            });
            pomelo.on(ServerEventListener.ON_GET_PRIVATE_GROUPS, function (data) {
                console.log(ServerEventListener.ON_GET_PRIVATE_GROUPS, JSON.stringify(data));
                self.frontendListener.onGetPrivateGroupsComplete(data);
            });
            pomelo.on(ServerEventListener.ON_GET_PROJECT_BASE_GROUPS, function (data) {
                console.log(ServerEventListener.ON_GET_PROJECT_BASE_GROUPS, JSON.stringify(data));
                self.frontendListener.onGetProjectBaseGroupsComplete(data);
            });
        };
        ServerEventListener.prototype.callChatServer = function () {
            var self = this;
            pomelo.on(ServerEventListener.ON_CHAT, function (data) {
                console.log(ServerEventListener.ON_CHAT, JSON.stringify(data));
                self.chatServerListener.onChat(data);
            });
            pomelo.on(ServerEventListener.ON_LEAVE, function (data) {
                console.log(ServerEventListener.ON_LEAVE, JSON.stringify(data));
                self.chatServerListener.onLeaveRoom(data);
            });
            pomelo.on(ServerEventListener.ON_MESSAGE_READ, function (data) {
                console.log(ServerEventListener.ON_MESSAGE_READ, JSON.stringify(data));
                self.chatServerListener.onMessageRead(data);
            });
            pomelo.on(ServerEventListener.ON_GET_MESSAGES_READERS, function (data) {
                console.log(ServerEventListener.ON_GET_MESSAGES_READERS, JSON.stringify(data));
                self.chatServerListener.onGetMessagesReaders(data);
            });
        };
        ServerEventListener.prototype.callRTCEvents = function () {
            var self = this;
            pomelo.on(ServerEventListener.ON_VIDEO_CALL, function (data) {
                console.log(ServerEventListener.ON_VIDEO_CALL, JSON.stringify(data));
                self.rtcCallListener.onVideoCall(data);
            });
            pomelo.on(ServerEventListener.ON_VOICE_CALL, function (data) {
                console.log(ServerEventListener.ON_VOICE_CALL, JSON.stringify(data));
                self.rtcCallListener.onVoiceCall(data);
            });
            pomelo.on(ServerEventListener.ON_HANGUP_CALL, function (data) {
                console.log(ServerEventListener.ON_HANGUP_CALL, JSON.stringify(data));
                self.rtcCallListener.onHangupCall(data);
            });
            pomelo.on(ServerEventListener.ON_THE_LINE_IS_BUSY, function (data) {
                console.log(ServerEventListener.ON_THE_LINE_IS_BUSY, JSON.stringify(data));
                self.rtcCallListener.onTheLineIsBusy(data);
            });
        };
        ServerEventListener.prototype.callServerEvents = function () {
            var self = this;
            pomelo.on(ServerEventListener.ON_ACCESS_ROOMS, function (data) {
                console.log(ServerEventListener.ON_ACCESS_ROOMS, JSON.stringify(data));
                self.serverListener.onAccessRoom(data);
            });
            pomelo.on(ServerEventListener.ON_ADD_ROOM_ACCESS, function (data) {
                console.log(ServerEventListener.ON_ADD_ROOM_ACCESS, JSON.stringify(data));
                self.serverListener.onAddRoomAccess(data);
            });
            pomelo.on(ServerEventListener.ON_UPDATED_LASTACCESSTIME, function (data) {
                console.log(ServerEventListener.ON_UPDATED_LASTACCESSTIME, JSON.stringify(data));
                self.serverListener.onUpdatedLastAccessTime(data);
            });
            pomelo.on(ServerEventListener.ON_USER_UPDATE_PROFILE, function (data) {
                console.log(ServerEventListener.ON_USER_UPDATE_PROFILE, JSON.stringify(data));
                self.serverListener.onUserUpdateProfile(data);
            });
            pomelo.on(ServerEventListener.ON_USER_UPDATE_IMAGE_PROFILE, function (data) {
                console.log(ServerEventListener.ON_USER_UPDATE_IMAGE_PROFILE, JSON.stringify(data));
                self.serverListener.onUserUpdateImageProfile(data);
            });
            pomelo.on(ServerEventListener.ON_CREATE_GROUP_SUCCESS, function (data) {
                console.log(ServerEventListener.ON_CREATE_GROUP_SUCCESS, JSON.stringify(data));
                self.serverListener.onCreateGroupSuccess(data);
            });
            pomelo.on(ServerEventListener.ON_EDITED_GROUP_MEMBER, function (data) {
                console.log(ServerEventListener.ON_EDITED_GROUP_MEMBER, JSON.stringify(data));
                self.serverListener.onEditedGroupMember(data);
            });
            pomelo.on(ServerEventListener.ON_EDITED_GROUP_NAME, function (data) {
                console.log(ServerEventListener.ON_EDITED_GROUP_NAME, JSON.stringify(data));
                self.serverListener.onEditedGroupName(data);
            });
            pomelo.on(ServerEventListener.ON_EDITED_GROUP_IMAGE, function (data) {
                console.log(ServerEventListener.ON_EDITED_GROUP_IMAGE, JSON.stringify(data));
                self.serverListener.onEditedGroupImage(data);
            });
            pomelo.on(ServerEventListener.ON_NEW_GROUP_CREATED, function (data) {
                console.log(ServerEventListener.ON_NEW_GROUP_CREATED, JSON.stringify(data));
                self.serverListener.onNewGroupCreated(data);
            });
            pomelo.on(ServerEventListener.ON_UPDATE_MEMBER_INFO_IN_PROJECTBASE, function (data) {
                console.log(ServerEventListener.ON_UPDATE_MEMBER_INFO_IN_PROJECTBASE, JSON.stringify(data));
                self.serverListener.onUpdateMemberInfoInProjectBase(data);
            });
        };
        ServerEventListener.ON_ADD = "onAdd";
        ServerEventListener.ON_LEAVE = "onLeave";
        ServerEventListener.ON_CHAT = "onChat";
        ServerEventListener.ON_MESSAGE_READ = "onMessageRead";
        ServerEventListener.ON_GET_MESSAGES_READERS = "onGetMessagesReaders";
        ServerEventListener.ON_VIDEO_CALL = "onVideoCall";
        ServerEventListener.ON_VOICE_CALL = "onVoiceCall";
        ServerEventListener.ON_HANGUP_CALL = "onHangupCall";
        ServerEventListener.ON_THE_LINE_IS_BUSY = "onTheLineIsBusy";
        ServerEventListener.ON_ACCESS_ROOMS = "onAccessRooms";
        ServerEventListener.ON_ADD_ROOM_ACCESS = "onAddRoomAccess";
        ServerEventListener.ON_UPDATED_LASTACCESSTIME = "onUpdatedLastAccessTime";
        ServerEventListener.ON_CREATE_GROUP_SUCCESS = "onCreateGroupSuccess";
        ServerEventListener.ON_EDITED_GROUP_MEMBER = "onEditGroupMembers";
        ServerEventListener.ON_EDITED_GROUP_NAME = "onEditGroupName";
        ServerEventListener.ON_EDITED_GROUP_IMAGE = "onEditGroupImage";
        ServerEventListener.ON_NEW_GROUP_CREATED = "onNewGroupCreated";
        ServerEventListener.ON_UPDATE_MEMBER_INFO_IN_PROJECTBASE = "onUpdateMemberInfoInProjectBase";
        ServerEventListener.ON_USER_UPDATE_IMAGE_PROFILE = "onUserUpdateImgProfile";
        ServerEventListener.ON_USER_UPDATE_PROFILE = "onUserUpdateProfile";
        ServerEventListener.ON_GET_ME = "onGetMe";
        ServerEventListener.ON_GET_COMPANY_INFO = "onGetCompanyInfo";
        ServerEventListener.ON_GET_COMPANY_MEMBERS = "onGetCompanyMembers";
        ServerEventListener.ON_GET_PRIVATE_GROUPS = "onGetPrivateGroups";
        ServerEventListener.ON_GET_ORGANIZE_GROUPS = "onGetOrganizeGroups";
        ServerEventListener.ON_GET_PROJECT_BASE_GROUPS = "onGetProjectBaseGroups";
        return ServerEventListener;
    })();
    ChatServer.ServerEventListener = ServerEventListener;
})(ChatServer || (ChatServer = {}));
var SocketComponent = (function () {
    function SocketComponent() {
    }
    SocketComponent.prototype.disconnected = function (reason) {
        if (!!this.onDisconnect) {
            this.onDisconnect(reason);
        }
        else {
            console.warn("onDisconnected delegate is empty.");
        }
    };
    return SocketComponent;
})();
var MessageMeta = (function () {
    function MessageMeta() {
    }
    return MessageMeta;
})();
var Message = (function () {
    function Message() {
    }
    return Message;
})();
var CompanyInfo = (function () {
    function CompanyInfo() {
    }
    return CompanyInfo;
})();
var ContactInfo = (function () {
    function ContactInfo() {
    }
    return ContactInfo;
})();
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
    JobLevel[JobLevel["vice_president"] = 4] = "vice_president";
})(JobLevel || (JobLevel = {}));
var Member = (function () {
    function Member() {
        this.role = MemberRole.member;
    }
    return Member;
})();
var MemberRole;
(function (MemberRole) {
    MemberRole[MemberRole["member"] = 0] = "member";
    MemberRole[MemberRole["admin"] = 1] = "admin";
})(MemberRole || (MemberRole = {}));
var MinLocation = (function () {
    function MinLocation() {
    }
    return MinLocation;
})();
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
var Room = (function () {
    function Room() {
        this._visibility = true;
    }
    Object.defineProperty(Room.prototype, "visibility", {
        set: function (_boo) {
            this._visibility = _boo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "visibilty", {
        get: function () {
            return this._visibility;
        },
        enumerable: true,
        configurable: true
    });
    return Room;
})();
var RoomAccessData = (function () {
    function RoomAccessData() {
    }
    return RoomAccessData;
})();
;
var TokenDecode = (function () {
    function TokenDecode() {
    }
    return TokenDecode;
})();
var User = (function () {
    function User() {
    }
    return User;
})();
var UserRole;
(function (UserRole) {
    UserRole[UserRole["personnel"] = 0] = "personnel";
    UserRole[UserRole["section_chief"] = 1] = "section_chief";
    UserRole[UserRole["department_chief"] = 2] = "department_chief";
    UserRole[UserRole["division_chief"] = 3] = "division_chief";
    UserRole[UserRole["admin"] = 4] = "admin";
})(UserRole || (UserRole = {}));
;
var Dummy = (function () {
    function Dummy() {
        this.chatRoom = ChatServer.ChatRoomApiProvider.prototype;
        this.bots = [{ name: "test1@rfl.com", pass: "1234" }, { name: "test2@rfl.com", pass: "1234" },
            { name: "test3@rfl.com", pass: "1234" }, { name: "test4@rfl.com", pass: "1234" }, { name: "test5@rfl.com", pass: "1234" },
            { name: "test6@rfl.com", pass: "1234" }, { name: "test7@rfl.com", pass: "1234" }];
        this.serverApi = ChatServer.ServerImplemented.getInstance();
    }
    Dummy.prototype.getBot = function () {
        var r = Math.floor((Math.random() * this.bots.length) + 1);
        return this.bots[r];
    };
    Dummy.prototype.fireChatInRoom = function (myUid) {
        var _this = this;
        this.serverApi.JoinChatRoomRequest("55d5bb67451bbf090b0e8cde", function (err, res) {
            if (!err && res !== null) {
                setInterval(function () {
                    _this.chatRoom.chat("55d5bb67451bbf090b0e8cde", "bot", myUid, "test for bot", ContentType[ContentType.Text], function (err, res) {
                        console.log(res);
                    });
                }, 1000);
            }
        });
    };
    return Dummy;
})();
var SecureService = (function () {
    function SecureService() {
        this.key = "CHITCHAT!@#$%^&*()_+|===";
        this.passiv = "ThisIsUrPassword";
    }
    SecureService.prototype.hashCompute = function (content, callback) {
        require(["../js/crypto-js/crypto-js"], function (CryptoJS) {
            var hash = CryptoJS.MD5(content);
            var md = hash.toString(CryptoJS.enc.Hex);
            callback(null, md);
        });
    };
    SecureService.prototype.encryption = function (content, callback) {
        var self = this;
        require(["../js/crypto-js/crypto-js"], function (CryptoJS) {
            var ciphertext = CryptoJS.AES.encrypt(content, self.key);
            callback(null, ciphertext.toString());
        });
    };
    SecureService.prototype.decryption = function (content, callback) {
        var self = this;
        require(["../js/crypto-js/crypto-js"], function (CryptoJS) {
            var bytes = CryptoJS.AES.decrypt(content, self.key);
            var plaintext = bytes.toString(CryptoJS.enc.Utf8);
            callback(null, plaintext);
        });
    };
    SecureService.prototype.encryptWithSecureRandom = function (content, callback) {
        var self = this;
        require(["../js/crypto-js/crypto-js"], function (CryptoJS) {
            var key = CryptoJS.enc.Utf8.parse(self.key);
            var iv = CryptoJS.enc.Utf8.parse(self.passiv);
            var ciphertext = CryptoJS.AES.encrypt(content, key, { iv: iv });
            callback(null, ciphertext.toString());
        });
    };
    SecureService.prototype.decryptWithSecureRandom = function (content, callback) {
        var self = this;
        require(["../js/crypto-js/crypto-js"], function (CryptoJS) {
            var key = CryptoJS.enc.Utf8.parse(self.key);
            var iv = CryptoJS.enc.Utf8.parse(self.passiv);
            var bytes = CryptoJS.AES.decrypt(content, key, { iv: iv });
            var plaintext = bytes.toString(CryptoJS.enc.Utf8);
            if (!!plaintext)
                callback(null, plaintext);
            else
                callback(new Error("cannot decrypt content"), content);
        });
    };
    return SecureService;
})();
var HttpStatusCode = (function () {
    function HttpStatusCode() {
    }
    HttpStatusCode.success = 200;
    HttpStatusCode.fail = 500;
    HttpStatusCode.requestTimeout = 408;
    return HttpStatusCode;
})();
