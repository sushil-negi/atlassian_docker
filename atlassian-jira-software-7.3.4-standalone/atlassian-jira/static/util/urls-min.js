define("jira/util/urls",["exports"],function(exports){exports.atl_token=function(){var tokenEl=document.getElementById("atlassian-token");return(tokenEl&&tokenEl.getAttribute)?tokenEl.getAttribute("content"):undefined}});