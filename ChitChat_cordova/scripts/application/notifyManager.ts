class NotifyManager {
    private dataManager: DataManager;
    private serverImp: ChatServer.ServerImplemented;
    constructor(main: Main) {
        console.log("NotifyManager.constructor");
        
        this.dataManager = main.getDataManager();
        this.serverImp = main.getServerImp();
    }

    public notify(chatMessageImp: Message, appBackground: boolean, notifyService) {
        let self = this;
        var contactName, contactId;
        if (this.dataManager.getGroup(chatMessageImp.rid) === undefined) {
            contactName = this.dataManager.getContactProfile(chatMessageImp.sender).displayname;
            contactId = this.dataManager.getContactProfile(chatMessageImp.sender)._id;
        }
        else {
            contactName = this.dataManager.getGroup(chatMessageImp.rid).name;
            contactId = this.dataManager.getGroup(chatMessageImp.rid)._id;
        }

        if (chatMessageImp.type.toString() === ContentType[ContentType.Text]) {
            var secure = new SecureService();
            if (self.serverImp.appConfig.encryption == true) {
                secure.decryptWithSecureRandom(chatMessageImp.body, function done(err, res) {
                    if (!err) {
                        chatMessageImp.body = res;
                    }
                    else {
                        console.warn(err, res);
                    }

                    var toastMessage = contactName + " sent " + chatMessageImp.body;
                    if (!appBackground) {
                        notifyService.makeToastOnCenter(contactId, toastMessage);
                    }
                    else {
                        notifyService.scheduleSingleNotification(contactId, contactName, chatMessageImp.body);
                    }
                });
            }
            else {
                var toastMessage = contactName + " sent " + chatMessageImp.body;
                if (!appBackground) {
                    notifyService.makeToastOnCenter(contactId, toastMessage);
                }
                else {
                    notifyService.scheduleSingleNotification(contactId, contactName, chatMessageImp.body);
                }
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Sticker]) {
            var message = contactName + " sent a sticker."
            if (!appBackground) {
                notifyService.makeToastOnCenter(contactId, message);
            }
            else {
                notifyService.scheduleSingleNotification(contactId, contactName, message);
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Voice]) {
            var message = contactName + " sent a voice message."
            if (!appBackground) {
                notifyService.makeToastOnCenter(contactId, message);
            }
            else {
                notifyService.scheduleSingleNotification(contactId, contactName, message);
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Image]) {
            var message = contactName + " sent a image."
            if (!appBackground) {
                notifyService.makeToastOnCenter(contactId, message);
            }
            else {
                notifyService.scheduleSingleNotification(contactId, contactName, message);
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Video]) {
            var message = contactName + " sent a video."
            if (!appBackground) {
                notifyService.makeToastOnCenter(contactId, message);
            }
            else {
                notifyService.scheduleSingleNotification(contactId, contactName, message);
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Location]) {
            var message = contactName + " sent a location."
            if (!appBackground) {
                notifyService.makeToastOnCenter(contactId, message);
            }
            else {
                notifyService.scheduleSingleNotification(contactId, contactName, message);
            }
        }
    }
}