// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","d3","screenfull","app/viewport","app/core/View","app/factoryLayout/templates/canvas"],function(t,e,n,i,a,o,r){function s(t,e){return"rgba("+parseInt(t.substr(1,2),16)+","+parseInt(t.substr(3,2),16)+","+parseInt(t.substr(5,2),16)+","+e+")"}var l=10,d=22,c=4,u=17,h=18,p=110,f=39,g=d+2+l;return o.extend({template:r,events:{"click [data-action]":function(t){var e=t.currentTarget,n=e.dataset.action;return n===this.currentAction?!1:(null!==this.currentAction&&this.$("[data-action="+this.currentAction+"]").removeClass("active"),this.currentAction=n,void this.$("[data-action="+this.currentAction+"]").addClass("active"))},"mouseover .factoryLayout-division":function(t){this.bringDivisionToTop(t.currentTarget)},"mousedown .factoryLayout-prodLine":function(t){return this.clickInfo={type:"prodLine",time:t.timeStamp,modelId:t.currentTarget.getAttribute("data-id"),button:t.button},!1},"mousedown .factoryLayout-division":function(t){return this.clickInfo={type:"division",time:t.timeStamp,modelId:t.currentTarget.getAttribute("data-id"),button:t.button},!1}},initialize:function(){if(this.onKeyDown=this.onKeyDown.bind(this),this.onResize=t.debounce(this.onResize.bind(this),16),this.editable=!!this.options.editable,this.canvas=null,this.zoom=null,this.currentAction=null,this.clickInfo=null,this.panInfo=null,e("body").on("keydown",this.onKeyDown),e(window).on("resize",this.onResize),i.onchange=t.debounce(this.onFullscreen.bind(this),16),!this.editable){var n=this.model;this.listenTo(n.prodLineStates,"change:state",this.onStateChange),this.listenTo(n.prodLineStates,"change:online",this.onOnlineChange),this.listenTo(n.prodLineStates,"change:extended",this.onExtendedChange),this.listenTo(n.prodLineStates,"change:plannedQuantityDone",this.onPlannedQuantityDoneChange),this.listenTo(n.prodLineStates,"change:actualQuantityDone",this.onActualQuantityDoneChange),this.listenTo(n.settings,"change",this.onSettingsChange)}},destroy:function(){e("body").off("keydown",this.onKeyDown),e(window).off("resize",this.onResize),i.onchange=function(){},this.zoom=null,this.canvas=null,this.clickInfo=null,this.panInfo=null},beforeRender:function(){this.editable||this.stopListening(this.model,"sync",this.render)},afterRender:function(){this.editable||this.listenToOnce(this.model,"sync",this.render),this.$el.toggleClass("is-editable",this.editable),this.setUpCanvas(this.getSize()),this.renderLayout(),this.centerView(),this.$("[data-action=pan]").click()},renderLayout:function(){this.renderDivisionAreas()},renderDivisionAreas:function(){var t=this,e=this.model,i=this.canvas.selectAll(".factoryLayout-division").data(e.factoryLayout.get("live")),a=n.svg.line().x(function(t){return t[0]}).y(function(t){return t[1]}).interpolate("linear-closed"),o=n.behavior.drag().origin(function(t){return t.position}).on("dragstart",function(){n.event.sourceEvent.stopPropagation(),t.bringDivisionToTop(this),n.select(this).classed("is-dragging",!0)}).on("dragend",function(){n.select(this).classed("is-dragging",!1)}).on("drag",function(t){t.position.x=n.event.x-n.event.x%10,t.position.y=n.event.y-n.event.y%10,n.select(this).attr("transform","translate("+t.position.x+","+t.position.y+")")}),r=i.enter().insert("g").attr("class","factoryLayout-division").attr("transform",function(t){return"translate("+t.position.x+","+t.position.y+")"}).attr("fill",function(t){return e.settings?e.settings.getColor(t._id):s(t.fillColor||"#000000",1)}).attr("data-id",function(t){return t._id}).call(this.editable?o:function(){});r.append("path").classed("factoryLayout-division-area",!0).attr("d",function(t){return a(t.points)});var l=e.prodLineStates,d=e.settings?e.settings.isBlacklisted.bind(e.settings):null;r.each(function(e){var i=n.select(this);e.prodLines.forEach(t.renderProdLinesGuide.bind(t,e,i,l?l.getByOrgUnit("division",[e._id],d):null)),t.renderDivisionName(i,e)}),i.exit().remove()},renderDivisionName:function(t,e){for(var n=0,i=0,a=1,o=e.points.length-1;o>a;++a){var r=e.points[a-1],s=e.points[a],l=e.points[a+1];if(s[1]===r[1]&&s[1]>l[1]&&s[0]===l[0]){n=s[0]-(4+8*e._id.length),i=s[1]-16;break}}var d=t.append("g").classed("factoryLayout-divisionName",!0).attr("transform","translate("+n+","+i+")");d.append("rect").attr({x:0,y:0,width:3+8*e._id.length,height:14}),d.append("text").attr({x:2,y:12}).text(e._id)},renderProdLinesGuide:function(t,e,n,i){for(var a=e.append("g").attr({"class":"factoryLayout-prodLines",transform:"translate("+i.x+","+i.y+")"}),o=Math.floor(i.h/g),r=0;o>r;++r){var s=n?n.shift():null;if(void 0===s)break;this.renderProdLineBox(a,s,r)}},renderProdLineBox:function(t,e,n){var i=t.append("g").attr({"class":"factoryLayout-prodLine",transform:"translate(0,"+g*n+")",style:"font-size: "+h+"px"});e&&(i.attr("data-id",e.id),null!==e.get("state")&&i.classed("is-"+e.get("state"),!0)),i.classed("is-offline",e&&!e.get("online")),i.classed("is-extended",e&&e.get("extended"));var a=i.append("g").attr({"class":"factoryLayout-prodLine-inner"});a.append("rect").attr({"class":"factoryLayout-prodLine-bg",x:0,y:0,width:p,height:d}),a.append("text").attr({"class":"factoryLayout-prodLine-name",x:c,y:u}).text(e?e.getLabel():"LPx "+(n+1)),a.append("rect").attr({"class":"factoryLayout-metric-bg",x:p,y:0,width:f,height:d});var o=this.prepareMetricValue(e?e.get("plannedQuantityDone"):0);a.append("text").attr({"class":"factoryLayout-metric-value factoryLayout-metric-plannedQuantityDone",x:1+p+c,y:u,"data-length":o.length}).text(o),a.append("rect").attr({"class":"factoryLayout-metric-bg",x:p+f,y:0,width:f,height:d});var r=this.prepareMetricValue(e?e.get("actualQuantityDone"):0);a.append("text").attr({"class":"factoryLayout-metric-value factoryLayout-metric-actualQuantityDone",x:1+p+f+c,y:u,"data-length":r.length}).text(r)},padMetricValue:n.format(" >3d"),setUpCanvas:function(t){function e(){i.canvas.attr("transform","translate("+n.event.translate+")")}var i=this;this.$el.css(t);var a=n.behavior.zoom().on("zoomstart",function(){i.panInfo={time:n.event.sourceEvent.timeStamp,translate:n.event.target.translate()},i.$el.addClass("is-panning")}).on("zoomend",function(){i.$el.removeClass("is-panning");var t=i.panInfo,e=n.event.target.translate();i.panInfo=null,i.clickInfo&&t.translate[0]===e[0]&&t.translate[1]===e[1]&&i.handleClick()}).on("zoom",e),o=n.select(this.el).select("svg").attr("class","factoryLayout-canvas").attr("width",t.width).attr("height",t.height).attr("pointer-events","all").append("g").call(a).on("dblclick.zoom",null).on("wheel.zoom",null);o.append("rect").attr("class","factoryLayout-bg").attr("width",t.width).attr("height",t.height),this.zoom=a,this.canvas=o.append("g"),this.canvas.append("rect").attr("class","factoryLayout-area").attr("x","0").attr("y","0").attr("width","1920px").attr("height","1080px"),this.translate(5,5)},translate:function(t,e){this.zoom.translate([t,e]),this.canvas.attr("transform","translate("+t+","+e+")")},getSize:function(){if(i.element===this.el)return{width:window.innerWidth,height:window.innerHeight};var t=window.innerWidth-28,n=window.innerHeight-19-e(".page > .hd").outerHeight(!0)-e(".page > .ft").outerHeight(!0);return{width:t,height:n}},centerView:function(){var t,e,n=this.canvas.node().getBBox().width;i.isFullscreen?(t=(window.innerWidth-n)/2,e=0):(t=(this.el.getBoundingClientRect().width-n)/2,e=5),this.$el.toggleClass("is-fullscreen",i.isFullscreen),this.translate(t,e)},onKeyDown:function(t){document.msExitFullscreen||122!==t.which||i.isFullscreen||(t.preventDefault(),i.request(this.el))},onResize:function(){var t=this.getSize();this.$el.css(t),this.$("svg").attr(t).find(".factoryLayout-bg").attr(t)},onFullscreen:function(){this.centerView()},getProdLineOuterContainer:function(t){return n.select('.factoryLayout-prodLine[data-id="'+t+'"]')},onStateChange:function(t){var e=this.getProdLineOuterContainer(t.id);if(!e.empty()){var n={"is-idle":!1,"is-working":!1,"is-downtime":!1};n["is-"+t.get("state")]=!0,e.classed(n)}},onOnlineChange:function(t){var e=this.getProdLineOuterContainer(t.id);e.empty()||e.classed("is-offline",!t.get("online"))},onExtendedChange:function(e){var n=this.getProdLineOuterContainer(e.id);n.empty()||(n.classed("is-extended",e.get("extended")),e.get("extended")||(n.style("display","none"),t.defer(function(){n.style("display",null)})))},onPlannedQuantityDoneChange:function(t){this.updateMetricValue(t,"plannedQuantityDone")},onActualQuantityDoneChange:function(t){this.updateMetricValue(t,"actualQuantityDone")},onSettingsChange:function(t){if(/blacklist/.test(t.id))this.canvas.selectAll(".factoryLayout-division").remove(),this.renderLayout();else if(/color/.test(t.id)){var e=t.id.split(".")[1];this.canvas.select('.factoryLayout-division[data-id="'+e+'"]').attr("fill",t.getValue())}},updateMetricValue:function(e,n){var i=this.getProdLineOuterContainer(e.id);if(!i.empty()){var a=i.select(".factoryLayout-metric-"+n);if(!a.empty()){var o=this.prepareMetricValue(e.get(n));a.style("display","none"),a.text(o),a.attr("data-length",o.length),t.defer(function(){a.style("display",null)})}}},prepareMetricValue:function(t){return-1===t?"???":this.padMetricValue(t)},handleClick:function(){var t=this.clickInfo;if(t&&(this.clickInfo=null,2!==t.button)){var e=1===t.button;if("division"===t.type){var n="#factoryLayout;list?orgUnitType=division&orgUnitIds="+encodeURIComponent(t.modelId);e?window.open(n):this.broker.publish("router.navigate",{url:n,trigger:!0,replace:!1})}else"prodLine"===t.type&&this.showProdLinePreview(t.modelId,e)}},showProdLinePreview:function(t,e){var n=this.model.prodLineStates.get(t);if(n){var i=n.get("prodShift");if(i){var a="#prodShifts/"+t;e?window.open(a):this.broker.publish("router.navigate",{url:a,trigger:!0,replace:!1})}}},bringDivisionToTop:function(t){t.parentNode.lastElementChild!==t&&t.parentNode.appendChild(t)}})});