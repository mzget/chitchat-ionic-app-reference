class AuthenReducer {

    store: LocalForage;
    key = "session_token";

    constructor(_store: LocalForage) {
        this.store = _store;
    }

    getData(done: (err, authenInfo) => void) {
        this.store.getItem(this.key).then(function (value) {
            let docs = JSON.parse(JSON.stringify(value));
            console.log("get session_token success", value);
            done(null, docs);
        }).catch(function rejected(err) {
            console.warn(err);
            done(err, null);
        });
    }

    saveData(authInfo: any, callback?: (err, result) => void) {
        let self = this;
        this.store.setItem(self.key, authInfo).then(function (value) {
            console.log("save persistent success");
            if (callback != null) {
                callback(null, value);
            }
        }).catch(function rejected(err) {
            console.warn(err);
            self.removeData(self.key);
            if (callback != null) {
                callback(err, null);
            }
        });
    }

    removeData(rid: string, callback?: (err, res) => void) {
        this.store.removeItem(rid).then(() => {
            console.info('room_id %s is removed: ', rid);
            if (callback) {
                callback(null, null);
            }
        }).catch((err) => {
            console.warn(err);
        });

    }

    clearData(next: (err?: Error) => void) {
        this.store.clear((err) => {
            if (err != null) {
                console.warn("Clear database fail", err);
            }

            next(err);
        });
    }
}