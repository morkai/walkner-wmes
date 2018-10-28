define(["underscore","app/user","app/data/aors","app/data/orgUnits","app/data/downtimeReasons","app/core/views/FilterView","app/core/util/fixTimeRange","app/orgUnits/views/OrgUnitPickerView","app/mrpControllers/util/setUpMrpSelect2","app/prodDowntimes/templates/filter"],function(t,e,a,n,r,i,s,o,l,p){"use strict";return i.extend({template:p,events:t.extend({"change #-alerts":"toggleStatus"},i.prototype.events),defaultFormData:function(){return{startedAt:"",aor:null,aorIn:!0,reason:null,reasonIn:!0,status:null,mrp:""}},termToForm:{startedAt:function(t,e,a){s.toFormData(a,e,"date+time")},aor:function(t,e,a){"eq"===e.name||"ne"===e.name?(a[t+"In"]="eq"===e.name,a[t]=e.args[1]):"in"!==e.name&&"nin"!==e.name||(a[t+"In"]="in"===e.name,a[t]=e.args[1].join(","))},status:function(t,e,a){a.status=[].concat(e.args[1])},"alerts.active":function(t,e,a){a.alerts=1},"orderData.mrp":function(t,e,a){a.mrp=Array.isArray(e.args[1])?e.args[1].join(","):""},reason:"aor"},initialize:function(){i.prototype.initialize.apply(this,arguments),this.setView("#"+this.idPrefix+"-orgUnit",new o({filterView:this}))},afterRender:function(){i.prototype.afterRender.call(this),this.$id("aor").select2({width:"256px",allowClear:!0,multiple:!0,data:a.map(function(t){return{id:t.id,text:t.getLabel()}}).sort(function(t,e){return t.text.localeCompare(e.text)})}),this.$id("reason").select2({width:"256px",allowClear:!0,multiple:!0,data:r.map(function(t){return{id:t.id,text:t.id+" - "+(t.get("label")||"?")}}).sort(function(t,e){return t.id.localeCompare(e.id)})}),this.toggleStatus(),l(this.$id("mrp"),{own:!0,view:this,width:"256px"})},serializeFormToQuery:function(t){var e=s.fromView(this,{defaultTime:"06:00"}),a=this.$id("aor").select2("val"),n=this.$id("aorIn").prop("checked"),r=this.$id("reason").select2("val"),i=this.$id("reasonIn").prop("checked"),o=this.$id("alerts").prop("checked"),l=this.fixStatus(),p=this.$id("mrp").val();o?t.push({name:"eq",args:["alerts.active",!0]}):1===l.length?t.push({name:"eq",args:["status",l[0]]}):l.length>1&&t.push({name:"in",args:["status",l]}),p&&p.length&&t.push({name:"in",args:["orderData.mrp",p.split(",")]}),e.from&&t.push({name:"ge",args:["startedAt",e.from]}),e.to&&t.push({name:"le",args:["startedAt",e.to]}),1===a.length?t.push({name:n?"eq":"ne",args:["aor",a[0]]}):a.length>1&&t.push({name:n?"in":"nin",args:["aor",a]}),1===r.length?t.push({name:i?"eq":"ne",args:["reason",r[0]]}):r.length>1&&t.push({name:i?"in":"nin",args:["reason",r]})},fixStatus:function(){var t=this.$('input[name="status[]"]'),e=t.filter(":checked");0===e.length&&(e=t.prop("checked",!0));var a=e.map(function(){return this.value}).get();return a.length===t.length?[]:a},toggleStatus:function(){this.$('[name="status[]"]').prop("disabled",this.$id("alerts").prop("checked"))}})});