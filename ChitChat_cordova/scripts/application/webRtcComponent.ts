class WebRtcComponent implements absSpartan.IRTCListener {
    webRtcCallState: WebRtcCallState;
    lineBusyEvent: (contactId: string) => void;
    videoCallEvent: (contactId : string, callerId : string) => void;
    voiceCallEvent:  (contactId : string, callerId : string) => void;

    constructor() {
        console.log("starting.. webRtcComponent.");
        
        this.webRtcCallState = new WebRtcCallState();
    }

    public onVideoCall(dataEvent: any):void {
        let body = dataEvent.body;
        let contactId : string = body.from;
        let peerId : string = body.peerId;

        if(this.webRtcCallState.callState === CallState.idle) {
            if(this.videoCallEvent != null) {
                this.videoCallEvent(contactId, peerId);
            }
        }
        else {
            console.warn("Call status is not idle. " + this.webRtcCallState.callState.toString())
            if(this.lineBusyEvent != null) {
                this.lineBusyEvent(contactId);
            }
        }

/**    From stalk.droid code.
 * 
        //<!-- Checking WEBRTC controller status.
        // if (WebRTCCallController.getCallState().equals(WebRTCCallController.CallState.Idle)) {
        //     Intent intent = RTCReceivedCallActivity.createIntent(context, contactId, peerId, true);
        //     context.startActivity(intent);
        // }
        // else {
        //     Log.w(this.toString(), "Call status is not idle. " + WebRTCCallController.getCallState().toString());
        //     ServerAPIProvider.getInstance().theLineIsBusy(contactId);
        // }
        
        **/
}

    public onVoiceCall(dataEvent:any):void {
        let body = dataEvent.body;
        let contactId = body.from;
        let peerId = body.peerId;

        if (this.webRtcCallState.callState === CallState.idle) {
            if (this.voiceCallEvent != null) {
                this.voiceCallEvent(contactId, peerId);
            }
        }
        else {
            console.warn("Call status is not idle. " + this.webRtcCallState.callState.toString())
            if (this.lineBusyEvent != null) {
                this.lineBusyEvent(contactId);
            }
        }

        /**
         * Form stalk.droid code.
         *  */    
        //<!-- Checking WEBRTC controller status.
        // if (WebRTCCallController.getCallState().equals(WebRTCCallController.CallState.Idle)) {
        //     Intent intent = RTCReceivedCallActivity.createIntent(context, contactId, peerId, false);
        //     context.startActivity(intent);
        // }
        // else {
        //     Log.w(this.toString(), "Call status is not idle. " + WebRTCCallController.getCallState().toString());
        //     ServerAPIProvider.getInstance().theLineIsBusy(contactId);
        // }
}

    public onHangupCall(dataEvent: any):void {

    }
    
    public onTheLineIsBusy(dataEvent: any):void {

    }
}