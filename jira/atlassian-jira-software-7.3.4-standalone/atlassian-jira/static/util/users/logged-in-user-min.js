define("jira/util/users/logged-in-user",["jira/util/data/meta"],function(meta){var User={};User.username=function(){return meta.get("remote-user")};User.fullName=function(){return meta.get("remote-user-fullname")};User.isAnonymous=function(){return meta.get("remote-user")===""};User.isSysadmin=function(){return !!meta.getBoolean("is-sysadmin")};User.isAdmin=function(){return !!meta.getBoolean("is-admin")};return User});