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

        var dataManager = main.getDataManager();

        activate();
            
        function activate() { 
            console.warn(vm.title, "activate");
            
            $scope.roomAccess = [];

            displayLogs();
        }

        function displayLogs() {
            $scope.roomAccess = chatslogService.getChatsLog();
        }
        
        $scope.gotoChat = function (roomId, chatlog) 
        {	
            var group = dataManager.getGroup(roomId);
            roomSelected.setRoom(group);
            $state.go(NGStateUtil.tab_chats_chat, {});
        };
        
        $scope.$on('getunreadmessagecomplete', function(event, data){
        });

        $scope.$on('onUnreadMessageMapChanged', function (event, data) {
        });
    }
})();