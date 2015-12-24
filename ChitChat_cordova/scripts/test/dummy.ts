class Dummy implements absSpartan.IChatServerListener {
    chatRoom: ChatServer.ChatRoomApiProvider = ChatServer.ChatRoomApiProvider.prototype;
    serverApi: ChatServer.ServerImplemented;
    
    counter: number = 0;
    intervalNumber: number;
    chatsMsg: Array<String> = new Array<String>;

    constructor() {
        this.serverApi = ChatServer.ServerImplemented.getInstance();
    }

    public bots = [{ name: "test1@rfl.com", pass: "1234" }, { name: "test2@rfl.com", pass: "1234" },
        { name: "test3@rfl.com", pass: "1234" }, { name: "test4@rfl.com", pass: "1234" }, 
        { name: "test5@rfl.com", pass: "1234" }, { name: "test6@rfl.com", pass: "1234" },
        { name: "test7@rfl.com", pass: "1234" }];

    public getBot() {
        var main = Main.prototype;
        var dataListener = main.getDataListener();
        dataListener.addChatListenerImp(this);

        var r = Math.floor((Math.random() * this.bots.length) + 1);
        return this.bots[r];
    }

    public fireChatInRoom(myUid: string) {
        this.serverApi.JoinChatRoomRequest("564f01c6394ffb2e5dbfeeab", (err, res) => {
            if (!err && res !== null) {
                this.intervalNumber = setInterval(() => {
                    var temp = this.counter++;
                    this.chatRoom.chat("564f01c6394ffb2e5dbfeeab", "bot", myUid, "bot: " + temp, ContentType[ContentType.Text], function (err, res) {
                        console.log(res);
                    });
                }, 2000);
            }
        });
    }

    public stopChat() {
        clearInterval(this.intervalNumber);
    }

    public getChats() {
        return this.chatsMsg;
    }

    public onChat(data) {
        this.chatsMsg.push(data);
    }
    public onLeaveRoom(data) { }
    public onRoomJoin(data) { }
    public onMessageRead(dataEvent) { }
    public onGetMessagesReaders(dataEvent) { }
}



/*
{
    "_id" : ObjectId("55d5bb67451bbf090b0e8cde"),
    "name" : "SkylineDeveloper",
    "type" : 2,
    "members" : [ 
        {
            "id" : "55d1929fd20212707c46c688"
        }  
    ],
    "createTime" : ISODate("2015-08-20T11:35:03.066Z"),
    "image" : "/uploads/groups/images/4b8560d8b445d3c48a0b076b1b4c8139.jpg"
}
*/