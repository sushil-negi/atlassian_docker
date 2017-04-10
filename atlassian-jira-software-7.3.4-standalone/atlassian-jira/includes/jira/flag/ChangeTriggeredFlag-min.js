define("jira/project/edit/change-triggered-flag",["jira/util/key-code","jquery","aui/flag"],function(keyCode,$,Flag){var ChangeTriggeredFlag=function(options){this.getValue=options.getValue;this.revert=options.revert;this.warningDescription=options.warningDescription;this.cancelMessage=options.cancelMessage;this.onCancelCallback=options.onCancelCallback;this.flag=null;this.cancelled=false;this.originalValue=this.getValue();this.Templates=JIRA.Templates.Project.ChangeTriggeredFlag};ChangeTriggeredFlag.prototype.changeOccurred=function(){if(this.getValue()!==this._getOriginalValue()){if(this.flag===null&&!this.cancelled){this._showFlag()}}else{this._closeFlag();this._triggerCancellationCallback()}};ChangeTriggeredFlag.prototype._getOriginalValue=function(){return this.originalValue};ChangeTriggeredFlag.prototype._showFlag=function(){this.flag=Flag({type:"warning",title:"",body:this.Templates.fieldRevertWarning({message:this.warningDescription,revertMessage:this.cancelMessage})});$(this.flag).find(".cancel").click(function(event){event.preventDefault();this.revert(this._getOriginalValue())}.bind(this));$(this.flag).find(".aui-icon.icon-close").click(function(){this.cancelled=true;this.flag=null}.bind(this));$(this.flag).find(".aui-icon.icon-close").keypress(function(e){if((e.which===keyCode.ENTER)||(e.which===keyCode.SPACE)){this.cancelled=true;this.flag=null}}.bind(this))};ChangeTriggeredFlag.prototype._closeFlag=function(){if(this.flag){this.flag.close();this.flag=null}};ChangeTriggeredFlag.prototype._triggerCancellationCallback=function(){if(this.onCancelCallback){this.onCancelCallback()}};ChangeTriggeredFlag.prototype.cleanup=function(){this._closeFlag()};return ChangeTriggeredFlag});