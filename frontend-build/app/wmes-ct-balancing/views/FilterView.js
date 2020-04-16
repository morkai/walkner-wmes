define(["underscore","app/core/views/FilterView","app/core/util/forms/dateTimeRange","app/orgUnits/views/OrgUnitPickerView","app/wmes-ct-balancing/templates/filter","app/core/util/ExpandableSelect"],function(e,t,i,n,r){"use strict";return t.extend({template:r,events:e.assign({"click a[data-date-time-range]":i.handleRangeEvent},t.prototype.events),termToForm:{startedAt:i.rqlToForm,"order._id":function(e,t,i){i.product=t.args[1]},"order.nc12":"order._id",line:function(e,t,i){i[e]="in"===t.name?t.args[1]:[t.args[1]]},stt:function(e,t,i){i["ge"===t.name?"minDuration":"maxDuration"]=t.args[1]+"%"},d:function(e,t,i){i["ge"===t.name?"minDuration":"maxDuration"]=t.args[1]+"s"}},initialize:function(){t.prototype.initialize.apply(this,arguments),this.setView("#-orgUnit",new n({filterView:this,orgUnitTerms:{line:"prodLine"},orgUnitTypes:["prodLine"]})),this.once("afterRender",function(){this.$id("product").val()||this.$('.btn[type="submit"]').click()})},serializeFormToQuery:function(e){i.formToRql(this,e);var t=this.$id("product").val().trim(),n=this.$id("minDuration").val().trim(),r=this.$id("maxDuration").val().trim();9===t.length?e.push({name:"eq",args:["order._id",t]}):7!==t.length&&12!==t.length||e.push({name:"eq",args:["order.nc12",t.toUpperCase()]}),/^[0-9]+\s*[%s]?$/.test(n)&&e.push({name:"ge",args:[/%/.test(n)?"stt":"d",parseInt(n,10)]}),/^[0-9]+\s*[%s]?$/.test(r)&&e.push({name:"le",args:[/%/.test(r)?"stt":"d",parseInt(r,10)]})},afterRender:function(){t.prototype.afterRender.call(this),this.$(".is-expandable").expandableSelect()},destroy:function(){t.prototype.destroy.call(this),this.$(".is-expandable").expandableSelect("destroy")}})});