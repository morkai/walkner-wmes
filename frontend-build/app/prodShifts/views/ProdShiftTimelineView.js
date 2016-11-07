// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["require","underscore","jquery","d3","d3.timeline","app/time","app/i18n","app/user","app/viewport","app/core/View","app/core/util/getShiftStartInfo","app/data/downtimeReasons","app/data/aors","app/prodChangeRequests/util/createDeletePageAction","app/prodShiftOrders/util/calcOrderEfficiency","app/prodShifts/templates/timelineIdlePopover","app/prodShifts/templates/timelineWorkingPopover","app/prodShifts/templates/timelineDowntimePopover"],function(t,e,i,o,n,r,s,d,a,h,l,m,p,u,g,c,f,v){"use strict";return h.extend({className:"prodShifts-timeline",events:{"click .prodShifts-timeline-addOrder":"showAddOrderDialog","click .prodShifts-timeline-editOrder":function(){this.showEditDialog(this.prodShiftOrders,"app/prodShiftOrders/views/ProdShiftOrderFormView")},"click .prodShifts-timeline-deleteOrder":function(){this.showDeleteDialog(this.prodShiftOrders)},"click .prodShifts-timeline-addDowntime":"showAddDowntimeDialog","click .prodShifts-timeline-editDowntime":function(){this.showEditDialog(this.prodDowntimes,"app/prodDowntimes/views/ProdDowntimeFormView")},"click .prodShifts-timeline-deleteDowntime":function(){this.showDeleteDialog(this.prodDowntimes)},"mouseover .popover":function(){this.timers.hidePopover&&(clearTimeout(this.timers.hidePopover),this.timers.hidePopover=null)}},initialize:function(){this.chart=null,this.datum=null,this.beginning=-1,this.ending=-1,this.lastWidth=-1,this.popover=null,this.highlightedItem=null,this.options.resizable!==!1&&(this.onWindowResize=e.debounce(this.onWindowResize.bind(this),16),i(window).on("resize",this.onWindowResize)),this.options.editable!==!1&&(this.onDocumentClick=this.onDocumentClick.bind(this),i(document.body).on("click",this.onDocumentClick));var t=e.debounce(this.render.bind(this),1),o=e.debounce(this.reset.bind(this),1);this.listenTo(this.prodShiftOrders,"add remove change",t),this.listenTo(this.prodShiftOrders,"reset",o),this.listenTo(this.prodDowntimes,"add remove change",t),this.listenTo(this.prodDowntimes,"reset",o)},destroy:function(){this.hidePopover(),this.removeChart(),this.chart=null,this.datum=null,this.options.resizable!==!1&&i(window).off("resize",this.onWindowResize),this.options.editable!==!1&&i(document.body).off("click",this.onDocumentClick),i(document.body).removeClass("prodShifts-extendedDowntime"),o.select(this.el).select("svg").remove()},getLastState:function(){var t="idle";if(!this.datum)return t;for(var e=0,i=0,o=this.datum.length;o>i;++i){var n=this.datum[i],r=n.times[n.times.length-1];r&&r.ending_time>=e&&(e=r.ending_time,t=n.type)}return t},calcWidth:function(){return Math.max(this.el.getBoundingClientRect().width-28,300)},onWindowResize:function(){var t=this.calcWidth();t!==this.lastWidth&&(this.lastWidth=t,this.renderChart())},onDocumentClick:function(t){t.target!==document.body&&i(t.target).closest(".prodShifts-timeline-popover").length||this.hidePopover()},afterRender:function(){this.timers&&(this.serializeDatum(),this.beginning&&(null===this.chart&&this.createChart(),this.renderChart(),this.toggleExtendedDowntime(),this.setUpDatumExtension()))},setUpDatumExtension:function(){function t(t){null===t.popover&&(t.extendDatum(),t.renderChart(),t.toggleExtendedDowntime())}this.timers.extendDatum&&clearTimeout(this.timers.extendDatum),this.ending>=this.beginning+288e5||(this.timers.extendDatum=setInterval(t,15e3,this))},toggleExtendedDowntime:function(){var t=this.prodShift?this.prodShift.get("extendedDowntimeDelay"):null;if("number"==typeof t){var e=this.prodDowntimes.last(),o=!1;if(e&&!e.get("finishedAt")){var n=Date.parse(e.get("startedAt")),r=Date.now()-n;o=r>=60*t*1e3}i("body").toggleClass("prodShifts-extendedDowntime",o)}},reset:function(){this.chart=null,this.removeChart(),this.render()},removeChart:function(){var t=o.select(this.el),e=t.select("svg");e.empty()||e.remove()},renderChart:function(){this.removeChart();var t=this.calcWidth();this.hidePopover(),this.chart.width(t),o.select(this.el).append("svg").attr("width",t).datum(this.datum).call(this.chart),this.highlightedItem&&this.highlightItem(this.highlightedItem)},hidePopover:function(t){this.timers&&this.timers.hidePopover&&(clearTimeout(this.timers.hidePopover),this.timers.hidePopover=null),null!==this.popover&&(t?this.timers.hidePopover=setTimeout(this.hidePopover.bind(this),200,!1):(i(this.popover.el).popover("destroy"),this.popover=null))},serializeDatum:function(){function t(t){return t.length&&-1===t[t.length-1].ending_time&&(t[t.length-1].ending_time=a,t[t.length-1].ended=!1),t}var e=[],i=[],o=[],n=[],r=Date.now();this.beginning=this.prodShift?Date.parse(this.prodShift.get("date")):l(r).moment.valueOf();var s=this.beginning+288e5,d=r>=s,a=Math.min(r,s);this.ending=a,this.prodShiftOrders.forEach(function(t){var e=Date.parse(t.get("startedAt")),o=Date.parse(t.get("finishedAt"));n.push({from:e,to:o}),i.push({type:"working",starting_time:e,ending_time:o||-1,ended:!isNaN(o),data:t.toJSON()})}),this.prodDowntimes.forEach(function(t){var e=Date.parse(t.get("startedAt")),i=Date.parse(t.get("finishedAt"));t.get("prodShiftOrder")||n.push({from:e,to:i}),o.push({type:"downtime",starting_time:e,ending_time:i||-1,ended:!isNaN(i),data:t.toJSON()})}),n.sort(function(t,e){return t.from-e.from});var h=0===n.length?d?a:-1:n[0].from;e.push({type:"idle",starting_time:this.beginning,ending_time:h,ended:-1!==h});for(var m=0,p=n.length;p>m;++m){var u=n[m+1];if(!u)break;var g=n[m];u.from-g.to>1e3&&e.push({type:"idle",starting_time:g.to,ending_time:u.from,ended:!0})}n.length&&n[n.length-1].to<s&&e.push({type:"idle",starting_time:n[n.length-1].to,ending_time:d?s:-1,ended:d}),this.datum=[{type:"idle",times:t(e)},{type:"working",times:t(i)},{type:"downtime",times:t(o)}]},extendDatum:function(){var t=Date.now(),e=this.beginning+288e5;t>=e&&(clearTimeout(this.timers.extendDatum),this.timers.extendDatum=null,t=e),this.datum.forEach(function(e){var i=e.times.length-1;i>-1&&e.times[i].ended===!1&&(e.times[i].ending_time=t)})},createChart:function(){var t=this,e=this.options.editable!==!1&&d.isAllowedTo("PROD_DATA:MANAGE","PROD_DATA:CHANGES:REQUEST"),r=this.options.itemHeight||60,a=Math.round(.833*r);this.chart=n().beginning(this.beginning).ending(this.beginning+288e5).itemHeight(r).margin({left:20,right:20,top:1,bottom:0}).tickFormat({format:o.time.format("%H:%M"),tickTime:o.time.hours,tickNumber:1,tickSize:5}).colors(!1).itemClassName(function(t){return"timeline-item timeline-item-"+t.type}).afterRender(function(t){t.data&&t.data._id&&this.setAttribute("data-model-id",t.data._id),"downtime"===t.type&&t.data.prodShiftOrder&&this.setAttribute("height",a)}).mouseover(function(n){var r=o.event.target;if(null===t.popover||t.popover.el!==r){t.hidePopover();var d=e&&n.ended,a=i(r);a.popover({trigger:"manual",container:t.el,placement:"top",html:!0,title:s("prodShifts","timeline:popover:"+n.type),content:t.renderPopover(n,d)}),a.popover("show"),a.data("bs.popover").$tip.addClass("popover-"+n.type),t.popover={el:r,item:n}}}).mouseout(function(){t.options.editable===!1?t.hidePopover():o.event.ctrlKey||t.hidePopover(!0)}).mousedown(function(){o.event.preventDefault()}).click(function(e){var i=null;"downtime"===e.type&&d.isAllowedTo("LOCAL","PROD_DATA:VIEW","PROD_DOWNTIMES:VIEW")?i="prodDowntimes/"+e.data._id:"working"===e.type&&(i="prodShiftOrders/"+e.data._id),i&&(o.event.ctrlKey||1===o.event.button?window.open("#"+i):t.broker.publish("router.navigate",{url:"/"+i,trigger:!0}))})},renderPopover:function(t,e){var i=r.toString((t.ending_time-t.starting_time)/1e3),o={startedAt:r.format(t.starting_time,"HH:mm:ss"),finishedAt:t.ended?r.format(t.ending_time,"HH:mm:ss"):"-",duration:i,managing:e};if("idle"===t.type)return c(o);if("working"===t.type)return o.order=t.data.orderId,o.operation=t.data.operationNo,o.workerCount=t.data.workerCount,o.quantityDone=t.data.quantityDone,o.efficiency=g(t.data,!0),f(o);if("downtime"===t.type){var n=m.get(t.data.reason),s=p.get(t.data.aor);return o.reason=n?n.getLabel():t.data.reason,o.aor=s?s.getLabel():t.data.aor,o.hasOrder=!!t.data.prodShiftOrder,v(o)}},showAddOrderDialog:function(){var e=this,i=this.popover.item;t(["app/prodShiftOrders/views/ProdShiftOrderFormView","app/prodShiftOrders/ProdShiftOrder"],function(t,o){var n=e.prodShift,r=new o({prodShift:n.id,division:n.get("division"),subdivision:n.get("subdivision"),mrpControllers:n.get("mrpControllers"),prodFlow:n.get("prodFlow"),workCenter:n.get("workCenter"),prodLine:n.get("prodLine"),master:n.get("master"),leader:n.get("leader"),operator:n.get("operator"),operators:n.get("operators"),workerCount:1,quantityDone:0,startedAt:new Date(i.starting_time),finishedAt:new Date(i.ending_time)}),d=r.getNlsDomain();a.showDialog(new t({dialogClassName:"has-panel",model:r,editMode:!1,formMethod:"POST",formAction:r.url(),formActionText:s(d,"FORM:ACTION:add"),failureText:s(d,"FORM:ERROR:addFailure"),panelTitleText:s(d,"PANEL:TITLE:addForm"),done:function(){a.closeDialog()}}))})},showAddDowntimeDialog:function(){var e=this,i=this.popover.item;t(["app/prodDowntimes/views/ProdDowntimeFormView","app/prodDowntimes/ProdDowntime"],function(t,o){var n=new o({prodShift:e.prodShift.id,prodShiftOrder:"working"===i.type?i.data._id:null,master:e.prodShift.get("master"),leader:e.prodShift.get("leader"),operator:e.prodShift.get("operator"),operators:e.prodShift.get("operators"),startedAt:new Date(i.starting_time),finishedAt:new Date(i.ending_time),status:"undecided"}),r=n.getNlsDomain();a.showDialog(new t({dialogClassName:"has-panel",model:n,editMode:!1,formMethod:"POST",formAction:n.url(),formActionText:s(r,"FORM:ACTION:add"),failureText:s(r,"FORM:ERROR:addFailure"),panelTitleText:s(r,"PANEL:TITLE:addForm"),done:function(){a.closeDialog()}}))})},showEditDialog:function(e,i){var o=e.get(this.popover.item.data._id);o&&this.promised(o.fetch()).then(function(){t([i],function(t){var e=o.getNlsDomain();a.showDialog(new t({dialogClassName:"has-panel",model:o,editMode:!0,formMethod:"PUT",formAction:o.url(),formActionText:s(e,"FORM:ACTION:edit"),failureText:s(e,"FORM:ERROR:editFailure"),panelTitleText:s(e,"PANEL:TITLE:editForm"),done:function(){a.closeDialog()}}))})})},showDeleteDialog:function(t){var e=t.get(this.popover.item.data._id);if(e){var i=this;this.promised(e.fetch()).then(function(){u(i,e).callback()})}},highlightItem:function(t){var e=this.$('.timeline-item[data-model-id="'+t+'"]');e.length&&e[0].classList.add("is-highlighted"),this.highlightedItem=t}})});