define(["app/i18n","app/user","app/viewport","app/core/util/bindLoadingMessage","app/core/View","../ProdDowntime","../views/ProdDowntimeDetailsView","../views/CorroborateProdDowntimeView"],function(o,e,i,t,r,n,s,d){return r.extend({layoutName:"page",pageId:"details",remoteTopics:{"prodDowntimes.corroborated.*":function(o){this.corroborating&&o._id===this.model.id&&i.closeDialog()}},breadcrumbs:function(){return[{label:o.bound("prodDowntimes","BREADCRUMBS:browse"),href:this.model.genClientUrl("base")},o.bound("prodDowntimes","BREADCRUMBS:details")]},actions:function(){var t=[];if("undecided"===this.model.get("status")&&e.isAllowedTo("PROD_DOWNTIMES:MANAGE")&&e.hasAccessToAor(this.model.get("aor"))){var r=this;t.push({id:"corroborate",icon:"gavel",label:o("prodDowntimes","LIST:ACTION:corroborate"),href:this.model.genClientUrl("corroborate"),callback:function(e){e.preventDefault(),r.broker.subscribe("viewport.dialog.hidden",function(){r.corroborating=!1}),r.corroborating=!0,i.showDialog(new d({model:r.model}),o("prodDowntimes","corroborate:title"))}})}return this.model.isEditable()&&t.push({label:o.bound("prodDowntimes","PAGE_ACTION:edit"),icon:"edit",href:this.model.genClientUrl("edit"),privileges:"PROD_DATA:MANAGE"}),t},initialize:function(){this.corroborating=!1,this.model=t(new n({_id:this.options.modelId}),this),this.view=new s({model:this.model})},setUpLayout:function(o){this.listenTo(this.model,"change:status",function(){o.setActions(this.actions())})},load:function(o){return o(this.model.fetch(this.options.fetchOptions))}})});