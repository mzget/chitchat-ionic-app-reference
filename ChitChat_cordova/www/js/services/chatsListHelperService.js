/// <reference path="../../../typings/index.d.ts" />

(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('chatsListHelperService', chatsListHelperService);

    function chatsListHelperService($http, $state, $ionicLoading, chatslogService) {
        var service = {
            highlightContactRoom: highlightContactRoom,
            highlightGroup: highlightGroup,
            highlightChatslog: highlightChatslog
        };

        return service;

        function highlightChatslog(roomId) {
            var roomAccess = chatslogService.getChatsLog();
            var docID = "log:" + roomId;   
            async.map(roomAccess, function iterator(item, result) {
                var _doc = "log:" + item.id;
                if (document.getElementById(_doc) != null) {
                    document.getElementById(_doc).style = "";
                }
                result();
            }, function done(err) {
                if (document.getElementById(docID) != null) {
                    document.getElementById(docID).style.background = "#C5CAE9";
                }
            });
        }

        function highlightContactRoom(contactId) {
            return new Promise(function (resolve, reject) {
                async.map(main.getDataManager().orgMembers, function iterator(item, result) {
                    if (document.getElementById(item._id) != null) {
                        document.getElementById(item._id).style = "";
                    }
                    result();
                }, function done(err) {
                    if (document.getElementById(contactId) != null) {
                        document.getElementById(contactId).style.background = "#C5CAE9";
                    }
                    resolve();
                });
            });
        }

        function highlightGroup(groupId) {
            var group = main.getDataManager().getGroup(groupId);

            var unHighlightOrgGroup = function () {
                return new Promise(function resolver(resolve, reject) {
                    async.map(main.getDataManager().orgGroups, function iterator(item, result) {
                        if (document.getElementById(item._id) != null) {
                            document.getElementById(item._id).style = "";
                        }
                        result();
                    }, function done(err) {
                        resolve();
                    });
                });
            }
            var unHighlightProjectBaseGroup = function () {
                return new Promise(function resolver(resolve, reject) {
                    async.map(main.getDataManager().projectBaseGroups, function iterator(item, result) {
                        if (document.getElementById(item._id) != null) {
                            document.getElementById(item._id).style = "";
                        }
                        result();
                    }, function done(err) {
                        resolve();
                    });
                });
            }
            var unHighlightPrivateGroups = function () {
                return new Promise(function resolver(resolve, reject) {
                    async.map(main.getDataManager().privateGroups, function iterator(item, result) {
                        if (document.getElementById(item._id) != null) {
                            document.getElementById(item._id).style = "";
                        }
                        result();
                    }, function done(err) {
                        resolve();
                    });
                });
            }
            var unHighlightContactRoom = function () {
                return new Promise(function resolver(resolve, reject) {
                    try {
                        if (group.type === RoomType.privateChat) {
                            resolve();
                        }
                        else {
                            async.map(main.getDataManager().orgMembers, function iterator(item, result) {
                                if (document.getElementById(item._id) != null) {
                                    document.getElementById(item._id).style = "";
                                }
                                result();
                            }, function done(err) {
                                resolve();
                            });
                        }
                    }
                    catch(err){
                        console.warn("There is no have a group info in room store." + err);
                        resolve();
                    }
                });
            }

            unHighlightOrgGroup()
                .then(unHighlightProjectBaseGroup())
                .then(unHighlightPrivateGroups())
                .then(unHighlightContactRoom())
                .then(function () {
                    if (document.getElementById(groupId) != null) {
                        document.getElementById(groupId).style.background = "#C5CAE9";
                    }
                });
        }
    }
})();