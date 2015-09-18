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
    private dataManager = new DataManager();
    public getDataManager(): DataManager {
        return this.dataManager;
    }

    constructor() { }

    public startChatServerListener() {
        this.serverListener.frontendListener = this.dataManager;
        this.serverListener.addListenner();
    }

    public getHashService(content: string, callback: (err, res) => void) {
        var hashService = new HashGenerator();
        hashService.hashCompute(content, callback);
    }

    public authenUser(server, email, password) {
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
                        if (res.code === 200)
                            self.dataManager.setMyProfile(res.data);
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