// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/core/View","app/data/clipboard","app/mrpControllers/util/setUpMrpSelect2","app/planning/templates/planFilter"],function(t,i,e,a,s,n,r,o){"use strict";return s.extend({template:o,events:{"input #-date":"changeFilter","change #-date":"changeFilter","change #-mrps":"changeFilter","click #-lineOrdersList":function(){this.plan.displayOptions.toggleLineOrdersList()},"click #-useDarkerTheme":function(){this.plan.displayOptions.toggleDarkerThemeUse()},'click a[role="copyOrderList"]':function(t){this.copyOrderList(+t.currentTarget.dataset.shift)}},initialize:function(){var t=this.plan,i=t.displayOptions;this.listenTo(t,"change:loading",this.onLoadingChanged),this.listenTo(t,"change:_id",this.onDateChanged),this.listenTo(i,"change:minDate change:maxDate",this.onMinMaxDateChanged),this.listenTo(i,"change:lineOrdersList change:useDarkerTheme",this.updateToggles)},serialize:function(){var i=this.plan,e=i.displayOptions;return t.assign({idPrefix:this.idPrefix,date:i.id,mrps:e.get("mrps"),minDate:e.get("minDate"),maxDate:e.get("maxDate"),lineOrdersList:e.isLineOrdersListEnabled(),useDarkerTheme:e.isDarkerThemeUsed(),showToggles:this.options.toggles!==!1,showStats:this.options.stats!==!1})},afterRender:function(){r(this.$id("mrps"),{width:"600px",placeholder:e("planning","filter:mrps:placeholder"),sortable:!0,own:!0,view:this})},copyOrderList:function(t){var a=this,s={};i(".planning-mrp[data-id]").each(function(){s[this.dataset.id]=!0});var r=a.plan.getOrderList(s,t);n.copy(function(t){if(t){t.setData("text/plain",r.join("\r\n")),t.setData("text/html","<ul><li>"+r.join("</li><li>")+"</li></ul>");var i=a.$id("copyOrderList").tooltip({container:a.el,trigger:"manual",placement:"bottom",title:e("planning","toolbar:copyOrderList:success")});i.tooltip("show").data("bs.tooltip").tip().addClass("result success"),a.timers.hideTooltip&&clearTimeout(a.timers.hideTooltip),a.timers.hideTooltip=setTimeout(function(){i.tooltip("destroy")},1337)}})},recountStats:function(){var t={manHours:{todo:0,late:0,plan:0,remaining:0},quantity:{todo:0,late:0,plan:0,remaining:0}};i(".planning-mrp-stats-bd").each(function(){i(this).find("td").each(function(){var i=this.dataset.value;i>0&&(t[this.dataset.group][this.dataset.subgroup]+=parseFloat(i))})}),this.$(".planning-mrp-stats-bd td").each(function(){this.textContent=t[this.dataset.group][this.dataset.subgroup].toLocaleString()})},updateToggles:function(){if(this.options.toggles!==!1){var t=this.plan.displayOptions;this.$id("lineOrdersList").toggleClass("active",t.isLineOrdersListEnabled()),this.$id("useDarkerTheme").toggleClass("active",t.isDarkerThemeUsed())}},changeFilter:function(){var i=this.$id("date")[0],e=i.value,a={mrps:this.$id("mrps").val().split(",").filter(function(t){return t.length>0})};i.checkValidity()&&/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(e)&&(a.date=e),t.isEqual(a.mrps,this.plan.displayOptions.get("mrps"))||this.plan.displayOptions.set("mrps",a.mrps),a.date&&a.date!==this.plan.id&&this.plan.set("_id",a.date)},onLoadingChanged:function(){var t=this.plan.get("loading");this.$id("date").prop("disabled",t),this.$id("mrps").select2("enable",!t)},onDateChanged:function(){this.$id("date").val(this.plan.id)},onMinMaxDateChanged:function(){this.$id("date").prop("min",this.plan.displayOptions.get("minDate")).prop("max",this.plan.displayOptions.get("maxDate"))}})});