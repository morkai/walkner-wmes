// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","app/time","app/data/orgUnits","app/data/downtimeReasons","app/core/View","app/core/templates/userInfo","app/factoryLayout/templates/listItem","app/prodShifts/views/ProdShiftTimelineView","app/prodShifts/views/QuantitiesDoneChartView"],function(e,t,i,n,s,o,r,a,l,h){return o.extend({template:a,events:{"click .factoryLayout-quantitiesDone-prop":function(e){e.currentTarget.classList.contains("is-clickable")&&this.toggleQuantitiesDoneChart()},"mouseup .factoryLayout-prodLineListItem-prodLine":function(e){if(2!==e.button){var t=this.serializeShift();if(t.href)return 1===e.button?window.open(t.href):this.broker.publish("router.navigate",{url:t.href,trigger:!0,replace:!1}),!1}}},initialize:function(){this.renderTimeline=e.debounce(this.renderTimeline.bind(this),1),this.timelineView=null,this.quantitiesDoneChartView=null,this.listenTo(this.model,"change:online",this.onOnlineChanged),this.listenTo(this.model,"change:state",this.onStateChanged),this.listenTo(this.model,"change:extended",this.onExtendedChanged),this.listenTo(this.model,"change:prodShift",this.onProdShiftChanged),this.listenTo(this.model,"change:prodShiftOrders",this.onProdShiftOrdersChanged),this.listenTo(this.model,"change:prodDowntimes",this.onProdDowntimesChanged),this.listenTo(this.model,"change:plannedQuantityDone change:actualQuantityDone",e.debounce(this.onMetricsChanged.bind(this),1)),this.listenTo(this.displayOptions,"change",this.toggleVisibility)},destroy:function(){this.timelineView=null,this.quantitiesDoneChartView=null},serialize:function(){var e=[];this.model.get("online")||e.push("is-offline"),this.model.get("state")&&e.push("is-"+this.model.get("state")),this.model.get("extended")&&e.push("is-extended");var t=n.getParent(n.getByTypeAndId("prodLine",this.model.getProdLineId())),i=t?n.getParent(t):null,s=this.serializeOrder(),o=this.serializeNc12(),r=this.serializeDowntime();return{classNames:e.join(" "),prodLine:this.model.getLabel(),prodFlow:i?i.getLabel():"?",workCenter:t?t.getLabel():"?",shift:this.serializeShift(),order:s,nc12:o,downtime:r,quantitiesDone:this.serializeQuantitiesDone(),master:this.serializePersonnel("master"),leader:this.serializePersonnel("leader"),operator:this.serializePersonnel("operator")}},serializeShift:function(){var e=this.model.get("prodShift");return e?{text:i.format(e.get("date"),"YYYY-MM-DD")+", "+t("core","SHIFT:"+e.get("shift")),href:"#prodShifts/"+(this.displayOptions.isHistoryData()?e.id:this.model.id)}:{text:"?",href:null}},serializePersonnel:function(e){var t=this.model.get("prodShift");if(!t)return"-";var i=t.get(e);return i?(i.label=i.label.match(/^(.*?)(?:\(.*?\))?$/)[1].trim(),r({userInfo:i})):"-"},serializeOrder:function(){var e=this.model.get("prodShiftOrders").last();return{label:t("factoryLayout",!e||e.get("finishedAt")?"prop:lastOrder":"prop:order"),value:e?e.getLabel(!1):"-"}},serializeNc12:function(){var e=this.model.get("prodShiftOrders").last();return{label:t("factoryLayout",!e||e.get("finishedAt")?"prop:lastNc12":"prop:nc12"),value:e?e.getNc12():"-"}},serializeDowntime:function(){var e=this.model.get("prodDowntimes").last(),i=e?s.get(e.get("reason")):null;return{label:t("factoryLayout",!e||e.get("finishedAt")?"prop:lastDowntime":"prop:downtime"),value:i?i.getLabel():e?"?":"-"}},serializeQuantitiesDone:function(){var e=this.model.get("actualQuantityDone"),i=this.model.get("plannedQuantityDone");return t("factoryLayout","qty",{actual:-1===e?"?":e.toLocaleString(),planned:-1===i?"?":i.toLocaleString()})},afterRender:function(){this.timelineView=new l({prodShift:this.model.get("prodShift"),prodShiftOrders:this.model.get("prodShiftOrders"),prodDowntimes:this.model.get("prodDowntimes"),editable:!1,resizable:!1,itemHeight:40,calcWidth:this.calcWidth}),this.setView(".factoryLayout-timeline-container",this.timelineView).render();var e=!!this.model.get("prodShift");e&&this.$(".factoryLayout-quantitiesDone-prop").addClass("is-clickable"),this.$el.toggleClass("has-prodShift",e),this.quantitiesDoneChartView&&(this.quantitiesDoneChartView=null,this.toggleQuantitiesDoneChart()),this.toggleVisibility()},calcWidth:function(){return window.innerWidth-20},renderTimeline:function(){this.timelineView&&this.timelineView.render()},resize:function(){this.timelineView.onWindowResize(),this.quantitiesDoneChartView&&(this.quantitiesDoneChartView.$el.css("width",this.calcWidth()+"px"),this.quantitiesDoneChartView.chart.reflow())},toggleQuantitiesDoneChart:function(){null===this.quantitiesDoneChartView?this.renderQuantitiesDoneChart():this.destroyQuantitiesDoneChart()},renderQuantitiesDoneChart:function(){var e=this.model.get("prodShift");e&&(this.quantitiesDoneChartView=new h({model:this.model.get("prodShift"),height:220,reflow:!1,showTitle:!1,showLegend:!1}),this.setView(".factoryLayout-quantitiesDone-container",this.quantitiesDoneChartView).render(),this.quantitiesDoneChartView.$el.parent().show())},destroyQuantitiesDoneChart:function(){null!==this.quantitiesDoneChartView&&(this.quantitiesDoneChartView.$el.parent().hide(),this.quantitiesDoneChartView.remove(),this.quantitiesDoneChartView=null)},toggleVisibility:function(){this.$el.toggle(this.displayOptions.isVisible(this.model))},onOnlineChanged:function(){this.$el.toggleClass("is-offline",!this.model.get("online")),this.toggleVisibility()},onStateChanged:function(){this.$el.removeClass("is-idle is-working is-downtime"),this.model.get("state")&&this.$el.addClass("is-"+this.model.get("state")),this.toggleVisibility()},onExtendedChanged:function(){this.$el.toggleClass("is-extended",this.model.get("extended"))},onProdShiftChanged:function(){this.$("[role=shift]").html(this.serializeShift()),["master","leader","operator"].forEach(function(e){this.$("[role="+e+"]").html(this.serializePersonnel(e))},this);var e=!!this.model.get("prodShift");e||this.destroyQuantitiesDoneChart(),this.$(".factoryLayout-quantitiesDone-prop").toggleClass("is-clickable",e)},onProdShiftOrdersChanged:function(e){var t=this.serializeOrder(),i=this.serializeNc12();this.$("[role=orderLabel]").html(t.label),this.$("[role=orderValue]").html(t.value),this.$("[role=nc12Label]").html(i.label),this.$("[role=nc12Value]").html(i.value),e&&e.reset&&this.renderTimeline()},onProdDowntimesChanged:function(e){var t=this.serializeDowntime();this.$("[role=downtimeLabel]").html(t.label),this.$("[role=downtimeValue]").html(t.value),e&&e.reset&&this.renderTimeline()},onMetricsChanged:function(){this.$("[role=quantitiesDone]").html(this.serializeQuantitiesDone())}})});