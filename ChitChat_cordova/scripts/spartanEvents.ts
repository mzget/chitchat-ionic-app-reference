module Services {

    interface IOnChatListener {
        onChatData(data);
        onLeaveRoom(data);
        onRoomJoin(data);
        onMessageRead(dataEvent);
        onGetMessagesReaders(dataEvent);
    }
    interface IFrontendServerListener {
        onGetCompanyMemberComplete(dataEvent);
        onGetPrivateGroupsComplete(dataEvent);
        onGetOrganizeGroupsComplete(dataEvent);
        onGetProjectBaseGroupsComplete(dataEvent);
    }
    interface IRTCListener {
        onVideoCall(dataEvent);
        onVoiceCall(dataEvent);
        onHangupCall(dataEvent);
        onTheLineIsBusy(dataEvent);
    }
    interface IServerListener {
        onAccessRoom(dataEvent);
        onUpdatedLastAccessTime(dataEvent);
        onAddRoomAccess(dataEvent);

        onCreateGroupSuccess(dataEvent);
        onEditedGroupMember(dataEvent);
        onEditedGroupName(dataEvent);
        onEditedGroupImage(dataEvent);
        onNewGroupCreated(dataEvent);

        onUpdateMemberInfoInProjectBase(dataEvent);

        onUserUpdateImageProfile(dataEvent);
        onUserUpdateProfile(dataEvent);
    }

    export class ChatServerListener implements IOnChatListener {
        onChatData(data) { };
        onLeaveRoom(data) { };
        onRoomJoin(data) { };
        onMessageRead(dataEvent) { };
        onGetMessagesReaders(dataEvent) { };
    }

    export class FrontendServerListener implements IFrontendServerListener {
        onGetCompanyMemberComplete(dataEvent) { };
        onGetPrivateGroupsComplete(dataEvent) { };
        onGetOrganizeGroupsComplete(dataEvent) { };
        onGetProjectBaseGroupsComplete(dataEvent) { };
    };

    export class RTCListener implements IRTCListener {
        onVideoCall(dataEvent) { };
        onVoiceCall(dataEvent) { };
        onHangupCall(dataEvent) { };
        onTheLineIsBusy(dataEvent) { };
    }

    export class ServerListener implements IServerListener {
        onAccessRoom(dataEvent) { };
        onUpdatedLastAccessTime(dataEvent) { };
        onAddRoomAccess(dataEvent) { };

        onCreateGroupSuccess(dataEvent) { };
        onEditedGroupMember(dataEvent) { };
        onEditedGroupName(dataEvent) { };
        onEditedGroupImage(dataEvent) { };
        onNewGroupCreated(dataEvent) { };

        onUpdateMemberInfoInProjectBase(dataEvent) { };

        onUserUpdateImageProfile(dataEvent) { };
        onUserUpdateProfile(dataEvent) { };
    }
}