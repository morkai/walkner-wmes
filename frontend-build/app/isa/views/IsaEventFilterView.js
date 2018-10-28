define(["app/data/orgUnits","app/core/views/FilterView","app/core/util/idAndLabel","app/core/util/fixTimeRange","app/orgUnits/views/OrgUnitPickerView","app/isa/templates/eventListFilter"],function(e,t,i,a,r,n){"use strict";return t.extend({template:n,defaultFormData:{time:"",type:null},termToForm:{time:function(e,t,i){a.toFormData(i,t,"date+time")},type:function(e,t,i){i.type=t.args[1]}},initialize:function(){t.prototype.initialize.apply(this,arguments),this.setView("#"+this.idPrefix+"-orgUnit",new r({mode:"array",filterView:this}))},afterRender:function(){t.prototype.afterRender.call(this),this.$id("type").select2({width:"275px",allowClear:!0,placeholder:" "})},serializeFormToQuery:function(e){var t=a.fromView(this,{defaultTime:"00:00"}),i=this.$id("type").val();i&&i.length&&e.push({name:"eq",args:["type",i]}),t.from&&e.push({name:"ge",args:["time",t.from]}),t.to&&e.push({name:"lt",args:["time",t.to]})}})});