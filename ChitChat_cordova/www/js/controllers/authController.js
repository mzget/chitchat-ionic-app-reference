(function () {
    'use strict';

    angular
        .module('spartan.auth', [])
        .controller('authController', authController)
        .controller('noConnection', noConnection);


    authController.$inject = ['$location', "$ionicPlatform", "$state", "networkService"];

    function authController($location, $ionicPlatform, $state, networkService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'authController';
        var registrationId = "";
        
        $ionicPlatform.ready(function () {
            activateBackground();
            activate();

            main.setDataManager(dataManager);
            main.setServerListener(serverEvents);
            main.setServerImp(server);
            main.onMyProfileReadyListener = function (dataManager) {
                $('#login').css('display', 'none');
                $('.bar-stable').css({ 'display': '' });
                $('#splash').css({ 'display': 'none' });

                // Hide spinner dialog
                window.plugins.spinnerDialog.hide();

                //location.href = "#/tab/group";
                $state.go('tab.group');
                activateNetworkService();
            };
            initSpartanServer();

            setTimeout(function () {
                navigator.splashscreen.hide();
            }, 100);
        });

        function activate() {
            console.warn('authController activate');

            console.log("init push notification.");
            var push = PushNotification.init({
                "ios": { "alert": "true", "badge": "true", "sound": "true" },
                "windows": {}
            });

            push.on('registration', function (data) {
                console.warn("registration event", JSON.stringify(data));
                registrationId = data.registrationId;
                localStorage.setItem("registrationId", registrationId);
            });

            push.on('notification', function (data) {
                console.warn("notification event", JSON.stringify(data));

                push.finish(function () {
                    console.warn('finish successfully called');
                });
            });

            push.on('error', function (e) {
                console.error("push error", e.message);
            });
        }
        
        function activateBackground() {
            // Prevent the app from going to sleep in background
            cordova.plugins.backgroundMode.enable();
            // Get informed when the background mode has been activated
            cordova.plugins.backgroundMode.onactivate = function () {
                console.warn("backgroundMode.onactivate");
                cordova.plugins.notification.badge.set(1);
            };
            
            // Get informed when the background mode has been deactivated
            cordova.plugins.backgroundMode.ondeactivate = function () {
                console.warn("backgroundMode.ondeactivate");
                cordova.plugins.notification.badge.clear();
            };
        }

        function activateNetworkService() {
            networkService.regisSocketListener();
        }

        function initSpartanServer() {
            server.init(function (err, server) {
                console.log("Init serve completed is connected:", server._isConnected, JSON.stringify(err));
                if (err !== null) {
                    onServerConnectionFail(err);
                }
                else {
                    onReadyToSigning();
                }
            });
        }

        function onLoginTimeout(param) {
            // Hide spinner dialog
            window.plugins.spinnerDialog.hide();

            navigator.notification.alert(param.message, function callback() { }, "Login Timeout!", "OK");
        }

        function onDuplicateLogin(param) {
            // Hide spinner dialog
            window.plugins.spinnerDialog.hide();

            navigator.notification.confirm("May be you use this app in other devices \n You want to logout other devices",
                function (buttonIndex) {
                    switch (buttonIndex) {
                        case 1:
                            break;
                        case 2:
                            server.kickMeAllSession(param.uid);
                            break;
                    }
                }, "Duplicated login!", ["Cancle", "OK"]);
        }

        function onAuthenFail(errMessage) {
            // Hide spinner dialog
            window.plugins.spinnerDialog.hide();

            navigator.notification.alert(errMessage, function callback() { }, "Login fail!", "OK");
        }

        function onServerConnectionFail(errMessage) {
            // Hide spinner dialog
            window.plugins.spinnerDialog.hide();

            navigator.notification.alert(errMessage, function callback() {
                console.warn("Just go to no connection page.");
                $('#login').css('display', 'none');
                $('.bar-stable').css({ 'display': '' });
                $('#splash').css({ 'display': 'none' });
                window.plugins.spinnerDialog.hide();
                location.href = "#/tab/login/error";
            },
            "Connecting to server fail! \n Please come back again.", "OK");
        }

        function onMissingParams() {
            // Hide spinner dialog
            window.plugins.spinnerDialog.hide();

            navigator.notification.alert("Missing username or password.", function callback() { }, "Cannot login.", "OK");
        }

        function onReadyToSigning() {
            var authen = server.authenData;
            console.log("token: ", authen.token);
            if (!authen.token) {
                $('#splash').css({ 'display': 'none' });

                $('body #login #btn-login').click(function (event) {
                    event.preventDefault();

                    $('body #login input').attr('readonly', true);
                    var email = $('body #login form input[name="email"]').val();
                    var password = $('body #login form input[name="password"]').val();

                    // console.error(email, ":", password)
                    if (!email || !password) {
                        onMissingParams();
                    }
                    else {
                        // Show spinner dialog
                        window.plugins.spinnerDialog.show(null, "loging in...", true);

                        main.getHashService(password, function (err, res) {
                            main.authenUser(server, email, res, function (err, res) {
                                if (!err && res !== null) {
                                    if (res.code === HttpStatusCode.success) {
                                        console.log("Success Login User...");
                                    }
                                    else if (res.code === 1004) {
                                        $('body #login input').attr('readonly', false);

                                        onDuplicateLogin(res);
                                    }
                                    else if (res.code === HttpStatusCode.requestTimeout) {
                                        onLoginTimeout(res);
                                    }
                                }
                                else {
                                    $('body #login input').attr('readonly', false);
                                    // maybe user not found.
                                    onAuthenFail(err);
                                }
                            });
                        });
                    }
                });
            }
            else {
                server.TokenAuthen(authen.token, function (err, res) {
                    if (!err && res !== null) {
                        console.log("Authen result: ", JSON.stringify(res));
                        if (res.success) {
                            main.authenUser(server, res.username, res.password, function (err, res) {
                                if (!err && res !== null) {
                                    if (res.code === 200) {
                                        console.log("Success Authen User...");
                                    }
                                    else {
                                        //<!-- Authen fail.
                                        server.Logout();
                                        location.href = '';

                                        console.error(err, res);
                                        onDuplicateLogin(err);
                                    }
                                }
                                else {
                                    //<!-- Authen fail.
                                    server.Logout();
                                    location.href = '';

                                    console.error(err, res);
                                    onDuplicateLogin(err);
                                }
                            });
                        }
                    }
                });
            }
        }
    }
    function noConnection($scope,$ionicNavBarDelegate,$rootScope,$ionicHistory){
        $ionicNavBarDelegate.showBackButton(false);
        $scope.goBack = function(){
            $ionicHistory.goBack(-1);
        }
    }
})();
