cordova.define("chitchat-plugin-cameraroll.CameraRoll", function(require, exports, module) { var exec = require('cordova/exec');

var cameraRoll = {};

cameraRoll.saveImageToCameraRoll = function(uri, successCallback, errorCallback, options) {
  exec(successCallback, errorCallback, "CameraRoll", "saveImageToCameraRoll", [uri]);
};

cameraRoll.saveVideoToCameraRoll = function(uri, successCallback, errorCallback, options) {
  exec(successCallback, errorCallback, "CameraRoll", "saveVideoToCameraRoll", [uri]);
};

module.exports = cameraRoll;

});
