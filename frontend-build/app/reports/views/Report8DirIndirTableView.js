// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/highcharts","app/core/View","app/reports/templates/report8DirIndirTable"],function(i,r,t,e){"use strict";return t.extend({template:e,events:{"click .js-dirIndir":function(i){this.toggleDirIndir(i.currentTarget.parentNode.dataset.prop),this.saveDirIndir(),this.recountTotalDirIndir()},"click .js-value":function(i){this.toggleSeries(i.currentTarget.parentNode.dataset.prop,i.currentTarget.dataset.kind)}},initialize:function(){this.dirIndir=this.readDirIndir(),this.listenTo(this.model,"change:summary",this.render)},afterRender:function(){this.recountTotalDirIndir()},serialize:function(){return{idPrefix:this.idPrefix,props:this.serializeProps()}},serializeProp:function(i,r,t,e){var a=this.dirIndir[t],s={plan:"",rawPlan:0,real:"",rawReal:0,className:a?"is-"+a:"",dirIndir:e!==!1,planColor:this.serializeColor(t,"plan"),realColor:this.serializeColor(t,"real")},n=r[t];return Array.isArray(n)?(s.plan=this.formatValue(n[0]),s.rawPlan=n[0],s.real=this.formatValue(n[1]),s.rawReal=n[1]):(s.real=this.formatValue(n),s.rawReal=n),i[t]=s,s},serializeColor:function(i,r){var t=i+":"+r;return this.model.query.isVisibleSeries(t)?this.model.getColor("dirIndir",t):"transparent"},formatValue:function(i){return r.numberFormat(i,2)},serializeProps:function(){var r=this.model.get("summary"),t={totalVolumeProduced:!1,averageRoutingTime:!1,prodBasedPlanners:!0,prodQualityInspection:!0,prodOperators:!0,prodSetters:!0,masters:!0,leaders:!0,prodMaterialHandling:!0,kitters:!0,prodTransport:!0,cycleCounting:!0,otherWarehousing:!0,materialQualityInspection:!0,maintenance:!0};return i.forEach(t,function(i,e){this.serializeProp(t,r,e,i)},this),t},adjustHeight:function(i){var r=this.$id("footer").css("height","0px"),t=this.$el.outerHeight();t>=i?r.css("display","none"):r.css({display:"",height:1+i-t+"px"})},toggleDirIndir:function(i){var r=this.$('tr[data-prop="'+i+'"]');r.hasClass("is-dir")?r.removeClass("is-dir").addClass("is-indir"):r.hasClass("is-indir")?r.removeClass("is-indir"):r.addClass("is-dir")},recountTotalDirIndir:function(){var i=0,r=0,t=0,e=0,a=!1;this.$(".is-dir").each(function(){a=!0,i+=parseFloat(this.dataset.plan),r+=parseFloat(this.dataset.real)}),this.$(".is-indir").each(function(){a=!0,t+=parseFloat(this.dataset.plan),e+=parseFloat(this.dataset.real)}),this.$id("planDirTotal").text(a?this.format00(i):""),this.$id("realDirTotal").text(a?this.format00(r):""),this.$id("planIndirTotal").text(a?this.format00(t):""),this.$id("realIndirTotal").text(a?this.format00(e):"")},format00:function(i){return(Math.round(100*i)/100).toLocaleString()},readDirIndir:function(){return JSON.parse(localStorage.LEAN_DIR_INDIR||"{}")},saveDirIndir:function(){var i={};this.$(".is-dir, .is-indir").each(function(){i[this.dataset.prop]=this.classList.contains("is-dir")?"dir":"indir"}),localStorage.LEAN_DIR_INDIR=JSON.stringify(i)},toggleSeries:function(i,r){var t=this.$('tr[data-prop="'+i+'"]'),e=t.find('td[data-kind="'+r+'"] > span'),a=i+":"+r;this.model.query.toggleSeriesVisibility(a),e.css({borderBottomColor:this.serializeColor(i,r)})}})});