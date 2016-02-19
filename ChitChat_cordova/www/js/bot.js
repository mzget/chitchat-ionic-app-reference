// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter',
     ['ionic','spartan.controllers', 'spartan.home', 'spartan.chatslog',
	  'starter.directives', 'spartan.chat', 'spartan.media', 'spartan.group', 'spartan.bot',
      'spartan.services', 'spartan.notify', 'spartan.db', 'ngCordova', 'ngStorage'])


.run(function($ionicPlatform) {

    var currentPlatform = ionic.Platform.platform();
    var currentPlatformVersion = ionic.Platform.version();
    console.log("currentPlatform", currentPlatform, currentPlatformVersion);

	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
	    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
	        if (currentPlatform !== "win32") {
	            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
	            cordova.plugins.Keyboard.disableScroll(true);
	        }
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleLightContent();
		}
		
		console.log("$ionicPlatform.ready");
	});
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

	// Ionic uses AngularUI Router which uses the concept of states
	// Learn more here: https://github.com/angular-ui/ui-router
	// Set up the various states which the app can be in.
	// Each state's controller can be found in controllers.js

	$ionicConfigProvider.views.swipeBackEnabled(false);
	
	$stateProvider
	// setup an abstract state for the tabs directive
	.state('tab', {
		url: '/tab',
		abstract: true,
		templateUrl: 'templates/tabs.html'
	})

	// Each tab has its own nav history stack:

	// LOGIN
	.state('tab.login', {
		url: '/login',
		views: {
		    'tab-login': {
		        templateUrl: 'templates/tab-login.html',
		        controller: 'botAuthController'
			}
		}
	})

	// ERROR
	.state('tab.login-error', {
		url: '/login/error',
		views: {
			'tab-login': {
				templateUrl: 'templates/tab-login-error.html',
				controller: 'noConnection'
			}
		}
	})

	// BOT
	.state('tab.bot', {
	    url: '/bot',
	    views: {
	        'tab-group': {
	            templateUrl: 'templates/tab-bot.html',
	            controller: 'botController'
	        }
	    }
	})

	// GROUP
	.state('tab.group', {
		url: '/group',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-group.html',
				controller: 'homeController'
			}
		}
	})

	// GROUP - View Profile
	.state('tab.group-viewprofile',{
		url: '/group/member/:chatId',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-group-viewprofile.html',
				controller: 'GroupViewprofileCtrl'
			}
		}
	})
		
	// GROUP - Members
	.state('tab.group-members', {
		url: '/group/members/:chatId',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-group-members.html',
				controller: 'viewGroupMembersCtrl'
			}
		}
	})

	.state('tab.group-members-invite', {
		url: '/group/members/:chatId/invite',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-account-invite.html',
				controller: 'editMemberGroup'
			}
		}
	})//

	.state('tab.group-members-edit', {
		url: '/group/members/:chatId/edit',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-group-members-edit.html',
				controller: 'editMemberGroup'
			}
		}
	})
	
	// CHATS - Notification
	//.state('tab.chats', {
	//	url: '/chats',
	//	views: {
	//		'tab-chats': {
	//			templateUrl: 'templates/tab-chats.html',
	//			controller: 'ChatsCtrl'
	//		}
	//	}
	//})
	
	.state('tab.group-chat', {
		url: '/group/chat/:chatId',
		views: {
			'tab-group': {
				templateUrl: 'templates/chat-detail.html',
				controller: 'chatController'
			}
		}
	})
	
	.state('tab.chats', {
		url: '/chats',
		views: {
			'tab-chats': {
				templateUrl: 'templates/tab-chats.html',
				controller: 'chatslogController'
			}
		}
	})
	
	.state('tab.chats-chat', {
		url: '/chats/chat/:chatId',
		views: {
			'tab-chats': {
				templateUrl: 'templates/chat-detail.html',
				controller: 'chatController'
			}
		}
	})

	.state('tab.chats-chat-viewprofile',{
		url: '/chats/member/:chatId',
		views: {
			'tab-chats': {
				templateUrl: 'templates/tab-group-viewprofile.html',
				controller: 'GroupViewprofileCtrl'
			}
		}
	})
	.state('tab.chats-chat-members', {
		url: '/chats/members/:chatId',
		views: {
			'tab-chats': {
				templateUrl: 'templates/tab-group-members.html',
				controller: 'viewGroupMembersCtrl'
			}
		}
	})
	
	/*
	// CHAT : Message
	.state('tab.message', {
		url: '/message/:chatId',
		views: {
			'tab-message': {
				templateUrl: 'templates/chat-detail.html',
				controller: 'ChatDetailCtrl'
			}
		}
	})
	*/
	
	// Free Call
	.state('tab.freecall', {
		url: '/freecall/:chatId',
		views: {
			'tab-freecall': {
				templateUrl: 'templates/tab-freecall.html',
				controller: 'FreecallCtrl'
			}
		}
	})
	
	.state('tab.timeline', {
		url: '/timeline',
		views: {
			'tab-timeline': {
				templateUrl: 'templates/tab-timeline.html'
//				controller: 'DashCtrl'
			}
		}
	})

	.state('tab.account', {
		url: '/account',
		views: {
			'tab-account': {
				templateUrl: 'templates/tab-account.html',
				controller: 'AccountCtrl'
			}
		}
	})

	.state('tab.account-create', {
		url: '/account/create',
		views: {
			'tab-account': {
				templateUrl: 'templates/tab-account-create.html',
				controller: 'AccountCreate'
			}
		}
	})

	.state('tab.account-invite', {
		url: '/account/create/invite',
		views: {
			'tab-account': {
				templateUrl: 'templates/tab-account-invite.html',
				controller: 'AccountInvite'
			}
		}
	})
	
	.state('tab.chat.readers', {
		url: '/group/chat/readers',
		views: {
			'tab-group' : {
				templateUrl : 'templates/reader-view.html',
				controller: 'chatController'
			}
		}	
	});

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/tab/login');
});
