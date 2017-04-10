define("jira/field/multi-user-list-picker",["jira/util/formatter","jira/field/multi-user-list-picker/item","jira/ajs/select/suggestions/user-list-suggest-handler","jira/ajs/select/multi-select","jira/ajs/list/item-descriptor","jira/ajs/list/group-descriptor","jira/ajs/group","jquery"],function(formatter,MultiUserListPickerItem,UserListSuggestHandler,MultiSelect,ItemDescriptor,GroupDescriptor,Group,jQuery){return MultiSelect.extend({init:function(options){var restPath="/rest/api/1.0/users/picker";function formatResponse(response){var ret=[];jQuery(response).each(function(i,suggestions){var groupDescriptor=new GroupDescriptor({weight:i,label:suggestions.footer});jQuery(suggestions.users).each(function(){groupDescriptor.addItem(new ItemDescriptor({value:this.name,label:this.displayName,html:this.html,icon:this.avatarUrl,allowDuplicate:false,highlighted:true}))});ret.push(groupDescriptor)});return ret}jQuery.extend(options,{itemAttrDisplayed:"label",userEnteredOptionsMsg:formatter.I18n.getText("common.form.email.label.suffix"),showDropdownButton:false,removeOnUnSelect:true,ajaxOptions:{url:contextPath+restPath,query:true,data:{showAvatar:true},formatResponse:formatResponse},suggestionsHandler:UserListSuggestHandler,itemGroup:new Group(),itemBuilder:function(descriptor){return new MultiUserListPickerItem({descriptor:descriptor,container:this.$selectedItemsContainer})}});this._super(options)},_createFurniture:function(disabled){this._super(disabled);if(this.options.description){this._render("description",this.options.description).insertAfter(this.$field)}},updateItemsIndent:jQuery.noop,_renders:{selectedItemsWrapper:function(){return jQuery('<div class="recipients" />')},selectedItemsContainer:function(){return jQuery("<ol />")},description:function(description){return jQuery("<div />").addClass("description").text(description)}}})});AJS.namespace("JIRA.MultiUserListPicker",null,require("jira/field/multi-user-list-picker"));AJS.namespace("JIRA.MultiUserListPicker.Item",null,require("jira/field/multi-user-list-picker/item"));