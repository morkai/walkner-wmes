define(["underscore","app/core/views/FilterView","app/core/util/forms/dateTimeRange","app/orgUnits/views/OrgUnitPickerView","app/wmes-ct-balancing/templates/filter","app/core/util/ExpandableSelect"],function(e,t,i,r,n){"use strict";return t.extend({template:n,events:e.assign({"click a[data-date-time-range]":i.handleRangeEvent},t.prototype.events),termToForm:{startedAt:i.rqlToForm,"order._id":function(e,t,i){i.order=t.args[1]},line:function(e,t,i){i[e]="in"===t.name?t.args[1]:[t.args[1]]}},initialize:function(){t.prototype.initialize.apply(this,arguments),this.setView("#-orgUnit",new r({filterView:this,orgUnitTerms:{line:"prodLine"},orgUnitTypes:["prodLine"]}))},serializeFormToQuery:function(e){i.formToRql(this,e);var t=this.$id("order").val().trim();t.length&&e.push({name:"eq",args:["order._id",t]})},afterRender:function(){t.prototype.afterRender.call(this),this.$(".is-expandable").expandableSelect()},destroy:function(){t.prototype.destroy.call(this),this.$(".is-expandable").expandableSelect("destroy")}})});