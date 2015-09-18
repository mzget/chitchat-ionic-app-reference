module Services {

    export interface IOnChatListener {
        onChatData(data);
        onLeaveRoom(data);
        onRoomJoin(data);
        onMessageRead(dataEvent);
        onGetMessagesReaders(dataEvent);
    }
    export interface IFrontendServerListener {
        onGetCompanyMemberComplete(dataEvent);
        onGetPrivateGroupsComplete(dataEvent);
        onGetOrganizeGroupsComplete(dataEvent);
        onGetProjectBaseGroupsComplete(dataEvent);
    }
    export interface IRTCListener {
        onVideoCall(dataEvent);
        onVoiceCall(dataEvent);
        onHangupCall(dataEvent);
        onTheLineIsBusy(dataEvent);
    }
    export interface IServerListener {
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

    export abstract class AbsChatServerListener implements IOnChatListener {
        onChatData(data) { };
        onLeaveRoom(data) { };
        onRoomJoin(data) { };
        onMessageRead(dataEvent) { };
        onGetMessagesReaders(dataEvent) { };
    }

    export abstract class AbsFrontendServerListener implements IFrontendServerListener {
        abstract onGetCompanyMemberComplete(dataEvent);
        abstract onGetPrivateGroupsComplete(dataEvent);
        abstract onGetOrganizeGroupsComplete(dataEvent);
        abstract onGetProjectBaseGroupsComplete(dataEvent);
    };

    export abstract class AbsRTCListener implements IRTCListener {
        abstract onVideoCall(dataEvent);
        abstract onVoiceCall(dataEvent);
        abstract onHangupCall(dataEvent);
        abstract onTheLineIsBusy(dataEvent);
    }

    export abstract class AbsServerListener implements IServerListener {
        abstract onAccessRoom(dataEvent);
        abstract onUpdatedLastAccessTime(dataEvent);
        abstract onAddRoomAccess(dataEvent);

        abstract onCreateGroupSuccess(dataEvent);
        abstract onEditedGroupMember(dataEvent);
        abstract onEditedGroupName(dataEvent);
        abstract onEditedGroupImage(dataEvent);
        abstract onNewGroupCreated(dataEvent);

        abstract onUpdateMemberInfoInProjectBase(dataEvent);

        abstract onUserUpdateImageProfile(dataEvent);
        abstract onUserUpdateProfile(dataEvent);
    }
}