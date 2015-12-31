// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/util/pageActions","app/core/pages/DetailsPage","app/opinionSurveys/dictionaries","../views/OpinionSurveyOmrResultDetailsView"],function(e,t,i,n,o){"use strict";return i.extend({DetailsView:o,baseBreadcrumb:!0,actions:function(){var i=[],n=this.model;return"unrecognized"!==n.get("status")?i:(n.get("survey")&&i.push({label:e.bound(n.getNlsDomain(),"PAGE_ACTION:edit"),icon:"edit",href:"#opinionSurveyResponses/"+n.get("response")+";edit?fix="+n.id}),i.push(t["delete"](n)),i)},destroy:function(){i.prototype.destroy.call(this),n.unload()},load:function(e){return e(this.model.fetch(),n.load())},afterRender:function(){i.prototype.afterRender.call(this),n.load()}})});