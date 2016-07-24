(function () {
    'use strict';

    angular
        .module('spartan.chatslog', [])
        .controller('chatslogController', chatslogController);

    // chatslogController.$inject = ['$location', '$scope', '$timeout', 'roomSelected'];
            
    function chatslogController($location, $scope, $rootScope, $state, $timeout,$ionicTabsDelegate,
     roomSelected, chatslogService, localNotifyService, sharedObjectService, ConvertDateTime) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'chatslogController';
        $ionicTabsDelegate.showBar(true);

            
        $scope.roomAccess = [];
        $scope.gotoChat = gotoChat;

        var dataManager = main.getDataManager();

        activate();
            
        function activate() { 
            console.debug(vm.title, "activate");
            
            displayLogs();
        }

        function displayLogs() {
            $scope.roomAccess = chatslogService.getChatsLog();
        }
        
        function gotoChat(roomId, chatlog)
        {	
            var group = dataManager.getGroup(roomId);
            if ($rootScope.isMobile) {
                roomSelected.setRoom(group);
                $state.go(NGStateUtil.tab_chats_chat, {});
            }
            else {
                $rootScope.$broadcast('changeChat', group);
            }
        };
        
        $scope.$on('getunreadmessagecomplete', function (event, data) {
            displayLogs();
        });

        $scope.$on('onUnreadMessageMapChanged', function (event, data) {
            displayLogs();
        });
    }
})();