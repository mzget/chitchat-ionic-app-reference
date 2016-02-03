(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('webRTCFactory', webRTCFactory);

    webRTCFactory.$inject = ['$http'];

    function webRTCFactory($http) {
        var service = {
            init:init,
            call: call
        };
        var webRtcComponent;

        return service;

        function init() {
            webRtcComponent = new WebRtcComponent();
            webRtcComponent.voiceCallEvent = voiceCallHandler;
            webRtcComponent.videoCallEvent = videoCallHandler;
            webRtcComponent.lineBusyEvent = lineBusyHandler;
        }

        function call(contactId) {
            cordova.exec(function success(callId) {
                console.warn(callId);
                server.voiceCallRequest(contactId, callId, function success(err, res) {
                    console.log("voiceCallRequest", JSON.stringify(res));

                    if (res.code === HttpStatusCode.fail) {
                        console.warn("Fail to call. Need to hangup.");
                    }
                });
            }, null, "CallCordovaPlugin", "freeCall", ["", dataManager.getContactProfile(contactId)]);
        }
        
        function voiceCallHandler(contactId, callerId) {           
            cordova.exec(function success(callId) {
                console.warn(callId);
                server.voiceCallRequest(contactId, callId, function success(err, res) {
                    console.log("voiceCallRequest", JSON.stringify(res));

                    if (res.code === HttpStatusCode.fail) {
                        console.warn("Fail to call. Need to hangup.");
                    }
                });
            }, null, "CallCordovaPlugin", "freeCall", [callerId, dataManager.getContactProfile(contactId)]);
        }
         
        function videoCallHandler(contactId, callerId) {
            
        }
        
        function lineBusyHandler(contactId) {
            
        }
    }
})();