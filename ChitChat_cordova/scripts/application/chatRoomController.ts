interface IChatRoomController {
    onChat(data);
    onLeaveRoom(data);
    onRoomJoin(data);
    onMessageRead(dataEvent);
    onGetMessagesReaders(dataEvent);
}

class ChatRoomController implements IChatRoomController {
    public chatMessages = [];

    onChat(chatMessageImp) {
        console.log("Implement chat msg hear..", chatMessageImp);

        var secure = new SecureService();
        if (chatMessageImp.type === ContentType[ContentType.Text]) {
            secure.decryptWithSecureRandom(chatMessageImp.body, (err, res) => {
                if (!err) {
                    chatMessageImp.body = res;
                    this.chatMessages.push(chatMessageImp);
                }
                else {
                    console.log(err, res);
                    this.chatMessages.push(chatMessageImp);
                }
            })
        }
        else {
            this.chatMessages.push(chatMessageImp);
        }
    }

    onLeaveRoom(data) {

    }

    onRoomJoin(data) {

    }

    onMessageRead(dataEvent) {

    }

    onGetMessagesReaders(dataEvent) {

    }
}