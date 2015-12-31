// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/viewport","app/data/aors","app/core/views/FilterView","app/core/util/idAndLabel","./CustomTimesView","app/reports/templates/7/filter"],function(e,t,s,i,o,r,l,a){"use strict";return o.extend({template:a,events:e.extend({"click #-customTimes":function(){this.$id("customTimes").blur(),this.showCustomTimesDialog()}},o.prototype.events),initialize:function(){o.prototype.initialize.apply(this,arguments),this.listenTo(this.model,"change:customTimes",this.toggleCustomTimes)},afterRender:function(){o.prototype.afterRender.call(this),this.toggleButtonGroup("statuses");var e=i.map(r);this.$id("specificAor").select2({width:"275px",allowClear:!0,placeholder:" ",data:e}),this.$id("aors").select2({multiple:!0,data:e}),this.toggleCustomTimes()},serializeQueryToForm:function(){return{specificAor:this.model.get("specificAor"),aors:(this.model.get("aors")||[]).join(","),statuses:this.model.get("statuses")}},changeFilter:function(){this.model.set(this.serializeFormToQuery(),{reset:!0})},serializeFormToQuery:function(){var e={statuses:this.getButtonGroupValue("statuses"),aors:this.$id("aors").val().split(",").filter(function(e){return e.length>0}),specificAor:this.$id("specificAor").val()};return e.statuses.length||this.$id("statuses").find(".btn").click(),e},toggleCustomTimes:function(){this.$id("customTimes").toggleClass("active",!!this.model.get("customTimes"))},showCustomTimesDialog:function(){var i=new l({model:this.model});this.listenToOnce(i,"submit",function(t){s.closeDialog(),this.model.setCustomTimes(e.extend(this.serializeFormToQuery(),t))}),this.listenToOnce(i,"reset",function(){s.closeDialog(),this.model.resetCustomTimes(this.serializeFormToQuery())}),s.showDialog(i,t("reports","7:customTimes:title"))}})});