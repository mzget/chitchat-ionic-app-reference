var pomelo;
var username: string = "";
var password: string = "";

var getPomelo = require(['../js/pomelo/pomeloclient'], function (obj) {
    pomelo = obj;
});

module ChatServer {
    interface IDictionary {
        [k: string]: string;
    }

    interface IAuthenData {
        userId: string;
        token: string;
    }
    class AutheData implements IAuthenData {
        userId: string;
        token: string;
    }

    export class ServerImplemented {
        host: string = "git.animation-genius.com";
        port: number = 3014;
        authenData: AutheData;

        public getClient() {
            var self = this;
            if (pomelo !== null) {
                return pomelo;
            }
            else {
                console.warn("disconnect Event");
                
                //if (connectionListen != null) {
                //    connectionListen.connectionEvent("disconnect");
                //}

                //return new PomeloClient(instance.host, instance.port);
            }
        }

        constructor() {
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

        public init(callback: Function) {
            var self = this;
            if (pomelo !== null) {
                self.connectSocketServer(self.host, self.port, () => {
                    callback();
                });
            }
        }

        public disConnect() {
            if (pomelo !== null) {
                pomelo.disconnect();
            }

            this.authenData = null;
        }

        private connectSocketServer(_host: string, _port: number, callback: Function) {
            console.log("connecting to: ", _host, _port);
            var self = this;

            pomelo.init({ host: _host, port: _port }, function (socket) {
                console.log("client.init : ", socket);
                callback();

                //pomelo.on("disconnect", function (dataEvent) {
                    //console.error("disconnect Event", dataEvent);
                    //if (connectionListen != null) {
                    //    connectionListen.connectionEvent("disconnect");
                    //}
                //});
            });
        }

        // region <!-- Authentication...
        /// <summary>
        /// Connect to gate server then get query of connector server.
        /// </summary>
        public logIn(_username: string, passwordHash: string, callback: (err, res) => void) {
            var self = this;

            require(["../js/crypto-js/crypto-js"], function (CryptoJS) {
                var hash = CryptoJS.MD5(passwordHash);
                var md = hash.toString(CryptoJS.enc.Hex);

                username = _username;
                password = md;

                localStorage.setItem("username", username);
                localStorage.setItem("password", password);

                if (pomelo !== null) {
                    var msg = { uid: username };

                    pomelo.request("gate.gateHandler.queryEntry", msg, function (result) {

                        console.log("QueryConnectorServ", result);

                        if (result.code === 200) {
                            pomelo.disconnect();

                            var port = result.port;
                            self.connectSocketServer(self.host, port, () => {
                                self.connectConnectorServer(callback);
                            });
                        }
                    });
                }
            });
        }

        //<!-- Authentication. request for token sign.
        connectConnectorServer(callback: (err, res) => void) {
            var self = this;
            var msg = { username: username, password: password };

            console.log("login:", msg.username, msg.password);

            //if (SpartanTalkApplication.getSharedAppData().contains(INSTALLATION_ID)) {
            //    msg.put(INSTALLATION_ID, SpartanTalkApplication.getSharedAppData().getString(INSTALLATION_ID, ""));
            //}

            //<!-- Authentication.
            pomelo.request("connector.entryHandler.login", msg, (res) => {
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
        }
        
        //region <!-- user profile -->

        public UpdateUserProfile(myId: string, profileFields: { [k: string]: string }, callback: (err, res) => void) {
            profileFields["token"] = this.authenData.token;
            profileFields["_id"] = myId;
            pomelo.request("auth.profileHandler.profileUpdate", profileFields, (result) => {
                if (callback != null) {
                    callback(null, result);
                }
            });
        }

        public ProfileImageChanged(userId: string, path: string, callback: (err, res) => void) {
            var msg: { [k: string]: string } = {};
            msg["token"] = this.authenData.token;
            msg["userId"] = userId;
            msg["path"] = path;
            pomelo.request("auth.profileHandler.profileImageChanged", msg, (result) => {
                if (callback != null) {
                    callback(null, result);
                }
            });
        }

        public GetLastAccessRoomsInfo(userId: string) {
            var msg: IDictionary = {};
            msg["id"] = userId;
            msg["token"] = this.authenData.token;
            //<!-- Get user info.
            pomelo.request("connector.entryHandler.getLastAccessRooms", msg, (result) => {
            });
        }

        public getMe(callback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["username"] = username;
            msg["password"] = password;
            msg["token"] = this.authenData.token;
            //<!-- Get user info.
            pomelo.request("connector.entryHandler.getMe", msg, (result) => {
                console.log("getMe: ", JSON.stringify(result));
                if (result.code === 500) {
                    callback(result.message, null);
                    //                    if (OnLoginComplete != null)
                    //                        OnLoginComplete (false);
                } else {
                    callback(null, result);
                }
            });
        }

        public TokenAuthen(tokenBearer: string, checkTokenCallback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["token"] = tokenBearer;
            pomelo.request("gate.gateHandler.authenGateway", msg, (result) => {
                this.OnTokenAuthenticate(result, checkTokenCallback);
            });
        }

        private OnTokenAuthenticate(tokenRes: any, onSuccessCheckToken: (err, res) => void) {
            if (tokenRes.code === 200) {
                var data = tokenRes.data;
                var decode = data.decoded; //["decoded"];
                var decodedModel: TokenDecode = JSON.parse(JSON.stringify(decode));
                if (onSuccessCheckToken != null)
                    onSuccessCheckToken(null, { success: true, username: decodedModel.username, password: decodedModel.password });
            }
            else {
                if (onSuccessCheckToken != null)
                    onSuccessCheckToken(null, null);
            }
        }

        //endregion <!-- end user profile section. -->



        //region <!-- Company data. -->

        /// <summary>
        /// Gets the company info.
        /// Beware for data loading so mush. please load from cache before load from server.
        /// </summary>
        public getCompanyInfo(callBack: (err, res) => void) {
            var msg: IDictionary = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getCompanyInfo", msg, (result) => {
                console.log("getCompanyInfo", JSON.stringify(result));
                if (callBack != null)
                    callBack(null, result);
            });
        }

        /// <summary>
        /// Gets the company members.
        /// Beware for data loading so mush. please load from cache before load from server.
        /// </summary>
        public getCompanyMembers(callBack: (err, res) => void) {
            var msg: IDictionary = {};
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
        public getOrganizationGroups(callBack: (err, res) => void) {
            var msg: IDictionary = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getCompanyChatRoom", msg, (result) => {
                console.log("getOrganizationGroups: " + JSON.stringify(result));
                if (callBack != null)
                    callBack(null, result);
            });
        }

