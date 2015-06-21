// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","app/viewport","app/data/aors","app/core/views/FilterView","app/core/util/idAndLabel","./Report7CustomTimesView","app/reports/templates/report7Filter"],function(t,e,s,i,o,r,a,l){"use strict";return o.extend({template:l,events:t.extend({"click #-customTimes":function(){this.$id("customTimes").blur(),this.showCustomTimesDialog()}},o.prototype.events),termToForm:{specificAor:function(t,e,s){s[t]=e.args[1]},aors:function(t,e,s){s[t]=e.args[1].split(",")},statuses:"aors"},initialize:function(){o.prototype.initialize.apply(this,arguments),this.listenTo(this.model,"change:customTimes",this.toggleCustomTimes)},afterRender:function(){o.prototype.afterRender.call(this),this.toggleButtonGroup("statuses");var t=i.map(r);this.$id("specificAor").select2({width:"275px",allowClear:!0,placeholder:" ",data:t}),this.$id("aors").select2({multiple:!0,data:t}),this.toggleCustomTimes()},serializeQueryToForm:function(){return{specificAor:this.model.get("specificAor"),aors:(this.model.get("aors")||[]).join(","),statuses:this.model.get("statuses")}},changeFilter:function(){this.model.set(this.serializeFormToQuery(),{reset:!0})},serializeFormToQuery:function(){var t={statuses:this.getButtonGroupValue("statuses"),aors:this.$id("aors").val().split(",").filter(function(t){return t.length>0}),specificAor:this.$id("specificAor").val()};return t.statuses.length||this.$id("statuses").find(".btn").click(),t},toggleCustomTimes:function(){this.$id("customTimes").toggleClass("active",!!this.model.get("customTimes"))},showCustomTimesDialog:function(){var i=new a({model:this.model});this.listenToOnce(i,"submit",function(e){s.closeDialog(),this.model.setCustomTimes(t.extend(this.serializeFormToQuery(),e))}),this.listenToOnce(i,"reset",function(){s.closeDialog(),this.model.resetCustomTimes(this.serializeFormToQuery())}),s.showDialog(i,e("reports","7:customTimes:title"))}})});