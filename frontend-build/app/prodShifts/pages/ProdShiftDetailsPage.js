define(["underscore","app/i18n","app/time","app/viewport","app/core/util/bindLoadingMessage","app/core/View","app/prodLogEntries/ProdLogEntryCollection","../ProdShift","../views/ProdShiftDetailsView","../views/ProdShiftTimelineView","../views/QuantitiesDoneChartView","app/prodShifts/templates/detailsPage"],function(e,t,i,o,s,n,r,d,h,a,p,f){var l=["changeOrder","finishOrder","startDowntime","finishDowntime","endWork"];return n.extend({template:f,layoutName:"page",pageId:"details",breadcrumbs:function(){return[{label:t.bound("prodShifts","BREADCRUMBS:browse"),href:this.prodShift.genClientUrl("base")},this.prodShift.get("prodLine"),t.bound("prodShifts","BREADCRUMBS:details",{date:i.format(this.prodShift.get("date"),"YYYY-MM-DD"),shift:t("core","SHIFT:"+this.prodShift.get("shift"))})]},actions:function(){var e=Date.parse(this.prodShift.get("date")),i=e+288e5;return[{label:t.bound("prodShifts","PAGE_ACTION:prodLogEntries"),icon:"edit",href:"#prodLogEntries?sort(createdAt)&limit(20)&prodLine="+encodeURIComponent(this.prodShift.get("prodLine"))+"&createdAt>="+e+"&createdAt<"+i}]},initialize:function(){this.defineModels(),this.defineViews(),this.listenToOnce(this.prodShift,"sync",this.setUpRemoteTopics),this.setView(".prodShifts-details-container",this.detailsView),this.setView(".prodShifts-timeline-container",this.timelineView),this.setView(".prodShifts-quantitiesDone-container",this.quantitiesDoneChartView)},defineModels:function(){this.prodShift=s(new d({_id:this.options.modelId}),this),this.prodLogEntries=s(new r(null,{rqlQuery:{sort:{createdAt:1,type:-1},limit:9999,selector:{name:"and",args:[{name:"eq",args:["prodShift",this.options.modelId]}]}}}),this)},defineViews:function(){this.detailsView=new h({model:this.prodShift}),this.timelineView=new a({collection:this.prodLogEntries}),this.quantitiesDoneChartView=new p({model:this.prodShift})},load:function(e){return e(this.prodShift.fetch(),this.prodLogEntries.fetch({reset:!0}))},setUpRemoteTopics:function(){var e=Date.parse(this.prodShift.get("date")+288e5);Date.now()>=e||this.pubsub.subscribe("production.synced."+this.prodShift.get("prodLine"),this.handleProdChanges.bind(this))},handleProdChanges:function(t){e.intersection(t.types,l).length&&this.prodLogEntries.fetch({reset:!0}),t.prodShift&&this.prodShift.set(t.prodShift)}})});