// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/pages/DetailsPage","app/opinionSurveys/dictionaries","app/opinionSurveyResponses/templates/details"],function(e,t,o){"use strict";return e.extend({detailsTemplate:o,baseBreadcrumb:!0,destroy:function(){e.prototype.destroy.call(this),t.unload()},load:function(e){return e(this.model.fetch(),t.load())},afterRender:function(){e.prototype.afterRender.call(this),t.load()}})});