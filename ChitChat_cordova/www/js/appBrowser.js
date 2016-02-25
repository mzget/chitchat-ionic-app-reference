// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter',
     ['ionic','spartan.controllers', 'spartan.home', 'spartan.chatslog',
	  'starter.directives', 'spartan.chat', 'spartan.media', 'spartan.group',
      'spartan.services', 'spartan.notify', 'spartan.db', 'ngCordova', 'ngStorage', 'ngMaterial', 'angular-toArrayFilter', 'ui.router'])


.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);

		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			
            //StatusBar.styleLightContent();
		    StatusBar.styleDefault();            
		}
		
		console.log("$ionicPlatform.ready");
	});

	var currentPlatform = ionic.Platform.platform();
	var currentPlatformVersion = ionic.Platform.version();
	console.log("currentPlatform", currentPlatform, currentPlatformVersion);
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

	// Ionic uses AngularUI Router which uses the concept of states
	// Learn more here: https://github.com/angular-ui/ui-router
	// Set up the various states which the app can be in.
	// Each state's controller can be found in controllers.js

	$ionicConfigProvider.views.swipeBackEnabled(false);
	
	$stateProvider

	.state('login', {
		url: '/login',
		templateUrl: 'templates_web/tab-login.html',
		controller: 'authController'
	})

	.state('chats', {
        url: "/chats",
        views: {
            '': {
                templateUrl: 'templates_web/chats.html',
                controller: "InfoCtrl"
            },
            "chats-account@chats": {
                templateUrl: "templates_web/teamInfo-web.html",
                controller: "companyController"
            },
            "chats-list@chats": {
                abstract: true,
                templateUrl: 'templates_web/tabs-web.html',     
            },
            "chats-detail@chats": {
                templateUrl: "templates_web/chat-detail.html",
                controller: "chatController"
            },
            "chats-info@chats": {
                templateUrl: "templates_web/chat-info.html"
            },
        }
	})

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/login');

    // .state('chats.detail', {
    // 	views: {
    // 		"detail" : { templateUrl: 'templates/chats.html', controller: 'homeController' }, 
    // 		"detail@contacts" : {  templateUrl: 'templates/chats.html', controller: 'homeController'  }
    // 	}
    // })



// 	// ERROR
// 	.state('tab.login-error', {
// 		url: '/login/error',
// 		views: {
// 			'tab-login': {
// 				templateUrl: 'templates/tab-login-error.html',
// 				controller: 'noConnection'
// 			}
// 		}
// 	})

// 	// GROUP
// 	.state('tab.group', {
// 		url: '/group',
// 		views: {
// 			'tab-group': {
// 				templateUrl: 'templates/tab-group.html',
// 				controller: 'homeController'
// 			}
// 		}
// 	})

// 	// GROUP - View Profile
// 	.state('tab.group-viewprofile',{
// 		url: '/group/member/:chatId',
// 		views: {
// 			'tab-group': {
// 				templateUrl: 'templates/tab-group-viewprofile.html',
// 				controller: 'GroupViewprofileCtrl'
// 			}
// 		}
// 	})
		
// 	// GROUP - Members
// 	.state('tab.group-members', {
// 		url: '/group/members/:chatId',
// 		views: {
// 			'tab-group': {
// 				templateUrl: 'templates/tab-group-members.html',
// 				controller: 'viewGroupMembersCtrl'
// 			}
// 		}
// 	})

// 	.state('tab.group-members-invite', {
// 		url: '/group/members/:chatId/invite',
// 		views: {
// 			'tab-group': {
// 				templateUrl: 'templates/tab-account-invite.html',
// 				controller: 'editMemberGroup'
// 			}
// 		}
// 	})//

// 	.state('tab.group-members-edit', {
// 		url: '/group/members/:chatId/edit',
// 		views: {
// 			'tab-group': {
// 				templateUrl: 'templates/tab-group-members-edit.html',
// 				controller: 'editMemberGroup'
// 			}
// 		}
// 	})
	
// 	// CHATS - Notification
// 	//.state('tab.chats', {
// 	//	url: '/chats',
// 	//	views: {
// 	//		'tab-chats': {
// 	//			templateUrl: 'templates/tab-chats.html',
// 	//			controller: 'ChatsCtrl'
// 	//		}
// 	//	}
// 	//})
	
// 	.state('tab.group-chat', {
// 		url: '/group/chat/:chatId',
// 		views: {
// 			'tab-group': {
// 				templateUrl: 'templates/chat-detail.html',
// 				controller: 'homeController'
// 			}
// 		}
// 	})
	
// 	.state('tab.group-freecall', {
// 		url: '/group/freecall/:chatId',
// 		views: {
// 			'tab-group': {
// 				templateUrl: 'templates/tab-freecall.html',
// 				controller: 'freecallController'
// 			}
// 		}
// 	})
	
// 	.state('tab.chats', {
// 		url: '/chats',
// 		views: {
// 			'tab-chats': {
// 				templateUrl: 'templates/tab-chats.html',
// 				controller: 'chatslogController'
// 			}
// 		}
// 	})
	
// 	.state('tab.chats-chat', {
// 		url: '/chats/chat/:chatId',
// 		views: {
// 			'tab-chats': {
// 				templateUrl: 'templates/chat-detail.html',
// 				controller: 'chatController'
// 			}
// 		}
// 	})

// 	.state('tab.chats-chat-viewprofile',{
// 		url: '/chats/member/:chatId',
// 		views: {
// 			'tab-chats': {
// 				templateUrl: 'templates/tab-group-viewprofile.html',
// 				controller: 'GroupViewprofileCtrl'
// 			}
// 		}
// 	})
// 	.state('tab.chats-chat-members', {
// 		url: '/chats/members/:chatId',
// 		views: {
// 			'tab-chats': {
// 				templateUrl: 'templates/tab-group-members.html',
// 				controller: 'viewGroupMembersCtrl'
// 			}
// 		}
// 	})
	
// 	/*
// 	// CHAT : Message
// 	.state('tab.message', {
// 		url: '/message/:chatId',
// 		views: {
// 			'tab-message': {
// 				templateUrl: 'templates/chat-detail.html',
// 				controller: 'ChatDetailCtrl'
// 			}
// 		}
// 	})
// 	*/
	
// 	.state('tab.timeline', {
// 		url: '/timeline',
// 		views: {
// 			'tab-timeline': {
// 				templateUrl: 'templates/tab-timeline.html'
// //				controller: 'DashCtrl'
// 			}
// 		}
// 	})

// 	.state('tab.account', {
// 		url: '/account',
// 		views: {
// 			'tab-account': {
// 				templateUrl: 'templates/tab-account.html',
// 				controller: 'AccountCtrl'
// 			}
// 		}
// 	})

// 	.state('tab.account-create', {
// 		url: '/account/create',
// 		views: {
// 			'tab-account': {
// 				templateUrl: 'templates/tab-account-create.html',
// 				controller: 'AccountCreate'
// 			}
// 		}
// 	})

// 	.state('tab.account-invite', {
// 		url: '/account/create/invite',
// 		views: {
// 			'tab-account': {
// 				templateUrl: 'templates/tab-account-invite.html',
// 				controller: 'AccountInvite'
// 			}
// 		}
// 	})
	
// 	.state('tab.chat.readers', {
// 		url: '/group/chat/readers',
// 		views: {
// 			'tab-group' : {
// 				templateUrl : 'templates/reader-view.html',
// 				controller: 'chatController'
// 			}
// 		}	
// 	});
});
