module absSpartan {
    export interface IChatServerListener {
        onChat(data);
        onLeaveRoom(data);
        onRoomJoin(data);
        onMessageRead(dataEvent);
        onGetMessagesReaders(dataEvent);
    }
    export interface IFrontendServerListener {
        onGetMe(dataEvent);
        onGetCompanyInfo(dataEvent);
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

        onUserLogin(dataEvent);
        onUserUpdateImageProfile(dataEvent);
        onUserUpdateProfile(dataEvent);
    }
}