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
    
    function viewGroupMembersCtrl($scope, $stateParams, $ionicModal, roomSelected) {
        $scope.$on('$ionicView.enter', function () {
            //<!-- Contact modal.
            $ionicModal.fromTemplateUrl('templates/modal-contact.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.contactModal = modal;
            });


            //Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function () {
                $scope.contactModal.remove();
            });
            // Execute action on hide modal
            $scope.$on('modal.hidden', function () {
                // Execute action
            });
            // Execute action on remove modal
            $scope.$on('modal.removed', function () {
                // Execute action
            });
        });
        $scope.$on('$ionicView.leave', function () {
            console.debug("leave controller.");
        });
        $scope.$on('$ionicView.unloaded', function () {
            console.info("unloaded controller.");
        });
        $scope.$on('$ionicView.beforeLeave', function () {
            console.info("beforeLeave controller.");
            $scope.contactModal.hide();
        });
        $scope.$on('$ionicView.afterLeave', function () {
            console.info("afterLeave controller.");
        });

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

        $scope.InviteMembers = function () {
            location.href = '#/tab/group/members/' + $scope.chat._id + '/invite';
        }

        $scope.viewContact = function (contactId) {
            console.debug("viewContact", contactId);
            $scope.openContactModal(contactId);
        }

        //<!-- Contact modal -------------------------->
        $scope.openContactModal = function (contactId) {
            initContactModal($scope, contactId, roomSelected, function done() {
                $scope.contactModal.show();
            });
        };
        $scope.closeContactModal = function () {
            $scope.contactModal.hide();
        };
    }
})();
