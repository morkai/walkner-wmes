define(["app/i18n","app/core/View","app/core/util/bindLoadingMessage","app/wmes-osh-common/dictionaries","../CountReport","../views/CountReportFilterView","../views/CountPerUserChartView","../views/TableAndChartView","app/wmes-osh-reports/templates/count/pages"],function(e,t,i,s,r,a,n,o,l){"use strict";return t.extend({layoutName:"page",template:function(){return l[this.model.type].apply(this,arguments)},events:{"click a[data-key]":function(e){const{group:t,key:i}=e.currentTarget.dataset,s=this.$(`a[data-group="${t}"].active`).removeClass("active").attr("data-key");e.currentTarget.classList.add("active"),this.$id(s).addClass("hidden"),this.$id(i).removeClass("hidden")}},breadcrumbs:function(){return[this.t("breadcrumb"),this.t(`count:${this.model.type}:breadcrumb`)]},initialize:function(){this.model=i(this.model,this),this.filterView=new a({model:this.model}),this.model.metrics.forEach(e=>{const t=r.USER_METRICS[e]?n:o;this.setView(`#-${e}`,new t({metric:e,model:this.model,filename:this.t(`count:filename:${e}:${this.model.type}`),title:this.t(`count:title:${e}`)}))}),this.listenTo(this.filterView,"filterChanged",this.onFilterChanged),this.setView("#-filter",this.filterView)},load:function(e){return e(s.load().done(()=>this.model.fetch()))},getTemplateData:function(){return{type:this.model.type,metrics:this.model.metrics.filter(e=>!s.ORG_UNITS.includes(e)),orgUnits:s.ORG_UNITS}},afterRender:function(){const e=new Set;this.$("a[data-group]").each((t,i)=>{const s=i.dataset.group;e.has(s)||(e.add(s),i.click())})},onFilterChanged:function(e){this.model.rqlQuery=e,this.promised(this.model.fetch()),this.broker.publish("router.navigate",{url:this.model.genClientUrl(),trigger:!1,replace:!0})}})});