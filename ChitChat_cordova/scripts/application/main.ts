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

class Main {
    private static instance: Main;
    public static getInstance(): Main {
        if (this.instance === null || this.instance === undefined) {
            this.instance = Main.prototype;
        }
        return this.instance;
    }


    private serverImp: ChatServer.ServerImplemented;
    private serverListener: ChatServer.ServerEventListener;
    private chatRoomApi: ChatServer.ChatRoomApiProvider;
    private dataManager: DataManager;
    public getDataManager(): DataManager {
        return this.dataManager;
    }
    public setDataManager(data: DataManager) {
        this.dataManager = data;
        this.dataListener = new DataListener(this.dataManager);
    }
    private dataListener: DataListener;
    public getDataListener(): DataListener {
        return this.dataListener;
    }
    public getServerImp(): ChatServer.ServerImplemented {
        console.log("getServerImp", this.serverImp);
        return this.serverImp;
    }
    public setServerImp(server: ChatServer.ServerImplemented) {
        this.serverImp = server;
        console.log("setServerImp", server);
    }
    public getChatRoomApi(): ChatServer.ChatRoomApiProvider {
        if (!this.chatRoomApi) {
            this.chatRoomApi = ChatServer.ChatRoomApiProvider.prototype;
        }

        return this.chatRoomApi;
    }
    public setServerListener(server: ChatServer.ServerEventListener) {
        this.serverListener = server;
    }

    public startChatServerListener(resolve, rejected) {
        this.serverListener.addFrontendListener(this.dataManager);
        this.serverListener.addServerListener(this.dataListener);
        this.serverListener.addChatListener(this.dataListener);

        this.serverListener.addListenner(resolve, rejected);
    }

    public getHashService(content: string, callback: (err, res) => void) {
        var hashService = new SecureService();
        hashService.hashCompute(content, callback);
    }
    public encodeService(content: string, callback: Function) {
        var crypto = new SecureService();
        crypto.encryptWithSecureRandom(content, callback);
    }
    public decodeService(content: string, callback: Function) {
        var crypto = new SecureService();
        crypto.decryptWithSecureRandom(content, callback);
    }

    public authenUser(server: ChatServer.ServerImplemented, email: string, password: string, callback: (err, res) => void) {
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
    }

    public onMyProfileReadyListener:(dataManager: DataManager) => void;
}