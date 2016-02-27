
var pomelo;
var username: string = "";
var password: string = "";

module ChatServer {
    interface IDictionary {
        [k: string]: string;
    }

    interface IAuthenData {
        userId: string;
        token: string;
    }
    class AuthenData implements IAuthenData {
        userId: string;
        token: string;
    }

    export class ServerImplemented {
        private static Instance: ServerImplemented;
        public static getInstance(): ServerImplemented {
            if (this.Instance === null || this.Instance === undefined) {
                this.Instance = new ServerImplemented();
            }

            return this.Instance;
        }

        host: string;
        port: number;
        authenData: AuthenData;
        appConfig : any;
        _isInit = false;
        _isConnected = false;
        _isLogedin = false;
        socketComponent: SocketComponent;
        public setSocketComponent(socket: SocketComponent) {
            this.socketComponent = socket;
        }

        constructor() {
            console.warn("serv imp. constructor");
        }

        public getClient() {
            var self = this;
            if (pomelo !== null) {
                return pomelo;
            }
            else {
                console.warn("disconnect Event");
            }
        }

        public dispose() {
            console.warn("dispose socket client.");

            this.disConnect();

            this.authenData = null;
        }

        public disConnect() {
            console.log('disconnecting...');
            if (!!pomelo) {
                pomelo.removeAllListeners();
                pomelo.disconnect();
                pomelo = null;
            }
        }
       
        public logout() {
            var registrationId = localStorage.getItem("registrationId");
            var msg: IDictionary = {};
            msg["username"] = username;
            msg["registrationId"] = registrationId;
            if (pomelo != null)
                pomelo.notify("connector.entryHandler.logout", msg);

            this.disConnect();
        }

        public init(callback: (err, res) => void) {
            console.log('serverImp.init()');
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
        }

        private loadSocket(resolve, rejected) {
            require(['../js/pomelo/pomeloclient'], function (obj) {
                pomelo = obj;
                resolve();
            });
        }

        private loadConfig(callback: (err, res) => void) {
            var self = this;
            var promiseForFileConfig = new Promise(function (resolve, reject) {
                // This only is an example to create asynchronism
                $.ajax({
                    url: "configs/appconfig.json",
                    dataType: "json",
                    success: function (config) {
                        self.appConfig = JSON.parse(JSON.stringify(config));

                        resolve();
                    }, error: function (jqXHR, textStatus, errorThrown) {
                        console.error(jqXHR, textStatus, errorThrown);
                        reject(errorThrown);
                    }
                });
            }).then(function resolve(val) {
                self.host = self.appConfig.socketHost;
                self.port = self.appConfig.socketPort;
                if (!!pomelo) {
                    //<!-- Connecting gate server.
                    self.connectServer(self.host, self.port, (err) => {
                        callback(err, self);
                    });
                }
                else {
                    console.error("pomelo socket is un ready.");
                }
            }).catch(function onRejected(err) {
                console.log(err)
            });
        }
        
        private connectServer(_host: string, _port: number, callback: (err) => void) {
            console.log("socket connecting to: ", _host, _port);
            
            // var self = this;    
            pomelo.init({ host: _host, port: _port }, function cb(err) {
                console.log("socket init result: " + err);
                callback(err);
            });
        }

        public connectToConnectorServer(callback:(err, res) => void) {

        }

