(function () {
    'use strict';

    angular
        .module('spartan.chatslog', ['ionic'])
        .controller('chatslogController', chatslogController);

    // chatslogController.$inject = ['$location', '$scope', '$timeout', 'roomSelected'];
            
    function chatslogController($location, $scope, $rootScope, $state, $timeout,$ionicTabsDelegate,
     roomSelected, chatslogService, localNotifyService, sharedObjectService, ConvertDateTime) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'chatslogController';
        $ionicTabsDelegate.showBar(true);

        var dataManager = main.getDataManager();

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

        $scope.$on('$ionicView.enter', function() { 
            console.log("$ionicView.enter: ", vm.title);
        });

        $scope.$on('$ionicView.loaded', function () {
            console.log("$ionicView.loaded: ", vm.title);

            activate();
        });
        
		$scope.$on('$ionicView.unloaded', function () {
		    console.log("$ionicView.unloaded:", vm.title);
		});
        
        $scope.$on('getunreadmessagecomplete', function(event, data){
        });

        $scope.$on('onUnreadMessageMapChanged', function (event, data) {
        });
    }
})();