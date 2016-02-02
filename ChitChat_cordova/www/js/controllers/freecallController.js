/// <reference path="../bootstrap.js" />
angular.module('spartan.freecall', [])

.controller('freecallController',
function ($scope, $timeout, $stateParams, $rootScope, $state, $ionicScrollDelegate, $ionicPopup, $ionicPopover, $ionicLoading, $ionicModal,
	$sce, $cordovaGeolocation, $cordovaDialogs,
    chatRoomService, roomSelected, Favorite, blockNotifications, localNotifyService, sharedObjectService, networkService)
{
    $scope.calling = true;
});