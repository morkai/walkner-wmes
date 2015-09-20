// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/pages/EditFormPage","app/core/util/bindLoadingMessage","app/opinionSurveys/dictionaries","app/opinionSurveys/OpinionSurveyCollection","../views/OpinionSurveyActionFormView"],function(e,t,o,i,n){"use strict";return e.extend({baseBreadcrumb:!0,FormView:n,defineModels:function(){e.prototype.defineModels.apply(this,arguments),this.model.surveys=t(new i(null,{rqlQuery:"sort(-startDate)"}),this),this.listenToOnce(this.model.surveys,"reset",function(){this.model.surveys.buildCacheMaps()})},load:function(e){return e(this.model.fetch(),this.model.surveys.fetch({reset:!0}),o.load())},destroy:function(){e.prototype.destroy.call(this),o.unload()},afterRender:function(){e.prototype.afterRender.call(this),o.load()}})});