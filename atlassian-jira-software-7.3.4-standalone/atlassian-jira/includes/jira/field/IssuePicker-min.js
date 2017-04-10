define("jira/field/issue-picker",["jira/ajs/select/multi-select","jira/ajs/list/group-descriptor","jira/ajs/list/item-descriptor","wrm/context-path","jquery","jira/libs/parse-uri"],function(MultiSelect,GroupDescriptor,ItemDescriptor,wrmContextPath,jQuery,parseUri){var contextPath=wrmContextPath();var IssuePicker=MultiSelect.extend({_formatResponse:function(response){var ret=[];var canonicalBaseUrl=(function(){var uri=parseUri(window.location);return uri.protocol+"://"+uri.authority})();if(response&&response.sections){jQuery(response.sections).each(function(i,section){var groupDescriptor=new GroupDescriptor({weight:i,label:section.label,description:section.sub});if(section.issues&&section.issues.length>0){jQuery(section.issues).each(function(){groupDescriptor.addItem(new ItemDescriptor({highlighted:true,value:this.key,label:this.key+" - "+this.summaryText,icon:this.img?canonicalBaseUrl+contextPath+this.img:null,html:this.keyHtml+" - "+this.summary}))})}ret.push(groupDescriptor)})}return ret},_getDefaultOptions:function(){return jQuery.extend(true,this._super(),{ajaxOptions:{formatResponse:this._formatResponse}})},_launchPopup:function(){function getWithDefault(value,def){if(value==null){return def}else{return value}}var url;var urlParam;var vWinUsers;var options;var instance=this;IssuePicker.callback=function(items){if(typeof items==="string"){items=JSON.parse(items)}instance._addMultipleItems(items,true);instance.$field.focus()};options=this.options.ajaxOptions.data;url=contextPath+"/secure/popups/IssuePicker.jspa?";urlParam={singleSelectOnly:"false",decorator:"popup",currentIssue:options.currentIssueKey||"",showSubTasks:getWithDefault(options.showSubTasks,false),showSubTasksParent:getWithDefault(options.showSubTaskParent,false)};if(options.currentProjectId){urlParam["currentProjectId"]=options.currentProjectId}url+=jQuery.param(urlParam);vWinUsers=window.open(url,"IssueSelectorPopup","status=no,resizable=yes,top=100,left=200,width="+this.options.popupWidth+",height="+this.options.popupHeight+",scrollbars=yes,resizable");vWinUsers.opener=self;vWinUsers.focus()},_createFurniture:function(disabled){var $popupLink;this._super(disabled);$popupLink=this._render("popupLink");this._assignEvents("popupLink",$popupLink);this.$container.addClass("jira-issue-picker");this.$container.addClass("hasIcon");this.$container.after($popupLink)},handleFreeInput:function(){var values=this.$field.val().toUpperCase().match(/\S+/g);if(values){this._addMultipleItems(jQuery.map(values,function(value){return{value:value,label:value}}))}this.$field.val("")},_events:{popupLink:{click:function(e){this._launchPopup();e.preventDefault()}}},_renders:{popupLink:function(){return jQuery("<a class='issue-picker-popup' />").attr({href:"#",title:this.options.popupLinkMessage}).text(""+this.options.popupLinkMessage+"")}}});IssuePicker.callback=null;return IssuePicker});AJS.namespace("jira.issuepicker",null,require("jira/field/issue-picker"));AJS.namespace("AJS.IssuePicker",null,require("jira/field/issue-picker"));AJS.namespace("JIRA.IssuePicker",null,require("jira/field/issue-picker"));