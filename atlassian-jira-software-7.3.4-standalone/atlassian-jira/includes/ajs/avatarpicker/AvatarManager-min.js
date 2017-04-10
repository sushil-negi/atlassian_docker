define("jira/ajs/avatarpicker/avatar-manager",["jira/util/formatter","jira/lib/class","wrm/context-path","jquery"],function(formatter,Class,wrmContextPath,jQuery){var contextPath=wrmContextPath();return Class.extend({init:function(options){this.store=options.store;this.ownerId=options.ownerId;this.username=options.username;this.anonymousAvatarId=options.anonymousAvatarId;this.avatarSrcBaseUrl=options.avatarSrcBaseUrl},selectAvatar:function(avatar,options){return this.store.selectAvatar(avatar,options)},getById:function(id){return this.store.getById(id)},destroy:function(avatar,options){this.store.destroy(avatar,options)},update:function(avatar,options){this.store.update(avatar,options)},add:function(avatar,options){this.store._add(avatar,options)},getAllSystemAvatars:function(){return this.store.getAllSystemAvatars()},getAllCustomAvatars:function(){return this.store.getAllCustomAvatars()},getSelectedAvatar:function(){return this.store.getSelectedAvatar()},getAllAvatars:function(){return this.store.getAllAvatars()},getAllAvatarsRenderData:function(size){var i;var instance=this;var avatars=this.getAllAvatars();var renderData={system:[],custom:[]};for(i=0;i<avatars.system.length;i++){renderData.system.push(instance.getAvatarRenderData(avatars.system[i],size))}for(i=0;i<avatars.custom.length;i++){renderData.custom.push(instance.getAvatarRenderData(avatars.custom[i],size))}return renderData},getAvatarRenderData:function(avatar,size){var data=avatar.toJSON();data.src=this.getAvatarSrc(avatar,size);data.width=size.width;data.height=size.height;return data},refreshStore:function(options){this.store.refresh(options)},getAvatarSrc:function(avatar,size){if(this.store.isTempAvatar(avatar)){return contextPath+"/secure/temporaryavatar?"+jQuery.param({cropped:true,magic:new Date().getTime(),size:size.param})}return avatar.getUrl(formatter.format("{0}x{1}",size.height,size.width))},createTemporaryAvatar:function(field,options){this.store.createTemporaryAvatar(field,options)},createAvatarFromTemporary:function(instructions,options){this.store.createAvatarFromTemporary(instructions,options)},getAnonymousAvatarId:function(){return this.anonymousAvatarId}})});define("jira/ajs/avatarpicker/avatar-manager-factory",["jira/ajs/avatarpicker/avatar-store","jira/ajs/avatarpicker/avatar-manager","wrm/context-path","exports"],function(AvatarStore,AvatarManager,wrmContextPath,exports){var contextPath=wrmContextPath();exports.createUniversalAvatarManager=function(options){var restQueryUrl;var restUpdateUrl="";var restCreateTempUrl="";var restUpdateTempUrl="";var restSingleAvatarUrl="";if(options.projectId){var urlAvatarOwnerPrefix=contextPath+"/rest/api/latest/universal_avatar/type/"+options.avatarType+"/owner/"+options.projectId;restQueryUrl=urlAvatarOwnerPrefix;var avatarCreateUrl=urlAvatarOwnerPrefix+"/avatar";restUpdateUrl=null;restCreateTempUrl=urlAvatarOwnerPrefix+"/temp";restUpdateTempUrl=avatarCreateUrl;restSingleAvatarUrl=avatarCreateUrl}else{restQueryUrl=contextPath+"/rest/api/latest/avatar/project/system";restCreateTempUrl=contextPath+"/rest/api/latest/avatar/project/temporary";restUpdateTempUrl=contextPath+"/rest/api/latest/avatar/project/temporaryCrop"}var store=new AvatarStore({restQueryUrl:restQueryUrl,restUpdateUrl:restUpdateUrl,restCreateTempUrl:restCreateTempUrl,restUpdateTempUrl:restUpdateTempUrl,restSingleAvatarUrl:restSingleAvatarUrl,defaultAvatarId:options.defaultAvatarId});return new AvatarManager({store:store,ownerId:options.projectId,avatarSrcBaseUrl:contextPath+"/secure/projectavatar"})};exports.createProjectAvatarManager=function(options){options.avatarType="project";return exports.createUniversalAvatarManager(options)};exports.createUserAvatarManager=function(options){var userRestUrl=contextPath+"/rest/api/latest/user";var store=new AvatarStore({restQueryUrl:userRestUrl+"/avatars",restUpdateUrl:userRestUrl+"/avatar",restCreateTempUrl:userRestUrl+"/avatar/temporary",restUpdateTempUrl:userRestUrl+"/avatar",restSingleAvatarUrl:userRestUrl+"/avatar",restParams:{"username":options.username},defaultAvatarId:options.defaultAvatarId});return new AvatarManager({store:store,username:options.username,avatarSrcBaseUrl:contextPath+"/secure/useravatar"})}});