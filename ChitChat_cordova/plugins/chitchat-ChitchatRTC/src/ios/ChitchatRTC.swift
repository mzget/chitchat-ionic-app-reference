 //
//  ChitchatRTC.swift
//  ChitchatRTC
//
//  Created by Prathan B.
//

import Foundation
import AVFoundation
import UIKit

let VIDEO_TRACK_ID = "ARDAMSv0" //TAG + "VIDEO"
let AUDIO_TRACK_ID = "ARDAMSa0" //TAG + "AUDIO"
let LOCAL_MEDIA_STREAM_ID = "ARDAMS" //TAG + "STREAM"
let SERVER_HOST = "203.113.25.44"
let SERVER_PORT = "3000"

@objc(ChitchatRTC)
class ChitchatRTC: CDVPlugin  , RTCSessionDescriptionDelegate , RTCPeerConnectionDelegate  {

    var command = CDVInvokedUrlCommand()
    var waitforEndCallCommand = CDVInvokedUrlCommand()
    
    var pcFactory:RTCPeerConnectionFactory! = nil
    var peerConnection:RTCPeerConnection! = nil
    var localStream: RTCMediaStream!
    var localVideoTrack: RTCVideoTrack!
    var localAudioTrack: RTCAudioTrack!

    var peerId:String!
    var remoteId:String! = nil
    
    var mediaConstraints: RTCMediaConstraints! = nil
    var peerStarted: Bool = false
    
    var socket: SocketIOClient! = nil
    
    let storyboard = UIStoryboard(name: "Chitchat", bundle: nil)
    var voiceCallView:VoiceCallViewController! = nil
    var videoCallView:VideoCallViewController! = nil
    var receiveCallView:ReceiveCallViewController! = nil
    
    var contactId = [String:String]()
    
    override func pluginInitialize() {
        super.pluginInitialize()
        
        RTCPeerConnectionFactory.initializeSSL()
        pcFactory = RTCPeerConnectionFactory()

        //init ui
        voiceCallView = storyboard.instantiateViewControllerWithIdentifier("voiceCallView") as! VoiceCallViewController
        videoCallView = storyboard.instantiateViewControllerWithIdentifier("videoCallView") as! VideoCallViewController
        receiveCallView = storyboard.instantiateViewControllerWithIdentifier("receiveCallView") as! ReceiveCallViewController
        
    }
    
    func peerConfig(OfferVideo:Bool) {
        
        peerConnection = pcFactory.peerConnectionWithICEServers(getIceServers(), constraints: nil, delegate: self)
        
        localStream = pcFactory.mediaStreamWithLabel(LOCAL_MEDIA_STREAM_ID)
        
        localAudioTrack = pcFactory.audioTrackWithID(AUDIO_TRACK_ID)
        
        localStream.addAudioTrack(localAudioTrack)
        
        peerConnection.addStream(localStream)
        
        mediaConstraints = RTCMediaConstraints(
            mandatoryConstraints: [
                RTCPair(key: "OfferToReceiveAudio", value: "true"),
                RTCPair(key: "OfferToReceiveVideo", value: "false"),
            ],
            
            optionalConstraints: [
                //RTCPair(key: "internalSctpDataChannels", value: "true"),
                RTCPair(key: "DtlsSrtpKeyAgreement", value: "true")
            ]
        )

    }
    
    func freeCall(command: CDVInvokedUrlCommand) {
        
        self.command = command
        
        if command.argumentAtIndex(0) != nil {
            
            self.remoteId = command.argumentAtIndex(0) as! String
        }
        
        if command.argumentAtIndex(1) != nil {
            
            contactId = command.argumentAtIndex(1) as! NSDictionary as! [String : String]
            
            /*
            print(contactId)
            print(contactId["_id"])
            print(contactId["displayname"])
            print(contactId["image"])
            print(contactId["status"])
            */
            
            if self.remoteId != "" {
                receiveCall()
            }
            else{
                voiceCall()
            }
        }
    }
    
