define(["app/user","app/core/views/FilterView","app/core/util/fixTimeRange","app/orgUnits/views/OrgUnitPickerView","app/prodLogEntries/templates/filter"],function(e,t,i,r,a){"use strict";return t.extend({template:a,defaultFormData:{createdAt:"",type:null},termToForm:{createdAt:function(e,t,r){i.toFormData(r,t,"date+time")},type:function(e,t,i){i[e]=t.args[1]}},initialize:function(){t.prototype.initialize.apply(this,arguments),this.setView("#"+this.idPrefix+"-orgUnit",new r({filterView:this}))},afterRender:function(){t.prototype.afterRender.call(this),this.$id("type").select2({width:"275px",allowClear:!0})},serializeFormToQuery:function(e){var t=i.fromView(this,{defaultTime:"06:00"}),r=this.$id("type").val();r&&r.length&&e.push({name:"eq",args:["type",r]}),t.from&&e.push({name:"ge",args:["createdAt",t.from]}),t.to&&e.push({name:"le",args:["createdAt",t.to]})}})});