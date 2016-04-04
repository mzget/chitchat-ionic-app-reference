(function () {
    'use strict';

    angular
        .module('spartan.backend')
        .controller('backendMenuController', backendMenuController);

//    backendMenuController.$inject = ['$location']; 

    function backendMenuController($state, $scope) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'backendMenuController';

        activate();

        function activate() { }

		$("body").on("click",".menu-item",function(){
			$(".menu-item").removeClass( "active" );
			$(this).addClass("active");
		});
		$scope.menuMember = function(){ $state.go('members'); }
		$scope.menuOrg = function(){ $state.go('organization'); }
		$scope.menuPjb = function(){ $state.go('projectbase'); }
    }
})();
