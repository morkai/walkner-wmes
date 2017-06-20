// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/data/orgUnits","app/core/views/FilterView","app/core/util/idAndLabel","app/core/util/fixTimeRange","app/isa/templates/requestListFilter"],function(e,t,i,r,a){"use strict";return t.extend({template:a,defaultFormData:{requestedAt:"",line:null},termToForm:{requestedAt:function(e,t,i){r.toFormData(i,t,"date+time")},prodLine:function(e,t,i){i.line=t.args[1]}},afterRender:function(){t.prototype.afterRender.call(this),this.$id("line").select2({width:"275px",allowClear:!0,placeholder:" ",data:this.getApplicableProdLines()})},getApplicableProdLines:function(){return e.getAllByType("prodLine").filter(function(t){var i=e.getSubdivisionFor(t);return!i||"assembly"===i.get("type")}).map(i)},serializeFormToQuery:function(e){var t=r.fromView(this,{defaultTime:"00:00"}),i=this.$id("line").val();i&&i.length&&e.push({name:"orgUnit",args:["prodLine",i]}),t.from&&e.push({name:"ge",args:["requestedAt",t.from]}),t.to&&e.push({name:"lt",args:["requestedAt",t.to]})}})});