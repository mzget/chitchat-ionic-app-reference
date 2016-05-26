class MessageDAL {

    store: LocalForage;

    constructor(_store: LocalForage) {
        this.store = _store;
    }

    getData(rid: string, done: (err, messages) => void) {
        this.store.getItem(rid).then(function (value) {
            console.log("get persistent success");
            done(null, value);
        }).catch(function rejected(err) {
            console.warn(err);
        });
    }

    saveData(rid: string, chatRecord: Array<any>, callback?: (err, result) => void) {
        this.store.setItem(rid, chatRecord).then(function (value) {
            console.log("save persistent success", value.length);
            if (callback != null) {
                callback(null, value);
            }
        }).catch(function rejected(err) {
            console.warn(err);
            if(callback != null) {
                callback(err, null);
            }
        });
    }

    removeData(rid: string, callback: (err, res) => void) {
        this.store.removeItem(rid).then(() => {
            console.info('room_id %s is removed: ', rid);
            callback(null, null);
        }).catch((err) => {
            console.warn(err);
        });
        
     }

    clearData(next:(err?: Error) => void) {
        console.warn('MessageDAL.clearData');
        this.store.clear((err) => {
            if (err != null) {
                console.warn("Clear database fail", err);
            }

            console.warn("message db now empty.");
            
            next(err);
        });
    }
}