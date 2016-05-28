(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('modalFactory', modalFactory);

    function modalFactory($http, $state, $ionicLoading, webRTCFactory, localNotifyService, sharedObjectService) {
        var service = {
            initContactModal: initContactModal,
            initMyProfileModal: initMyProfileModal,
            initContactWeb: initContactWeb
        };
        var room;
        
        return service;

        function initContactWeb($rootScope, contactId) {
            if (server._isConnected) {
                $ionicLoading.show({
                    template: 'Waiting for validation your contact...'
                });
                
                server.getPrivateChatRoomId(dataManager.myProfile._id, contactId, function result(err, res) {
                    if (res.code === HttpStatusCode.success) {
                        var room = JSON.parse(JSON.stringify(res.data));
                        $rootScope.$broadcast('changeChat', room);
                    }
                    else {
                        console.warn(err, res);
                    }
                    
                    $ionicLoading.hide();
                });
            }
            else {
                localNotifyService.makeToast(sharedObjectService.getStringValue().connectionProblem);
            }
        }

        function initContactModal($scope, $rootScope, contactId, roomSelected, done) {
            var contact = main.getDataManager().orgMembers[contactId];
            $scope.contact = contact;
            $scope.chat = chat;
            $scope.freecall = freecall;
            $scope.openViewContactProfile = openViewContactProfile;
            
            function chat() {
                if (ionic.Platform.platform() !== 'ios' && ionic.Platform.platform() !== 'android') {
                    $rootScope.$broadcast('changeChat', room);
                }
                else {
                    roomSelected.setRoom(room);
                    if ($state.current.name === NGStateUtil.tab_chats_chat_members) {
                        $state.go(NGStateUtil.tab_chats_chat);
                    }
                    else if ($state.current.name === NGStateUtil.tab_group || $state.current.name === NGStateUtil.tab_group_members) {
                        $state.go(NGStateUtil.tab_group_chat);
                    }
                }
            };
                    
            function freecall() {
                roomSelected.setRoom(room);

                webRTCFactory.call(contactId);
            };
            
            function openViewContactProfile(id) {
                console.debug(id);
                if ($state.current.name === NGStateUtil.tab_chats_chat_members) {
                    $state.go(NGStateUtil.tab_chats_chat_viewprofile, { chatId: id });
                }
                else if ($state.current.name === NGStateUtil.tab_group || $state.current.name === NGStateUtil.tab_group_members) {
                    $state.go(NGStateUtil.tab_group_viewprofile, { chatId: id });
                }
            }
  
            server.getPrivateChatRoomId(dataManager.myProfile._id, contactId, function result(err, res) {
                console.log('getPrivateChatRoomId', JSON.stringify(res));
                
                if (res.code === HttpStatusCode.success) {
                    room = JSON.parse(JSON.stringify(res.data));

                    $scope.$apply();
                }
                else {
                    console.warn(err, res);
                }
            });

            done();
        }

        function initMyProfileModal($scope, done) {
            $scope.chat = main.getDataManager().myProfile;

            $scope.editProfile = function (chatId) {
                $state.go(NGStateUtil.tab_group_viewprofile, { chatId: chatId });
            };

            done();
        }
    }
})();