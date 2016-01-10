(function () {
    'use strict';

    angular
        .module('spartan.chatslog', [])
        .controller('chatslogController', chatslogController);

    // chatslogController.$inject = ['$location', '$scope', '$timeout', 'roomSelected'];
            
    function chatslogController($location, $scope, $rootScope, $timeout, roomSelected, chatslogService, localNotifyService, sharedObjectService, ConvertDateTime) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'chatslogController';

        var dataManager = main.getDataManager();
        var listenerImp;
        var myRoomAccess = [];
        var chatslog = {};
        $scope.myProfile = dataManager.myProfile;
        $scope.orgMembers = dataManager.orgMembers;
        $scope.roomAccess = [];

        function activate() { 
            console.warn(vm.title, "activate");
            
            myRoomAccess = [];
            chatslog = {};
            getRoomInfo();
        }
        
        function getRoomInfo() {
            console.log("my roomAccess.length", dataManager.getRoomAccess().length);
            
            var unreadMessageMap = chatslogService.getUnreadMessageMap();
            async.mapSeries(unreadMessageMap, function iterator(item, resultCB) {
                var roomInfo = dataManager.getGroup(item.rid);
                if (!!roomInfo) {
                    chatslogService.organizeChatLogMap(item, roomInfo, function done(log) {
                        addChatLog(log);
                        resultCB(null, {});
                    });
                }
                else {
                    console.warn("Can't find roomInfo from persisted data: ", item.rid);

                    server.getRoomInfo(item.rid, function (err, res) {
                        if (res['code'] === HttpStatusCode.success) {
                            var roomInfo = JSON.parse(JSON.stringify(res.data));
                            if (roomInfo.type === RoomType.privateChat) {
                                var targetMemberId = "";
                                roomInfo.members.some(function itorator(item) {
                                    if (item.id !== dataManager.myProfile._id) {
                                        targetMemberId = item.id;
                                        return item.id;
                                    }
                                });

                                var contactProfile = dataManager.getContactProfile(targetMemberId);
                                if (contactProfile == null) {
                                    roomInfo.name = "EMPTY ROOM";
                                }
                                else {
                                    roomInfo.name = contactProfile.displayname;
                                }
                            }
                            else {
                                console.warn("OMG: the god only know. May be group status is not active.");
                            }

                            dataManager.addGroup(roomInfo);

                            chatslogService.organizeChatLogMap(item, roomInfo, function done(log) {
                                addChatLog(log);
                                resultCB(null, {});
                            });
                        }
                        else {
                            console.warn("Fail to get room info of room %s", item.rid, res.message);
                            resultCB(null, {});
                        }
                    });
                }
            }, function done(err, results) {
                console.debug("getRoomInfo Completed.");
            });
        }

        function updateUnreadMessageCount() {
            var lastMessageMap = chatslogService.getUnreadMessageMap();
  
            for (var i = 0; i < myRoomAccess.length; i++) {
                var rid = myRoomAccess[i]._id;
                myRoomAccess[i].body = lastMessageMap[rid];
                if(!!lastMessageMap[rid] && !!lastMessageMap[rid].message) {
                    myRoomAccess[i].lastTime = lastMessageMap[rid].message.createTime; 
                }
            }
        }
        
        function addChatLog(chatLog) {
            //if (!!unreadMessageMap && !!unreadMessageMap[item.roomId]) {
            //    log.body = unreadMessageMap[item.roomId];

            //    if (!!unreadMessageMap[item.roomId].message) {
            //        log.lastTime = unreadMessageMap[item.roomId].message.createTime ?
            //            unreadMessageMap[item.roomId].message.createTime : item.accessTime;
            //    }
            //    else {
            //        log.lastTime = item.accessTime;
            //    }
            //}
            //else {
            //    log.lastTime = item.accessTime;
            //}

            chatLog.time = ConvertDateTime.getTimeChatlog(chatLog.lastMessageTime);
            chatslog[chatLog.id] = chatLog;
            
            myRoomAccess = [];
            async.mapSeries(chatslog, function itorator(item, cb) {
                myRoomAccess.push(item);
                cb(null, item);
            }, function done(err, results) {
                // done.
                $scope.roomAccess = myRoomAccess;
            });
        }

        //var refresh = function () 
        //{
        //   updateUnreadMessageCount();

        //    $scope.roomAccess = myRoomAccess;
            
        //    $timeout(refresh, 1000);
        //} 
        //$timeout(refresh, 1000);
        
        $scope.gotoChat = function (accessId, chatlog) 
        {		
            var accessLength = myRoomAccess.length; 
            
            for(var i=0; i< accessLength; i++)
            {
                if( myRoomAccess[i]['_id'] == accessId )
                {
                    switch( myRoomAccess[i]['type'] )
                    {
                        case 0:
                            var group = main.getDataManager().orgGroups[accessId];
                            roomSelected.setRoom(group);
                            location.href = '#/tab/chats/chat/' + accessId;
                            break;
                        case 1:
                            var group = main.getDataManager().projectBaseGroups[accessId];
                            roomSelected.setRoom(group);
                            location.href = '#/tab/chats/chat/' + accessId;
                            break;
                        case 2:
                            var group = main.getDataManager().privateGroups[accessId];
                            roomSelected.setRoom(group);
                            location.href = '#/tab/chats/chat/' + accessId;
                            break;
                        case 3:
                            var contactId;
                            if( myRoomAccess[i]['members'][0]['id'] != dataManager.myProfile._id )
                                contactId = myRoomAccess[i]['members'][0]['id']
                            else
                                contactId = myRoomAccess[i]['members'][1]['id']
                        
                            server.getPrivateChatRoomId(dataManager.myProfile._id, contactId, function result(err, res) {
                                console.log(JSON.stringify(res));
                                var room = JSON.parse(JSON.stringify(res.data));
                                roomSelected.setRoom(room);
                                location.href = '#/tab/chats/chat/' + room._id;
                            });
                            break;
                    }
                    i = accessLength;
                }
            }	
        };

        $scope.$on('$ionicView.enter', function() { 
            console.log("$ionicView.enter: ", vm.title);
        });

        $scope.$on('$ionicView.loaded', function () {
            console.log("$ionicView.loaded: ", vm.title);

            activate();
        });
        
        $scope.$on('getunreadmessagecomplete', function(event, data){
            getRoomInfo();
        });

        $scope.$on('onUnreadMessageMapChanged', function (event, data) {
            var roomInfo = dataManager.getGroup(data.data.rid);
            chatslogService.organizeChatLogMap(data.data, roomInfo, function done(log) {
                addChatLog(log);
            });
        });
    }
})();