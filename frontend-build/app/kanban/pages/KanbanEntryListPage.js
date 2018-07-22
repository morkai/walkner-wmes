// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/core/util/bindLoadingMessage","../state","../views/KanbanEntryListView","../views/KanbanPrintQueueBuilderView","app/kanban/templates/page","app/kanban/templates/dictionariesAction","app/kanban/templates/builder/action"],function(i,e,t,n,o,d,s,l,r,a,u,h,p){"use strict";return d.extend({layoutName:"page",template:u,localTopics:{"socket.connected":function(){this.model.load(!0)}},remoteTopics:{"kanban.import.*":function(i,e){var t=-1!==e.indexOf("success");o.msg.show({type:t?"success":"error",time:2500,text:this.t("msg:import:"+(t?"success":"failure"))}),this.$id("import").prop("disabled",!1)}},breadcrumbs:function(){return[e.bound("kanban","bc:base")]},actions:function(){var i=this;return[{template:function(){return p({idPrefix:i.idPrefix})},afterRender:function(){i.$id("builderToggle").on("click",i.onBuilderToggleClick.bind(i)),i.$id("builderAddAll").on("click",i.onBuilderAddAllClick.bind(i)),i.updateBuilderCount()}},{id:"-import",label:e.bound("kanban","pa:import"),icon:"download",privileges:function(){return n.isAllowedTo("KANBAN:MANAGE","FN:process-engineer")},callback:i.import.bind(i),afterRender:i.updateImportedAt.bind(i)},{template:h}]},initialize:function(){this.defineModels(),this.defineViews(),this.defineBindings(),this.setView("#-list",this.listView),this.setView("#-builder",this.builderView)},destroy:function(){document.body.classList.remove("no-overflow","no-ft"),this.model.unload(),this.model=null},defineModels:function(){this.model=s(l,this)},defineViews:function(){this.listView=new r({model:this.model}),this.builderView=new a({model:this.model})},defineBindings:function(){this.listenTo(this.model.tableView,"change",this.onTableViewChanged),this.listenTo(this.model.settings,"change",this.onSettingChanged),this.listenTo(this.model.builder,"add remove reset",this.updateBuilderCount),this.listenTo(this.model.builder,"add",this.onBuilderAdd),this.listenTo(this.builderView,"find",this.listView.find.bind(this.listView)),this.listenTo(this.builderView,"shown hidden",this.toggleBuilderToggle)},load:function(i){return i(this.model.load(!1))},afterRender:function(){document.body.classList.add("no-overflow","no-ft"),this.model.load(!1)},onTableViewChanged:function(i,e){e.save&&this.promised(i.save())},onSettingChanged:function(i){"kanban.import.importedAt"===i.id&&this.updateImportedAt()},import:function(t){var n=this,d=i(t.currentTarget).find(".btn");if(!d.prop("disabled")){d.prop("disabled",!0);var s=n.ajax({method:"POST",url:"/kanban;import"});s.fail(function(){var i=s.responseJSON&&s.responseJSON.error||{},t=i.code,l=e.has("kanban","msg:import:"+i.code)?t:"failure";o.msg.show({type:"IN_PROGRESS"===t?"warning":"error",time:3e3,text:n.t("msg:import:"+l)}),d.prop("disabled","IN_PROGRESS"===t)}),s.done(function(){o.msg.show({type:"info",time:2e3,text:n.t("msg:import:started")})})}},updateImportedAt:function(){this.$id("import").prop("title",this.t("pa:import:title",{importedAt:t.format(this.model.settings.getValue("import.importedAt"),"LLLL")}))},updateBuilderCount:function(){this.$id("builderCount").text(this.model.builder.length).closest(".btn").prop("disabled",0===this.model.builder.length)},onBuilderAdd:function(){this.builderView.shown||1!==this.model.builder.length||this.toggleBuilderVisibility()},toggleBuilderVisibility:function(){this.builderView.shown?this.builderView.hide():this.builderView.show()},toggleBuilderToggle:function(){this.$id("builderToggle").toggleClass("active",this.builderView.shown).blur()},onBuilderToggleClick:function(){document.body.focus(),this.toggleBuilderVisibility()},onBuilderAddAllClick:function(){this.model.builder.addFromEntries(this.model.entries.filtered)}})});