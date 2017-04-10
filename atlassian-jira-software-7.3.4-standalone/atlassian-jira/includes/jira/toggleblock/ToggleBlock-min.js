define("jira/toggleblock/toggle-block",["jira/util/logger","jira/lib/class","jira/util/events","jira/util/events/types","jira/data/local-storage","jquery","jira/libs/parse-uri"],function(logger,Class,Events,Types,localStorage,$,parseUri){function expand(e){var instance=e.data.instance;if($(this).hasClass(instance.options.collapsedClass)){instance.expand(this)}}function toggle(e){var instance=e.data.instance;if(!(instance.options.originalTargetIgnoreSelector&&$(e.originalTarget).is(instance.options.originalTargetIgnoreSelector))){instance.toggle(e.target);e.preventDefault()}}function refreshToggleBlocks(e){e.data.instance._collapseTwiciBlocksFromStorage()}return Class.extend({getDefautOptions:function(){return{blockSelector:".twixi-block",triggerSelector:".twixi",eventType:"click",collapsedClass:"collapsed",expandedClass:"expanded",storageCollectionName:"twixi-blocks",autoFocusTrigger:true}},_collapseTwiciBlocksFromStorage:function(){var block;var val=localStorage.getItem(this.options.storageCollectionName)||"";val=val.replace(/\./g,"\\.");if(/#\w+/.test(val)){block=$(val);if(block.is(this.options.blockSelector)){if(!this.isPermlink()){block.removeClass(this.options.expandedClass).addClass(this.options.collapsedClass)}}}return this},_updateTwixiBlockIdInStorage:function(blockId){if(!this.isPermlink()){if(!/#\w+/.test(blockId)){return this}var val=localStorage.getItem(this.options.storageCollectionName)||"";var blockLength=(","+val+",").indexOf(","+blockId+",")+1;if(blockLength){if(val.indexOf(","+blockId)+1){val=val.replace(","+blockId,"")}else{val=val.replace(blockId,"")}}else{val=val.length?val+","+blockId:blockId}localStorage.setItem(this.options.storageCollectionName,val)}return this},contract:function(block){block=$(block);if(block.is(this.options.blockSelector)){block.removeClass(this.options.expandedClass).addClass(this.options.collapsedClass);if(this.options.persist!==false){this._updateTwixiBlockIdInStorage("#"+block.attr("id"))}}$(block).trigger("contractBlock");return this},expand:function(block){block=$(block);if(block.is(this.options.blockSelector)){block.removeClass(this.options.collapsedClass).addClass(this.options.expandedClass);if(this.options.persist!==false){this._updateTwixiBlockIdInStorage("#"+block.attr("id"))}}$(block).trigger("expandBlock");return this},toggle:function(twikiBlockChild){var block=$(twikiBlockChild).closest(this.options.blockSelector);if(!block.hasClass(this.options.collapsedClass)){this.contract(block)}else{this.expand(block)}if(this.options.autoFocusTrigger){block.find(this.options.triggerSelector+":visible").focus()}return this},isPermlink:function(){return this.checkIsPermlink(location.href)},checkIsPermlink:function(url){var query=parseUri(url).queryKey;return(query.hasOwnProperty("focusedCommentId")||query.hasOwnProperty("focusedWorklogId"))},addTrigger:function(triggerSelector,eventType){var thisInstance=this;var lastMousedown=0;if(triggerSelector){eventType=eventType||"click";if(eventType==="dblclick"){if(document.selection){$(document).delegate(triggerSelector,"dblclick",function(){document.selection.empty()})}else{$(document).delegate(triggerSelector,"mousedown",function(){var now=new Date().getTime();var allowSelection=now-lastMousedown>750;lastMousedown=now;return allowSelection})}}$(document).delegate(triggerSelector,eventType,function(){thisInstance.toggle(this)})}return this},addCallback:function(methodName,callback){$.aop.after({target:this,method:methodName},callback);return this},isUnique:function(uid){var uids=$(document).data("toggleBlockUids")||[];return $.inArray(uid,uids)===-1},setUid:function(uid){var uids=$(document).data("toggleBlockUids")||[];uids.push(uid);$(document).data("toggleBlockUids",uids)},init:function(options){var instance=this;options=options||{};this.options=$.extend(this.getDefautOptions(),options);var uid=this.options.triggerSelector;if(!this.isUnique(uid)){if(typeof console!=="undefined"&&logger.warn){logger.warn("Your are trying to create a ToggleBlock with selector '"+this.options.triggerSelector+"'."+"One already exists with this trigger so has been ignored.")}return }this.setUid(uid);$(document).delegate(this.options.blockSelector,"reveal",{instance:this},expand);$(document).delegate(this.options.triggerSelector,this.options.eventType,{instance:this},toggle);Events.bind(Types.REFRESH_TOGGLE_BLOCKS,{instance:this},refreshToggleBlocks);if(this.options.persist!==false){$(function(){instance._collapseTwiciBlocksFromStorage()})}}})});AJS.namespace("JIRA.ToggleBlock",null,require("jira/toggleblock/toggle-block"));