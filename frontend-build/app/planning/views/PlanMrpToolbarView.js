define(["underscore","jquery","app/i18n","app/time","app/viewport","app/core/View","app/core/util/html2pdf","app/data/clipboard","app/printers/views/PrinterPickerView","app/prodShifts/ProdShiftCollection","../util/shift","../PlanSapOrderCollection","app/planning/templates/toolbar","app/planning/templates/toolbarPrintLineList","app/planning/templates/printPage","app/planning/templates/orderStatusIcons"],function(t,e,n,i,r,s,o,a,l,p,d,u,h,c,f,m){"use strict";return s.extend({template:h,events:{'click a[role="copyOrderList"]':function(t){this.copyOrderList(+t.currentTarget.dataset.shift)},'click a[role="printLines"]':function(e){var n=this,r=e.currentTarget.dataset.line,s=[];if(t.isString(r))if("__ALL__"===r)s=n.mrp.lines.models;else{var o=n.mrp.lines.get(r);o&&s.push(o)}else t.forEach(r,function(t){var e=n.mrp.lines.get(t);e&&s.push(e)});s.length&&(i.getMoment(this.plan.id+" 06:00:00","YYYY-MM-DD HH:mm:ss").diff(Date.now(),"minutes")>-1380||e.altKey?this.printLines(e,s):this.loadAndPrintLines(e,s))},"click #-showTimes":function(){return this.plan.displayOptions.togglePrintOrderTime(),this.toggleShowTimes(),!1},"show.bs.dropdown #-printLines":"toggleShowTimes"},initialize:function(){this.listenTo(this.plan.lateOrders,"reset",this.scheduleRender),this.listenTo(this.plan.sapOrders,"reset",this.scheduleRender),this.listenTo(this.mrp.orders,"added removed changed reset",this.scheduleRender),this.listenTo(this.mrp.lines,"added removed changed reset",this.scheduleRender)},serialize:function(){return{idPrefix:this.idPrefix,lines:this.mrp.lines.map(function(t){return t.id}),stats:!1===this.options.stats?null:this.mrp.getStats()}},afterRender:function(){this.broker.publish("planning.mrpStatsRecounted",{mrp:this.mrp})},scheduleRender:function(){this.timers.render&&clearTimeout(this.timers.render),this.plan.isAnythingLoading()||(this.timers.render=setTimeout(this.render.bind(this),1))},copyOrderList:function(t){var e=this,i={};i[this.mrp.id]=!0;var r=e.plan.getOrderList(i,t);a.copy(function(t){if(t){t.setData("text/plain",r.join("\r\n")),t.setData("text/html","<ul><li>"+r.join("</li><li>")+"</li></ul>");var i=e.$id("copyOrderList").tooltip({container:e.el,trigger:"manual",placement:"left",title:n("planning","toolbar:copyOrderList:success")});i.tooltip("show").data("bs.tooltip").tip().addClass("result success"),e.timers.hideTooltip&&clearTimeout(e.timers.hideTooltip),e.timers.hideTooltip=setTimeout(function(){i.tooltip("destroy")},1337)}})},loadAndPrintLines:function(s,o){var a=this,l=a.$id("printLines").find(".btn").prop("disabled",!0),h=l.find(".fa").removeClass("fa-print").addClass("fa-spinner fa-spin"),c=i.getMoment(a.plan.id+" 06:00:00","YYYY-MM-DD HH:mm:ss"),f=new p(null,{url:"/prodShifts?select(prodLine,shift,quantitiesDone)&limit(0)&date=in=("+[c.valueOf(),c.add(8,"hours").valueOf(),c.add(8,"hours").valueOf()]+")&prodLine=in=("+t.pluck(o,"id")+")"}),m=new u(null,{paginate:!1,plan:a.plan,mrp:a.mrp.id}),g=a.promised(f.fetch()),y=a.promised(m.fetch()),v=e.when(g,y);g.fail(function(){r.msg.show({type:"error",time:3e3,text:n("planning","MSG:LOADING_FAILURE:shifts")})}),y.fail(function(){r.msg.show({type:"error",time:3e3,text:n("planning","MSG:LOADING_FAILURE:sapOrders")})}),v.done(function(){var t={};f.forEach(function(e){var n=e.get("prodLine");t[n]||(t[n]=d.EMPTY_HOURLY_PLAN.slice());var i=8*(e.get("shift")-1);e.get("quantitiesDone").forEach(function(e,r){t[n][i+r]+=e.actual})}),a.printLines(s,o,m,t)}),v.always(function(){h.removeClass("fa-spinner fa-spin").addClass("fa-print"),l.prop("disabled",!1)})},printLines:function(e,n,i,r){var s=this;e.contextMenu={view:s,tag:"planning"},l.contextMenu(e,function(e){var a=f({date:s.plan.id,lines:t.pluck(n,"id").join(", "),showTimes:!!i||s.plan.displayOptions.isOrderTimePrinted(),done:!!i,pages:s.serializePrintPages(n,i,r),pad:function(t){return t<10?"&nbsp;"+t:t}});o(a,e)})},serializePrintPages:function(e,r,s){var o=this,a=!!r,l=o.plan,p=-1,u=[],h={};return e.forEach(function(e){var c=[],f={pageNo:1,pageCount:1,mrp:e.settings.get("mrpPriority").join(" "),line:e.id,hourlyPlan:e.get("hourlyPlan"),quantityDone:a?s[e.id]||d.EMPTY_HOURLY_PLAN.slice():null,workerCount:"?",orders:[]};e.orders.forEach(function(n,s){var u=l.orders.get(n.get("orderNo")),g=d.getShiftNo(n.get("startAt")),y=-1!==p&&g!==p;p=g;var v=e.mrpSettings(u.get("mrp"));v&&!t.includes(c,v.get("workerCount"))&&c.push(v.get("workerCount"));var w=n.get("quantity"),L=a?l.shiftOrders.getTotalQuantityDone(e.id,g,u.id):-1,P={no:s+1,orderNo:u.id,nc12:u.get("nc12"),name:u.get("name"),kind:u.get("kind"),qtyTodo:u.get("quantityTodo"),qtyPlan:w,qtyClass:-1===L?"":L===w?"is-completed":L>w?"is-surplus":L>0?"is-incomplete":"",startAt:n.get("startAt"),finishAt:n.get("finishAt"),nextShift:y,icons:m(l,u.id)};if(f.orders.push(P),a&&!h[u.id]){var D=r.get(u.id),T=l.shiftOrders.findOrders(u.id,e.id).sort(function(t,e){return Date.parse(t.get("startedAt"))-Date.parse(e.get("startedAt"))}),O=D?o.delayReasons.get(D.get("delayReason")):"",Y=D?D.get("comment"):"";O&&(O=O.getLabel(),Y&&(O+=":")),T.forEach(function(t,e){f.orders.push({no:null,delayReason:0===e&&O?O:"",comment:0===e?Y:"",qtyTodo:n.get("quantity"),qtyPlan:t.get("quantityDone"),startAt:i.utc.getMoment(i.getMoment(t.get("startedAt")).format("YYYY-MM-DD HH:mm:ss"),"YYYY-MM-DD HH:mm:ss").valueOf(),finishAt:i.utc.getMoment(i.getMoment(t.get("finishedAt")).format("YYYY-MM-DD HH:mm:ss"),"YYYY-MM-DD HH:mm:ss").valueOf(),nextShift:!1,psStatus:"unknown"})}),T.length||!Y&&!O||f.orders.push({no:null,delayReason:O,comment:Y,qtyTodo:n.get("quantity"),qtyDone:0,startAt:null,finishAt:null,nextShift:!1,psStatus:"unknown"}),h[u.id]=!0}}),0===c.length&&c.push(1),1===c.length?f.workerCount=n("planning","print:workerCount",{count:c[0]}):(c.sort(),f.workerCount=n("planning","print:workerCounts",{to:c.pop(),from:c.join("-")}));var g=f.orders.length;if(g<=35)u.push(f);else{var y,v=Math.ceil(g/42);for(y=1;y<=v;++y)u.push({pageNo:y,pageCount:v,mrp:f.mrp,line:f.line,hourlyPlan:null,quantityDone:null,workerCount:f.workerCount,orders:f.orders.slice(42*(y-1),42*y)});var w=t.last(u);if(w.orders.length<=35)return w.hourlyPlan=f.hourlyPlan,void(w.quantityDone=f.quantityDone);v+=1,u.forEach(function(t){t.pageCount=v}),u.push({pageNo:w.pageNo+1,pageCount:v,mrp:f.mrp,line:f.line,hourlyPlan:f.hourlyPlan,quantityDone:f.quantityDone,workerCount:f.workerCount,orders:[]})}}),u},toggleShowTimes:function(){this.$id("showTimes").blur().find(".fa").removeClass("fa-check fa-times").addClass(this.plan.displayOptions.isOrderTimePrinted()?"fa-check":"fa-times")}})});