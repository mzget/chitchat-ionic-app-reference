class MessageDAL {

    store: LocalForage;

    constructor(_store: LocalForage) {
        this.store = _store;
    }

    getData(rid: string, done: (err, messages) => void) {
        this.store.getItem(rid).then(function (value) {
            console.log("get persistent success");
            done(null, value);
        });
    }

    saveData(rid: string, chatRecord: Array<any>) {
        this.store.setItem(rid, chatRecord).then(function (value) {
            console.log("save persistent success", value.length);
        });
    }

    removeData() { }

    clearData() {
        this.store.clear((err) => {
            if (err != null) {
                console.warn("Clear database fail", err);
            }

            console.log("message db now empty.");
        });
    }
}