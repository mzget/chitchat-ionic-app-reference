class NotifyManager {
    private static _instance: NotifyManager;
    public static getInstance(): NotifyManager {
        if (this._instance === null || this._instance === undefined) {
            this._instance = new NotifyManager;
        }

        return this._instance;
    } 

    constructor() {
        console.log("construc notify manager.");
    }

    public notify(chatMessageImp: Message, appBackground: boolean, notifyService) {
        console.warn('notify', appBackground, chatMessageImp.type, notifyService);

        var dataManager = DataManager.getInstance();

        console.warn('notify 2', dataManager);

        if (chatMessageImp.type === ContentType.Text) {
            var contact = dataManager.getContactProfile(chatMessageImp.sender);
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
            var contact = dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a sticker."
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
        else if (chatMessageImp.type === ContentType.Voice) {
            var contact = dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a voice message."
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
        else if (chatMessageImp.type === ContentType.Image) {
            var contact = dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a image."
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
        else if (chatMessageImp.type === ContentType.Video) {
            var contact = dataManager.getContactProfile(chatMessageImp.sender);
            var message = contact.displayname + " sent a video."
            if (!appBackground) {
                notifyService.makeToastOnCenter(message);
            }
            else {
                notifyService.scheduleSingleNotification(contact.displayname, message);
            }
        }
        else if (chatMessageImp.type === ContentType.Location) {
            var contact = dataManager.getContactProfile(chatMessageImp.sender);
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