class RoomDAL {

    store: LocalForage;

    constructor(_store: LocalForage) {
        this.store = _store;
    }

    getData(room_id: string, done: (err, roomInfo) => void) {
        this.store.getItem(room_id).then(function (value) {
                let docs = JSON.parse(JSON.stringify(value));
                done(null, docs);
            }).catch(function (err) {
                console.warn(err);
                done(err, null);
            });
    }

    saveData(room_id: string, roomInfo: any, callback?: (err, result) => void) {
        let self = this;
        this.store.setItem(room_id, roomInfo)
            .then(function (value) {
                if (callback != null) {
                    callback(null, value);
                }
            }).catch(function rejected(err) {
                console.warn(err);
                self.removeData(room_id);

                if (callback != null) {
                    callback(err, null);
                }
            });
    }

    removeData(room_id: string, callback?: (err, res) => void) {
        this.store.removeItem(room_id)
        .then(() => {
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