// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/data/prodLines","app/core/views/FilterView","app/core/util/fixTimeRange","app/core/util/idAndLabel","app/prodSerialNumbers/templates/filter"],function(e,r,t,a,i){"use strict";return r.extend({template:i,defaultFormData:{_id:"",orderNo:"",prodLine:"",scannedAt:""},termToForm:{scannedAt:function(e,r,a){t.toFormData(a,r,"date")},_id:function(e,r,t){t[e]=r.args[1]},prodLine:function(e,r,t){t[e]=r.args[1]},orderNo:"prodLine"},afterRender:function(){r.prototype.afterRender.call(this),this.$id("prodLine").select2({width:"275px",allowClear:!0,placeholder:" ",data:e.map(a)})},serializeFormToQuery:function(e){var r=t.fromView(this);r.from&&e.push({name:"ge",args:["scannedAt",r.from]}),r.to&&e.push({name:"lt",args:["scannedAt",r.to]}),["_id","orderNo","prodLine"].forEach(function(r){var t=this.$id(r).val().trim();t&&t.length&&e.push({name:"eq",args:[r,t]})},this)}})});