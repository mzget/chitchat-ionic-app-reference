interface IUnreadMessage {
    rid: string;
    count: number;
    type: string,
    body: string; // last message id.
}

class ChatsLogComponent implements absSpartan.IRoomAccessListenerImp {
    onAccessRoom(dataEvent) {
        console.warn("onAccessRoom", JSON.stringify(dataEvent));
    }
        onUpdatedLastAccessTime(dataEvent) {}
        onAddRoomAccess(dataEvent) {}
        
        private main : Main;
        private server: ChatServer.ServerImplemented;
        constructor(main: Main, server: ChatServer.ServerImplemented) {
            this.main = main;
            this.server = server;
        }
        
        public getUnreadMessage(roomAccess: RoomAccessData[], callback:(err: Error, logsData: Array<IUnreadMessage>) => void) {
            var self = this;
            var logs = [];
            async.mapSeries(roomAccess, function iterator(item, cb) {
                if (!!item.roomId && !!item.accessTime) {
                    self.server.getUnreadMsgOfRoom(item.roomId, item.accessTime.toString(), function res(err, res) {
                        if (err || res === null) {
                            console.warn("getUnreadMsgOfRoom: ", err);
                        }
                        else {
                            if (res.code === HttpStatusCode.success) {
                                var unread: IUnreadMessage = JSON.parse(JSON.stringify(res.data));
                                unread.rid = item.roomId;
                                logs.push(unread);
                            }
                        }
                        cb(null, null);
                    });
                }
                else {
                    cb(null, null);
                }
            }, function done(err) {
                console.log("get unread message is done.");
                callback(null, logs);
            });
        }
}