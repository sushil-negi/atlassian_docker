define("jira/ajs/shorten/shortener",["jira/util/formatter","jira/ajs/control","jira/data/local-storage","jquery"],function(formatter,Control,localStorage,jQuery){return Control.extend({_getDefaultOptions:function(){return{items:"a, span",numRows:1,shortenText:"hide",shortenOnInit:true,persist:true,expandButtonTooltip:formatter.I18n.getText("viewissue.shorten.view.more"),collapseButtonTooltip:formatter.I18n.getText("viewissue.shorten.hide")}},init:function(options){if(typeof options==="string"){options={element:options}}options=options||{};this.options=jQuery.extend(this._getDefaultOptions(),options);this._timerId=0;this.expanded=false;this.$container=jQuery(this.options.element);this._assignEvents("body",document.body);this._ready()},_isValid:function(){return !this.initialized&&this.$container.is(":visible")&&this.$container.children().length>0},_ready:function(){if(this._isValid()){this.$items=this.$container.children(this.options.items);this.$expandButton=this._render("expandButton");this.$collapseButton=this._render("collapseButton");this._assignEvents("expand-button",".shortener-expand");this._assignEvents("collapse-button",".shortener-collapse");if(!jQuery.browser.msie||jQuery.browser.version>="9"){this._assignEvents("resize-region",window)}if(this._isCollapsedOnInit()){this.collapse()}else{this.expand()}this.initialized=true}},_renders:{"expandButton":function(){return jQuery("<a href='#' class='ellipsis shortener-expand'></a>").attr("title",this.options.expandButtonTooltip).add("<br>")},"collapseButton":function(){return jQuery("<a href='#' title='Hide' class='icon icon-hide shortener-collapse'></a>").append(jQuery("<span>").text(this.options.collapseButtonTooltip))}},_events:{"expand-button":{"click":function(event){if(event.currentTarget===this.$expandButton[0]){event.preventDefault();this.expand();this._saveState("expanded")}}},"collapse-button":{"click":function(event){if(event.currentTarget===this.$collapseButton[0]){event.preventDefault();this.collapse();this._saveState("collapsed");this.$container.scrollIntoView()}}},"resize-region":{"resize":function(){clearTimeout(this._timerId);if(!this.expanded){var instance=this;this._timerId=setTimeout(function(){instance.collapse()},400)}}},"body":{tabSelect:function(){this._ready()}}},_saveState:function(value){try{localStorage.setItem("AJS.Shortener#"+this.$container.closest("[id]").attr("id"),value)}catch(QUOTA_EXCEEDED_ERR){}},_loadState:function(){return localStorage.getItem("AJS.Shortener#"+this.$container.closest("[id]").attr("id"))},_isCollapsedOnInit:function(){var shortenOnInit=this._loadState();if(shortenOnInit!==null){return shortenOnInit!=="expanded"}return this.options.shortenOnInit},_removeButtons:function(){this.$expandButton.remove();this.$collapseButton.remove()},_getOverflowIndex:function(){if(this.$items.length>1){var currentRow=1;var prevItemPageX=-1;for(var i=0;i<this.$items.length;i++){var itemPageX=this.$items.eq(i).offset().left;if(itemPageX<=prevItemPageX){currentRow++;if(currentRow>this.options.numRows){return i}}prevItemPageX=itemPageX}}return -1},expand:function(){this._removeButtons();if(this._getOverflowIndex()>0){this.$collapseButton=this._render("collapseButton");this.$container.append(this.$collapseButton);this.$container.css("height","auto");if(jQuery.browser.msie&&jQuery.browser.version<"9"){jQuery("body").toggleClass("reflow")}}this.expanded=true},collapse:function(){this._removeButtons();var i=this._getOverflowIndex();if(i>0){this.$container.css({"position":"absolute","visibility":"hidden","width":this.$container[0].clientWidth+"px"});var $expandButtonContent=this.$expandButton.first();do{var remainingItemCount=(this.$items.length-i);$expandButtonContent.text("("+remainingItemCount+")");this.$expandButton.insertBefore(this.$items[i]);i--;var oi=this.$items.eq(i).offset();var ob=this.$expandButton.offset();if(oi.left<ob.left&&ob.top<oi.top+10){break}}while(i>0);var height=(i<this.$items.length-1)?(this.$items.eq(i+1).offset().top-this.$container.offset().top)+"px":"auto";this.$container.css({"height":height,"position":"static","visibility":"visible","width":"auto"});$expandButtonContent.attr("title",formatter.format(this.options.expandButtonTooltip,remainingItemCount));if(jQuery.browser.msie&&jQuery.browser.version<"9"){jQuery("body").toggleClass("reflow")}}else{this.$container.css("height","auto")}this.expanded=false}})});define("jira/jquery/plugins/shorten/shorten",["jira/ajs/shorten/shortener","jquery"],function(Shortener,jQuery){jQuery.fn.shorten=function(options){var res=[];options=options||{};this.each(function(){options.element=this;res.push(new Shortener(options))});return res}});AJS.namespace("AJS.Shortener",null,require("jira/ajs/shorten/shortener"));(function(){require("jira/jquery/plugins/shorten/shorten")})();