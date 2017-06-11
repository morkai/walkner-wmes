// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/core/views/FilterView","app/core/util/idAndLabel","../dictionaries","app/opinionSurveys/templates/reportFilter"],function(e,i,s,t,r){"use strict";return i.extend({template:r,afterRender:function(){i.prototype.afterRender.call(this),this.$id("surveys").select2({width:300,placeholder:" ",allowClear:!0,multiple:!0,data:this.surveys.map(s)}),this.$id("divisions").select2({width:250,placeholder:" ",allowClear:!0,multiple:!0,data:t.divisions.map(s)}),this.$id("superiors").select2({width:500,placeholder:" ",allowClear:!0,multiple:!0,id:function(e){return e._id},formatSelection:function(e){return e.short},data:{results:this.surveys.getSuperiors(),text:"full"}}),this.$id("employers").select2({width:200,placeholder:" ",allowClear:!0,multiple:!0,data:t.employers.map(s)})},serializeQueryToForm:function(){return{surveys:this.query.get("surveys").join(","),divisions:this.query.get("divisions").join(","),superiors:this.query.get("superiors").join(","),employers:this.query.get("employers").join(",")}},changeFilter:function(){this.query.set(this.serializeFormToQuery(),{reset:!0})},serializeFormToQuery:function(){return{surveys:this.$id("surveys").val().split(","),divisions:this.$id("divisions").val().split(","),superiors:this.$id("superiors").val().split(","),employers:this.$id("employers").val().split(",")}}})});