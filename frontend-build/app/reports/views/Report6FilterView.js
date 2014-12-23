// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["js2form","app/time","app/core/View","app/core/util/fixTimeRange","app/core/util/buttonGroup","app/reports/templates/report6Filter","../util/prepareDateRange","../util/getFromTimeByInterval"],function(t,e,r,i,a,o,n,l){return r.extend({template:o,events:{submit:function(t){t.preventDefault(),this.changeFilter()},"click a[data-range]":function(t){var e=n(t.target);this.$id("from").val(e.fromMoment.format("YYYY-MM-DD")),this.$id("to").val(e.toMoment.format("YYYY-MM-DD")),this.$('.btn[data-interval="'+e.interval+'"]').click(),this.$el.submit()}},afterRender:function(){var e=this.serializeFormData();t(this.el,e),a.toggle(this.$id("interval"))},serializeFormData:function(){return{interval:this.model.get("interval"),from:e.format(+this.model.get("from"),"YYYY-MM-DD"),to:e.format(+this.model.get("to"),"YYYY-MM-DD")}},changeFilter:function(){var t={_rnd:Math.random(),from:null,to:null,interval:a.getValue(this.$id("interval"))},r=i.fromView(this);t.from=r.from||l(t.interval),t.to=r.to||Date.now(),this.$id("from").val(e.format(t.from,"YYYY-MM-DD")),this.$id("to").val(e.format(t.to,"YYYY-MM-DD")),this.model.set(t,{reset:!0})}})});