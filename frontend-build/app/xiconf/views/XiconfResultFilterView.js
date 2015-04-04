// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time","app/core/views/FilterView","app/xiconf/templates/filter"],function(e,t,r){"use strict";return t.extend({template:r,defaultFormData:function(){return{from:"",to:"",srcId:"",serviceTag:"",orderNo:"",nc12:"",result:["success","failure"]}},termToForm:{startedAt:function(t,r,s){var i="datetime-local"===this.$id("from").prop("type")?"YYYY-MM-DDTHH:mm:ss":"YYYY-MM-DD HH:mm";s["ge"===r.name?"from":"to"]=e.format(r.args[1],i)},orderNo:function(e,t,r){r[e]=t.args[1]},result:function(e,t,r){("success"===t.args[1]||"failure"===t.args[1])&&(r.result=[t.args[1]])},nc12:"orderNo",srcId:"orderNo",serviceTag:"orderNo"},initialize:function(){this.collection&&this.listenTo(this.collection,"change:srcIds",this.setUpSrcIdSelect2)},afterRender:function(){t.prototype.afterRender.call(this),1===this.formData.result.length?this.$(".xiconf-filter-"+this.formData.result[0]).addClass("active"):this.$(".xiconf-filter-result > label").addClass("active"),this.setUpSrcIdSelect2()},setUpSrcIdSelect2:function(){this.$id("srcId").select2({width:"200px",allowClear:!0,data:(this.collection.srcIds||[]).map(function(e){return{id:e,text:e}})})},serializeFormToQuery:function(t){var r=e.getMoment(this.$id("from").val()),s=e.getMoment(this.$id("to").val()),i=this.$id("orderNo").val().trim(),a=this.$id("nc12").val().trim(),o=this.$id("serviceTag").val().trim(),l=this.$id("srcId").val(),n=this.$('input[name="result[]"]:checked');l.length&&t.push({name:"eq",args:["srcId",l]}),/^[0-9]{9}$/.test(i)&&t.push({name:"eq",args:["orderNo",i]}),/^[0-9]{12}$/.test(a)&&t.push({name:"eq",args:["nc12",a]}),/^P[0-9]+$/.test(o)&&t.push({name:"eq",args:["serviceTag",o]}),r.isValid()&&t.push({name:"ge",args:["startedAt",r.valueOf()]}),s.isValid()&&t.push({name:"lt",args:["startedAt",s.valueOf()]}),1===n.length&&t.push({name:"eq",args:["result",n.val()]})}})});