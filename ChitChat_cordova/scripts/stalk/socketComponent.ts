class SocketComponent {
    onDisconnect: (reason: any) => void;
    disconnected(reason) {
        if (!!this.onDisconnect) {
            this.onDisconnect(reason);
        }
        else {
            console.warn("onDisconnected delegate is empty.");
        }
    }
}