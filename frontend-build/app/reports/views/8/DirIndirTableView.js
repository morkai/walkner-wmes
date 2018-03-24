// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/highcharts","app/core/View","app/reports/templates/8/dirIndirTable"],function(i,r,t,a){"use strict";return t.extend({template:a,events:{"click .js-dirIndir":function(i){this.toggleDirIndir(i.currentTarget.parentNode.dataset.prop),this.saveDirIndir(),this.recountTotalDirIndir()},"click .js-value":function(i){var r=i.currentTarget;this.toggleSeries(r.parentNode.dataset.prop,r.dataset.kind)}},initialize:function(){this.dirIndir=this.readDirIndir(),this.listenTo(this.model,"change:summary",this.render)},afterRender:function(){this.recountTotalDirIndir()},serialize:function(){return{idPrefix:this.idPrefix,props:this.serializeProps()}},serializeProp:function(i,r,t,a){var e=this.dirIndir[t],s={plan:"",rawPlan:0,real:"",rawReal:0,className:e?"is-"+e:"",dirIndir:!1!==a,planColor:this.serializeColor(t,"plan"),realColor:this.serializeColor(t,"real")};if(r){var n=r[t];Array.isArray(n)?(s.plan=this.formatValue(n[0]),s.rawPlan=n[0],s.real=this.formatValue(n[1]),s.rawReal=n[1]):(s.real=this.formatValue(n),s.rawReal=n)}return i[t]=s,s},serializeColor:function(i,r){var t=i+":"+r;return this.model.query.isVisibleSeries(t)?this.model.getColor("dirIndir",t):"transparent"},formatValue:function(i){return r.numberFormat(i,2)},serializeProps:function(){var r=this.model.get("summary"),t={totalVolumeProduced:!1,averageRoutingTime:!1,prodBasedPlanners:!0,prodQualityInspection:!0,prodOperators:!0,prodSetters:!1,masters:!0,leaders:!0,prodMaterialHandling:!0,kitters:!0,prodTransport:!0,cycleCounting:!0,otherWarehousing:!0,materialQualityInspection:!0,maintenance:!0};return i.forEach(t,function(i,a){this.serializeProp(t,r,a,i)},this),t},adjustHeight:function(i){var r=this.$id("footer").css("height","0px"),t=this.$el.outerHeight();t>=i?r.css("display","none"):r.css({display:"",height:1+i-t+"px"})},toggleDirIndir:function(i){var r=this.$('tr[data-prop="'+i+'"]');r.hasClass("is-dir")?r.removeClass("is-dir").addClass("is-indir"):r.hasClass("is-indir")?r.removeClass("is-indir"):r.addClass("is-dir")},recountTotalDirIndir:function(){var i=0,r=0,t=0,a=0,e=!1;this.$(".is-dir").each(function(){e=!0,i+=parseFloat(this.dataset.plan),r+=parseFloat(this.dataset.real)}),this.$(".is-indir").each(function(){e=!0,t+=parseFloat(this.dataset.plan),a+=parseFloat(this.dataset.real)}),this.$id("planDirTotal").text(e?this.format00(i):""),this.$id("realDirTotal").text(e?this.format00(r):""),this.$id("planIndirTotal").text(e?this.format00(t):""),this.$id("realIndirTotal").text(e?this.format00(a):"")},format00:function(i){return(Math.round(100*i)/100).toLocaleString()},readDirIndir:function(){return JSON.parse(localStorage.LEAN_DIR_INDIR||"{}")},saveDirIndir:function(){var i={};this.$(".is-dir, .is-indir").each(function(){i[this.dataset.prop]=this.classList.contains("is-dir")?"dir":"indir"}),localStorage.LEAN_DIR_INDIR=JSON.stringify(i)},toggleSeries:function(i,r){var t=this.$('tr[data-prop="'+i+'"]'),a=t.find('td[data-kind="'+r+'"] > span'),e=i+":"+r;this.model.query.toggleSeriesVisibility(e),a.css({borderBottomColor:this.serializeColor(i,r)})}})});