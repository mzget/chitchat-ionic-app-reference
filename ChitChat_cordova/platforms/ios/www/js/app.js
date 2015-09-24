// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

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
				//controller: 'LoginCtrl'
			}
		}
	})


	// GROUP
	.state('tab.group', {
		url: '/group',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-group.html',
				controller: 'GroupCtrl'
			}
		}
	})
	
	// GROUP - Profile
	.state('tab.group-myprofile', {
		url: '/group/myprofile',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-group-myprofile.html',
				controller: 'GroupMyprofileCtrl'
			}
		}
	})
	
	// GROUP - Type
	.state('tab.group-projectbasegroup', {
		url: '/group/projectbasegroup/:chatId',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-group-orggroup.html',
				controller: 'GroupProjectbaseCtrl'
			}
		}
	})
	
	.state('tab.group-privategroup', {
		url: '/group/privategroup/:chatId',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-group-orggroup.html',
				controller: 'GroupPrivateCtrl'
			}
		}
	})
	
	.state('tab.group-orggroup', {
		url: '/group/orggroup/:chatId',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-group-orggroup.html',
				controller: 'GroupOrggroupsCtrl'
			}
		}
	})
	
	.state('tab.group-detail', {
		url: '/group/detail/:chatId',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-group-detail.html',
				controller: 'GroupDetailCtrl'
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
	.state('tab.chats', {
		url: '/chats',
		views: {
			'tab-chats': {
				templateUrl: 'templates/tab-chats.html',
				controller: 'ChatsCtrl'
			}
		}
	})
	
	.state('tab.chat-detail', {
		url: '/chats/:chatId',
		views: {
			'tab-chats': {
				templateUrl: 'templates/chat-detail.html',
				controller: 'ChatDetailCtrl'
			}
		}
	})

	.state('tab.message', {
		url: '/message/:chatId',
		views: {
			'tab-message': {
				templateUrl: 'templates/chat-detail.html',
				controller: 'ChatDetailCtrl'
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
	});

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/tab/login');

});
