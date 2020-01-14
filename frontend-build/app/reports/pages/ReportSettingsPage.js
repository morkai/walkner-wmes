define(["jquery","app/i18n","app/core/util/bindLoadingMessage","app/core/View","../settings","../views/ReportSettingsView","app/prodTasks/ProdTaskCollection","app/delayReasons/storage"],function(e,s,t,i,n,a,o,r){"use strict";return i.extend({layoutName:"page",pageId:"reportSettings",breadcrumbs:function(){return[s.bound("reports","BREADCRUMB:reports"),s.bound("reports","BREADCRUMB:settings")]},initialize:function(){this.defineModels(),this.defineViews()},destroy:function(){n.release(),r.release()},defineModels:function(){this.settings=t(n.acquire(),this),this.prodTasks=t(new o,this),this.delayReasons=t(r.acquire(),this)},defineViews:function(){this.view=new a({initialTab:this.options.initialTab,initialSubtab:this.options.initialSubtab,settings:this.settings,prodTasks:this.prodTasks,delayReasons:this.delayReasons})},load:function(s){var t=this;return s(t.settings.fetchIfEmpty(function(){return e.when(t.prodTasks.fetch({reset:!0}),t.delayReasons.isEmpty()?t.delayReasons.fetch({reset:!0}):null)}))},afterRender:function(){n.acquire(),r.acquire()}})});