(function(){var Events=require("jira/util/events");var Types=require("jira/util/events/types");var Reasons=require("jira/util/events/reasons");var jQuery=require("jquery");jQuery(function(){var ctx=jQuery(document);Events.trigger(Types.NEW_CONTENT_ADDED,[ctx,Reasons.pageLoad]);Events.trigger(Types.NEW_PAGE_ADDED,[ctx])});Events.bind("dialogContentReady",function(e,dialog){var ctx=dialog.get$popupContent();Events.trigger(Types.NEW_CONTENT_ADDED,[ctx,Reasons.dialogReady]);Events.trigger(Types.NEW_PAGE_ADDED,[ctx])});Events.bind("contentRefreshed",function(e,context){var ctx=jQuery(context);Events.trigger(Types.NEW_CONTENT_ADDED,[ctx])})})();