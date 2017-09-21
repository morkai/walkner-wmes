// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","select2","app/user","app/data/mrpControllers","app/core/views/FilterView","app/core/util/fixTimeRange","app/orgUnits/views/OrgUnitPickerView","app/users/ownMrps","app/mrpControllers/util/setUpMrpSelect2","app/prodShiftOrders/templates/filter"],function(e,r,t,i,a,n,s,o,p,l,c){"use strict";return n.extend({template:c,defaultFormData:{from:"",to:"",mrp:"",type:null,shift:0,orderId:"",bom:""},termToForm:{startedAt:function(e,r,t){s.toFormData(t,r,"date")},"orderData.mrp":function(e,r,t){t.mrp=Array.isArray(r.args[1])?r.args[1].join(","):""},orderId:function(e,r,t){var i=r.args[1],a=t[e];a+="all"===r.name?" "+i.join("+"):"in"===r.name?" "+i.join(","):" "+i,t[e]=a.trim()},"orderData.bom.nc12":function(e,r,t){var i=r.args[1],a=t.bom;a+="all"===r.name?" "+i.join("+"):"in"===r.name?" "+i.join(","):" "+i,t.bom=a.trim()},"orderData.bom.item":"orderData.bom.nc12",shift:function(e,r,t){t[e]=r.args[1]}},events:e.assign({"focus .prodShiftOrders-filter-orderId":function(e){var t=this.$(e.currentTarget),i=t.closest(".form-group"),a=r('<textarea class="form-control" rows="4"></textarea>').css({position:"absolute",marginTop:"-34px",width:"383px",zIndex:"2"}).val(t.val().split(" ").join("\n")).appendTo(i).focus();a.on("blur",function(){t.val(a.val().split("\n").join(" ")).prop("disabled",!1),a.remove()}),t[0].disabled=!0}},p.events,n.prototype.events),initialize:function(){n.prototype.initialize.apply(this,arguments),this.setView("#"+this.idPrefix+"-orgUnit",new o({filterView:this}))},serialize:function(){return e.assign(n.prototype.serialize.apply(this,arguments),{showOwnMrps:p.hasAny()})},afterRender:function(){n.prototype.afterRender.apply(this,arguments),this.toggleButtonGroup("shift"),l(this.$id("mrp"))},serializeOrderId:function(r){var t=this.$id("orderId").val().replace(/\s+/g," ").replace(/\s*,\s*/g,",").replace(/\s*\+\s*/g,"+").toUpperCase().split(" "),i={},a={};t.forEach(function(r){var t=a,n=",";e.includes(r,"+")&&(t=i,n="+"),r.split(n).forEach(function(e){e=e.replace(/[^0-9A-Z]+/g,""),e.length&&(t[e]=1)})}),i=e.keys(i),a=e.keys(a),i.length&&r.push({name:"all",args:["orderId",i]}),a.length&&r.push({name:"in",args:["orderId",a]})},serializeBom:function(r){var t=this.$id("bom").val().replace(/\s+/g," ").replace(/\s*,\s*/g,",").replace(/\s*\+\s*/g,"+").toUpperCase().split(" "),i={nc12:{},item:{}},a={nc12:{},item:{}};t.forEach(function(r){var t=a,n=",";e.includes(r,"+")&&(t=i,n="+");var s=r.split(n).map(function(e){return e.replace(/[^0-9A-Z]+/g,"")}).filter(function(e){return/^([0-9]{1,4}|[0-9A-Z]{6,12})$/.test(e)});s.length&&(t=s[0].length<=4?t.item:t.nc12,s.forEach(function(e){for(;e.length<4;)e="0"+e;t[e]=1}))}),["nc12","item"].forEach(function(t){i[t]=e.keys(i[t]),a[t]=e.keys(a[t]),i[t].length&&r.push({name:"all",args:["orderData.bom."+t,i[t]]}),a[t].length&&r.push({name:"in",args:["orderData.bom."+t,a[t]]})})},serializeFormToQuery:function(e){var r=s.fromView(this,{defaultTime:"06:00"}),t=this.$id("mrp").val(),i=parseInt(this.$("input[name=shift]:checked").val(),10);this.serializeOrderId(e),this.serializeBom(e),t&&t.length&&e.push({name:"in",args:["orderData.mrp",t.split(",")]}),i&&e.push({name:"eq",args:["shift",i]}),r.from&&e.push({name:"ge",args:["startedAt",r.from]}),r.to&&e.push({name:"lt",args:["startedAt",r.to]})}})});