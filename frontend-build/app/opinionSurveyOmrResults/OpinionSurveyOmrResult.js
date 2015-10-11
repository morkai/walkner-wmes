// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../i18n","../time","../core/Model","../opinionSurveys/dictionaries","../opinionSurveys/OpinionSurvey"],function(e,r,t,i,o){"use strict";return t.extend({urlRoot:"/opinionSurveys/omrResults",clientUrlRoot:"#opinionSurveyOmrResults",topicPrefix:"opinionSurveys.omrResults",privilegePrefix:"OPINION_SURVEYS",nlsDomain:"opinionSurveyOmrResults",defaults:{},url:function(){var e=t.prototype.url.apply(this,arguments);return this.isNew()?e:e+"?populate(survey)"},getSurveyId:function(){var e=this.get("survey");return"string"!=typeof e&&(e=e?e._id||e.id:null),e},serialize:function(t){var i=this.toJSON();t||(t=new o(i.survey._id?i.survey:{_id:i.survey})),t.cacheMaps||t.buildCacheMaps(),i.survey=t.get("label")||t.id,i.status=e(this.nlsDomain,"status:"+i.status),i.errorCode=i.errorCode?e(this.nlsDomain,"error:"+i.errorCode):"",i.matchScore=i.matchScore.toLocaleString();var s=r.getMoment(i.startedAt),n=r.getMoment(i.finishedAt);return i.startedAt=s.format("YYYY-MM-DD, HH:mm:ss.SSS"),i.finishedAt=n.format("YYYY-MM-DD, HH:mm:ss.SSS"),i.duration=r.toString(n.diff(s,"seconds",!0)),i}})});