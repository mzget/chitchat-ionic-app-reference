
class ChatRoomController {
    public chatMessages = [];

    onChat(chatMessageImp) {
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
}