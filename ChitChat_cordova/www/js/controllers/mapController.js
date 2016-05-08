
(function () {
    'use strict';

    angular
        .module('spartan.controllers')
        .controller('mapController', mapController);

    function mapController($location, $scope, $rootScope, $mdDialog) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'mapController';
        
        $scope.viewOnly;
        $scope.closeMapModal = function hide() {
            $mdDialog.hide();
        };
        $scope.place;
        $scope.latitude;
        $scope.longitude;
        
        console.log('activate', vm.title);    
        $scope.$on('getPosReady', function (event, data) {
            console.log(data);
            $scope.viewOnly = data.viewType;
            $scope.place = data.place;
            $scope.latitude = data.lat;
            $scope.longitude = data.lng;
        });
        
	    $scope.selectedPlace = function (place) {
		    console.debug('onSelectMarker', place)
		    $scope.place = place.name;
		    $scope.myLocation = place;
	    };

	    $scope.share = function () {
		    if (!$scope.place) {
			    $cordovaDialogs.alert('Missing place information', 'Share location', 'OK')
			       .then(function () {
				       // callback success
			       });

			    return;
		    }
	        //            console.log('share', $scope.myLocation.geometry.location.lat());
            
		    var locationObj = new MinLocation();
		    locationObj.name = $scope.myLocation.name;
		    locationObj.address = $scope.myLocation.vicinity;
		    locationObj.latitude = $scope.myLocation.geometry.location.lat();
		    locationObj.longitude = $scope.myLocation.geometry.location.lng();

		    $rootScope.$broadcast('onShareLocation', locationObj);
		    $mdDialog.hide();
	    }
    }
})();