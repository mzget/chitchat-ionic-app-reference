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
            webRtcComponent.hangUpCallEvent = hangUpCallHandler;
            webRtcComponent.contactLineBusyEvent = contactLineBusyHandler;
        }

        function call(contactId) {
            webRtcComponent.setCallState(CallState.calling);
            
            cordova.exec(function success(callId) {
                console.warn(callId);
                server.voiceCallRequest(contactId, callId, function success(err, res) {
                    console.log("voiceCallRequest", JSON.stringify(res));

                    if (res.code === HttpStatusCode.fail) {
                        console.warn("Fail to call. Need to hangup.");
                    }
                });
            }, function fail() { }, "ChitchatRTC", "freeCall",
            ["", dataManager.getContactProfile(contactId)]);
        }
        
        function voiceCallHandler(contactId, callerId) {
            webRtcComponent.setCallState(CallState.signalingCall);
            
            cordova.exec(function success(callId) {
                console.warn(callId);
            }, function fail() {

            }, "ChitchatRTC", "freeCall", [callerId, dataManager.getContactProfile(contactId)]);
        }
         
        function videoCallHandler(contactId, callerId) {
            
        }
        
        function lineBusyHandler(contactId) {
            server.theLineIsBusy(contactId);
        }

        function hangUpCallHandler() {
            cordova.exec(null, null, "ChitchatRTC", "endCall", []);
            
            webRtcComponent.setCallState(CallState.idle);
        }

        function contactLineBusyHandler() {
            cordova.exec(null, null, "ChitchatRTC", "endCall", []);

            webRtcComponent.setCallState(CallState.idle);
        }
    }
})();