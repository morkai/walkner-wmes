define(["app/time","app/core/View","app/prodShiftOrders/ProdShiftOrder","./ExecutionTimelineView","app/heff/templates/shiftEfficiency"],function(t,e,i,a,r){"use strict";return e.extend({swapDelay:2e4,template:r,initialize:function(){this.currentMetrics="tt",this.todoView=new a({mode:"todo",model:{todo:this.model.planShiftOrders,done:this.model.prodShiftOrders}}),this.doneView=new a({mode:"done",model:{todo:this.model.planShiftOrders,done:this.model.prodShiftOrders}}),this.listenTo(this.model.prodShiftOrders,"reset add change",this.updateData),this.setView("#-todo",this.todoView),this.setView("#-done",this.doneView)},getTitle:function(){return this.t("shift:title")},activate:function(){this.swapMetrics(),this.updateData()},deactivate:function(){this.currentMetrics="tt",clearTimeout(this.timers.swapMetrics)},updateData:function(){this.updatePlanned(),this.updateActual(),this.updateLineEff()},periodicUpdate:function(){this.updateActual()},updatePlanned:function(){var e="?",i=this.model.prodShiftOrders.last();i&&(i.get("sapTaktTime")&&(e=t.toString(i.get("sapTaktTime"),!0,!1).replace(/^00:/,"")));this.$id("plannedTt").text(e)},updateActual:function(){var e="?",i="?",a="fa-meh-o",r=this.model.prodShiftOrders.last();if(r){var d=Date.now(),s=r.get("workDuration"),n=r.get("quantityDone")||1,o=!1;if(s>0)s*=36e5;else{var h=Date.parse(r.get("startedAt")),f=Date.parse(r.get("finishedAt"))||d;s=f-h,this.model.prodDowntimes.forEach(function(t){t.get("prodShiftOrder")===r.id&&"A"===t.get("reason")&&(s-=(Date.parse(t.get("finishedAt"))||d)-Date.parse(t.get("startedAt")))}),r.attributes.workDuration=s/36e5,o=!0}var p=r.get("sapTaktTime"),l=s/n/1e3;if(e=t.toString(l,!0,!1).replace(/^00:/,""),l<=p?a="fa-smile-o":l>p&&(a="fa-frown-o"),r.get("quantityDone")){var u=r.getEfficiency();u&&(i=Math.min(999,Math.round(100*u))+"%")}o&&(r.attributes.workDuration=0)}this.$id("actualTt").text(e),this.$id("orderEff").text(i),this.$id("icon").hasClass(a)||this.$id("icon").removeClass("fa-meh-o fa-smile-o fa-frown-o").addClass(a)},updateLineEff:function(){var t=this,e=Date.now(),a=0,r=0;t.model.prodShiftOrders.forEach(function(d){var s=d.get("workDuration"),n=i.getTaktTimeCoeff(d.attributes);s||d.get("finishedAt")||(s=e-Date.parse(d.get("startedAt")),t.model.prodDowntimes.forEach(function(t){t.get("prodShiftOrder")===d.id&&"A"===t.get("reason")&&(s-=(Date.parse(t.get("finishedAt"))||e)-Date.parse(t.get("startedAt")))}),s/=36e5),a+=d.get("laborTime")*n/100*d.get("quantityDone"),r+=s*d.get("workerCount")});var d=Math.min(999,Math.round(a/r*100));t.$id("lineEff").text(d>0?d+"%":"?")},swapMetrics:function(){"tt"===this.currentMetrics?(this.currentMetrics="eff",this.updateLineEff(),this.$id("plannedTt").parent().addClass("hidden"),this.$id("actualTt").parent().addClass("hidden"),this.$id("lineEff").parent().removeClass("hidden"),this.$id("orderEff").parent().removeClass("hidden")):(this.currentMetrics="tt",this.$id("lineEff").parent().addClass("hidden"),this.$id("orderEff").parent().addClass("hidden"),this.$id("plannedTt").parent().removeClass("hidden"),this.$id("actualTt").parent().removeClass("hidden"))}})});