// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/views/FilterView","app/core/util/idAndLabel","app/opinionSurveys/dictionaries","app/opinionSurveyScanTemplates/templates/filter"],function(e,r,t,i){"use strict";return e.extend({template:i,defaultFormData:function(){return{survey:""}},termToForm:{survey:function(e,r,t){t[e]=r.args[1]}},afterRender:function(){e.prototype.afterRender.call(this),this.$id("survey").select2({width:175,allowClear:!0,placeholder:" ",minimumResultsForSearch:-1,data:this.model.opinionSurveys.map(r)})},serializeFormToQuery:function(e){var r=this.$id("survey").val();r.length&&e.push({name:"eq",args:["survey",r]})}})});