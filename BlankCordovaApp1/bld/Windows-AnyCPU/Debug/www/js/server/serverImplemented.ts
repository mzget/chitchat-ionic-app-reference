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

module ChatServer {
    export class ServerImplemented {

        username: string;
        password: string;
        host: string = "git.animation-genius.com";
        port: number = 3014;

        private client;
        public getClient() {
            if (this.client != null)
                return this.client;
        else {
            console.log("disconnect Event");
            //if (connectionListen != null) {
            //    connectionListen.connectionEvent("disconnect");
            //}

            //return new PomeloClient(instance.host, instance.port);
         }
        }

        constructor() { }

        public init() { }

        public connectGateServer() {

        }

        public connectConnectorServer() {

        }

        public disConnect() {

        }

        private connectSocketServer(_host: string, _port: number) {
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
        }

        // region <!-- Authentication...
        /// <summary>
        /// Connect to gate server then get query of connector server.
        /// </summary>
        public logIn(username: string, passwordHash: string, callback: Function) {

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
    }
    }
  }