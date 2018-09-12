// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/core/View","app/data/clipboard","app/mrpControllers/util/setUpMrpSelect2","app/planning/templates/planFilter"],function(t,e,i,a,n,s,o,r){"use strict";return n.extend({template:r,events:{"input #-date":"changeFilter","change #-date":"changeFilter","change #-mrps":"changeFilter","click #-lineOrdersList":function(){this.plan.displayOptions.toggleLineOrdersList()},"click #-useDarkerTheme":function(){this.plan.displayOptions.toggleDarkerThemeUse()},'click a[role="copyOrderList"]':function(t){this.copyOrderList(+t.currentTarget.dataset.shift)}},initialize:function(){var t=this.plan,e=t.displayOptions;this.listenTo(t,"change:loading",this.onLoadingChanged),this.listenTo(t,"change:_id",this.onDateChanged),this.listenTo(e,"change:minDate change:maxDate",this.onMinMaxDateChanged),this.listenTo(e,"change:lineOrdersList change:useDarkerTheme",this.updateToggles)},serialize:function(){var e=this.plan,i=e.displayOptions;return t.assign({idPrefix:this.idPrefix,date:e.id,mrps:i.get("mrps"),minDate:i.get("minDate"),maxDate:i.get("maxDate"),lineOrdersList:i.isLineOrdersListEnabled(),useDarkerTheme:i.isDarkerThemeUsed(),showToggles:!1!==this.options.toggles,showStats:!1!==this.options.stats})},afterRender:function(){o(this.$id("mrps"),{width:"600px",placeholder:i("planning","filter:mrps:placeholder"),sortable:!0,own:!0,view:this})},copyOrderList:function(t){var a=this,n={};e(".planning-mrp[data-id]").each(function(){n[this.dataset.id]=!0});var o=a.plan.getOrderList(n,t);s.copy(function(t){if(t){t.setData("text/plain",o.join("\r\n")),t.setData("text/html","<ul><li>"+o.join("</li><li>")+"</li></ul>");var e=a.$id("copyOrderList").tooltip({container:a.el,trigger:"manual",placement:"bottom",title:i("planning","toolbar:copyOrderList:success")});e.tooltip("show").data("bs.tooltip").tip().addClass("result success"),a.timers.hideTooltip&&clearTimeout(a.timers.hideTooltip),a.timers.hideTooltip=setTimeout(function(){e.tooltip("destroy")},1337)}})},recountStats:function(){var t={manHours:{todo:0,late:0,plan:0,remaining:0},quantity:{todo:0,late:0,plan:0,remaining:0},execution:{plan:0,done:0,percent:0},orders:{todo:0,late:0,plan:0,remaining:0}};e(".planning-mrp-stats-bd").each(function(){e(this).find("td").each(function(){if(this.dataset.plan)return t.execution.plan+=parseInt(this.dataset.plan,10),void(t.execution.done+=parseInt(this.dataset.done,10));var e=this.dataset.value;e>0&&(t[this.dataset.group][this.dataset.subgroup]+=parseFloat(e))})}),t.execution.percent=t.execution.plan?Math.round(t.execution.done/t.execution.plan*100):0,this.$(".planning-mrp-stats-bd td").each(function(){this.textContent=t[this.dataset.group][this.dataset.subgroup].toLocaleString()})},updateToggles:function(){if(!1!==this.options.toggles){var t=this.plan.displayOptions;this.$id("lineOrdersList").toggleClass("active",t.isLineOrdersListEnabled()),this.$id("useDarkerTheme").toggleClass("active",t.isDarkerThemeUsed())}},changeFilter:function(){var e=this.$id("date")[0],i=e.value,a={mrps:this.$id("mrps").val().split(",").filter(function(t){return t.length>0})};e.checkValidity()&&/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(i)&&(a.date=i),t.isEqual(a.mrps,this.plan.displayOptions.get("mrps"))||this.plan.displayOptions.set("mrps",a.mrps),a.date&&a.date!==this.plan.id&&this.plan.set("_id",a.date)},onLoadingChanged:function(){var t=this.plan.get("loading");this.$id("date").prop("disabled",t),this.$id("mrps").select2("enable",!t)},onDateChanged:function(){this.$id("date").val(this.plan.id)},onMinMaxDateChanged:function(){this.$id("date").prop("min",this.plan.displayOptions.get("minDate")).prop("max",this.plan.displayOptions.get("maxDate"))}})});