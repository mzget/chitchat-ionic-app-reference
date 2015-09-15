

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
class FrontendServerListener implements IFrontendServerListener {
    onGetCompanyMemberComplete(dataEvent) { };
    onGetPrivateGroupsComplete(dataEvent) { };
    onGetOrganizeGroupsComplete(dataEvent) { };
    onGetProjectBaseGroupsComplete(dataEvent) { };
};