(function () {
    'use strict';

    angular
        .module('spartan.auth', [])
        .controller('authController', authController);

    authController.$inject = ['$location', "$ionicPlatform", "networkService"];

    function authController($location, $ionicPlatform, networkService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'authController';
        var registrationId = "";
        
        navHide();

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
            
		    main.setDataManager(dataManager);
		    main.setServerListener(serverEvents);
		    main.setServerImp(server);
		    main.onMyProfileReadyListener = function(dataManager) {
			    $('#login').css('display','none');
			    $('.bar-stable').css({'display':''});
			    $('#splash').css({ 'display': 'none' });

			    location.href = "#/tab/group";
			    activateNetworkService();
		    };
		    server.init(function (err, server) {
			    console.info("init server connection", err, server);
			    if(err) {
				    onServerConnectionFail(err);
			    }
			    else { 
				    var authen = server.authenData;
				    console.log("token: ", authen.token);
				    if (!authen.token) {
					    $('#splash').css({ 'display': 'none' });
	
					    $('body #login #btn-login').click(function (event) {
						    event.preventDefault();
						    $('body #login input').attr('readonly', true);
						    var email = $('body #login form input[name="email"]').val();
						    var password = $('body #login form input[name="password"]').val();
	
						    main.getHashService(password, function (err, res) {
							    main.authenUser(server, email, res, function (err, res) {
								    if (!err && res !== null) {
									    if (res.code === HttpStatusCode.success) {
										    console.log("Success Login User...");
									    }
									    else if(res.code === 1004) {
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
		    });
		    function onLoginTimeout(param) {
		        navigator.notification.alert(param.message, function callback() { }, "Login Timeout!", "OK");
		    }
			function onDuplicateLogin(param) {
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
				navigator.notification.alert(errMessage, function callback() {}, "Login fail!", "OK");
			}
			
			function onServerConnectionFail(errMessage) {
				navigator.notification.alert(errMessage, function callback() {}, "Connecting to server fail!", "OK");
			}
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

        $ionicPlatform.ready(function () {
            activateBackground();
            activate();
            setTimeout(function() {
		        navigator.splashscreen.hide();
		    }, 100);
        });
    }
})();
