define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","../MorSettingCollection","../views/MorSettingsView"],function(e,i,n,t,o){"use strict";return n.extend({layoutName:"page",breadcrumbs:function(){return[{label:e.bound("mor","BREADCRUMBS:base"),href:"#mor"},e.bound("mor","BREADCRUMBS:settings")]},initialize:function(){this.defineModels(),this.defineViews()},defineModels:function(){this.model=i(new t,this)},defineViews:function(){this.view=new o({initialTab:this.options.initialTab,settings:this.model})},load:function(e){return e(this.model.fetch({reset:!0}))}})});