// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter',
     ['ionic','spartan.controllers', 'spartan.home', 'spartan.chatslog',
	  'spartan.directives', 'spartan.chat', 'spartan.media', 'spartan.group', 'spartan.backend', 'ui.select2',
      'spartan.services', 'spartan.notify', 'spartan.db', 'ngCordova', 'ngStorage', 'ngMaterial', 'ngMessages', 'datatables','angular-toArrayFilter', 'angular-web-notification', 'ui.router'])


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
	$ionicConfigProvider.views.transition('none');
	$ionicConfigProvider.views.swipeBackEnabled(false);

	console.info('state config...');
	
	$stateProvider
    .state('login', {
	    url: '/login',
	    templateUrl: 'templates_web/tab-login.html',
	    controller: 'authController'
	})
    .state('signup', {
        url: "signup",
        templateUrl: "templates_web/signup-web.html",
        controller: 'signupController'
    })
	.state('chats', {
	    url: "/chats",
	    views: {
	        '': { //@ Header and company info.
	            templateUrl: 'templates_web/chats.html',
	            controller: "InfoCtrl"
	        },
	        "chats-list@chats": { //@ tabs-groups, tabs-chats,
	            abstract: true,
	            templateUrl: 'templates_web/tabs-web.html',
	        },
	        "chats-detail@chats": { //@Chat activity.
	            templateUrl: "templates_web/chat-detail.html",
	            controller: "chatController"
	        },
	        "chats-info@chats": { //@Chat room informations.
	            templateUrl: "templates_web/chat-info.html"
	        },
	    }
	})
        /*
        * Backend-sections...
        */
    .state('backend',{
        url: '/backend',
        abstract: true,
	    templateUrl: 'backend/templates/menu.html',
	    controller: "backendMenuController"
    })
    /**
     * Members manager...
     */
	.state('backend.members', {
	    url: '/members'
	})
	.state('backend.member-info', {
	    url: '/members/:memberId'
	})
	.state('members-new', {
	    url: '/backend/members/newmember',
	    templateUrl: 'backend/templates/member-newmember.html',
	    controller: "backendMembers"
	})
    /**
     * Groups-manager...
     */
	.state('backend.organization', {
	    url: '/organization'
	})
	.state('organization-create', {
	    url: '/backend/organization/create',
	    templateUrl: 'backend/templates/org-create.html',
	    controller: "backendOrgController"
	})
	.state('organization-member', {
	    url: '/backend/organization/:groupId',
	    templateUrl: 'backend/templates/org-members.html',
	    controller: "backendOrgController"
	})
	.state('backend.projectbase', {
	    url: '/projectbase'
	})
	.state('projectbase-create', {
	    url: '/backend/projectbase/create',
	    templateUrl: 'backend/templates/pjb-create.html',
	    controller: "backendPjbController"
	})
	.state('projectbase-member', {
	    url: '/backend/projectbase/:groupId',
	    templateUrl: 'backend/templates/pjb-members.html',
	    controller: "backendPjbController"
	})

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/login');
})

    /*
.directive('menu', function () {
	return {
	    restrict: 'A', //This menas that it will be used as an attribute and NOT as an element. I don't like creating custom HTML elements
	    replace: true,
	    templateUrl: "backend/templates/menu.html",
	    controller: "backendMenuController"
	}
});
*/