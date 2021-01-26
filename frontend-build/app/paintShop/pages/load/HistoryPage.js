define(["app/viewport","app/core/util/pageActions","app/core/util/bindLoadingMessage","app/core/pages/FilteredListPage","app/paintShop/PaintShopLoadReasonCollection","app/paintShop/views/load/ListFilterView","app/paintShop/views/load/ListView"],function(t,e,i,o,s,n,a){"use strict";return o.extend({FilterView:n,ListView:a,breadcrumbs:function(){return[{href:"#paintShop/"+(window.WMES_LAST_PAINT_SHOP_DATE||"0d"),label:this.t("BREADCRUMB:base")},{href:"#paintShop/load/monitoring",label:this.t("BREADCRUMB:load")},this.t("load:history:breadcrumb")]},actions:function(t){return[e.export(t,this),{href:"#paintShop/load/report",icon:"line-chart",label:this.t("load:report:pageAction")},{href:"#paintShop;settings?tab=load",icon:"cogs",label:this.t("PAGE_ACTION:settings"),privileges:"PAINT_SHOP:MANAGE"}]},defineModels:function(){o.prototype.defineModels.apply(this,arguments),this.reasons=i(new s,this)},getListViewOptions:function(){return Object.assign(o.prototype.getListViewOptions.apply(this,arguments),{reasons:this.reasons})},load:function(t){return t(this.reasons.fetch({reset:!0}),this.collection.fetch({reset:!0}))}})});