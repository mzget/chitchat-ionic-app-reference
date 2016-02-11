/// <reference path="../typings/tsd.d.ts" />
requirejs.config({
    paths: {
        jquery: '../js/jquery.min',
        cryptojs: '../lib/crypto-js/crypto-js'
    }
});
// Directly call the RequireJS require() function and from here
// TypeScript's external module support takes over
//require(["../../scripts/server/serverImplemented"]);
var Main = (function () {
    function Main() {
    }
    Main.getInstance = function () {
        if (this.instance === null || this.instance === undefined) {
            this.instance = Main.prototype;
        }
        return this.instance;
    };
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
        console.log("getServerImp", this.serverImp);
        return this.serverImp;
    };
    Main.prototype.setServerImp = function (server) {
        this.serverImp = server;
        console.log("setServerImp", server);
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
        console.log("authenUser:", email);
        var self = this;
        server.logIn(email, password, function (err, loginRes) {
            callback(err, loginRes);
            if (!err && loginRes !== null && loginRes.code === HttpStatusCode.success) {
                //<!-- Listen all event in the spartan world.
                var promiseForAddListener = new Promise(function callback(resolve, rejected) {
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
                            console.log("companyInfo: ", JSON.stringify(res));
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
    };
    return Main;
})();
