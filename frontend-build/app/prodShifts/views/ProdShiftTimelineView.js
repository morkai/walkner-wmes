// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["require","underscore","jquery","d3","d3.timeline","app/time","app/i18n","app/user","app/viewport","app/core/View","app/core/util/getShiftStartInfo","app/data/downtimeReasons","app/data/aors","app/prodShiftOrders/util/calcOrderEfficiency","app/prodShifts/templates/timelineIdlePopover","app/prodShifts/templates/timelineWorkingPopover","app/prodShifts/templates/timelineDowntimePopover"],function(e,t,i,o,n,r,d,s,a,h,p,l,m,u,f,c,g){"use strict";return h.extend({className:"prodShifts-timeline",events:{"click .prodShifts-timeline-addOrder":"showAddOrderDialog","click .prodShifts-timeline-editOrder":function(){this.showEditDialog(this.prodShiftOrders,"app/prodShiftOrders/views/ProdShiftOrderFormView")},"click .prodShifts-timeline-deleteOrder":function(){this.showDeleteDialog(this.prodShiftOrders)},"click .prodShifts-timeline-addDowntime":"showAddDowntimeDialog","click .prodShifts-timeline-editDowntime":function(){this.showEditDialog(this.prodDowntimes,"app/prodDowntimes/views/ProdDowntimeFormView")},"click .prodShifts-timeline-deleteDowntime":function(){this.showDeleteDialog(this.prodDowntimes)},"mouseover .popover":function(){this.timers.hidePopover&&(clearTimeout(this.timers.hidePopover),this.timers.hidePopover=null)}},initialize:function(){this.chart=null,this.datum=null,this.beginning=-1,this.ending=-1,this.lastWidth=-1,this.popover=null,this.options.resizable!==!1&&(this.onWindowResize=t.debounce(this.onWindowResize.bind(this),16),i(window).on("resize",this.onWindowResize)),this.options.editable!==!1&&(this.onDocumentClick=this.onDocumentClick.bind(this),i(document.body).on("click",this.onDocumentClick));var e=t.debounce(this.render.bind(this),1),o=t.debounce(this.reset.bind(this),1);this.listenTo(this.prodShiftOrders,"add remove change",e),this.listenTo(this.prodShiftOrders,"reset",o),this.listenTo(this.prodDowntimes,"add remove change",e),this.listenTo(this.prodDowntimes,"reset",o)},destroy:function(){this.hidePopover(),this.removeChart(),this.chart=null,this.datum=null,this.options.resizable!==!1&&i(window).off("resize",this.onWindowResize),this.options.editable!==!1&&i(document.body).off("click",this.onDocumentClick),i(document.body).removeClass("prodShifts-extendedDowntime"),o.select(this.el).select("svg").remove()},getLastState:function(){for(var e="idle",t=0,i=0,o=this.datum.length;o>i;++i){var n=this.datum[i],r=n.times[n.times.length-1];r&&r.ending_time>=t&&(t=r.ending_time,e=n.type)}return e},calcWidth:function(){return this.el.getBoundingClientRect().width-28},onWindowResize:function(){var e=this.calcWidth();e!==this.lastWidth&&(this.lastWidth=e,this.renderChart())},onDocumentClick:function(e){e.target!==document.body&&i(e.target).closest(".prodShifts-timeline-popover").length||this.hidePopover()},afterRender:function(){this.serializeDatum(),this.beginning&&(null===this.chart&&this.createChart(),this.renderChart(),this.toggleExtendedDowntime(),this.setUpDatumExtension())},setUpDatumExtension:function(){function e(e){null===e.popover&&(e.extendDatum(),e.renderChart(),e.toggleExtendedDowntime())}this.timers.extendDatum&&clearTimeout(this.timers.extendDatum),this.ending>=this.beginning+288e5||(this.timers.extendDatum=setInterval(e,15e3,this))},toggleExtendedDowntime:function(){var e=this.prodShift?this.prodShift.get("extendedDowntimeDelay"):null;if("number"==typeof e){var t=this.prodDowntimes.last(),o=!1;if(t&&!t.get("finishedAt")){var n=Date.parse(t.get("startedAt")),r=Date.now()-n;o=r>=60*e*1e3}i("body").toggleClass("prodShifts-extendedDowntime",o)}},reset:function(){this.chart=null,this.removeChart(),this.render()},removeChart:function(){var e=o.select(this.el),t=e.select("svg");t.empty()||t.remove()},renderChart:function(){this.removeChart();var e=this.calcWidth();this.hidePopover(),this.chart.width(e),o.select(this.el).append("svg").attr("width",e).datum(this.datum).call(this.chart)},hidePopover:function(e){this.timers&&this.timers.hidePopover&&(clearTimeout(this.timers.hidePopover),this.timers.hidePopover=null),null!==this.popover&&(e?this.timers.hidePopover=setTimeout(this.hidePopover.bind(this),200,!1):(i(this.popover.el).popover("destroy"),this.popover=null))},serializeDatum:function(){function e(e){return e.length&&-1===e[e.length-1].ending_time&&(e[e.length-1].ending_time=a,e[e.length-1].ended=!1),e}var t=[],i=[],o=[],n=[],r=Date.now();this.beginning=this.prodShift?Date.parse(this.prodShift.get("date")):p(r).moment.valueOf();var d=this.beginning+288e5,s=r>=d,a=Math.min(r,d);this.ending=a,this.prodShiftOrders.forEach(function(e){var t=Date.parse(e.get("startedAt")),o=Date.parse(e.get("finishedAt"));n.push({from:t,to:o}),i.push({type:"working",starting_time:t,ending_time:o||-1,ended:!isNaN(o),data:e.toJSON()})}),this.prodDowntimes.forEach(function(e){var t=Date.parse(e.get("startedAt")),i=Date.parse(e.get("finishedAt"));e.get("prodShiftOrder")||n.push({from:t,to:i}),o.push({type:"downtime",starting_time:t,ending_time:i||-1,ended:!isNaN(i),data:e.toJSON()})}),n.sort(function(e,t){return e.from-t.from});var h=0===n.length?s?a:-1:n[0].from;t.push({type:"idle",starting_time:this.beginning,ending_time:h,ended:-1!==h});for(var l=0,m=n.length;m>l;++l){var u=n[l+1];if(!u)break;var f=n[l];u.from-f.to>1e3&&t.push({type:"idle",starting_time:f.to,ending_time:u.from,ended:!0})}n.length&&n[n.length-1].to<d&&t.push({type:"idle",starting_time:n[n.length-1].to,ending_time:s?d:-1,ended:s}),this.datum=[{type:"idle",times:e(t)},{type:"working",times:e(i)},{type:"downtime",times:e(o)}]},extendDatum:function(){var e=Date.now(),t=this.beginning+288e5;e>=t&&(clearTimeout(this.timers.extendDatum),this.timers.extendDatum=null,e=t),this.datum.forEach(function(t){var i=t.times.length-1;i>-1&&t.times[i].ended===!1&&(t.times[i].ending_time=e)})},createChart:function(){var e=this,t=this.options.editable!==!1&&s.isAllowedTo("PROD_DATA:MANAGE"),r=this.options.itemHeight||60,a=Math.round(.833*r);this.chart=n().beginning(this.beginning).ending(this.beginning+288e5).itemHeight(r).margin({left:20,right:20,top:1,bottom:0}).tickFormat({format:o.time.format("%H:%M"),tickTime:o.time.hours,tickNumber:1,tickSize:5}).colors(!1).itemClassName(function(e){return"timeline-item timeline-item-"+e.type}).afterRender(function(e){"downtime"===e.type&&e.data.prodShiftOrder&&this.setAttribute("height",a)}).mouseover(function(n){var r=o.event.target;if(null===e.popover||e.popover.el!==r){e.hidePopover();var s=t&&n.ended,a=i(r);a.popover({trigger:"manual",container:e.el,placement:"top",html:!0,title:d("prodShifts","timeline:popover:"+n.type),content:e.renderPopover(n,s)}),a.popover("show"),a.data("bs.popover").$tip.addClass("popover-"+n.type),e.popover={el:r,item:n}}}).mouseout(function(){e.options.editable===!1?e.hidePopover():o.event.ctrlKey||e.hidePopover(!0)}).mousedown(function(){o.event.preventDefault()}).click(function(t){var i=null;"downtime"===t.type&&s.isAllowedTo("PROD_DOWNTIMES:VIEW")?i="prodDowntimes/"+t.data._id:"working"===t.type&&(i="prodShiftOrders/"+t.data._id),i&&(o.event.ctrlKey||1===o.event.button?window.open("#"+i):e.broker.publish("router.navigate",{url:"/"+i,trigger:!0}))})},renderPopover:function(e,t){var i=r.toString((e.ending_time-e.starting_time)/1e3),o={startedAt:r.format(e.starting_time,"HH:mm:ss"),finishedAt:e.ended?r.format(e.ending_time,"HH:mm:ss"):"-",duration:i,managing:t};if("idle"===e.type)return f(o);if("working"===e.type)return o.order=e.data.orderId,o.operation=e.data.operationNo,o.workerCount=e.data.workerCount,o.quantityDone=e.data.quantityDone,o.efficiency=u(e.data,!0),c(o);if("downtime"===e.type){var n=l.get(e.data.reason),d=m.get(e.data.aor);return o.reason=n?n.getLabel():e.data.reason,o.aor=d?d.getLabel():e.data.aor,o.hasOrder=!!e.data.prodShiftOrder,g(o)}},showAddOrderDialog:function(){var t=this,i=this.popover.item;e(["app/prodShiftOrders/views/ProdShiftOrderFormView","app/prodShiftOrders/ProdShiftOrder"],function(e,o){var n=new o({prodShift:t.prodShift.id,master:t.prodShift.get("master"),leader:t.prodShift.get("leader"),operator:t.prodShift.get("operator"),operators:t.prodShift.get("operators"),workerCount:1,quantityDone:0,startedAt:new Date(i.starting_time),finishedAt:new Date(i.ending_time)}),r=n.getNlsDomain();a.showDialog(new e({dialogClassName:"has-panel",model:n,editMode:!1,formMethod:"POST",formAction:n.url(),formActionText:d(r,"FORM:ACTION:add"),failureText:d(r,"FORM:ERROR:addFailure"),panelTitleText:d(r,"PANEL:TITLE:addForm"),done:function(){a.closeDialog()}}))})},showAddDowntimeDialog:function(){var t=this,i=this.popover.item;e(["app/prodDowntimes/views/ProdDowntimeFormView","app/prodDowntimes/ProdDowntime"],function(e,o){var n=new o({prodShift:t.prodShift.id,prodShiftOrder:"working"===i.type?i.data._id:null,master:t.prodShift.get("master"),leader:t.prodShift.get("leader"),operator:t.prodShift.get("operator"),operators:t.prodShift.get("operators"),startedAt:new Date(i.starting_time),finishedAt:new Date(i.ending_time),status:"undecided"}),r=n.getNlsDomain();a.showDialog(new e({dialogClassName:"has-panel",model:n,editMode:!1,formMethod:"POST",formAction:n.url(),formActionText:d(r,"FORM:ACTION:add"),failureText:d(r,"FORM:ERROR:addFailure"),panelTitleText:d(r,"PANEL:TITLE:addForm"),done:function(){a.closeDialog()}}))})},showEditDialog:function(t,i){var o=t.get(this.popover.item.data._id);o&&this.promised(o.fetch()).then(function(){e([i],function(e){var t=o.getNlsDomain();a.showDialog(new e({dialogClassName:"has-panel",model:o,editMode:!0,formMethod:"PUT",formAction:o.url(),formActionText:d(t,"FORM:ACTION:edit"),failureText:d(t,"FORM:ERROR:editFailure"),panelTitleText:d(t,"PANEL:TITLE:editForm"),done:function(){a.closeDialog()}}))})})},showDeleteDialog:function(t){var i=t.get(this.popover.item.data._id);i&&this.promised(i.fetch()).then(function(){e(["app/core/views/ActionFormView"],function(e){e.showDeleteDialog({model:i})})})}})});