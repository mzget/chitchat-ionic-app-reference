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
        var myRoomAccess = [];
        var chatslog = {};

        function activate() { 
            console.warn(vm.title, "activate");
            
            $scope.roomAccess = [];
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
        
        $scope.gotoChat = function (roomId, chatlog) 
        {	
            var group = dataManager.getGroup(roomId);
            roomSelected.setRoom(group);
            location.href = '#/tab/chats/chat/' + roomId;
        };

        $scope.$on('$ionicView.enter', function() { 
            console.log("$ionicView.enter: ", vm.title);

            activate();
        });

        $scope.$on('$ionicView.loaded', function () {
            console.log("$ionicView.loaded: ", vm.title);
        });
        
		$scope.$on('$ionicView.unloaded', function () {
			console.log("$ionicView.unloaded:", vm.title);
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