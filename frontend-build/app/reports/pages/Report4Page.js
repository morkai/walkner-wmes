define(["app/i18n","app/core/View","../Report4","../Report4Query","../views/4/FilterView","../views/4/EffAndProdChartView","../views/4/WorkTimesChartView","../views/4/MachineTimesChartView","../views/4/QuantitiesChartView","../views/4/NotesListView","app/reports/templates/4/page"],function(e,i,t,r,s,n,o,h,a,w,p){"use strict";return i.extend({layoutName:"page",pageId:"report4",template:p,breadcrumbs:[e.bound("reports","BREADCRUMB:4")],initialize:function(){this.defineModels(),this.defineViews(),this.setView(".filter-container",this.filterView),this.setView(".reports-4-effAndProd-container",this.effAndProdChartView),this.setView(".reports-4-workTimes-container",this.workTimesChartView),this.setView(".reports-4-machineTimes-container",this.machineTimesChartView),this.setView(".reports-4-quantities-container",this.quantitiesChartView),this.setView(".reports-4-notes-container",this.notesListView),this.once("afterRender",function(){this.promised(this.report.fetch())})},defineModels:function(){this.query=r.fromQuery(this.options.query),this.report=new t(null,{query:this.query}),this.listenTo(this.query,"change",this.onQueryChange)},defineViews:function(){this.filterView=new s({model:this.query}),this.effAndProdChartView=new n({model:this.report}),this.workTimesChartView=new o({model:this.report}),this.machineTimesChartView=new h({model:this.report}),this.quantitiesChartView=new a({model:this.report}),this.notesListView=new w({model:this.report})},onQueryChange:function(e,i){i&&i.reset&&(this.broker.publish("router.navigate",{url:this.report.url()+"?"+this.query.serializeToString(),replace:!0,trigger:!1}),this.promised(this.report.fetch()))}})});