class NotifyManager {
    private dataManager: DataManager;

    constructor(main: Main) {
        console.log("NotifyManager.constructor");

        this.dataManager = main.getDataManager();
    }

    public notify(chatMessageImp: Message, appBackground: boolean, notifyService) {
        if (chatMessageImp.type.toString() === ContentType[ContentType.Text]) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            var secure = new SecureService();
            secure.decryptWithSecureRandom(chatMessageImp.body, function done(err, res) {
                if (!err) {
                    chatMessageImp.body = res;

                    var toastMessage = contact.displayname + " sent " + chatMessageImp.body;
                    if (!appBackground) {
                        notifyService.makeToastOnCenter(toastMessage);
                    }
                    else {
                        notifyService.scheduleSingleNotification(contact.displayname, chatMessageImp.body);
                    }
                }
                else {
                    console.warn(err, res);
                }
            });
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Sticker]) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a sticker."
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Voice]) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a voice message."
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Image]) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a image."
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Video]) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a video."
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
        else if (chatMessageImp.type.toString() === ContentType[ContentType.Location]) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a location."
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
    }
}