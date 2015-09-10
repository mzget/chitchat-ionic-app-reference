var client = require(['./pomelo/build/build'], function (pomelo) {
    console.log(pomelo);
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
var ChatServer;
(function (ChatServer) {
    var ServerImplemented = (function () {
        function ServerImplemented() {
            this.host = "git.animation-genius.com";
            this.port = 3014;
        }
        ServerImplemented.prototype.getClient = function () {
            if (this.client != null)
                return this.client;
            else {
                console.log("disconnect Event");
            }
        };
        ServerImplemented.prototype.init = function () { };
        ServerImplemented.prototype.connectGateServer = function () {
        };
        ServerImplemented.prototype.connectConnectorServer = function () {
        };
        ServerImplemented.prototype.disConnect = function () {
        };
        ServerImplemented.prototype.connectSocketServer = function (_host, _port) {
            this.client.init({ host: _host, port: _port }, function (socket) {
                console.log("client.init");
            });
            //client.on("disconnect", new DataListener() {
            //    public void receiveData(DataEvent dataEvent) {
            //        System.err.println("disconnect Event");
            //        if (connectionListen != null) {
            //            connectionListen.connectionEvent("disconnect");
            //        }
            //    }
            //});
        };
        // region <!-- Authentication...
        /// <summary>
        /// Connect to gate server then get query of connector server.
        /// </summary>
        ServerImplemented.prototype.logIn = function (username, passwordHash, callback) {
            console.log("logIn");
            this.username = username;
            this.password = passwordHash;
            if (this.client == null) {
                this.connectSocketServer(this.host, this.port);
            }
            //if (!IsLoginSuccess) {
            //    try {
            //        JSONObject msg = new JSONObject();
            //        msg.put("uid", this.username);
            //        client.request("gate.gateHandler.queryEntry", msg, new DataCallBack() {
            //            public void responseData(JSONObject result) {
            //                Log.i("QueryConnectorServ", result.toString());
            //                try {
            //                    if(result.getInt("code") == 200) {
            //                        client.disconnect();
            //                        client = null;
            //                        int port = result.getInt("port");
            //                        connectSocketServer(host, port);
            //                        //                            this.InitSocket();
            //                        ConnectConnectorServer(callback);
            //                    }
            //                } catch (JSONException e) {
            //                    e.printStackTrace();
            //                }
            //            }
            //        });
            //} catch (JSONException e) {
            //    e.printStackTrace();
            //}
        };
        return ServerImplemented;
    })();
    ChatServer.ServerImplemented = ServerImplemented;
})(ChatServer || (ChatServer = {}));
