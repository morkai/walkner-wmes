// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","d3","app/core/View","app/factoryLayout/templates/canvas","screenfull"],function(t,n,e,i,a,o){function s(t,n){return"rgba("+parseInt(t.substr(1,2),16)+","+parseInt(t.substr(3,2),16)+","+parseInt(t.substr(5,2),16)+","+n+")"}var r=5,c=22,l=4,h=17,d=18,u=110,p=39;return i.extend({template:a,events:{"click [data-action]":function(t){var n=t.currentTarget,e=n.dataset.action;return e===this.currentAction?!1:(null!==this.currentAction&&this.$("[data-action="+this.currentAction+"]").removeClass("active"),this.currentAction=e,void this.$("[data-action="+this.currentAction+"]").addClass("active"))}},initialize:function(){this.onKeyDown=this.onKeyDown.bind(this),this.onResize=t.debounce(this.onResize.bind(this),16),this.canvas=null,this.zoom=null,this.currentAction=null,n("body").on("keydown",this.onKeyDown),n(window).on("resize",this.onResize),o.onchange=t.debounce(this.onFullscreen.bind(this),16),window.flv=this},destroy:function(){n("body").off("keydown",this.onKeyDown),n(window).off("resize",this.onResize),o.onchange=function(){},this.zoom=null,this.canvas=null},beforeRender:function(){},afterRender:function(){this.setUpCanvas(this.getSize()),this.canvas.append("rect").attr("class","factoryLayout-area").attr("x","0").attr("y","0").attr("width","1920px").attr("height","1080px");var t=this.canvas.selectAll(".division").data([{id:"LPd",position:{x:10,y:10},points:[[0,0],[0,350],[300,350],[300,600],[600,600],[600,0]],fillColor:"#00aaff",prodLines:[{x:10,y:10,h:330},{x:310,y:10,h:580}]},{id:"LPa",position:{x:610,y:10},points:[[0,0],[0,600],[430,600],[430,0]],fillColor:"#FFFF80",prodLines:[{x:10,y:10,h:580},{x:230,y:10,h:580}]},{id:"LPb",position:{x:1040,y:10},points:[[0,0],[0,600],[430,600],[430,0]],fillColor:"#80D780",prodLines:[{x:10,y:10,h:580},{x:230,y:10,h:580}]},{id:"LPc",position:{x:1470,y:10},points:[[0,0],[0,600],[440,600],[440,0]],fillColor:"#C080C0",prodLines:[{x:10,y:10,h:580},{x:240,y:10,h:580}]},{position:{x:10,y:360},points:[[0,0],[0,250],[75,250],[75,500],[800,500],[800,710],[1320,710],[1320,500],[1900,500],[1900,250],[300,250],[300,0]],fillColor:"#FFD580",prodLines:[]}]),n=e.svg.line().x(function(t){return t[0]}).y(function(t){return t[1]}).interpolate("linear-closed"),i=e.behavior.drag().origin(function(t){return t.position}).on("dragstart",function(){e.event.sourceEvent.stopPropagation(),this.parentNode.appendChild(this),this.classList.add("is-dragging")}).on("dragend",function(){this.classList.remove("is-dragging")}).on("drag",function(t){t.position.x=e.event.x-e.event.x%10,t.position.y=e.event.y-e.event.y%10,e.select(this).attr("transform","translate("+t.position.x+","+t.position.y+")")}),a=t.enter().insert("g").attr("class","factoryLayout-division").attr("transform",function(t){return"translate("+t.position.x+","+t.position.y+")"}).attr("fill",function(t){return s(t.fillColor||"#000000",.5)}).call(i);a.append("path").classed("factoryLayout-division-area",!0).attr("d",function(t){return n(t.points)});var o=e.format(" >6d"),f=e.format(" >3d"),y=c+2+r;a.each(function(t){var n=e.select(this),i=1;t.prodLines.forEach(function(e){var a=n.append("g").attr({"class":"factoryLayout-prodLines",transform:"translate("+e.x+","+e.y+")"});a.append("path").attr({"class":"factoryLayout-prodLines-line",d:"M-5,0 v"+e.h});for(var s=Math.floor(e.h/y),r=0;s>r;++r){var v=a.append("g").attr({"class":"factoryLayout-prodLine",transform:"translate(0,"+y*r+")",style:"font-size: "+d+"px"});v.append("rect").attr({"class":"factoryLayout-prodLine-bg",x:0,y:0,width:u,height:c}),v.append("text").attr({"class":"factoryLayout-prodLine-name",x:l,y:h}).html(t.id+" "+o(i++)),v.append("rect").attr({"class":"factoryLayout-metric-bg",x:u,y:0,width:p,height:c}),v.append("text").attr({"class":"factoryLayout-metric-value",x:1+u+l,y:h}).html(f(Math.round(125*Math.random()))),v.append("rect").attr({"class":"factoryLayout-metric-bg",x:u+p,y:0,width:p,height:c}),v.append("text").attr({"class":"factoryLayout-metric-value",x:1+u+p+l,y:h}).html(f(Math.round(125*Math.random())))}})}),t.exit().remove(),this.centerView(),this.$("[data-action=pan]").click()},getSize:function(){if(o.element===this.el)return{width:window.innerWidth,height:window.innerHeight};var t=window.innerWidth-28,e=window.innerHeight-14-n(".page > .hd").outerHeight(!0)-n(".page > .ft").outerHeight(!0);return{width:t,height:e}},centerView:function(){var t,n,e=this.canvas.node().getBBox().width;o.isFullscreen?(t=(window.innerWidth-e)/2,n=0):(t=(this.el.getBoundingClientRect().width-e)/2,n=5),this.$el.toggleClass("is-fullscreen",o.isFullscreen),this.translate(t,n)},onKeyDown:function(t){122!==t.which||o.isFullscreen||(t.preventDefault(),o.request(this.el))},onResize:function(){var t=this.getSize();this.$el.css(t),this.$("svg").attr(t).find(".factoryLayout-bg").attr(t)},onFullscreen:function(){this.centerView()},setUpCanvas:function(t){function n(){i.canvas.attr("transform","translate("+e.event.translate+") scale("+e.event.scale+")"),e.event.scale>=.5?i.$("text").fadeIn():i.$("text").fadeOut()}var i=this;this.$el.css(t);var a=e.behavior.zoom().on("zoomstart",function(){i.$el.addClass("is-panning")}).on("zoomend",function(){i.$el.removeClass("is-panning")}).on("zoom",n),o=e.select(this.el).select("svg").attr("class","factoryLayout-canvas").attr("width",t.width).attr("height",t.height).attr("pointer-events","all").append("g").call(a).on("dblclick.zoom",null);o.append("rect").attr("class","factoryLayout-bg").attr("width",t.width).attr("height",t.height),this.zoom=a,this.canvas=o.append("g"),this.translate(5,5)},translate:function(t,n){this.zoom.scale(1),this.zoom.translate([t,n]),this.canvas.attr("transform","translate("+t+","+n+") scale(1)")}})});