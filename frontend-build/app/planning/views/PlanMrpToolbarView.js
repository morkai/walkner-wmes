define(["underscore","jquery","app/i18n","app/time","app/viewport","app/core/View","app/core/views/DialogView","app/core/util/html2pdf","app/data/clipboard","app/printers/views/PrinterPickerView","app/prodShifts/ProdShiftCollection","../util/shift","../PlanSapOrderCollection","./ToggleMrpLockDialogView","app/planning/templates/toolbar","app/planning/templates/toolbarPrintLineList","app/planning/templates/printPage","app/planning/templates/orderStatusIcons"],function(t,e,i,n,s,r,o,a,l,p,d,u,h,c,g,m,f,y){"use strict";return r.extend({template:g,modelProperty:"plan",events:{'click a[role="copyOrderList"]':function(t){this.copyOrderList(+t.currentTarget.dataset.shift)},'click a[role="printLines"]':function(e){var i=this,s=e.currentTarget.dataset.line,r=[];if(t.isString(s))if("__ALL__"===s)r=i.mrp.lines.models;else{var o=i.mrp.lines.get(s);o&&r.push(o)}else t.forEach(s,function(t){var e=i.mrp.lines.get(t);e&&r.push(e)});r.length&&(n.getMoment(this.plan.id+" 06:00:00","YYYY-MM-DD HH:mm:ss").diff(Date.now(),"minutes")>-1380||e.altKey?this.printLines(e,r):this.loadAndPrintLines(e,r))},"click #-showTimes":function(){return this.plan.displayOptions.togglePrintOrderTime(),this.toggleShowTimes(),!1},"show.bs.dropdown #-printLines":"toggleShowTimes","click #-toggleLock":function(){var t=this,e=t.plan.settings.isMrpLockedDirectly(t.mrp.id),i=new c({model:{locked:e,mrp:t.mrp.id,date:t.plan.id}});t.listenTo(i,"answered",function(i){if("yes"===i){s.msg.saving(),t.mrp.settings.set("locked",!e);var n=t.plan.settings.save();n.done(function(){s.msg.saved()}),n.fail(function(){s.msg.savingFailed(),t.plan.settings.trigger("errored")})}}),s.showDialog(i,t.t("toggleLock:title:"+e))}},initialize:function(){this.listenTo(this.plan.lateOrders,"reset",this.scheduleRender),this.listenTo(this.plan.sapOrders,"reset",this.scheduleRender),this.listenTo(this.mrp.orders,"added removed changed reset",this.scheduleRender),this.listenTo(this.mrp.lines,"added removed changed reset",this.scheduleRender),this.listenTo(this.plan.settings,"changed",this.onSettingsChanged)},serialize:function(){return{idPrefix:this.idPrefix,lines:this.mrp.lines.map(function(t){return t.id}),stats:!1===this.options.stats?null:this.mrp.getStats(),canLock:this.plan.canLockMrps(),locked:this.plan.settings.isMrpLockedDirectly(this.mrp.id)}},afterRender:function(){this.broker.publish("planning.mrpStatsRecounted",{mrp:this.mrp})},scheduleRender:function(){this.timers.render&&clearTimeout(this.timers.render),this.plan.isAnythingLoading()||(this.timers.render=setTimeout(this.render.bind(this),1))},copyOrderList:function(t){var e=this,i={};i[this.mrp.id]=!0;var n=e.plan.getOrderList(i,t);l.copy(function(t){if(t){t.setData("text/plain",n.join("\r\n")),t.setData("text/html","<ul><li>"+n.join("</li><li>")+"</li></ul>");var i=e.$id("copyOrderList").tooltip({container:e.el,trigger:"manual",placement:"left",title:e.t("toolbar:copyOrderList:success")});i.tooltip("show").data("bs.tooltip").tip().addClass("result success"),e.timers.hideTooltip&&clearTimeout(e.timers.hideTooltip),e.timers.hideTooltip=setTimeout(function(){i.tooltip("destroy")},1337)}})},loadAndPrintLines:function(i,r){var o=this,a=o.$id("printLines").find(".btn").prop("disabled",!0),l=a.find(".fa").removeClass("fa-print").addClass("fa-spinner fa-spin"),p=n.getMoment(o.plan.id+" 06:00:00","YYYY-MM-DD HH:mm:ss"),c=new d(null,{url:"/prodShifts?select(prodLine,shift,quantitiesDone)&limit(0)&date=in=("+[p.valueOf(),p.add(8,"hours").valueOf(),p.add(8,"hours").valueOf()]+")&prodLine=in=("+t.pluck(r,"id")+")"}),g=new h(null,{paginate:!1,plan:o.plan,mrp:o.mrp.id}),m=o.promised(c.fetch()),f=o.promised(g.fetch()),y=e.when(m,f);m.fail(function(){s.msg.show({type:"error",time:3e3,text:o.t("MSG:LOADING_FAILURE:shifts")})}),f.fail(function(){s.msg.show({type:"error",time:3e3,text:o.t("MSG:LOADING_FAILURE:sapOrders")})}),y.done(function(){var t={};c.forEach(function(e){var i=e.get("prodLine");t[i]||(t[i]=u.EMPTY_HOURLY_PLAN.slice());var n=8*(e.get("shift")-1);e.get("quantitiesDone").forEach(function(e,s){t[i][n+s]+=e.actual})}),o.printLines(i,r,g,t)}),y.always(function(){l.removeClass("fa-spinner fa-spin").addClass("fa-print"),a.prop("disabled",!1)})},printLines:function(e,i,n,s){var r=this;e.contextMenu={view:r,tag:"planning"},p.contextMenu(e,function(e){var o=f({date:r.plan.id,lines:t.pluck(i,"id").join(", "),showTimes:!!n||r.plan.displayOptions.isOrderTimePrinted(),done:!!n,pages:r.serializePrintPages(i,n,s),pad:function(t){return t<10?"&nbsp;"+t:t}});a(o,e)})},serializePrintPages:function(e,i,s){var r=this,o=!!i,a=r.plan,l=-1,p=[],d={};return e.forEach(function(e){var h=[],c={pageNo:1,pageCount:1,mrp:e.settings.get("mrpPriority").join(" "),line:e.id,hourlyPlan:e.get("hourlyPlan"),quantityDone:o?s[e.id]||u.EMPTY_HOURLY_PLAN.slice():null,workerCount:"?",orders:[]};e.orders.forEach(function(s,p){var g=s.get("orderNo"),m=a.orders.get(g),f=u.getShiftNo(s.get("startAt")),v=-1!==l&&f!==l;l=f;var L=m?e.mrpSettings(m.get("mrp")):null;L&&!t.includes(h,L.get("workerCount"))&&h.push(L.get("workerCount"));var w=s.get("quantity"),k=o?a.shiftOrders.getTotalQuantityDone(e.id,f,g):-1,D={no:p+1,missing:!m,orderNo:g,nc12:m?m.get("nc12"):"?",name:m?m.get("name"):"?",kind:m?m.get("kind"):"?",qtyTodo:m?m.get("quantityTodo"):"?",qtyPlan:w,qtyClass:-1===k?"":k===w?"is-completed":k>w?"is-surplus":k>0?"is-incomplete":"",startAt:s.get("startAt"),finishAt:s.get("finishAt"),nextShift:v,icons:y(a,g)};if(c.orders.push(D),o&&!d[g]){var P=i.get(g),T=a.shiftOrders.findOrders(g,e.id).sort(function(t,e){return Date.parse(t.get("startedAt"))-Date.parse(e.get("startedAt"))}),M=P?r.delayReasons.get(P.get("delayReason")):"",C=P?P.get("comment"):"";M&&(M=M.getLabel(),C&&(M+=":")),T.forEach(function(t,e){c.orders.push({no:null,delayReason:0===e&&M?M:"",comment:0===e?C:"",qtyTodo:s.get("quantity"),qtyPlan:t.get("quantityDone"),startAt:n.utc.getMoment(n.getMoment(t.get("startedAt")).format("YYYY-MM-DD HH:mm:ss"),"YYYY-MM-DD HH:mm:ss").valueOf(),finishAt:n.utc.getMoment(n.getMoment(t.get("finishedAt")).format("YYYY-MM-DD HH:mm:ss"),"YYYY-MM-DD HH:mm:ss").valueOf(),nextShift:!1,psStatus:"unknown"})}),T.length||!C&&!M||c.orders.push({no:null,delayReason:M,comment:C,qtyTodo:s.get("quantity"),qtyDone:0,startAt:null,finishAt:null,nextShift:!1,psStatus:"unknown"}),d[g]=!0}}),0===h.length&&h.push(1),1===h.length?c.workerCount=r.t("print:workerCount",{count:h[0]}):(h.sort(),c.workerCount=r.t("print:workerCounts",{to:h.pop(),from:h.join("-")}));var g=c.orders.length;if(g<=35)p.push(c);else{var m,f=Math.ceil(g/42);for(m=1;m<=f;++m)p.push({pageNo:m,pageCount:f,mrp:c.mrp,line:c.line,hourlyPlan:null,quantityDone:null,workerCount:c.workerCount,orders:c.orders.slice(42*(m-1),42*m)});var v=t.last(p);if(v.orders.length<=35)return v.hourlyPlan=c.hourlyPlan,void(v.quantityDone=c.quantityDone);f+=1,p.forEach(function(t){t.pageCount=f}),p.push({pageNo:v.pageNo+1,pageCount:f,mrp:c.mrp,line:c.line,hourlyPlan:c.hourlyPlan,quantityDone:c.quantityDone,workerCount:c.workerCount,orders:[]})}}),p},toggleShowTimes:function(){this.$id("showTimes").blur().find(".fa").removeClass("fa-check fa-times").addClass(this.plan.displayOptions.isOrderTimePrinted()?"fa-check":"fa-times")},onSettingsChanged:function(t){if(t.locked){var e=this.plan.settings.isMrpLockedDirectly(this.mrp.id);this.$id("toggleLock").toggleClass("active",e).attr("title",this.t("toolbar:toggleLock:"+e))}}})});