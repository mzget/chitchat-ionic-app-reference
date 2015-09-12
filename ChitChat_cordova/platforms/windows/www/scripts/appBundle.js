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
            this.getClient();
        }
        ServerImplemented.prototype.getClient = function () {
            var self = this;
            if (this.pomelo !== null) {
                var client = require(['../js/pomelo/pomeloclient'], function (obj) {
                    console.log(obj);
                    self.pomelo = obj;
                });
                return this.pomelo;
            }
            else {
                console.log("disconnect Event");
            }
        };
        ServerImplemented.prototype.init = function () { };
        ServerImplemented.prototype.disConnect = function () {
            if (this.pomelo !== null) {
                this.pomelo.disconnect();
            }
            ServerImplemented.authenData = null;
        };
        ServerImplemented.prototype.connectSocketServer = function (_host, _port, callback) {
            console.log("connecting to: ", _host, _port);
            var self = this;
            this.pomelo.init({ host: _host, port: _port }, function (socket) {
                console.log("client.init : ", socket);
                callback();
                self.pomelo.on("disconnect", function (dataEvent) {
                    console.log("disconnect Event");
                    //if (connectionListen != null) {
                    //    connectionListen.connectionEvent("disconnect");
                    //}
                });
            });
        };
        // region <!-- Authentication...
        /// <summary>
        /// Connect to gate server then get query of connector server.
        /// </summary>
        ServerImplemented.prototype.logIn = function (username, passwordHash, callback) {
            var self = this;
            require(["../js/crypto-js/crypto-js"], function (CryptoJS) {
                var hash = CryptoJS.MD5(passwordHash);
                var md = hash.toString(CryptoJS.enc.Hex);
                ServerImplemented.username = username;
                ServerImplemented.password = md;
                if (self.pomelo !== null) {
                    self.connectSocketServer(self.host, self.port, function () {
                        //if (!IsLoginSuccess) {       
                        var msg = { uid: ServerImplemented.username };
                        self.pomelo.request("gate.gateHandler.queryEntry", msg, function (result) {
                            console.log("QueryConnectorServ", result);
                            if (result.code === 200) {
                                self.pomelo.disconnect();
                                var port = result.port;
                                self.connectSocketServer(self.host, port, function () {
                                    self.connectConnectorServer(callback);
                                });
                            }
                        });
                        //        });
                    });
                }
            });
        };
        //<!-- Authentication. request for token sign.
        ServerImplemented.prototype.connectConnectorServer = function (callback) {
            var self = this;
            var msg = { username: ServerImplemented.username, password: ServerImplemented.password };
            //if (SpartanTalkApplication.getSharedAppData().contains(INSTALLATION_ID)) {
            //    msg.put(INSTALLATION_ID, SpartanTalkApplication.getSharedAppData().getString(INSTALLATION_ID, ""));
            //}
            //<!-- Authentication.
            self.pomelo.request("connector.entryHandler.login", msg, function (res) {
                console.log("login: ", res, msg);
                if (res.code === 500) {
                    if (callback != null) {
                        callback(res.message, null);
                    }
                    self.pomelo.disconnect();
                }
                else {
                    ServerImplemented.authenData = new AutheData();
                    ServerImplemented.authenData.userId = res.uid;
                    ServerImplemented.authenData.token = res.token;
                    if (callback != null) {
                        callback(null, res);
                    }
                }
            });
        };
        ServerImplemented.prototype.UpdateUserProfile = function (myId, profileFields, callback) {
            profileFields["token"] = ServerImplemented.authenData.token;
            profileFields["_id"] = myId;
            this.pomelo.request("auth.profileHandler.profileUpdate", profileFields, function (result) {
                if (callback != null) {
                    callback(null, result);
                }
            });
        };
        ServerImplemented.prototype.ProfileImageChanged = function (userId, path, callback) {
            var msg = {};
            msg["token"] = ServerImplemented.authenData.token;
            msg["userId"] = userId;
            msg["path"] = path;
            this.pomelo.request("auth.profileHandler.profileImageChanged", msg, function (result) {
                if (callback != null) {
                    callback(null, result);
                }
            });
        };
        ServerImplemented.prototype.GetLastAccessRoomsInfo = function (userId) {
            var msg = {};
            msg["id"] = userId;
            msg["token"] = ServerImplemented.authenData.token;
            //<!-- Get user info.
            this.pomelo.request("connector.entryHandler.getLastAccessRooms", msg, function (result) {
            });
        };
        ServerImplemented.prototype.GetMe = function (callback) {
            var msg = {};
            msg["username"] = ServerImplemented.username;
            msg["password"] = ServerImplemented.password;
            msg["token"] = ServerImplemented.authenData.token;
            console.log("username:", ServerImplemented.username);
            //<!-- Get user info.
            this.pomelo.request("connector.entryHandler.getMe", msg, function (result) {
                console.log("getMe: ", result);
                if (result.code === 500) {
                    callback(result.message, null);
                }
                else {
                    callback(null, result);
                }
            });
        };
        return ServerImplemented;
    })();
    ChatServer.ServerImplemented = ServerImplemented;
    var ServerEventListener = (function () {
        function ServerEventListener() {
        }
        ServerEventListener.prototype.addListenner = function () {
            var self = this;
            var pomelo = ServerImplemented.prototype.getClient();
            //wait message from the server.
            pomelo.on(ServerEventListener.ON_CHAT, function (data) {
                console.log(ServerEventListener.ON_CHAT, data);
                self.onChatListener.onChatData(data);
            });
        };
        ServerEventListener.ON_ADD = "onAdd";
        ServerEventListener.ON_LEAVE = "onLeave";
        ServerEventListener.ON_CHAT = "onChat";
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
        ServerEventListener.ON_MESSAGE_READ = "onMessageRead";
        ServerEventListener.ON_GET_MESSAGES_READERS = "onGetMessagesReaders";
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
//# sourceMappingURL=appBundle.js.map