interface IUnreadMessage {
    count: number;
    type: string,
    body: string; // last message id.
}

class ChatsLogComponent implements Services.IServerListener {
        onAccessRoom(dataEvent) {}
        onUpdatedLastAccessTime(dataEvent) {}
        onAddRoomAccess(dataEvent) {}

        onCreateGroupSuccess(dataEvent) {}
        onEditedGroupMember(dataEvent) {}
        onEditedGroupName(dataEvent){}
        onEditedGroupImage(dataEvent){}
        onNewGroupCreated(dataEvent){}

        onUpdateMemberInfoInProjectBase(dataEvent) {}

        onUserUpdateImageProfile(dataEvent){}
        onUserUpdateProfile(dataEvent){}
        
        private main : Main;
        private server: ChatServer.ServerImplemented;
        constructor (main: Main, server: ChatServer.ServerImplemented) {
            this.main = main;
            this.server = server;
        }
        
        public getUnreadMessage(roomAccess: RoomAccessData[]) {
            var self = this;
        
            async.mapSeries(roomAccess, function iterator(item, cb) {
                if (!!item.roomId && !!item.accessTime) {
                    self.server.getUnreadMsgOfRoom(item.roomId, item.accessTime.toString(), function res(err, res) {
                        if (err || res === null) {
                            console.warn("getUnreadMsgOfRoom: ", err);
                        }
                        else {
                            if (res.code === HttpStatusCode.success) {
                                console.log(JSON.stringify(res));
                                var unread: IUnreadMessage = JSON.parse(JSON.stringify(res.data));
                                 
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
            });
        }
}