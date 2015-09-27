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

class Main {
    private serverListener = new ChatServer.ServerEventListener();
    private dataManager: DataManager;
    public getDataManager(): DataManager {
        return this.dataManager;
    }
    private dataListener: DataListener;
    public getDataListener(): DataListener {
        return this.dataListener;
    }

    constructor() {
        this.dataManager = new DataManager();
        this.dataListener = new DataListener(this.dataManager);
    }

    public startChatServerListener() {
        this.serverListener.addFrontendListener(this.dataManager);
        this.serverListener.addServerListener(this.dataListener);
        this.serverListener.addChatListener(this.dataListener);
        
        this.serverListener.addListenner();
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
        var self = this;
        server.logIn(email, password, function (err, loginRes) {
            callback(null, loginRes);

            if (!err && loginRes !== null) {    
                //<!-- Listen all event in the spartan world.
                self.startChatServerListener();

                server.getMe(function (err, res) {
                    if (err || res === null) {
                        console.error(err);
                    }
                    else {
                        if (res.code === 200) {
                            self.dataManager.setMyProfile(res.data);
                            
                            server.getLastAccessRoomsInfo(function (err, res) {
                                console.log("getLastAccessRoomsInfo:", JSON.stringify(res));
                            });
                        }
                        else {
                            console.error("My user profile is empty. please check.");
                        }
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
    }
}