define("jira/mention/uncomplicated-inline-layer",["jira/ajs/layer/inline-layer","jira/ajs/contentretriever/content-retriever","jquery"],function(InlineLayer,ContentRetriever,jQuery){return InlineLayer.extend({init:function(options){options||(options={});options.contentRetriever=new ContentRetriever();InlineLayer.prototype.init.call(this,options)},content:function(){if(arguments.length){this.$content=arguments[0]}return this.$content},refreshContent:function(callback){this.layer().empty().append(this.content());if(jQuery.isFunction(callback)){callback.call(this)}this.contentChange();this.setPosition()}})});AJS.namespace("JIRA.UncomplicatedInlineLayer",null,require("jira/mention/uncomplicated-inline-layer"));