webRtcClient.prototype.freeCall = function (success, error, options) {
    cordova.exec(success, error, "ChitchatRTC", "freeCall", options);
};

webRtcClient.prototype.endCall = function () {
    cordova.exec(null, null, "ChitchatRTC", "endCall", []);
};

module.exports = {
    webRtcClient: webRtcClient
};
