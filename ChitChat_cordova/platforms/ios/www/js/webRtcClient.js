webRtcClient.prototype.freeCall = function (success, error, options) {
    cordova.exec(success, error, "CallCordovaPlugin", "freeCall", options);
};

webRtcClient.prototype.endCall = function () {
    cordova.exec(null, null, "CallCordovaPlugin", "endCall", []);
};

module.exports = {
    webRtcClient: webRtcClient
};
