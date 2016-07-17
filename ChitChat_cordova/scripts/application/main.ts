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
    public authenReducer: AuthenReducer;
    public messageReducer: MessageDAL;
    public roomDAL: RoomDAL;
    public getMessageDAL(): MessageDAL {
        return this.messageReducer;
    }
    public setMessageReducer(store: MessageDAL) {
        this.messageReducer = store;
    }
    public setAuthReducer(store: AuthenReducer) {
        this.authenReducer = store;
    }
    public setRoomDAL(dal: RoomDAL) {
        this.roomDAL = dal;
    }
    public clearRoomDAL() {
        this.roomDAL.clearData(err => {
            console.error(err);
        });
    }
    public clearMessageReducer() {
        this.messageReducer.clearData((err) => {
            console.error(err);
        });
    }
    public clearAuthReducer() {
        this.authenReducer.clearData((err) => {
            console.error(err);
        });
    }
    public clearAllData() : Promise<any> {
        return new Promise((resolve, reject) => {
            localStorage.clear();
            this.clearAuthReducer();
            this.clearRoomDAL();
            this.clearMessageReducer();

            resolve();
        });
    }

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
        //console.log("getServerImp", this.serverImp);
        return this.serverImp;
    }
    public setServerImp(server: ChatServer.ServerImplemented) {
        this.serverImp = server;
        //console.log("setServerImp", server);
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

    public authenUser(server: ChatServer.ServerImplemented, email: string, password: string, deviceToken: string, callback: (err, res) => void) {
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

    public onMyProfileReadyListener: (dataManager: DataManager) => void;
}