(function () {
    'use strict';

    angular
        .module('spartan.controllers')
        .controller('signupController', signupController);

//    voiceCallController.$inject = ['$location'];

    function signupController($location, $http, $scope, $state, $rootScope) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'signupController';
        $scope.account = {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            firstname: '',
            lastname: '',
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
            var account = JSON.parse(JSON.stringify($scope.account));
            if (!!account.username && !!account.email && !!account.password && !!account.firstname && !!account.lastname) {
                if (account.password === account.confirmPassword) {
                    main.getHashService(account.password, function (err, res) {
                        account.password = res;
                        delete account.confirmPassword;


                        var data = {
                            user: account,
                            teamRegister: $rootScope.teamInfo.root
                        };
                        $http.post($rootScope.restServer + '/users/signup', data)
                            .then(function successCallback(response) {
                                console.log(response);
                            }, function errorCallback(response) {
                                console.error(response);
                            });
                    });
                }
                else {
                    console.warn('password and confirm password in not match.');
                }
            }
            else {
                console.warn('Some params is missing.');
            }
        }
    }
})();