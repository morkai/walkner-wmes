define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","../dictionaries","../views/KaizenSettingsView"],function(e,i,n,t,s){"use strict";return n.extend({layoutName:"page",breadcrumbs:function(){return[{label:e.bound("kaizenOrders","BREADCRUMBS:base"),href:"#kaizenOrders"},e.bound("kaizenOrders","BREADCRUMBS:settings")]},initialize:function(){this.defineModels(),this.defineViews()},destroy:function(){t.unload()},defineModels:function(){this.model=i(t.settings,this)},defineViews:function(){this.view=new s({initialTab:this.options.initialTab,settings:this.model})},load:function(e){return e(t.load())},afterRender:function(){t.load()}})});