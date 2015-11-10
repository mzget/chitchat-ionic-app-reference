class NotifyManager {
    private dataManager: DataManager;

    constructor(main: Main) {
        console.log("construc notify manager.");

        this.dataManager = main.getDataManager();
    }

    public notify(chatMessageImp: Message, appBackground: boolean, notifyService) {
        console.warn('notify', appBackground, JSON.stringify(chatMessageImp), notifyService);

        console.warn('notify 2', JSON.stringify(this.dataManager.myProfile));

        if (chatMessageImp.type === ContentType.Text) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            console.warn('notify 3', contact);
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
        else if (chatMessageImp.type === ContentType.Sticker) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a sticker."
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
        else if (chatMessageImp.type === ContentType.Voice) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a voice message."
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
        else if (chatMessageImp.type === ContentType.Image) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a image."
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
        else if (chatMessageImp.type === ContentType.Video) {
            var contact = this.dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a video."
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
        else if (chatMessageImp.type === ContentType.Location) {
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