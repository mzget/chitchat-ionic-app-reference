class MessageDAL {

    store: LocalForage;

    constructor(_store: LocalForage) {
        this.store = _store;
    }

    getData(rid: string, done: (err, messages) => void) {
        this.store.getItem(rid).then(function (value) {
            done(null, value);
        }).catch(function (err) {
            done(err, null);
        });
    }

    saveData(rid: string, chatRecord: Array<any>) {
        this.store.setItem(rid, chatRecord).then(function (value) {
            console.log("save persistent success", value.length);
        });
    }
}