    func receiveCall(){
        
        var presentationStyle: UIModalPresentationStyle
        if #available(iOS 8, *) {
            presentationStyle = .OverCurrentContext
        } else {
            presentationStyle = .CurrentContext
        }

        receiveCallView.contactId = contactId
        receiveCallView.answerCallback = answerCallback
        receiveCallView.declineCallback = declineCallback
        
        viewController!.modalPresentationStyle = presentationStyle
        receiveCallView.modalPresentationStyle = presentationStyle
        viewController!.modalTransitionStyle = .CoverVertical
        viewController!.presentViewController(receiveCallView, animated: true, completion: nil)
        
    }
    
    func voiceCall() {

        var presentationStyle: UIModalPresentationStyle
        if #available(iOS 8, *) {
            presentationStyle = .OverCurrentContext
        } else {
            presentationStyle = .CurrentContext
        }

        voiceCallView.contactId = contactId
        voiceCallView.hangUpCallback = hangUpCallback
        viewController!.modalPresentationStyle = presentationStyle
        voiceCallView.modalPresentationStyle = presentationStyle
        viewController!.modalTransitionStyle = .CoverVertical
        viewController!.presentViewController(voiceCallView, animated: true, completion: nil)

        peerConfig(false)
        sigConnect("ws://203.113.25.44:3000")

    }
    
    
    func videoCall(command: CDVInvokedUrlCommand) {
        self.command = command
        
        var device: AVCaptureDevice! = nil
        for captureDevice in AVCaptureDevice.devicesWithMediaType(AVMediaTypeVideo) {
            if (captureDevice.position == AVCaptureDevicePosition.Front) {
                device = captureDevice as! AVCaptureDevice
            }
        }
        
        if (device != nil) {
            
            peerConnection = pcFactory.peerConnectionWithICEServers(getIceServers(), constraints: nil, delegate: self)
        
            localStream = pcFactory.mediaStreamWithLabel(LOCAL_MEDIA_STREAM_ID)
        
            let capturer = RTCVideoCapturer(deviceName: device.localizedName)
            let videoConstraints = RTCMediaConstraints()
            let videoSource = pcFactory.videoSourceWithCapturer(capturer, constraints: videoConstraints)
            
            localVideoTrack = pcFactory.videoTrackWithID(VIDEO_TRACK_ID, source: videoSource)
            localAudioTrack = pcFactory.audioTrackWithID(AUDIO_TRACK_ID)
        
            localStream.addVideoTrack(localVideoTrack)
            localStream.addAudioTrack(localAudioTrack)
        
            peerConnection.addStream(localStream)
        
            mediaConstraints = RTCMediaConstraints(
                mandatoryConstraints: [
                    RTCPair(key: "OfferToReceiveAudio", value: "true"),
                    RTCPair(key: "OfferToReceiveVideo", value: "true"),
                ],
            
                optionalConstraints: [
                    //RTCPair(key: "internalSctpDataChannels", value: "true"),
                    RTCPair(key: "DtlsSrtpKeyAgreement", value: "true")
                ]
            )
        
            
            
            //localVideoTrack.addRenderer(renderer_sub)
        
            sigConnect("ws://203.113.25.44:3000")
        
        }
    }
    
    func waitForEndCall(command: CDVInvokedUrlCommand) {
        self.waitforEndCallCommand = command
    }
    
    func endCall(command: CDVInvokedUrlCommand) {
        
        self.command = command
        
        if self.socket.status == .Connected{
            self.socket.disconnect()
        }
        
        print("on endcall from callee")
        
        viewController?.presentedViewController?.dismissViewControllerAnimated(false, completion: nil)
        
        self.sendMessage(self.waitforEndCallCommand.callbackId, message: "endCall")
    }
    
    func lineBusy(command: CDVInvokedUrlCommand) {
        
        self.command = command
    }

    func answerCallback(){
        
        //self.sendMessage(self.waitforEndCallCommand.callbackId, message: "endCall")
        //sigConnect("ws://203.113.25.44:3000")
        voiceCall()
        
    }
    
    func declineCallback(){

        self.sendMessage(self.waitforEndCallCommand.callbackId, message: "endCall")
        
    }
    
    func hangUpCallback(){

        print("hangup callback event")
        
        if self.socket.status == .Connected{
            self.socket.disconnect()
        }
        
        self.sendMessage(self.waitforEndCallCommand.callbackId, message: "endCall")
        
    }
    
    func sendMessage(callbackId: String, message: String) {

        let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAsString: message)
        pluginResult.setKeepCallbackAsBool(true);
        
        self.commandDelegate!.sendPluginResult(pluginResult, callbackId:callbackId)
    }
    
    
    func prepareNewConnection() -> RTCPeerConnection {
        
        print("prepareNewConnection")

        peerConnection = pcFactory.peerConnectionWithICEServers(getIceServers(), constraints: nil, delegate: self)

        return peerConnection;
    }
    
    func getIceServers() -> [RTCICEServer] {
        
        var iceServers: [RTCICEServer] = []
        
        iceServers.append(RTCICEServer(
            URI: NSURL(string: "turn:203.113.25.44:3478"),
            username: "",
            password: ""))
        
        iceServers.append(RTCICEServer(
            URI: NSURL(string: "stun:203.113.25.44:3478"),
            username: "",
            password: ""))
        
        iceServers.append(RTCICEServer(
            URI: NSURL(string: "stun:stun.l.google.com:19302"),
            username: "",
            password: ""))
        
        return iceServers
    }

    // websocket related operations
    func sigConnect(wsUrl:String) {
        
        socket = SocketIOClient(socketURL: NSURL(string:wsUrl)! )
        //socket = SocketIOClient(socketURL: NSURL(string:wsUrl)! , options: [.Log(true), .ForcePolling(true)])
        
        socket.on("connect") { data in
            
            print("WebSocket connection opened to: " + wsUrl)
            
            
        }
        
        socket.on("id") { data , ack in
            if let localpeerId = data[0] as? String {
                self.peerId = localpeerId
                print("My callId: " + self.peerId);
                
                
                if self.remoteId != "" {
                    
                    self.sendMessage("init" , to: self.remoteId , payload: "");
                    
                }
                else{
                    
                    self.socket.emit("readyToStream", ["name":self.peerId!])
                }
                
                self.sendMessage(self.command.callbackId, message: self.peerId!)
            }
        }
        
        socket.on("disconnect") { data in
            print("WebSocket connection closed.")
        }
        
        socket.on("message") { (data, emitter) in
            
            if (data.count == 0) {
                return
            }
            
            let json = data[0] as! NSDictionary
            
            let type = json["type"] as! String
            self.remoteId = json["from"]  as! String
            
            print("onMessage_type: ", type , " data: " , json.description);
            
            if(type == "init") {
                
                print("Received init from \(self.remoteId) set offer, sending answer....");
                self.peerConnection.createOfferWithDelegate(self, constraints: self.mediaConstraints);

            }
            else if (type == "offer") {
                print("Received offer, set offer, sending answer....");
                
                let payload = json["payload"] as! NSDictionary
                let sdp = RTCSessionDescription(type: type, sdp: payload["sdp"] as! String)

                self.peerConnection.setRemoteDescriptionWithDelegate(self, sessionDescription: sdp)
                
            } else if (type == "answer" ) {
                
                print("Received answer, setting answer SDP");
                let payload = json["payload"] as! NSDictionary
                let sdp = RTCSessionDescription(type: type, sdp: payload["sdp"] as! String)
                
                if (self.peerConnection == nil) {
                    print("peerConnection NOT exist!")
                    return
                }
                self.peerConnection.setRemoteDescriptionWithDelegate(self, sessionDescription: sdp)
                
            } else if (type == "candidate" ) {
                
                print("Received ICE candidate...");
                
                let payload = json["payload"] as! NSDictionary
                let candidate = RTCICECandidate(
                    mid: payload["id"] as! String,
                    index: payload["label"] as! Int,
                    sdp: payload["candidate"] as! String)
                
                self.peerConnection.addICECandidate(candidate);
                
            } else if (type == "user disconnected") {
                print("disconnected");
            } else {
                print("Unexpected WebSocket message: " + data[0].description);
            }
            
        }
        
        socket.connect();
    }
    
    func sigRecoonect() {
        
        socket.disconnect()
        socket.connect();
    }
    
    func sigReadyToStream() {
        
        print("readyToStream")
        socket.emit("readyToStream", ["name":self.peerId]);
    }
    
    func sigSend(message:NSDictionary){
        
        socket.emit("message", message)
    }
    
    func sendMessage(type: String , to: String ,  payload:AnyObject){
        let message:[String: AnyObject] = [
            "type" : type ,
            "to"  : to ,
            "platform" : "iOS" ,
            "payload": payload
        ]
        
        socket.emit("message", message)
    }
    
    /**
     * Methods inherited from RTCSessionDescriptionDelegate.
     */
    func peerConnection(peerConnection: RTCPeerConnection!,
        didCreateSessionDescription sdp: RTCSessionDescription!, error: NSError!) {
            
            print("didCreate_SDP: " + String(peerConnection.signalingState))
            
            
            if (error == nil) {
                
                
                peerConnection.setLocalDescriptionWithDelegate(self, sessionDescription: sdp)
                
                let payload:[String: AnyObject] = [
                    "type" : sdp.type,
                    "sdp" : sdp.description
                ]
                
                // If we have a local offer OR answer we should signal it
                if (peerConnection.signalingState == RTCSignalingHaveLocalOffer || peerConnection.signalingState == RTCSignalingHaveLocalPrAnswer ) {
                    // Send offer/answer through the signaling channel of our application
                    sendMessage("offer", to: remoteId, payload: payload)
                    
                } else if (peerConnection.signalingState == RTCSignalingHaveRemoteOffer) {
                    // If we have a remote offer we should add it to the peer connection
                    sendMessage("answer", to: remoteId, payload: payload)
                }
                else
                {
                    sendMessage("offer", to: remoteId, payload: payload)
                }
                
            } else {
                print("sdp creation error: " + error.description)
            }
            
    }
    
    func peerConnection(peerConnection: RTCPeerConnection!,
        didSetSessionDescriptionWithError error: NSError!) {
            
            print("didSet_SDP: " + String(peerConnection.signalingState));
            if (error == nil) {
                // If we have a local offer OR answer we should signal it
                if (peerConnection.signalingState == RTCSignalingHaveLocalOffer || peerConnection.signalingState == RTCSignalingHaveLocalPrAnswer ) {
                    // Send offer/answer through the signaling channel of our application
                } else if (peerConnection.signalingState == RTCSignalingHaveRemoteOffer) {
                    // If we have a remote offer we should add it to the peer connection
                    peerConnection.createAnswerWithDelegate(self, constraints: mediaConstraints)
                }
            }else{
                print("didSetSessionDescriptionWithError: " + error.description)
            }
            
    }

    /**
     * Methods inherited from RTCPeerConnectionDelegate.
     */
    func peerConnection(peerConnection: RTCPeerConnection!,
        signalingStateChanged stateChanged: RTCSignalingState) {
            
            print("Signaling state changed: \(RTCTypes.signalingStates[stateChanged.rawValue])")
    }
    
    func peerConnection(peerConnection: RTCPeerConnection!,
        iceConnectionChanged newState: RTCICEConnectionState) {
            
            print("ICE state changed: \(RTCTypes.iceConnectionStates[newState.rawValue])")
    }
    
    func peerConnection(peerConnection: RTCPeerConnection!,
        iceGatheringChanged newState: RTCICEGatheringState) {
            
            print("iceGatheringChanged: \(RTCTypes.iceGatheringStates[newState.rawValue])")
    }
    
    func peerConnection(peerConnection: RTCPeerConnection!, gotICECandidate candidate: RTCICECandidate!) {
        
        print("gotICECandidate ::::")
        
        if (candidate != nil) {
            let payload:[String: AnyObject] = [
                "label" : candidate.sdpMLineIndex,
                "id" : candidate.sdpMid,
                "candidate" : candidate.sdp
            ]
            
            sendMessage("candidate", to: self.remoteId, payload: payload)
            
        } else {
            print("End of candidates. -------------------")
        }
        
    }
    
    func peerConnection(peerConnection: RTCPeerConnection!,
        addedStream stream: RTCMediaStream!) {
            
            print("Received %lu video tracks and %lu audio tracks" , stream.videoTracks.count , stream.audioTracks.count)
            
            if (peerConnection == nil) {
                print("peerConnection === nil")
                return
            }
            
            if (stream.audioTracks.count > 1 || stream.videoTracks.count > 1) {
                print("Weird-looking stream: " + stream.description)
                return
            }
    }
    
    func peerConnection(peerConnection: RTCPeerConnection!,
        removedStream stream: RTCMediaStream!) {
            
            print("removedStream: \(stream.description)")
    }
    
    func peerConnection(peerConnection: RTCPeerConnection!,
        didOpenDataChannel dataChannel: RTCDataChannel!) {
            
            print("didOpenDataChannel: \(dataChannel.description)")
    }
    
    func peerConnectionOnRenegotiationNeeded(peerConnection: RTCPeerConnection!) {
        
        print("peerConnectionOnRenegotiationNeeded: \(peerConnection.description)")
    }
}


