define(["underscore","jquery","d3","d3.timeline","app/time","app/i18n","app/user","app/core/View","app/data/downtimeReasons","app/data/aors","app/prodShifts/templates/timelineIdlePopover","app/prodShifts/templates/timelineWorkingPopover","app/prodShifts/templates/timelineDowntimePopover"],function(e,t,n,r,i,o,a,s,l,d,u,c,p){return s.extend({className:"prodShifts-timeline",initialize:function(){this.chart=null,this.datum=null,this.beginning=-1,this.ending=-1,this.lastWidth=-1,this.onResize=e.debounce(this.onResize.bind(this),100),t(window).resize(this.onResize)},destroy:function(){this.chart=null,this.datum=null,t(window).off("resize",this.onResize),n.select(this.el).select("svg").remove()},onResize:function(){var e=this.el.getBoundingClientRect().width;e!==this.lastWidth&&(this.lastWidth=e,this.renderChart())},beforeRender:function(){this.stopListening(this.collection,"reset",this.render)},afterRender:function(){this.listenToOnce(this.collection,"reset",this.render),this.serializeDatum(),null===this.chart&&this.createChart(),this.renderChart(),this.setUpDatumExtension()},setUpDatumExtension:function(){function e(e){e.extendDatum(),e.renderChart()}this.timers.extendDatum&&clearTimeout(this.timers.extendDatum),this.ending>=this.beginning+288e5||(this.timers.extendDatum=setInterval(e,1e4,this))},renderChart:function(){var e=n.select(this.el),t=e.select("svg");t.empty()||t.remove(),this.chart.width(null),e.append("svg").attr("width",this.el.getBoundingClientRect().width).datum(this.datum).call(this.chart)},serializeDatum:function(){function e(e,t,n,r){var o={type:e,prodLogEntry:n,starting_time:r,ending_time:-1,ended:!0};t.push(o),"working"===e&&(o.quantityDone=0,o.workerCount=0,i[n.get("prodShiftOrder")]=o)}function t(e){return e.length&&-1===e[e.length-1].ending_time&&(e[e.length-1].ending_time=f,e[e.length-1].ended=!1),e}this.beginning=-1;for(var n=0,r=this.collection.length,i={},o=[],a=[],s=[];r>n;++n){var l,d=this.collection.at(n),u=d.get("type"),c=d.get("data");if(-1!==this.beginning)switch(u){case"changeOrder":var p=Date.parse(c.startedAt);-1===o[o.length-1].ending_time&&(o[o.length-1].ending_time=p),e("working",a,d,p);break;case"finishOrder":a[a.length-1].ending_time=Date.parse(c.finishedAt);break;case"startDowntime":e("downtime",s,d,Date.parse(c.startedAt));break;case"finishDowntime":s[s.length-1].ending_time=Date.parse(c.finishedAt);break;case"endWork":e("idle",o,d,Date.parse(d.get("createdAt")));break;case"changeQuantityDone":l=i[d.get("prodShiftOrder")],l&&(l.quantityDone=d.get("data").newValue);break;case"changeWorkerCount":l=i[d.get("prodShiftOrder")],l&&(l.workerCount=d.get("data").newValue)}else"changeShift"===u&&(this.beginning=Date.parse(c.startedProdShift.date),e("idle",o,d,this.beginning))}var f=this.ending=Math.min(Date.now(),this.beginning+288e5);this.datum=[{type:"idle",times:t(o)},{type:"working",times:t(a)},{type:"downtime",times:t(s)}]},extendDatum:function(){var e=Date.now(),t=this.beginning+288e5;e>=t&&(clearTimeout(this.timers.extendDatum),this.timers.extendDatum=null,e=t),this.datum.forEach(function(t){var n=t.times.length-1;n>-1&&t.times[n].ended===!1&&(t.times[n].ending_time=e)})},createChart:function(){var e=this;this.chart=r().beginning(this.beginning).ending(this.beginning+288e5).itemHeight(60).margin({left:20,right:20,top:1,bottom:0}).tickFormat({format:n.time.format("%H:%M"),tickTime:n.time.hours,tickNumber:1,tickSize:5}).colors(!1).itemClassName(function(e){return"timeline-item timeline-item-"+e.type}).mouseover(function(r){var i=t(n.event.target);i.popover({trigger:"manual",container:e.el,placement:"auto top",html:!0,title:o("prodShifts","timeline:popover:"+r.type),content:e.renderPopover(r)}),i.popover("show"),i.data("bs.popover").$tip.addClass("popover-"+r.type)}).mouseout(function(){t(this).popover("destroy")}).click(function(t){"downtime"===t.type&&a.isAllowedTo("PROD_DOWNTIMES:VIEW")?e.broker.publish("router.navigate",{url:"/prodDowntimes/"+t.prodLogEntry.get("data")._id,trigger:!0}):"working"===t.type&&e.broker.publish("router.navigate",{url:"/prodShiftOrders/"+t.prodLogEntry.get("data")._id,trigger:!0})})},renderPopover:function(e){var t=i.toString((e.ending_time-e.starting_time)/1e3),n={startedAt:i.format(e.starting_time,"HH:mm:ss"),finishedAt:e.ended?i.format(e.ending_time,"HH:mm:ss"):"-",duration:t};if("idle"===e.type)return u(n);var r=e.prodLogEntry.get("data");if("working"===e.type)return n.order=r.orderId,n.operation=r.operationNo,n.workerCount=e.workerCount,n.quantityDone=e.quantityDone,c(n);if("downtime"===e.type){var o=l.get(r.reason),a=d.get(r.aor);return n.reason=o?o.getLabel():r.reason,n.aor=a?a.getLabel():r.aor,p(n)}}})});