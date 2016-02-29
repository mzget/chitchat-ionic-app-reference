(function () {
    'use strict';

    angular
        .module('spartan.controllers')
        .controller('signupController', signupController);

//    voiceCallController.$inject = ['$location'];

    function signupController($location, $http, $scope, $state) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'signupController';
        $scope.account = {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            tel:''
        };
        $scope.gotoSigning = gotoSigning;
        $scope.continue = submitForm;
   
        activate();

        function activate() {

        }

        function gotoSigning() {
            $state.go('login');
        }

        function submitForm() {

        }
    }
})();