(function () {
    'use strict';

    angular
        .module('spartan.backend')
        .controller('backendMenuController', backendMenuController);

//    backendMenuController.$inject = ['$location']; 

    function backendMenuController($location, $scope, $rootScope, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'backendMenuController';
        $scope.stateName = '';
		$scope.menuMember = function(){ 
            $state.go('backend.members');
        }
		$scope.menuOrg = function() {
            $state.go('backend.organization');
        }
		$scope.menuPjb = function() { 
            $state.go('backend.projectbase');
        }

        if(!server._isConnected) {
                location.href = '';
            }

        activate();

        function activate() {
            console.info('activate', vm.title);
        }

        $scope.$on('$ionicView.enter', function() { 
            console.info('$ionicView.enter: ', vm.title);
           
            $scope.stateName = $state.current.name;
        });

		$("body").on("click",".menu-item",function() {
			$(".menu-item").removeClass( "active" );
			$(this).addClass("active");
		});
        
        $rootScope.$on('$stateChangeSuccess', 
            function(event, toState, toParams, fromState, fromParams) {                 
                console.debug('$state info: ', JSON.stringify(toState));
                
                $scope.stateName = toState.name;
                $rootScope.$broadcast('stateChanged', {toState: toState, toParams: toParams, fromState: fromState, fromParams: fromParams});
            })
        }
})();
