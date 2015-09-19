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
        }
        function onPause() {
            // TODO: This application has been suspended. Save application state here.
            var serverImp = new ChatServer.ServerImplemented();
            serverImp.disConnect();
            console.error("disConnect");
        }
        function onResume() {
            // TODO: This application has been reactivated. Restore application state here.
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
// Directly call the RequireJS require() function and from here
// TypeScript's external module support takes over
//require(["../../scripts/server/serverImplemented"]);
var Main = (function () {
    function Main() {
        this.serverListener = new ChatServer.ServerEventListener();
        this.dataManager = new DataManager();
    }
    Main.prototype.getDataManager = function () {
        return this.dataManager;
    };
    Main.prototype.startChatServerListener = function () {
        this.serverListener.frontendListener = this.dataManager;
        this.serverListener.addListenner();
    };
    Main.prototype.getHashService = function (content, callback) {
        var hashService = new HashGenerator();
        hashService.hashCompute(content, callback);
    };
    Main.prototype.authenUser = function (server, email, password, callback) {
        var self = this;
        server.logIn(email, password, function (err, res) {
            if (!err && res !== null) {
                //<!-- Listen all event in the spartan world.
                self.startChatServerListener();
                server.getMe(function (err, res) {
                    if (err || res === null) {
                        console.error(err);
                    }
                    else {
                        if (res.code === 200) {
                            self.dataManager.setMyProfile(res.data);
                        }
                        callback();
                    }
                });
                server.getCompanyInfo(function (err, res) {
                    if (err || res === null) {
                        console.error(err);
                    }
                    else {
                        console.log("companyInfo: ", res);
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
            }
            else {
                console.log(err);
            }
        });
    };
    return Main;
})();
var pomelo;
var username = "";
var password = "";
require(['../js/pomelo/pomeloclient'], function (obj) {
    pomelo = obj;
});
var ChatServer;
(function (ChatServer) {
    var AutheData = (function () {
        function AutheData() {
        }
        return AutheData;
    })();
    var ServerImplemented = (function () {
        function ServerImplemented() {
            this.host = "git.animation-genius.com";
            this.port = 3014;
            username = localStorage.getItem("username");
            password = localStorage.getItem("password");
            var authen = localStorage.getItem("authen");
            if (authen !== null) {
                this.authenData = JSON.parse(authen);
            }
            else {
                this.authenData = new AutheData();
            }
        }
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
            var msg = {};
            msg["username"] = username;
            if (pomelo != null)
                pomelo.notify("connector.entryHandler.logout", msg);
            localStorage.clear();
            this.disConnect();
        };
        ServerImplemented.prototype.init = function (callback) {
            var self = this;
            if (pomelo !== null) {
                self.connectSocketServer(self.host, self.port, function () {
                    callback();
                });
            }
        };
        ServerImplemented.prototype.disConnect = function () {
            if (pomelo !== null) {
                pomelo.disconnect();
            }
            this.authenData = null;
        };
        ServerImplemented.prototype.connectSocketServer = function (_host, _port, callback) {
            console.log("connecting to: ", _host, _port);
            var self = this;
            pomelo.init({ host: _host, port: _port }, function (socket) {
                //console.log("client.init : ", socket);
                callback();
                //pomelo.on("disconnect", function (dataEvent) {
                //console.error("disconnect Event", dataEvent);
                //if (connectionListen != null) {
                //    connectionListen.connectionEvent("disconnect");
                //}
                //});
            });
        };
        // region <!-- Authentication...
        /// <summary>
        /// Connect to gate server then get query of connector server.
        /// </summary>
        ServerImplemented.prototype.logIn = function (_username, _hash, callback) {
            var self = this;
            username = _username;
            password = _hash;
            localStorage.setItem("username", username);
            localStorage.setItem("password", password);
            if (pomelo !== null) {
                var msg = { uid: username };
                pomelo.request("gate.gateHandler.queryEntry", msg, function (result) {
                    console.log("QueryConnectorServ", result);
                    if (result.code === 200) {
                        pomelo.disconnect();
                        var port = result.port;
                        self.connectSocketServer(self.host, port, function () {
                            self.connectConnectorServer(callback);
                        });
                    }
                });
            }
        };
        //<!-- Authentication. request for token sign.
        ServerImplemented.prototype.connectConnectorServer = function (callback) {
            var self = this;
            var msg = { username: username, password: password };
            //if (SpartanTalkApplication.getSharedAppData().contains(INSTALLATION_ID)) {
            //    msg.put(INSTALLATION_ID, SpartanTalkApplication.getSharedAppData().getString(INSTALLATION_ID, ""));
            //}
            //<!-- Authentication.
            pomelo.request("connector.entryHandler.login", msg, function (res) {
                console.log("login: ", JSON.stringify(res));
                if (res.code === 500) {
                    if (callback != null) {
                        callback(res.message, null);
                    }
                    pomelo.disconnect();
                }
                else {
                    self.authenData.userId = res.uid;
                    self.authenData.token = res.token;
                    localStorage.setItem("authen", JSON.stringify(self.authenData));
                    if (callback != null) {
                        callback(null, res);
                    }
                }
            });
        };
        //region <!-- user profile -->
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
        ServerImplemented.prototype.GetLastAccessRoomsInfo = function (userId) {
            var msg = {};
            msg["id"] = userId;
            msg["token"] = this.authenData.token;
            //<!-- Get user info.
            pomelo.request("connector.entryHandler.getLastAccessRooms", msg, function (result) {
            });
        };
        ServerImplemented.prototype.getMe = function (callback) {
            var msg = {};
            msg["username"] = username;
            msg["password"] = password;
            msg["token"] = this.authenData.token;
            //<!-- Get user info.
            pomelo.request("connector.entryHandler.getMe", msg, function (result) {
                console.log("getMe: ", JSON.stringify(result));
                if (result.code === 500) {
                    callback(result.message, null);
                }
                else {
                    callback(null, result);
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
                var decode = data.decoded; //["decoded"];
                var decodedModel = JSON.parse(JSON.stringify(decode));
                if (onSuccessCheckToken != null)
                    onSuccessCheckToken(null, { success: true, username: decodedModel.username, password: decodedModel.password });
            }
            else {
                if (onSuccessCheckToken != null)
                    onSuccessCheckToken(null, null);
            }
        };
        //endregion <!-- end user profile section. -->
        //region <!-- Company data. -->
        /// <summary>
        /// Gets the company info.
        /// Beware for data loading so mush. please load from cache before load from server.
        /// </summary>
        ServerImplemented.prototype.getCompanyInfo = function (callBack) {
            var msg = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getCompanyInfo", msg, function (result) {
                console.log("getCompanyInfo", JSON.stringify(result));
                if (callBack != null)
                    callBack(null, result);
            });
        };
        /// <summary>
        /// Gets the company members.
        /// Beware for data loading so mush. please load from cache before load from server.
        /// </summary>
        ServerImplemented.prototype.getCompanyMembers = function (callBack) {
            var msg = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getCompanyMember", msg, function (result) {
                console.log("getCompanyMembers", JSON.stringify(result));
                if (callBack != null)
                    callBack(null, result);
            });
        };
        /// <summary>
        /// Gets the company chat rooms.
        /// Beware for data loading so mush. please load from cache before load from server.
        /// </summary>
        ServerImplemented.prototype.getOrganizationGroups = function (callBack) {
            var msg = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getCompanyChatRoom", msg, function (result) {
                console.log("getOrganizationGroups: " + JSON.stringify(result));
                if (callBack != null)
                    callBack(null, result);
            });
        };
        //endregion <!-- Company data. 
        //region <!-- Group && Project base. -->
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
        //endregion <!-- Group && Project base. -->
        //region <!-- Group && Private Chat Room... -->
        //*********************************************************************************
        /// <summary>
        /// Gets the public group chat rooms.
        /// Beware for data loading so mush. please load from cache before load from server.
        /// </summary>
        /// <param name="callback">Callback.</param>
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
        /// <summary>
        /// Gets Private Chat Room.
        /// </summary>
        /// <param name="myId">My identifier.</param>
        /// <param name="myRoommateId">My roommate identifier.</param>
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
        //<!-- Join and leave chat room.
        ServerImplemented.prototype.JoinChatRoomRequest = function (room_id, callback) {
            var msg = {};
            msg["token"] = this.authenData.token;
            msg["rid"] = room_id;
            msg["username"] = username;
            pomelo.request("connector.entryHandler.enterRoom", msg, function (result) {
                console.log("JoinChatRequest: " + result);
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
        /// <summary>
        /// Gets the room info. For load Room info by room_id.
        /// </summary>
        /// <c> return data</c>
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
        return ServerImplemented;
    })();
    ChatServer.ServerImplemented = ServerImplemented;
    var ChatRoomApiProvider = (function () {
        function ChatRoomApiProvider() {
            this.serverImp = ServerImplemented.prototype;
        }
        ChatRoomApiProvider.prototype.chat = function (room_id, target, sender_id, content, contentType, repalceMessageID) {
            var message = {};
            message["rid"] = room_id;
            message["content"] = content;
            message["from"] = sender_id;
            message["target"] = target;
            message["type"] = contentType.toString();
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
            message["from"] = sender_id;
            message["target"] = target;
            message["type"] = contentType.toString();
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
        return ChatRoomApiProvider;
    })();
    ChatServer.ChatRoomApiProvider = ChatRoomApiProvider;
    var ServerEventListener = (function () {
        function ServerEventListener() {
            //this.frontendListener = new Services.FrontendServerListener();
            //this.onChatListener = new Services.ChatServerListener();
            //this.rtcCallListener = new Services.RTCListener();
            //this.serverListener = new Services.ServerListener();
        }
        ServerEventListener.prototype.addListenner = function () {
            this.callFrontendServer();
            this.callChatServer();
            this.callRTCEvents();
            this.callServerEvents();
        };
        ServerEventListener.prototype.callFrontendServer = function () {
            var self = this;
            //wait message from the server.
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
                console.log(ServerEventListener.ON_CHAT, data);
                self.onChatListener.onChatData(data);
            });
            //pomelo.on(ServerEventListener.ON_ADD, (data) => {
            //    console.log(ServerEventListener.ON_ADD, data);
            //    self.onChatListener.on(data);
            //});
            pomelo.on(ServerEventListener.ON_LEAVE, function (data) {
                console.log(ServerEventListener.ON_LEAVE, data);
                self.onChatListener.onLeaveRoom(data);
            });
            pomelo.on(ServerEventListener.ON_MESSAGE_READ, function (data) {
                console.log(ServerEventListener.ON_MESSAGE_READ, data);
                self.onChatListener.onMessageRead(data);
            });
            pomelo.on(ServerEventListener.ON_GET_MESSAGES_READERS, function (data) {
                console.log(ServerEventListener.ON_GET_MESSAGES_READERS, data);
                self.onChatListener.onGetMessagesReaders(data);
            });
        };
        ServerEventListener.prototype.callRTCEvents = function () {
            var self = this;
            pomelo.on(ServerEventListener.ON_VIDEO_CALL, function (data) {
                console.log(ServerEventListener.ON_VIDEO_CALL, data);
                self.rtcCallListener.onVideoCall(data);
            });
            pomelo.on(ServerEventListener.ON_VOICE_CALL, function (data) {
                console.log(ServerEventListener.ON_VOICE_CALL, data);
                self.rtcCallListener.onVoiceCall(data);
            });
            pomelo.on(ServerEventListener.ON_HANGUP_CALL, function (data) {
                console.log(ServerEventListener.ON_HANGUP_CALL, data);
                self.rtcCallListener.onHangupCall(data);
            });
            pomelo.on(ServerEventListener.ON_THE_LINE_IS_BUSY, function (data) {
                console.log(ServerEventListener.ON_THE_LINE_IS_BUSY, data);
                self.rtcCallListener.onTheLineIsBusy(data);
            });
        };
        ServerEventListener.prototype.callServerEvents = function () {
            var self = this;
            //<!-- AccessRoom Info -->
            pomelo.on(ServerEventListener.ON_ACCESS_ROOMS, function (data) {
                console.log(ServerEventListener.ON_ACCESS_ROOMS, data);
                self.serverListener.onAccessRoom(data);
            });
            pomelo.on(ServerEventListener.ON_ADD_ROOM_ACCESS, function (data) {
                console.log(ServerEventListener.ON_ADD_ROOM_ACCESS, data);
                self.serverListener.onAddRoomAccess(data);
            });
            pomelo.on(ServerEventListener.ON_UPDATED_LASTACCESSTIME, function (data) {
                console.log(ServerEventListener.ON_UPDATED_LASTACCESSTIME, data);
                self.serverListener.onUpdatedLastAccessTime(data);
            });
            //<!-- User profile -->
            pomelo.on(ServerEventListener.ON_USER_UPDATE_PROFILE, function (data) {
                console.log(ServerEventListener.ON_USER_UPDATE_PROFILE, data);
                self.serverListener.onUserUpdateProfile(data);
            });
            pomelo.on(ServerEventListener.ON_USER_UPDATE_IMAGE_PROFILE, function (data) {
                console.log(ServerEventListener.ON_USER_UPDATE_IMAGE_PROFILE, data);
                self.serverListener.onUserUpdateImageProfile(data);
            });
            //<!-- Group -->
            pomelo.on(ServerEventListener.ON_CREATE_GROUP_SUCCESS, function (data) {
                console.log(ServerEventListener.ON_CREATE_GROUP_SUCCESS, data);
                self.serverListener.onCreateGroupSuccess(data);
            });
            pomelo.on(ServerEventListener.ON_EDITED_GROUP_MEMBER, function (data) {
                console.log(ServerEventListener.ON_EDITED_GROUP_MEMBER, data);
                self.serverListener.onEditedGroupMember(data);
            });
            pomelo.on(ServerEventListener.ON_EDITED_GROUP_NAME, function (data) {
                console.log(ServerEventListener.ON_EDITED_GROUP_NAME, data);
                self.serverListener.onEditedGroupName(data);
            });
            pomelo.on(ServerEventListener.ON_EDITED_GROUP_IMAGE, function (data) {
                console.log(ServerEventListener.ON_EDITED_GROUP_IMAGE, data);
                self.serverListener.onEditedGroupImage(data);
            });
            pomelo.on(ServerEventListener.ON_NEW_GROUP_CREATED, function (data) {
                console.log(ServerEventListener.ON_NEW_GROUP_CREATED, data);
                self.serverListener.onNewGroupCreated(data);
            });
            pomelo.on(ServerEventListener.ON_UPDATE_MEMBER_INFO_IN_PROJECTBASE, function (data) {
                console.log(ServerEventListener.ON_UPDATE_MEMBER_INFO_IN_PROJECTBASE, data);
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
        //<!-- User profile -->
        ServerEventListener.ON_USER_UPDATE_IMAGE_PROFILE = "onUserUpdateImgProfile";
        ServerEventListener.ON_USER_UPDATE_PROFILE = "onUserUpdateProfile";
        ServerEventListener.ON_GET_COMPANY_MEMBERS = "onGetCompanyMembers";
        ServerEventListener.ON_GET_PRIVATE_GROUPS = "onGetPrivateGroups";
        ServerEventListener.ON_GET_ORGANIZE_GROUPS = "onGetOrganizeGroups";
        ServerEventListener.ON_GET_PROJECT_BASE_GROUPS = "onGetProjectBaseGroups";
        return ServerEventListener;
    })();
    ChatServer.ServerEventListener = ServerEventListener;
})(ChatServer || (ChatServer = {}));
var Services;
(function (Services) {
    var AbsChatServerListener = (function () {
        function AbsChatServerListener() {
        }
        AbsChatServerListener.prototype.onChatData = function (data) { };
        ;
        AbsChatServerListener.prototype.onLeaveRoom = function (data) { };
        ;
        AbsChatServerListener.prototype.onRoomJoin = function (data) { };
        ;
        AbsChatServerListener.prototype.onMessageRead = function (dataEvent) { };
        ;
        AbsChatServerListener.prototype.onGetMessagesReaders = function (dataEvent) { };
        ;
        return AbsChatServerListener;
    })();
    Services.AbsChatServerListener = AbsChatServerListener;
    var AbsFrontendServerListener = (function () {
        function AbsFrontendServerListener() {
        }
        return AbsFrontendServerListener;
    })();
    Services.AbsFrontendServerListener = AbsFrontendServerListener;
    ;
    var AbsRTCListener = (function () {
        function AbsRTCListener() {
        }
        return AbsRTCListener;
    })();
    Services.AbsRTCListener = AbsRTCListener;
    var AbsServerListener = (function () {
        function AbsServerListener() {
        }
        return AbsServerListener;
    })();
    Services.AbsServerListener = AbsServerListener;
})(Services || (Services = {}));
var DataManager = (function () {
    function DataManager() {
        this.orgGroups = {};
        this.projectBaseGroups = {};
        this.privateGroups = {};
        this.orgMembers = {};
    }
    DataManager.prototype.setMyProfile = function (data) {
        this.myProfile = JSON.parse(JSON.stringify(data));
    };
    DataManager.prototype.getMyProfile = function () {
        return this.myProfile;
    };
    DataManager.prototype.setMembers = function (data) {
    };
    DataManager.prototype.setCompanyInfo = function (data) {
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
    DataManager.prototype.onGetCompanyMemberComplete = function (dataEvent) {
        var _this = this;
        var member = JSON.parse(JSON.stringify(dataEvent));
        member.forEach(function (value) {
            if (!_this.orgMembers[value._id]) {
                _this.orgMembers[value._id] = value;
            }
            console.log("org_member: ", value);
        });
    };
    ;
    DataManager.prototype.onGetOrganizeGroupsComplete = function (dataEvent) {
        var _this = this;
        var rooms = JSON.parse(JSON.stringify(dataEvent));
        rooms.forEach(function (value) {
            if (!_this.orgGroups[value._id]) {
                _this.orgGroups[value._id] = value;
            }
            console.log("org_group: ", value);
        });
    };
    ;
    DataManager.prototype.onGetProjectBaseGroupsComplete = function (dataEvent) {
        var _this = this;
        var groups = JSON.parse(JSON.stringify(dataEvent));
        groups.forEach(function (value) {
            if (!_this.projectBaseGroups[value._id]) {
                _this.projectBaseGroups[value._id] = value;
            }
            console.log("project_base_groups: ", value);
        });
    };
    ;
    DataManager.prototype.onGetPrivateGroupsComplete = function (dataEvent) {
        var _this = this;
        var groups = JSON.parse(JSON.stringify(dataEvent));
        groups.forEach(function (value) {
            if (!_this.privateGroups[value._id]) {
                _this.privateGroups[value._id] = value;
            }
            console.log("private_groups: ", value);
        });
    };
    ;
    return DataManager;
})();
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
var Room = (function () {
    function Room() {
    }
    return Room;
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
var OrgMember = (function () {
    function OrgMember() {
    }
    return OrgMember;
})();
var HashGenerator = (function () {
    function HashGenerator() {
    }
    HashGenerator.prototype.hashCompute = function (content, callback) {
        require(["../js/crypto-js/crypto-js"], function (CryptoJS) {
            var hash = CryptoJS.MD5(content);
            var md = hash.toString(CryptoJS.enc.Hex);
            callback(null, md);
        });
    };
    return HashGenerator;
})();
//# sourceMappingURL=appBundle.js.map