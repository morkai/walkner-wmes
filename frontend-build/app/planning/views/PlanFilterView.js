define(["underscore","jquery","app/i18n","app/time","app/core/View","app/data/clipboard","app/mrpControllers/util/setUpMrpSelect2","app/planning/templates/planFilter"],function(t,e,i,n,a,s,o,r){"use strict";return a.extend({template:r,events:{"input #-date":"changeFilter","change #-date":"changeFilter","change #-mrps":"changeFilter","click #-lineOrdersList":function(){this.plan.displayOptions.toggleLineOrdersList()},"click #-useDarkerTheme":function(){this.plan.displayOptions.toggleDarkerThemeUse()},'click a[role="copyOrderList"]':function(t){this.copyOrderList(+t.currentTarget.dataset.shift)}},initialize:function(){var t=this.plan,e=t.displayOptions;this.listenTo(t,"change:loading",this.onLoadingChanged),this.listenTo(t,"change:_id",this.onDateChanged),this.listenTo(e,"change:minDate change:maxDate",this.onMinMaxDateChanged),this.listenTo(e,"change:lineOrdersList change:useDarkerTheme",this.updateToggles)},serialize:function(){var e=this.plan,i=e.displayOptions;return t.assign({idPrefix:this.idPrefix,date:e.id,mrps:i.get("mrps"),minDate:i.get("minDate"),maxDate:i.get("maxDate"),lineOrdersList:i.isLineOrdersListEnabled(),useDarkerTheme:i.isDarkerThemeUsed(),showToggles:!1!==this.options.toggles,showStats:!1!==this.options.stats})},afterRender:function(){o(this.$id("mrps"),{width:"600px",placeholder:i("planning","filter:mrps:placeholder"),sortable:!0,own:!0,view:this})},copyOrderList:function(t){var n=this,a={};e(".planning-mrp[data-id]").each(function(){a[this.dataset.id]=!0});var o=n.plan.getOrderList(a,t);s.copy(function(t){if(t){t.setData("text/plain",o.join("\r\n")),t.setData("text/html","<ul><li>"+o.join("</li><li>")+"</li></ul>");var e=n.$id("copyOrderList").tooltip({container:n.el,trigger:"manual",placement:"bottom",title:i("planning","toolbar:copyOrderList:success")});e.tooltip("show").data("bs.tooltip").tip().addClass("result success"),n.timers.hideTooltip&&clearTimeout(n.timers.hideTooltip),n.timers.hideTooltip=setTimeout(function(){e.tooltip("destroy")},1337)}})},recountStats:function(){var t={manHours:{todo:0,late:0,plan:0,remaining:0},quantity:{todo:0,late:0,plan:0,remaining:0},execution:{plan:0,done:0,percent:0},execution1:{plan:0,done:0,percent:0},execution2:{plan:0,done:0,percent:0},execution3:{plan:0,done:0,percent:0},orders:{todo:0,late:0,plan:0,remaining:0}};e(".planning-mrp-stats-bd").each(function(){e(this).find("td").each(function(){var e=this.dataset;if(e.plan){var i=e.shiftNo;i?(t["execution"+i].plan+=parseInt(e.plan,10),t["execution"+i].done+=parseInt(e.done,10)):(t.execution.plan+=parseInt(e.plan,10),t.execution.done+=parseInt(e.done,10))}else{var n=e.value;n>0&&(t[e.group][e.subgroup]+=parseFloat(n))}})}),t.execution.percent=t.execution.plan?Math.round(t.execution.done/t.execution.plan*100):0;for(var i=1;i<=3;++i){var n=t["execution"+i];n.percent=n.plan?Math.round(n.done/n.plan*100):100}this.$(".planning-mrp-stats-bd td").each(function(){this.textContent=t[this.dataset.group][this.dataset.subgroup].toLocaleString()})},updateToggles:function(){if(!1!==this.options.toggles){var t=this.plan.displayOptions;this.$id("lineOrdersList").toggleClass("active",t.isLineOrdersListEnabled()),this.$id("useDarkerTheme").toggleClass("active",t.isDarkerThemeUsed())}},changeFilter:function(){var e=this.$id("date")[0],i=e.value,n={mrps:this.$id("mrps").val().split(",").filter(function(t){return t.length>0})};e.checkValidity()&&/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(i)&&(n.date=i),t.isEqual(n.mrps,this.plan.displayOptions.get("mrps"))||this.plan.displayOptions.set("mrps",n.mrps),n.date&&n.date!==this.plan.id&&this.plan.set("_id",n.date)},onLoadingChanged:function(){var t=this.plan.get("loading");this.$id("date").prop("disabled",t),this.$id("mrps").select2("enable",!t)},onDateChanged:function(){this.$id("date").val(this.plan.id)},onMinMaxDateChanged:function(){this.$id("date").prop("min",this.plan.displayOptions.get("minDate")).prop("max",this.plan.displayOptions.get("maxDate"))}})});