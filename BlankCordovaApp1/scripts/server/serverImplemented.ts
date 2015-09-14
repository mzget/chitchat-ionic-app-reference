var pomelo = null;

var client = require(['../js/pomelo/pomeloclient'], function (obj) {
    console.log(obj);
    pomelo = obj;
});

//require(['pomelo-client'], function (photoService) {
//    var photoHtml = "";

//photoService.Init().then(function (images) {
//    images.forEach(function (item, index) {
//        var createNewRow = (index % 4 == 0);
//        if (createNewRow) {
//            if (index != 0) {
//                photoHtml += '</div>';
//            }
//            photoHtml += '<div class="row">';
//        }
//        photoHtml += '<div class="col-md-3"><img src="' + item + '" alt="" class="img-thumbnail"/></div>'

//        document.getElementById('photos').innerHTML = photoHtml;
//    })
//});
//});

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

        username: string;
        password: string;
        host: string = "git.animation-genius.com";
        port: number = 3014;
        authenData: AutheData;

        public getClient() {
            if (pomelo !== null)
                return pomelo;
            else {
                console.log("disconnect Event");
                //if (connectionListen != null) {
                //    connectionListen.connectionEvent("disconnect");
                //}

                //return new PomeloClient(instance.host, instance.port);
            }
        }

        constructor() {
        }

        public init() { }

        public disConnect() {
            if (pomelo !== null) {
                pomelo.disconnect();
            }

            this.authenData = null;
        }

        private connectSocketServer(_host: string, _port: number, callback: Function) {
            console.log("connecting to: ", _host, _port);
            pomelo.init({ host: _host, port: _port }, function (socket) {
                console.log("client.init : ", socket);
                callback();
                
                pomelo.on("disconnect", function (dataEvent) {
                    console.log("disconnect Event");
                    //if (connectionListen != null) {
                    //    connectionListen.connectionEvent("disconnect");
                    //}
                });
            });
        }

        // region <!-- Authentication...
        /// <summary>
        /// Connect to gate server then get query of connector server.
        /// </summary>
        public logIn(username: string, passwordHash: string, callback: (err, res) => void) {
            var self = this;

            require(["../js/crypto-js/crypto-js"], function (CryptoJS) {
                var hash = CryptoJS.MD5(passwordHash);
                var md = hash.toString(CryptoJS.enc.Hex);

                self.username = username;
                self.password = md;

                if (pomelo !== null) {
                    self.connectSocketServer(self.host, self.port, () => {
                        //if (!IsLoginSuccess) {       
                        var msg = { uid: self.username };

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
                        //        });
                    });
                }
            });
        }

        //<!-- Authentication. request for token sign.
        connectConnectorServer(callback: (err, res) => void) {
            var self = this;
            var msg = { username: this.username, password: this.password };

            //if (SpartanTalkApplication.getSharedAppData().contains(INSTALLATION_ID)) {
            //    msg.put(INSTALLATION_ID, SpartanTalkApplication.getSharedAppData().getString(INSTALLATION_ID, ""));
            //}

            //<!-- Authentication.
            pomelo.request("connector.entryHandler.login", msg, (res) => {
                console.log("login: ", res, msg);
                if (res.code === 500) {
                    if (callback != null) {
                        callback(res.message, null);
                    }
                    pomelo.disconnect();
                }
                else {
                    self.authenData = new AutheData();
                    self.authenData.userId = res.uid;
                    self.authenData.token = res.token;

                    if (callback != null) {
                        callback(null, res);
                    }
                }
            });
        }

        public UpdateUserProfile(myId: string, profileFields: { [k: string]: string }, callback: (err, res) => void) {
            profileFields["token"] = ServerImplemented.prototype.authenData.token;
            profileFields["_id"] = myId;
            pomelo.request("auth.profileHandler.profileUpdate", profileFields, (result) => {
                if (callback != null) {
                    callback(null, result);
                }
            });
        }

        public ProfileImageChanged(userId: string, path: string, callback: (err, res) => void) {
            var msg: { [k: string]: string } = {};
            msg["token"] = ServerImplemented.prototype.authenData.token;
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
            msg["token"] = ServerImplemented.prototype.authenData.token;
            //<!-- Get user info.
            pomelo.request("connector.entryHandler.getLastAccessRooms", msg, (result) => {
            });
        }

        public GetMe(callback: (err, res) => void) {
            var msg: IDictionary = {};
            msg["username"] = ServerImplemented.prototype.username;
            msg["password"] = ServerImplemented.prototype.password;
            msg["token"] = ServerImplemented.prototype.authenData.token;
            //<!-- Get user info.
            pomelo.request("connector.entryHandler.getMe", msg, (result) => {
                console.log("getMe: ", result);
                if (result.code === 500) {
                    callback(result.message, null);
                    //                    if (OnLoginComplete != null)
                    //                        OnLoginComplete (false);
                } else {
                    callback(null, result);
                }
            });
        }
    }

    interface IOnChatListener extends EventListener {
        onChatData(data);
        onLeaveRoom(data);
        onRoomJoin(data);
        onMessageRead(dataEvent);
        onGetMessagesReaders(dataEvent);
    }

    export class ServerEventListener {
        public static ON_ADD: string = "onAdd";
        public static ON_LEAVE: string = "onLeave";
        public static ON_CHAT: string = "onChat";

        public static ON_VIDEO_CALL: string = "onVideoCall";
        public static ON_VOICE_CALL: string = "onVoiceCall";
        public static ON_HANGUP_CALL: string = "onHangupCall";
        public static ON_THE_LINE_IS_BUSY: string = "onTheLineIsBusy";

        public static ON_ACCESS_ROOMS: string = "onAccessRooms";
        public static ON_ADD_ROOM_ACCESS: string = "onAddRoomAccess";
        public static ON_UPDATED_LASTACCESSTIME: string = "onUpdatedLastAccessTime";

        public static ON_CREATE_GROUP_SUCCESS: string = "onCreateGroupSuccess";
        public static ON_EDITED_GROUP_MEMBER: string = "onEditGroupMembers";
        public static ON_EDITED_GROUP_NAME: string = "onEditGroupName";
        public static ON_EDITED_GROUP_IMAGE: string = "onEditGroupImage";
        public static ON_NEW_GROUP_CREATED: string = "onNewGroupCreated";
        public static ON_UPDATE_MEMBER_INFO_IN_PROJECTBASE: string = "onUpdateMemberInfoInProjectBase";

        public static ON_MESSAGE_READ: string = "onMessageRead";
        public static ON_GET_MESSAGES_READERS: string = "onGetMessagesReaders";
        public static ON_USER_UPDATE_IMAGE_PROFILE: string = "onUserUpdateImgProfile";
        public static ON_USER_UPDATE_PROFILE: string = "onUserUpdateProfile";

        public static ON_GET_COMPANY_MEMBERS: string = "onGetCompanyMembers";
        public static ON_GET_PRIVATE_GROUPS: string = "onGetPrivateGroups";
        public static ON_GET_ORGANIZE_GROUPS: string = "onGetOrganizeGroups";
        public static ON_GET_PROJECT_BASE_GROUPS: string = "onGetProjectBaseGroups";

        public onChatListener: IOnChatListener;

        constructor() { }
        public addListenner() {
            var self = this;

            //wait message from the server.
            pomelo.on(ServerEventListener.ON_CHAT, function (data) {
                console.log(ServerEventListener.ON_CHAT, data);

                self.onChatListener.onChatData(data);
            });
        }
    }
}