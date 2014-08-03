// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["./DrillingReportPage","../Report5Query","../Report5DisplayOptions","../views/Report5HeaderView","../views/Report5FilterView","../views/Report5DisplayOptionsView","../views/Report5ChartsView","app/core/util/bindLoadingMessage"],function(e,t,i,s,n,r,o){return e.extend({rootBreadcrumbKey:"BREADCRUMBS:5",initialSettingsTab:"hr",maxOrgUnitLevel:"subdivision",pageId:"report5",load:function(e){return e(this.settings.fetch({reset:!0}))},createQuery:function(){return new t(this.options.query)},createDisplayOptions:function(){var e={settings:this.settings};return"string"==typeof this.options.displayOptions?i.fromString(this.options.displayOptions,e):new i(this.options.displayOptions,e)},createHeaderView:function(){return new s({model:this.query,displayOptions:this.displayOptions})},createFilterView:function(){return new n({model:this.query})},createDisplayOptionsView:function(){return new r({model:this.displayOptions})},createChartsView:function(e,t){return new o({model:e,settings:this.settings,displayOptions:this.displayOptions,skipRenderCharts:!!t})}})});