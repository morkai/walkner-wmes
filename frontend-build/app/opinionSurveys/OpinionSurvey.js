// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../time","../core/Model","./dictionaries"],function(i,e,o,s){"use strict";return o.extend({urlRoot:"/opinionSurveys/surveys",clientUrlRoot:"#opinionSurveys",topicPrefix:"opinionSurveys.surveys",privilegePrefix:"OPINION_SURVEYS",nlsDomain:"opinionSurveys",labelAttribute:"label",serialize:function(){var i=this.toJSON();return i.startDate=e.format(i.startDate,"LL"),i.endDate=e.format(i.endDate,"LL"),i.superiors=this.serializeSuperiors(),i.employeeCount=this.serializeEmployeeCount(),i},serializeSuperiors:function(){return(this.get("superiors")||[]).map(function(i){var e=s.divisions.get(i.division);return e&&(i.division=e.get("full")),i})},serializeEmployeeCount:function(){return(this.get("employeeCount")||[]).map(function(i){var e=s.divisions.get(i.division);e&&(i.division=e.get("full"));var o=s.employers.get(i.employer);return o&&(i.employer=o.get("short")),i.count=i.count.toLocaleString(),i})},buildCacheMaps:function(){this.cacheMaps||this.on("change",this.buildCacheMaps);var e=this.attributes,o={employers:{},divisions:{},superiors:{},questions:{},employeeCount:{}};i.forEach(e.employers,function(i){o.employers[i._id]=i},this),i.forEach(e.questions,function(i){o.questions[i._id]=i},this),i.forEach(e.superiors,function(i){o.superiors[i._id]=i,o.divisions[i.division]||(o.divisions[i.division]=[]),o.divisions[i.division].push(i)},this),i.forEach(e.employeeCount,function(i){o.employeeCount[i.division]||(o.employeeCount[i.division]={}),o.employeeCount[i.division][i.employer]=i.count}),this.cacheMaps=o}},{})});