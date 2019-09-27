define(["app/core/View","app/core/util/bindLoadingMessage","../WiringSettingCollection","../views/SettingsView"],function(i,e,t,n){"use strict";return i.extend({layoutName:"page",modelProperty:"settings",breadcrumbs:function(){return[{href:"#wiring/"+(window.WMES_LAST_WIRING_DATE||"0d"),label:this.t("BREADCRUMBS:base")},this.t("BREADCRUMBS:settings")]},initialize:function(){this.defineModels(),this.defineViews()},defineModels:function(){this.settings=e(new t(null,{pubsub:this.pubsub}),this)},defineViews:function(){this.view=new n({initialTab:this.options.initialTab,settings:this.settings})},load:function(i){return i(this.settings.fetch({reset:!0}))}})});