define(["jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/core/util/bindLoadingMessage","../state","../views/KanbanEntryListView","../views/KanbanPrintQueueBuilderView","../views/ImportXlsxDialogView","app/kanban/templates/page","app/kanban/templates/dictionariesAction","app/kanban/templates/builder/action","app/kanban/templates/importAction"],function(i,e,t,n,o,s,d,l,r,a,p,u,m,h,c){"use strict";return s.extend({layoutName:"page",template:u,localTopics:{"socket.connected":function(){this.model.load(!0)}},remoteTopics:{"kanban.import.*":function(i,e){if(-1!==e.indexOf("started"))this.importing=!0;else{this.importing=!1;var t=-1!==e.indexOf("success");o.msg.show({type:t?"success":"error",time:2500,text:this.t("msg:import:"+(t?"success":"failure"))}),this.$id("import-sap").parent().removeClass("disabled")}this.updateImportedAt()}},breadcrumbs:function(){return[e.bound("kanban","bc:base")]},actions:function(){var i=this;return[{template:function(){return'<span id="'+i.idPrefix+'-lastImport" class="kanban-pa-lastImport"></span>'}},{template:function(){return h({idPrefix:i.idPrefix})},afterRender:function(){i.$id("builderToggle").on("click",i.onBuilderToggleClick.bind(i)),i.$id("builderAddAll").on("click",i.onBuilderAddAllClick.bind(i)),i.updateBuilderCount()}},{template:function(){return c({idPrefix:i.idPrefix})},privileges:function(){return n.isAllowedTo("KANBAN:MANAGE","FN:process-engineer")},afterRender:function(){i.$id("import-sap").on("click",i.importSap.bind(i)),i.$id("import-entries").on("click",i.importEntries.bind(i)),i.$id("import-components").on("click",i.importComponents.bind(i)),i.updateImportedAt()}},{template:m}]},initialize:function(){this.defineModels(),this.defineViews(),this.defineBindings(),this.setView("#-list",this.listView),this.setView("#-builder",this.builderView)},destroy:function(){document.body.classList.remove("no-overflow","no-ft"),this.model.unload(),this.model=null},defineModels:function(){this.model=d(l,this)},defineViews:function(){this.listView=new r({model:this.model}),this.builderView=new a({model:this.model})},defineBindings:function(){this.listenTo(this.model.tableView,"change",this.onTableViewChanged),this.options.selectComponent&&this.listenToOnce(this.model.tableView,"sync",this.onTableViewSynced),this.listenTo(this.model.settings,"change",this.onSettingChanged),this.listenTo(this.model.builder,"add remove reset",this.updateBuilderCount),this.listenTo(this.model.builder,"add",this.onBuilderAdd),this.listenTo(this.builderView,"find",this.listView.find.bind(this.listView)),this.listenTo(this.builderView,"shown hidden",this.toggleBuilderToggle)},load:function(i){return i(this.model.load(!1))},afterRender:function(){document.body.classList.add("no-overflow","no-ft"),this.model.load(!1)},onTableViewChanged:function(i,e){e.save&&this.promised(i.save())},onTableViewSynced:function(i){i.setFilters({nc12:{type:"text",data:this.options.selectComponent}})},onSettingChanged:function(i){"kanban.import.importedAt"===i.id&&this.updateImportedAt()},importSap:function(){var i=this,t=i.$id("import-sap").parent();if(!t.hasClass("disabled")){t.addClass("disabled");var n=i.ajax({method:"POST",url:"/kanban/import/sap"});n.fail(function(){var s=n.responseJSON&&n.responseJSON.error||{},d=s.code,l=e.has("kanban","msg:import:"+s.code)?d:"failure";o.msg.show({type:"IN_PROGRESS"===d?"warning":"error",time:3e3,text:i.t("msg:import:"+l)}),t.toggleClass("disabled","IN_PROGRESS"===d),"IN_PROGRESS"===d&&(i.importing=!0,i.updateImportedAt())}),n.done(function(){o.msg.show({type:"info",time:2e3,text:i.t("msg:import:started")})})}},importComponents:function(){o.showDialog(new p({model:{what:"components"}}),this.t("import:components:title"))},importEntries:function(){o.showDialog(new p({model:{what:"entries"}}),this.t("import:entries:title"))},updateImportedAt:function(){var i=t.format(this.model.settings.getValue("import.importedAt"),"LL LTS"),e=this.t("pa:lastImport",{importedAt:i});this.importing&&(e='<i class="fa fa-spinner fa-spin"></i>'+e),this.$id("lastImport").html(e)},updateBuilderCount:function(){this.$id("builderCount").text(this.model.builder.length).closest(".btn").prop("disabled",0===this.model.builder.length)},onBuilderAdd:function(){this.builderView.shown||1!==this.model.builder.length||this.toggleBuilderVisibility()},toggleBuilderVisibility:function(){this.builderView.shown?this.builderView.hide():this.builderView.show()},toggleBuilderToggle:function(){this.$id("builderToggle").toggleClass("active",this.builderView.shown).blur()},onBuilderToggleClick:function(){document.body.focus(),this.toggleBuilderVisibility()},onBuilderAddAllClick:function(){var i=this.model;i.builder.addFromEntries(i.entries.filtered.map(function(e){return e.serialize(i)}))}})});