struct RTCTypes {
    static let signalingStates = [
        RTCSignalingStable.rawValue:             "stable",
        RTCSignalingHaveLocalOffer.rawValue:     "have-local-offer",
        RTCSignalingHaveLocalPrAnswer.rawValue:  "have-local-pranswer",
        RTCSignalingHaveRemoteOffer.rawValue:    "have-remote-offer",
        RTCSignalingHaveRemotePrAnswer.rawValue: "have-remote-pranswer",
        RTCSignalingClosed.rawValue:             "closed"
    ]
    
    static let iceGatheringStates = [
        RTCICEGatheringNew.rawValue:            "new",
        RTCICEGatheringGathering.rawValue:      "gathering",
        RTCICEGatheringComplete.rawValue:       "complete"
    ]
    
    static let iceConnectionStates = [
        RTCICEConnectionNew.rawValue:            "new",
        RTCICEConnectionChecking.rawValue:       "checking",
        RTCICEConnectionConnected.rawValue:      "connected",
        RTCICEConnectionCompleted.rawValue:      "completed",
        RTCICEConnectionFailed.rawValue:         "failed",
        RTCICEConnectionDisconnected.rawValue:   "disconnected",
        RTCICEConnectionClosed.rawValue:         "closed"
    ]
    
    static let dataChannelStates = [
        kRTCDataChannelStateConnecting.rawValue: "connecting",
        kRTCDataChannelStateOpen.rawValue:       "open",
        kRTCDataChannelStateClosing.rawValue:    "closing",
        kRTCDataChannelStateClosed.rawValue:     "closed"
    ]
    
    static let mediaStreamTrackStates = [
        RTCTrackStateInitializing.rawValue:      "initializing",
        RTCTrackStateLive.rawValue:              "live",
        RTCTrackStateEnded.rawValue:             "ended",
        RTCTrackStateFailed.rawValue:            "failed"
    ]
}
