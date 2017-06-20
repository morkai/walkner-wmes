// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/util/bindLoadingMessage","app/core/pages/FilteredListPage","app/opinionSurveys/OpinionSurveyCollection","app/opinionSurveys/dictionaries","../views/OpinionSurveyScanTemplateListView","../views/OpinionSurveyScanTemplateFilterView"],function(e,i,n,t,o,r,s){"use strict";return n.extend({baseBreadcrumb:!0,defineModels:function(){n.prototype.defineModels.apply(this,arguments),this.opinionSurveys=i(new t(null,{rqlQuery:"select(label,superiors,questions)&sort(-startDate)"}),this),this.listenToOnce(this.opinionSurveys,"reset",function(){this.opinionSurveys.buildCacheMaps()})},createFilterView:function(){return new s({model:{rqlQuery:this.collection.rqlQuery,opinionSurveys:this.opinionSurveys}})},createListView:function(){return new r({collection:this.collection,opinionSurveys:this.opinionSurveys})},destroy:function(){n.prototype.destroy.call(this),o.unload()},load:function(e){return e(this.collection.fetch({reset:!0}),this.opinionSurveys.fetch({reset:!0}),o.load())},afterRender:function(){n.prototype.afterRender.call(this),o.load()}})});