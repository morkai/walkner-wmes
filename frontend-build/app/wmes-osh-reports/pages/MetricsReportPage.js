define(["app/core/View","app/core/util/bindLoadingMessage","app/wmes-osh-common/dictionaries","../views/metrics/FilterView","../views/metrics/YearlyAccidentsChartView","../views/metrics/TrcView","../views/metrics/IprView","../views/metrics/IppView","../views/metrics/ObsPlanView","../views/metrics/ContactView","../views/metrics/RiskyObsView","../views/metrics/ObserversView","app/wmes-osh-reports/templates/metrics/page"],function(e,i,t,s,n,r,o,l,d,h,m,w,c){"use strict";return e.extend({layoutName:"page",template:c,breadcrumbs:function(){return[this.t("breadcrumb"),this.t("metrics:breadcrumb")]},initialize:function(){this.defineModels(),this.defineViews(),this.defineBindings()},defineModels:function(){this.model=i(this.model,this)},defineViews:function(){this.filterView=new s({model:this.model}),this.setView("#-filter",this.filterView),this.setView("#-yearlyAccidents",new n({model:this.model})),this.setView("#-trc",new r({model:this.model})),this.setView("#-ipr",new o({model:this.model})),this.setView("#-ipp",new l({model:this.model})),this.setView("#-obsPlan",new d({model:this.model})),this.setView("#-contact",new h({model:this.model})),this.setView("#-riskyObs",new m({model:this.model})),this.setView("#-observers",new w({model:this.model}))},defineBindings:function(){this.listenTo(this.filterView,"filterChanged",this.onFilterChanged)},load:function(e){return e(t.load().done(()=>this.model.fetch()))},onFilterChanged:function(e){this.model.rqlQuery=e,this.promised(this.model.fetch()),this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!1,replace:!0})}})});