define("jira/loading/loading",["jquery"],function($){var _isVisible=false;var _backgroundElement=$('<div class="jira-page-loading-background" />');var _spinnerElement=$('<div class="jira-page-loading-indicator" />');function show(){if(_isVisible){return }$("body").append(_backgroundElement).append(_spinnerElement);_isVisible=true}function hide(){if(!_isVisible){return }_spinnerElement.remove();_backgroundElement.remove();_isVisible=false}return{showLoadingIndicator:show,hideLoadingIndicator:hide,isVisible:function(){return _isVisible}}});AJS.namespace("JIRA.Loading",null,require("jira/loading/loading"));