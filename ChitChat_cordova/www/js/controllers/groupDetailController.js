(function () {
    'use strict';

    angular
        .module('spartan.group', [])
        .controller('groupDetailController', groupDetailController)
        .controller('viewGroupMembersCtrl', viewGroupMembersCtrl);

    groupDetailController.$inject = ['$location']; 

    function groupDetailController($location) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'groupDetailController';

        activate();

        function activate() { }
    }
    
    function viewGroupMembersCtrl($scope, $stateParams, roomSelected) {
        var room = roomSelected.getRoom();
        var group = null;
        switch (room.type) {
            case 0:
                group = main.getDataManager().orgGroups[$stateParams.chatId];
                break;
            case 1:
                group = main.getDataManager().projectBaseGroups[$stateParams.chatId];
                break;
            case 2:
                group = main.getDataManager().privateGroups[$stateParams.chatId];
                break;
            default:
                break;
        }

        var gMembers = group.members;

        $scope.chat = group;
        groupMembers(gMembers, gMembers.length, function done(members) {
            $scope.members = members;
        });
        $scope.members_length = gMembers.length;
    }
})();