        // region <!-- Authentication...
        /// <summary>
        /// Connect to gate server then get query of connector server.
        /// </summary>
        public logIn(_username: string, _hash: string, callback: (err, res) => void) {
            var self = this;

            username = _username;
            password = _hash;

            localStorage.setItem("username", username);
            localStorage.setItem("password", password);

            if (pomelo !== null && this._isConnected === false) {
                var msg = { uid: username };
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
                                    self.authenForFrontendServer(callback);
                                }
                            });
                        }).catch((error) => {
                            console.error('Load socket fail!');
                        });
                    }
                });
            }
            else if (pomelo !== null && this._isConnected) {
                self.authenForFrontendServer(callback);
            }
        }

        //<!-- Authentication. request for token sign.
        private authenForFrontendServer(callback: (err, res) => void) {
            var self = this;
            var registrationId = localStorage.getItem("registrationId");
            var msg = { username: username, password: password, registrationId: registrationId };

            //if (SpartanTalkApplication.getSharedAppData().contains(INSTALLATION_ID)) {
            //    msg.put(INSTALLATION_ID, SpartanTalkApplication.getSharedAppData().getString(INSTALLATION_ID, ""));
            //}

            //<!-- Authentication.
            pomelo.request("connector.entryHandler.login", msg, (res) => {
                console.log("login response: ", JSON.stringify(res), res.code);

                if (res.code === HttpStatusCode.fail) {
                    if (callback != null) {
                        callback(res.message, res);
                    }
                }
                else if (res.code === HttpStatusCode.success) {
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

        public kickMeAllSession(uid: string) {
            if (pomelo !== null) {
                var msg = { uid: uid };
                pomelo.request("connector.entryHandler.kickMe", msg, function (result) {
                    console.log("kickMe", JSON.stringify(result));
                });
            }
        }

        //<@--- ServerAPIProvider.

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

        public getLastAccessRoomsInfo(callback: Function) {
            var msg: IDictionary = {};
            msg["token"] = this.authenData.token;
            //<!-- Get user info.
            pomelo.request("connector.entryHandler.getLastAccessRooms", msg, (result) => {
                if (callback !== null) {
                    callback(null, result);
                }
            });
        }

        public getMe(callback: (err, res) => void) {
            var msg: IDictionary = {};
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

        public updateFavoriteMember(editType: string, member: string, callback: (err, ress) => void) {
            var msg: IDictionary = {};
            msg["editType"] = editType;
            msg["member"] = member;
            msg["token"] = this.authenData.token;
            //<!-- Get user info.
            pomelo.request("auth.profileHandler.editFavoriteMembers", msg, (result) => {
                console.log("updateFavoriteMember: ", JSON.stringify(result));
                callback(null, result);
            });
        }

        public updateFavoriteGroups(editType: string, group: string, callback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["editType"] = editType;
            msg["group"] = group;
            msg["token"] = this.authenData.token;
            //<!-- Get user info.
            pomelo.request("auth.profileHandler.updateFavoriteGroups", msg, (result) => {
                console.log("updateFavoriteGroups: ", JSON.stringify(result));
                    callback(null, result);
            });
        }

        public updateClosedNoticeMemberList(editType: string, member: string, callback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["editType"] = editType;
            msg["member"] = member;
            msg["token"] = this.authenData.token;
            //<!-- Get user info.
            pomelo.request("auth.profileHandler.updateClosedNoticeUsers", msg, (result) => {
                console.log("updateClosedNoticeUsers: ", JSON.stringify(result));
                    callback(null, result);
            });
        }

        public updateClosedNoticeGroupsList(editType: string, group: string, callback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["editType"] = editType;
            msg["group"] = group;
            msg["token"] = this.authenData.token;
            //<!-- Get user info.
            pomelo.request("auth.profileHandler.updateClosedNoticeGroups", msg, (result) => {
                console.log("updateClosedNoticeGroups: ", JSON.stringify(result));
                    callback(null, result);
            });
        }
        
        public getMemberProfile(userId: string, callback: (err, res) => void) {
            var msg: IDictionary = {};
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
        public getCompanyInfo(callBack: (err, res) => void) {
            var msg: IDictionary = {};
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

        //endregion


        //region Project base.
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

        //endregion


        //region <!-- Private Group Room... -->
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
                console.log("JoinChatRoom: " + JSON.stringify(result));
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

        //endregion


        // region <!-- Web RTC Calling...
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////

        /// <summary>
        /// Videos the call requesting.
        /// - tell target client for your call requesting...
        /// </summary>
        public videoCallRequest(targetId: string, myRtcId: string, callback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["token"] = this.authenData.token;
            msg["targetId"] = targetId;
            msg["myRtcId"] = myRtcId;
            pomelo.request("connector.entryHandler.videoCallRequest", msg, (result) => {
                console.log("videoCallRequesting =>: " + JSON.stringify(result));
                if (callback != null)
                    callback(null, result);
            });
        }

        public voiceCallRequest(targetId: string, myRtcId: string, callback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["token"] = this.authenData.token;
            msg["targetId"] = targetId;
            msg["myRtcId"] = myRtcId;
            pomelo.request("connector.entryHandler.voiceCallRequest", msg, (result) => {
                console.log("voiceCallRequesting =>: " + JSON.stringify(result));

                if (callback != null)
                    callback(null, result);
            });
        }

        public hangupCall(myId: string, contactId: string) {
            var msg: IDictionary = {};
            msg["userId"] = myId;
            msg["contactId"] = contactId;
            msg["token"] = this.authenData.token;

            pomelo.request("connector.entryHandler.hangupCall", msg, (result) => {
                console.log("hangupCall: ", JSON.stringify(result));
            });
        }

        public theLineIsBusy(contactId: string) {
            var msg: IDictionary = {};
            msg["contactId"] = contactId;

            pomelo.request("connector.entryHandler.theLineIsBusy", msg, (result) => {
                console.log("theLineIsBusy response: " + JSON.stringify(result));
            });
        }

        //endregion
    }

    export class ChatRoomApiProvider {
        serverImp: ServerImplemented = ServerImplemented.getInstance();
        
        public chat(room_id: string, target: string, sender_id: string, content: string, contentType: string, callback: (err, res) => void) {
            var message: IDictionary = {};
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
        
        public chatFile(room_id: string, target: string, sender_id: string, fileUrl: string, contentType: string, meta: any, callback: (err, res) => void) {
            console.log("Send file to ", target);

            var message: IDictionary = {};
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

        public getSyncDateTime(callback: (err, res) => void) {
            var message: IDictionary = {};
            message["token"] = this.serverImp.authenData.token;
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
        public getChatHistory(room_id: string, lastAccessTime: Date, callback: (err, res) => void) {
            var message: IDictionary = {};
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
        
        public getMessagesReaders() {
            var message: IDictionary = {};
            message["token"] = this.serverImp.authenData.token;
            pomelo.notify("chat.chatHandler.getMessagesReaders", message);
        }

        public getMessageContent(messageId: string, callback: (err: Error, res: any) => void) {
            var message: IDictionary = {};
            message["messageId"] = messageId;
            pomelo.request("chat.chatHandler.getMessageContent", message, (result) => {
                if (!!callback) {
                    callback(null, result);
                }
            });
        }

        public updateMessageReader(messageId: string, roomId: string) {
            var message: IDictionary = {};
            message["messageId"] = messageId;
            message["roomId"] = roomId;
            pomelo.notify("chat.chatHandler.updateWhoReadMessage", message);
        }
        
        public updateMessageReaders(messageIds:string[], roomId:string) {
            var message : IDictionary = {};
            message["messageIds"] = JSON.stringify(messageIds);
            message["roomId"] = roomId;
            pomelo.notify("chat.chatHandler.updateWhoReadMessages", message);
        }
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
        //<!-- User -->
        public static ON_USER_LOGIN: string = "onUserLogin";
        public static ON_USER_UPDATE_IMAGE_PROFILE: string = "onUserUpdateImgProfile";
        public static ON_USER_UPDATE_PROFILE: string = "onUserUpdateProfile";
        //<!-- Frontend server --->
        public static ON_GET_ME: string = "onGetMe";
        public static ON_GET_COMPANY_INFO: string = "onGetCompanyInfo";
        public static ON_GET_COMPANY_MEMBERS: string = "onGetCompanyMembers";
        public static ON_GET_PRIVATE_GROUPS: string = "onGetPrivateGroups";
        public static ON_GET_ORGANIZE_GROUPS: string = "onGetOrganizeGroups";
        public static ON_GET_PROJECT_BASE_GROUPS: string = "onGetProjectBaseGroups";

        private chatServerListener: absSpartan.IChatServerListener;
        private frontendListener: absSpartan.IFrontendServerListener;
        private rtcCallListener: absSpartan.IRTCListener;
        private serverListener: absSpartan.IServerListener;
        public addFrontendListener(obj: absSpartan.IFrontendServerListener): void {
            this.frontendListener = obj;
        }
        public addServerListener(obj: absSpartan.IServerListener): void {
            this.serverListener = obj;
        }
        public addChatListener(obj: absSpartan.IChatServerListener): void {
            this.chatServerListener = obj;
        }
        public addRTCListener(obj: absSpartan.IRTCListener): void {
            this.rtcCallListener = obj;
        }

        constructor() {

        }

        public addListenner(resolve, rejected) {
            this.callFrontendServer();
            this.callChatServer();
            this.callRTCEvents();
            this.callServerEvents();

            resolve();
        }

        private callFrontendServer() {
            let self = this; 

            pomelo.on(ServerEventListener.ON_GET_ME, function(data) {
                console.log(ServerEventListener.ON_GET_ME, JSON.stringify(data));

                self.frontendListener.onGetMe(data);
            });
            pomelo.on(ServerEventListener.ON_GET_COMPANY_INFO, function(data) {
                console.log(ServerEventListener.ON_GET_COMPANY_INFO, JSON.stringify(data));

                self.frontendListener.onGetCompanyInfo(data);
            });
                
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
                console.log(ServerEventListener.ON_MESSAGE_READ, JSON.stringify(data));

                self.chatServerListener.onMessageRead(data);
            });

            pomelo.on(ServerEventListener.ON_GET_MESSAGES_READERS, (data) => {
                console.log(ServerEventListener.ON_GET_MESSAGES_READERS, JSON.stringify(data));

                self.chatServerListener.onGetMessagesReaders(data);
            });
        }

        private callRTCEvents() {
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

        private callServerEvents() {
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
}