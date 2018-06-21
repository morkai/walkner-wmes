// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","app/paintShopPaints/PaintShopPaintCollection","../PaintShopSettingCollection","../views/PaintShopSettingsView"],function(i,t,n,e,s,a){"use strict";return n.extend({layoutName:"page",breadcrumbs:function(){return[{href:"#paintShop/"+(window.WMES_LAST_PAINT_SHOP_DATE||"0d"),label:i.bound("paintShop","BREADCRUMBS:base")},i.bound("paintShop","BREADCRUMBS:settings")]},initialize:function(){this.defineModels(),this.defineViews()},defineModels:function(){this.settings=t(new s(null,{pubsub:this.pubsub}),this),this.paints=t(new e(null,{rqlQuery:"select(name)"}),this)},defineViews:function(){this.view=new a({initialTab:this.options.initialTab,settings:this.settings,paints:this.paints})},load:function(i){return i(this.settings.fetch({reset:!0}),this.paints.fetch({reset:!0}))}})});