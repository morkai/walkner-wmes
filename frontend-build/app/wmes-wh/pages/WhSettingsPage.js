define(["app/i18n","app/core/util/bindLoadingMessage","app/core/View","../settings","../WhUserCollection","../views/WhSettingsView"],function(e,i,t,s,n,h){"use strict";return t.extend({layoutName:"page",breadcrumbs:function(){return[{label:this.t("BREADCRUMB:base"),href:"#wh-next/pickup/0d"},this.t("BREADCRUMB:settings")]},initialize:function(){this.defineModels(),this.defineViews()},destroy:function(){s.release()},defineModels:function(){this.model=i(s.acquire(),this),this.whUsers=i(new n,this),this.whUsers.setUpPubsub(this.pubsub.sandbox())},defineViews:function(){this.view=new h({initialTab:this.options.initialTab,settings:this.model,whUsers:this.whUsers})},load:function(e){return e(this.model.fetchIfEmpty(),this.whUsers.fetch({reset:!0}))},afterRender:function(){s.acquire()}})});