        //endregion <!-- Company data. 


        //region <!-- Group && Project base. -->

        public getProjectBaseGroups(callback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getProjectBaseGroups", msg, (result) => {
                console.log("getProjectBaseGroups: " + JSON.stringify(result));
                if (callback != null)
                    callback(null, result);
            });
        }

        public requestCreateProjectBaseGroup(groupName: string, members: Member[], callback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["token"] = this.authenData.token;
            msg["groupName"] = groupName;
            msg["members"] = JSON.stringify(members);
            pomelo.request("chat.chatRoomHandler.requestCreateProjectBase", msg, (result) => {
                console.log("requestCreateProjectBaseGroup: " + JSON.stringify(result));
                if (callback != null)
                    callback(null, result);
            });
        }


        public editMemberInfoInProjectBase(roomId: string, roomType: RoomType, member: Member, callback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["token"] = this.authenData.token;
            msg["roomId"] = roomId;
            msg["roomType"] = roomType.toString();
            msg["member"] = JSON.stringify(member);
            pomelo.request("chat.chatRoomHandler.editMemberInfoInProjectBase", msg, (result) => {
                if (callback != null)
                    callback(null, result);
            });
        }

        //endregion <!-- Group && Project base. -->



        //region <!-- Group && Private Chat Room... -->
        //*********************************************************************************

        /// <summary>
        /// Gets the public group chat rooms.
        /// Beware for data loading so mush. please load from cache before load from server.
        /// </summary>
        /// <param name="callback">Callback.</param>

        public getPrivateGroups(callback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["token"] = this.authenData.token;
            pomelo.request("connector.entryHandler.getMyPrivateGroupChat", msg, (result) => {
                console.log("getPrivateGroups: " + JSON.stringify(result));
                if (callback != null) {
                    callback(null, result);
                }
            });
        }

        public UserRequestCreateGroupChat(groupName: string, memberIds: string[], callback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["token"] = this.authenData.token;
            msg["groupName"] = groupName;
            msg["memberIds"] = JSON.stringify(memberIds);
            pomelo.request("chat.chatRoomHandler.userCreateGroupChat", msg, (result) => {
                console.log("RequestCreateGroupChat", JSON.stringify(result));

                if (callback != null)
                    callback(null, result);
            });
        }

        public UpdatedGroupImage(groupId: string, path: string, callback: (err, res) => void) {
            var msg: IDictionary = {};
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

        public editGroupMembers(editType: string, roomId: string, roomType: RoomType, members: string[], callback: (err, res) => void) {
            if (editType == null || editType.length === 0) return;
            if (roomId == null || roomId.length === 0) return;
            if (roomType === null) return;
            if (members == null || members.length === 0) return;

            var msg: IDictionary = {};
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

        public editGroupName(roomId: string, roomType: RoomType, newGroupName: string, callback: (err, res) => void) {
            if (roomId == null || roomId.length === 0) return;
            if (roomType === null) return;
            if (newGroupName == null || newGroupName.length === 0) return;

            var msg: IDictionary = {};
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
        public getPrivateChatRoomId(myId: string, myRoommateId: string, callback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["token"] = this.authenData.token;
            msg["ownerId"] = myId;
            msg["roommateId"] = myRoommateId;
            pomelo.request("chat.chatRoomHandler.getRoomById", msg, (result) => {
                console.log("getPrivateChatRoomId", result.toString());

                if (callback != null) {
                    callback(null, result);
                }
            });
        }

        //<!-- Join and leave chat room.
        public JoinChatRoomRequest(room_id: string, callback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["token"] = this.authenData.token;
            msg["rid"] = room_id;
            msg["username"] = username;
            pomelo.request("connector.entryHandler.enterRoom", msg, (result) => {
                console.log("JoinChatRequest: " + result);
                if (callback !== null) {
                    callback(null, result);
                }
            });
        }

        public LeaveChatRoomRequest(roomId: string, callback: (err, res) => void) {
            var msg: IDictionary = {};
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
        public getRoomInfo(roomId: string, callback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["token"] = this.authenData.token;
            msg["roomId"] = roomId;

            pomelo.request("chat.chatRoomHandler.getRoomInfo", msg, (result) => {
                if (callback != null)
                    callback(null, result);
            });
        }

        public getUnreadMsgOfRoom(roomId: string, lastAccessTime: string, callback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["token"] = this.authenData.token;
            msg["roomId"] = roomId;
            msg["lastAccessTime"] = lastAccessTime;
            pomelo.request("chat.chatRoomHandler.getUnreadRoomMessage", msg, (result) => {
                if (callback != null) {
                    callback(null, result);
                }
            });
        }

        //endregion <!-- Group && Private Chat Room... -->
    }

    export class ServerEventListener {
        public static ON_ADD: string = "onAdd";
        public static ON_LEAVE: string = "onLeave";
        public static ON_CHAT: string = "onChat";
        public static ON_MESSAGE_READ: string = "onMessageRead";
        public static ON_GET_MESSAGES_READERS: string = "onGetMessagesReaders";

        public static ON_VIDEO_CALL: string = "onVideoCall";
        public static ON_VOICE_CALL: string = "onVoiceCall";
        public static ON_HANGUP_CALL: string = "onHangupCall";
        public static ON_THE_LINE_IS_BUSY: string = "onTheLineIsBusy";
        //<!-- AccessRoom Info -->
        public static ON_ACCESS_ROOMS: string = "onAccessRooms";
        public static ON_ADD_ROOM_ACCESS: string = "onAddRoomAccess";
        public static ON_UPDATED_LASTACCESSTIME: string = "onUpdatedLastAccessTime";
        //<!-- Group -->
        public static ON_CREATE_GROUP_SUCCESS: string = "onCreateGroupSuccess";
        public static ON_EDITED_GROUP_MEMBER: string = "onEditGroupMembers";
        public static ON_EDITED_GROUP_NAME: string = "onEditGroupName";
        public static ON_EDITED_GROUP_IMAGE: string = "onEditGroupImage";
        public static ON_NEW_GROUP_CREATED: string = "onNewGroupCreated";
        public static ON_UPDATE_MEMBER_INFO_IN_PROJECTBASE: string = "onUpdateMemberInfoInProjectBase";
        //<!-- User profile -->
        public static ON_USER_UPDATE_IMAGE_PROFILE: string = "onUserUpdateImgProfile";
        public static ON_USER_UPDATE_PROFILE: string = "onUserUpdateProfile";

        public static ON_GET_COMPANY_MEMBERS: string = "onGetCompanyMembers";
        public static ON_GET_PRIVATE_GROUPS: string = "onGetPrivateGroups";
        public static ON_GET_ORGANIZE_GROUPS: string = "onGetOrganizeGroups";
        public static ON_GET_PROJECT_BASE_GROUPS: string = "onGetProjectBaseGroups";

        public onChatListener: Services.IOnChatListener;
        public frontendListener: Services.IFrontendServerListener;
        public rtcCallListener: Services.IRTCListener;
        public serverListener: Services.IServerListener;

        constructor() {
            //this.frontendListener = new Services.FrontendServerListener();
            //this.onChatListener = new Services.ChatServerListener();
            //this.rtcCallListener = new Services.RTCListener();
            //this.serverListener = new Services.ServerListener();
        }

        public addListenner() {
            this.callFrontendServer();
            this.callChatServer();
            this.callRTCEvents();
            this.callServerEvents();
        }

        private callFrontendServer() {

            var self = this; 

            //wait message from the server.
            pomelo.on(ServerEventListener.ON_GET_ORGANIZE_GROUPS, function (data) {
                console.log(ServerEventListener.ON_GET_ORGANIZE_GROUPS, JSON.stringify(data));

                self.frontendListener.onGetOrganizeGroupsComplete(data);
            });
            pomelo.on(ServerEventListener.ON_GET_COMPANY_MEMBERS, data => {
                console.log(ServerEventListener.ON_GET_COMPANY_MEMBERS, JSON.stringify(data));

                self.frontendListener.onGetCompanyMemberComplete(data);
            });
            pomelo.on(ServerEventListener.ON_GET_PRIVATE_GROUPS, data => {
                console.log(ServerEventListener.ON_GET_PRIVATE_GROUPS, JSON.stringify(data));

                self.frontendListener.onGetPrivateGroupsComplete(data);
            });
            pomelo.on(ServerEventListener.ON_GET_PROJECT_BASE_GROUPS, data => {
                console.log(ServerEventListener.ON_GET_PROJECT_BASE_GROUPS, JSON.stringify(data));

                self.frontendListener.onGetProjectBaseGroupsComplete(data);
            });

        }

        private callChatServer() {
            var self = this;
            pomelo.on(ServerEventListener.ON_CHAT, function (data) {
                console.log(ServerEventListener.ON_CHAT, data);

                self.onChatListener.onChatData(data);
            });

            //pomelo.on(ServerEventListener.ON_ADD, (data) => {
            //    console.log(ServerEventListener.ON_ADD, data);
            //    self.onChatListener.on(data);
            //});

            pomelo.on(ServerEventListener.ON_LEAVE, (data) => {
                console.log(ServerEventListener.ON_LEAVE, data);

                self.onChatListener.onLeaveRoom(data);
            });

            pomelo.on(ServerEventListener.ON_MESSAGE_READ, (data) => {
                console.log(ServerEventListener.ON_MESSAGE_READ, data);

                self.onChatListener.onMessageRead(data);
            });

            pomelo.on(ServerEventListener.ON_GET_MESSAGES_READERS, (data) => {
                console.log(ServerEventListener.ON_GET_MESSAGES_READERS, data);

                self.onChatListener.onGetMessagesReaders(data);
            });
        }

        private callRTCEvents() {
            var self = this;

            pomelo.on(ServerEventListener.ON_VIDEO_CALL, (data) => {
                console.log(ServerEventListener.ON_VIDEO_CALL, data);

                self.rtcCallListener.onVideoCall(data);
            });
            pomelo.on(ServerEventListener.ON_VOICE_CALL, (data) => {
                console.log(ServerEventListener.ON_VOICE_CALL, data);

                self.rtcCallListener.onVoiceCall(data);
            });
            pomelo.on(ServerEventListener.ON_HANGUP_CALL, (data) => {
                console.log(ServerEventListener.ON_HANGUP_CALL, data);

                self.rtcCallListener.onHangupCall(data);
            });
            pomelo.on(ServerEventListener.ON_THE_LINE_IS_BUSY, (data) => {
                console.log(ServerEventListener.ON_THE_LINE_IS_BUSY, data);

                self.rtcCallListener.onTheLineIsBusy(data);
            });
        }

        private callServerEvents() {
            var self = this;

            //<!-- AccessRoom Info -->
            pomelo.on(ServerEventListener.ON_ACCESS_ROOMS, (data) => {
                console.log(ServerEventListener.ON_ACCESS_ROOMS, data);

                self.serverListener.onAccessRoom(data);
            });
            pomelo.on(ServerEventListener.ON_ADD_ROOM_ACCESS, (data) => {
                console.log(ServerEventListener.ON_ADD_ROOM_ACCESS, data);

                self.serverListener.onAddRoomAccess(data);
            });
            pomelo.on(ServerEventListener.ON_UPDATED_LASTACCESSTIME, (data) => {
                console.log(ServerEventListener.ON_UPDATED_LASTACCESSTIME, data);

                self.serverListener.onUpdatedLastAccessTime(data);
            });

            //<!-- User profile -->
            pomelo.on(ServerEventListener.ON_USER_UPDATE_PROFILE, (data) => {
                console.log(ServerEventListener.ON_USER_UPDATE_PROFILE, data);

                self.serverListener.onUserUpdateProfile(data);
            });
            pomelo.on(ServerEventListener.ON_USER_UPDATE_IMAGE_PROFILE, (data) => {
                console.log(ServerEventListener.ON_USER_UPDATE_IMAGE_PROFILE, data);

                self.serverListener.onUserUpdateImageProfile(data);
            });

            //<!-- Group -->
            pomelo.on(ServerEventListener.ON_CREATE_GROUP_SUCCESS, (data) => {
                console.log(ServerEventListener.ON_CREATE_GROUP_SUCCESS, data);

                self.serverListener.onCreateGroupSuccess(data);
            });
            pomelo.on(ServerEventListener.ON_EDITED_GROUP_MEMBER, (data) => {
                console.log(ServerEventListener.ON_EDITED_GROUP_MEMBER, data);

                self.serverListener.onEditedGroupMember(data);
            });
            pomelo.on(ServerEventListener.ON_EDITED_GROUP_NAME, (data) => {
                console.log(ServerEventListener.ON_EDITED_GROUP_NAME, data);

                self.serverListener.onEditedGroupName(data);
            });
            pomelo.on(ServerEventListener.ON_EDITED_GROUP_IMAGE, (data) => {
                console.log(ServerEventListener.ON_EDITED_GROUP_IMAGE, data);

                self.serverListener.onEditedGroupImage(data);
            });
            pomelo.on(ServerEventListener.ON_NEW_GROUP_CREATED, (data) => {
                console.log(ServerEventListener.ON_NEW_GROUP_CREATED, data);

                self.serverListener.onNewGroupCreated(data);
            });
            pomelo.on(ServerEventListener.ON_UPDATE_MEMBER_INFO_IN_PROJECTBASE, (data) => {
                console.log(ServerEventListener.ON_UPDATE_MEMBER_INFO_IN_PROJECTBASE, data);

                self.serverListener.onUpdateMemberInfoInProjectBase(data);
            });
        }
    }
}