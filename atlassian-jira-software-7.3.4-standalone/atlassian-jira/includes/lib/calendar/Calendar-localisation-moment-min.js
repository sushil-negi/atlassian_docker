define("jira/calendar/localisation-moment",["require"],function(require){var moment=require("jira/moment");var langData=moment.langData("jira");if(langData===null||typeof langData!=="object"){return }if(typeof Calendar!=="function"){return }Calendar._DN=langData._weekdays.concat(langData._weekdays[0]);Calendar._SDN=langData._weekdaysShort.concat(langData._weekdaysShort[0]);Calendar._MN=[].concat(langData._months);Calendar._SMN=[].concat(langData._monthsShort)});require("jira/calendar/localisation-moment");