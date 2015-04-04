// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/time","app/core/views/FilterView","app/xiconfOrders/templates/filter"],function(t,e,a){"use strict";return e.extend({template:a,defaultFormData:function(){return{from:"",to:"",orderNo:"",nc12:"",status:[-1,0,1]}},termToForm:{reqDate:function(e,a,r){r["ge"===a.name?"from":"to"]=t.format(a.args[1],"YYYY-MM-DD")},_id:function(t,e,a){a.orderNo=e.args[1]},status:function(t,e,a){a.status="eq"===e.name?[e.args[1]]:e.args[1]},nc12:function(t,e,a){a.nc12=e.args[1]}},afterRender:function(){e.prototype.afterRender.call(this),this.toggleButtonGroup("status")},serializeFormToQuery:function(e){var a=t.getMoment(this.$id("from").val(),"YYYY-MM-DD"),r=t.getMoment(this.$id("to").val(),"YYYY-MM-DD"),s=this.$id("orderNo").val().trim(),n=this.$id("nc12").val().trim(),i=this.getButtonGroupValue("status").map(Number);/^[0-9]+$/.test(s)&&e.push({name:"eq",args:["_id",s]}),/^[a-zA-Z0-9]{1,12}$/.test(n)&&e.push({name:"eq",args:["nc12",n]}),a.isValid()&&e.push({name:"ge",args:["reqDate",a.valueOf()]}),r.isValid()&&e.push({name:"lt",args:["reqDate",r.valueOf()]}),1===i.length?e.push({name:"eq",args:["status",i[0]]}):2===i.length&&e.push({name:"in",args:["status",i]})}})});