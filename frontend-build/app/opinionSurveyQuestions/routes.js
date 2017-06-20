// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../router","../viewport","../user","../core/util/showDeleteFormPage"],function(e,i,n,o,u){"use strict";var s="i18n!app/nls/opinionSurveyQuestions",r=o.auth("OPINION_SURVEYS:MANAGE");i.map("/opinionSurveyQuestions",r,function(e){n.loadPage(["app/core/pages/ListPage","app/opinionSurveyQuestions/OpinionSurveyQuestionCollection",s],function(i,n){return new i({baseBreadcrumb:!0,collection:new n(null,{rqlQuery:e.rql}),columns:[{id:"_id",className:"is-min"},{id:"short",className:"is-min"},"full"]})})}),i.map("/opinionSurveyQuestions/:id",r,function(e){n.loadPage(["app/core/pages/DetailsPage","app/opinionSurveyQuestions/OpinionSurveyQuestion","app/opinionSurveyQuestions/templates/details",s],function(i,n,o){return new i({baseBreadcrumb:!0,model:new n({_id:e.params.id}),detailsTemplate:o})})}),i.map("/opinionSurveyQuestions;add",r,function(){n.loadPage(["app/core/pages/AddFormPage","app/opinionSurveyQuestions/OpinionSurveyQuestion","app/opinionSurveyQuestions/views/OpinionSurveyQuestionFormView",s],function(e,i,n){return new e({baseBreadcrumb:!0,FormView:n,model:new i})})}),i.map("/opinionSurveyQuestions/:id;edit",r,function(e){n.loadPage(["app/core/pages/EditFormPage","app/opinionSurveyQuestions/OpinionSurveyQuestion","app/opinionSurveyQuestions/views/OpinionSurveyQuestionFormView",s],function(i,n,o){return new i({baseBreadcrumb:!0,FormView:o,model:new n({_id:e.params.id})})})}),i.map("/opinionSurveyQuestions/:id;delete",r,e.partial(u,"app/opinionSurveyQuestions/OpinionSurveyQuestion",e,e,{baseBreadcrumb:!0}))});