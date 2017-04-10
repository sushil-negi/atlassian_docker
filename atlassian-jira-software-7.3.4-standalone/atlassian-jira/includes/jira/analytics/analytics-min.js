define("jira/analytics/analytics",["jquery","jira/ajs/dark-features","jira/analytics"],function($,DarkFeatures,analytics){var $document=$(document);function getBrowseProjectTab(){return $("li.active a.browse-tab").attr("id")}function bindEvents(){$document.on("click","#project-admin-link",function(){var selectedTab=getBrowseProjectTab();analytics.send({name:"browseproject.administerproject",properties:{selectedtab:selectedTab}})});$document.on("click","#browse-projects-create-project",function(){analytics.send({name:"projects.browse.createProject",properties:{}})});$document.on("click","#no-issues-create-issue",function(){analytics.send({name:"browseproject.issuesblankslate.createissue",properties:{}})});$document.on("click","a.issue-filter-link",function(){var $el=$(this);var id=$el.attr("id").replace("filter_","");var type=$el.attr("data-type");analytics.send({name:"browse"+type+".issuefilter."+id,properties:{}})});$document.on("click","#project_import_link_lnk",function(){analytics.send({name:"topnav.jim",properties:{}})});$document.on("click",".issueaction-viewworkflow",function(){var classes=$(this).attr("class");var isNew=classes.indexOf("new-workflow-designer")>-1||classes.indexOf("jira-workflow-designer-link")>-1;var version=isNew?"new":"old";var newEnabled=DarkFeatures.isEnabled("casper.VIEW_ISSUE");analytics.send({name:"issue.viewworkflow",properties:{version:version,newEnabled:newEnabled}})})}return{bindEvents:bindEvents}});