// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'spartan.controllers', 'spartan.chat', 'spartan.media', 'starter.services', 'ngCordova'])

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
			StatusBar.styleLightContent();
		}
	});
})

.config(function($stateProvider, $urlRouterProvider) {

	// Ionic uses AngularUI Router which uses the concept of states
	// Learn more here: https://github.com/angular-ui/ui-router
	// Set up the various states which the app can be in.
	// Each state's controller can be found in controllers.js
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
				controller: 'LoginCtrl'
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
				controller: 'GroupMembersCtrl'
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
	
	.state('tab.group-map', {
		url: '/group/chat/:chatId/map',
		views: {
			'tab-group': {
				templateUrl: 'templates/map.html',
				controller: 'MapCtrl'
			}
		}
	})
	
	.state('tab.chats', {
		url: '/chats',
		views: {
			'tab-chats': {
				templateUrl: 'templates/tab-chats.html',
				controller: 'ChatsCtrl'
			}
		}
	})
	
	
	/*
    .state('tap.chat.map', {
        url: '/chat/map',
        views: {
            'tab-chats': {
				templateUrl: 'templates/map.html',
				controller: 'chatController'
			}
        }
    })
	*/
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
				templateUrl: 'templates/tab-timeline.html',
				controller: 'DashCtrl'
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
