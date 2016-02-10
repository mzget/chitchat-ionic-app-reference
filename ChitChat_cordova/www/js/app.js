// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter',
     ['ionic','spartan.controllers','spartan.auth', 'spartan.home', 'spartan.chatslog',
	  'starter.directives', 'spartan.chat', 'spartan.media', 'spartan.group', 'spartan.freecall',
      'spartan.services', 'spartan.notify', 'spartan.db', 'ngCordova', 'ngStorage', 'angular-toArrayFilter', 'jrCrop'])


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
	// setup an abstract state for the tabs directive
	.state('tab', {
		url: '/tab',
		abstract: true,
		templateUrl: 'templates/tabs.html'
	})
	// Each tab has its own nav history stack:

        //@ Tab-login state.
	.state(NGStateUtil.tab_login, {
		url: '/login',
		views: {
		    'tab-login': {
		        templateUrl: 'templates/tab-login.html',
		        controller: 'authController'
			}
		}
	})
	.state(NGStateUtil.tab_login_error, {
		url: '/login/error',
		views: {
			'tab-login': {
				templateUrl: 'templates/tab-login-error.html',
				controller: 'noConnection'
			}
		}
	})

        //@ tab-group state.
	.state(NGStateUtil.tab_group, {
		url: '/group',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-group.html',
				controller: 'homeController'
			}
		}
	})
	.state(NGStateUtil.tab_group_viewprofile,{
		url: '/group/member/:chatId',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-group-viewprofile.html',
				controller: 'GroupViewprofileCtrl'
			}
		}
	})
	.state(NGStateUtil.tab_group_members, {
		url: '/group/members',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-group-members.html',
				controller: 'viewGroupMembersCtrl'
			}
		}
	})
	.state(NGStateUtil.tab_group_members_invite, {
		url: '/group/members/invite',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-account-invite.html',
				controller: 'editMemberGroup'
			}
		}
	})
	.state(NGStateUtil.tab_group_members_edit, {
		url: '/group/members/:chatId/edit',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-group-members-edit.html',
				controller: 'editMemberGroup'
			}
		}
	})
	.state(NGStateUtil.tab_group_chat, {
		url: '/group/chat/:chatId',
		views: {
			'tab-group': {
				templateUrl: 'templates/chat-detail.html',
				controller: 'chatController'
			}
		}
	})		
	.state(NGStateUtil.tab_group_freecall, {
		url: '/group/freecall/:chatId',
		views: {
			'tab-group': {
				templateUrl: 'templates/tab-freecall.html',
				controller: 'freecallController'
			}
		}
	})
	
        //@ tab-chats state.
	.state(NGStateUtil.tab_chats, {
		url: '/chats',
		views: {
			'tab-chats': {
				templateUrl: 'templates/tab-chats.html',
				controller: 'chatslogController'
			}
		}
	})	
	.state(NGStateUtil.tab_chats_chat, {
		url: '/chats/chat',
		views: {
		    'tab-chats': {
				templateUrl: 'templates/chat-detail.html',
				controller: 'chatController'
			}
		}
	})
	.state(NGStateUtil.tab_chats_chat_viewprofile, {
	    url: '/chats/chat/profile/:chatId',
		views: {
			'tab-chats': {
				templateUrl: 'templates/tab-group-viewprofile.html',
				controller: 'GroupViewprofileCtrl'
			}
		}
	})
	.state(NGStateUtil.tab_chats_chat_members, {
	    url: '/chats/chat/members/:chatId',
		views: {
			'tab-chats': {
				templateUrl: 'templates/tab-group-members.html',
				controller: 'viewGroupMembersCtrl'
			}
		}
	})
    .state(NGStateUtil.tab_chats_chat_members_invite, {
	    url: '/chats/members/invite',
	    views: {
	        'tab-chats': {
	            templateUrl: 'templates/tab-account-invite.html',
	            controller: 'editMemberGroup'
	        }
	    }
    })

     //@ tab-timeline state.
	.state('tab.timeline', {
		url: '/timeline',
		views: {
			'tab-timeline': {
				templateUrl: 'templates/tab-timeline.html'
//				controller: 'DashCtrl'
			}
		}
	})

     //@ tab-options state.
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

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/tab/login');
});
