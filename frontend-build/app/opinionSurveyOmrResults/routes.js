// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../router","../viewport","../user"],function(e,n,i,r){"use strict";var u="i18n!app/nls/opinionSurveyOmrResults",o=r.auth("OPINION_SURVEYS:MANAGE");n.map("/opinionSurveyOmrResults",o,function(e){i.loadPage(["app/opinionSurveyOmrResults/OpinionSurveyOmrResultCollection","app/opinionSurveyOmrResults/pages/OpinionSurveyOmrResultListPage",u],function(n,i){return new i({collection:new n(null,{rqlQuery:e.rql})})})}),n.map("/opinionSurveyOmrResults/:id",o,function(e){i.loadPage(["app/opinionSurveyOmrResults/OpinionSurveyOmrResult","app/opinionSurveyOmrResults/pages/OpinionSurveyOmrResultDetailsPage",u],function(n,i){return new i({model:new n({_id:e.params.id})})})})});