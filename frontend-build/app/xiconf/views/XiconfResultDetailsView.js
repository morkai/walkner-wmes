// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","highlight","app/i18n","app/highcharts","app/core/View","./LedsView","./ProgramStepsView","app/xiconf/templates/details"],function(t,i,e,n,r,s,a,o){"use strict";return r.extend({template:o,events:{"click .xiconf-tabs a":function(t){t.preventDefault();var i=this.$(t.target).tab("show").parent().attr("data-tab");this.broker.publish("router.navigate",{url:this.model.genClientUrl()+"?tab="+i,trigger:!1,replace:!0})},"shown.bs.tab":function(t){var i=t.target.parentNode,e=i.dataset.tab;return"program"===e?void this.renderMetrics():void(void 0!==i.dataset.highlight&&this.highlight(e))}},initialize:function(){this.highlighted={feature:!1,gprsInputFile:!1,gprsOutputFile:!1},this.metricsChart=null,this.setView(".xiconf-details-leds",new s({model:this.model})),this.setView(".xiconf-details-steps",new a({model:this.model}))},destroy:function(){null!==this.metricsChart&&(this.metricsChart.destroy(),this.metricsChart=null)},serialize:function(){return{idPrefix:this.idPrefix,model:this.model.toJSON(),log:this.model.getDecoratedLog()}},beforeRender:function(){this.highlighted={feature:!1,gprsInputFile:!1,gprsOutputFile:!1},null!==this.metricsChart&&(this.metricsChart.destroy(),this.metricsChart=null),this.stopListening(this.model,"change",this.render)},afterRender:function(){this.listenTo(this.model,"change",this.render),this.activateTab(this.options.tab||"log")},activateTab:function(t){this.$('.nav-tabs > li[data-tab="'+t+'"] > a').tab("show")},highlight:function(t){this.highlighted[t]||(this.model.get(t)&&i.highlightBlock(this.$id(t).find("code")[0]),this.highlighted[t]=!0)},renderMetrics:function(){if(null!==this.metricsChart)return void this.metricsChart.reflow();var t=this.model.get("metrics")||{uSet:[],uGet:[],i:[]},i={uSet:t.uSet,uGet:t.uGet,i:t.i,r:t.uGet.map(function(i,e){return t.i[e]?i/t.i[e]:0}),p:t.uGet.map(function(i,e){return t.i[e]?i*t.i[e]:0})};this.metricsChart=new n.Chart({chart:{renderTo:this.el.querySelector(".xiconf-details-metrics"),zoomType:"x",height:400},title:{text:e("xiconf","metrics:title")},noData:{},xAxis:{type:"category"},yAxis:[{title:{text:e("xiconf","metrics:u")},tickAmount:6},{title:{text:e("xiconf","metrics:i")},tickAmount:6},{title:{text:e("xiconf","metrics:r")},opposite:!0,tickAmount:6},{title:{text:e("xiconf","metrics:p")},opposite:!0,tickAmount:6}],tooltip:{shared:!0,valueDecimals:2},legend:{enabled:!0},plotOptions:{line:{lineWidth:1.5,pointInterval:1,pointStart:0,marker:{radius:0,symbol:"circle",lineWidth:0,states:{hover:{radius:4}}}}},series:[{id:"uSet",name:e.bound("xiconf","metrics:uSet"),type:"line",yAxis:0,data:i.uSet,min:0,tooltip:{valueSuffix:"V"},zIndex:1},{id:"uGet",name:e.bound("xiconf","metrics:uGet"),type:"line",yAxis:0,data:i.uGet,min:0,tooltip:{valueSuffix:"V"},zIndex:2},{id:"i",name:e.bound("xiconf","metrics:i"),type:"line",yAxis:1,data:i.i,min:0,tooltip:{valueSuffix:"A"},zIndex:3},{id:"r",name:e.bound("xiconf","metrics:r"),type:"line",yAxis:2,data:i.r,min:0,tooltip:{valueSuffix:"Ω"},zIndex:4},{id:"p",name:e.bound("xiconf","metrics:p"),type:"line",yAxis:3,data:i.p,min:0,tooltip:{valueSuffix:"W"},zIndex:5}]})}})});