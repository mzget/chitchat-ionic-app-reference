(function () {
    'use strict';

    angular
        .module('spartan.auth', [])
        .controller('authController', authController);

    authController.$inject = ['$location']; 

    function authController($location) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'authController';
        var registrationId = "";
        
        navHide();
        
        activate();

        function activate() {
            console.debug('authController activate');

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
			    console.warn('goto group');
			    $('#login').css('display','none');
			    $('.bar-stable').css({'display':''});
			    $('#splash').css({'display':'none'});
			    location.href = "#/tab/group";					
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
									    if (res.code === 200) {
										    console.log("Success Login User...");
									    }
									    else if(res.code === 1004) {
										    $('body #login input').attr('readonly', false);
										
										    onDuplicateLogin(res);
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
		
			function onDuplicateLogin(param) {
				navigator.notification.confirm("May be you use this app in other devices \n You want to logout other devices", function (buttonIndex) {
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
    }
})();
