// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/time","app/core/View","app/paintShop/templates/paintPicker"],function(i,t,e,n){"use strict";return e.extend({template:n,dialogClassName:"paintShop-paintPicker-dialog",events:{"focus [data-vkb]":function(i){this.options.vkb&&this.options.vkb.show(i.target,this.onVkbValueChange)},"click .paintShop-paintPicker-paint":function(i){this.$(".active").removeClass("active"),i.currentTarget.classList.add("active")},"input #-filter":"onVkbValueChange",submit:function(){return!1},"click #-select":function(){this.trigger("picked",this.$(".active").val())},"click #-msp":function(){this.trigger("picked","msp")},"click #-all":function(){this.trigger("picked","all")}},initialize:function(){this.onVkbValueChange=this.onVkbValueChange.bind(this)},destroy:function(){this.options.vkb&&this.options.vkb.hide()},getTemplateData:function(){var i=this.orders,t=this.dropZones,e={},n=[];i.serialize().forEach(function(i){Object.keys(i.paints).forEach(function(i){e[i]=1})});var a=i.settings.getValue("mspPaints")||[];return Object.keys(e).forEach(function(e){if(-1===a.indexOf(e)){var s=i.paints.get(e),r=i.totalQuantities[e],c=r?r.new+r.started+r.partial:0;n.push({nc12:e,name:s?s.get("name"):"",dropped:t.getState(e),totals:r,remaining:c,className:r&&0!==c?"default":"success"})}}),n.sort(function(i,t){return i.remaining===t.remaining?i.nc12.localeCompare(t.nc12):t.remaining-i.remaining}),{paints:n,mspDropped:t.getState("msp")}},afterRender:function(){var i=this.$('.paintShop-paintPicker-paint[value="'+this.orders.selectedPaint+'"]');i.length||(i=this.$(".paintShop-paintPicker-paint").first()),i.click().focus();var t=window.innerHeight-this.$(".paintShop-paintPicker-filter").outerHeight()-this.$(".paintShop-paintPicker-buttons").outerHeight()-60-60;this.$(".paintShop-paintPicker-paints").css("height",t+"px"),this.$id("filter").focus()},onVkbValueChange:function(){var i=this.$id("filter").val().trim();if(""===i)this.$(".hidden").removeClass("hidden");else{var t=null;this.$(".paintShop-paintPicker-paint").each(function(){var e=-1===this.value.indexOf(i);this.classList.toggle("hidden",e),t||e||(t=this)}),t&&t.click()}}})});