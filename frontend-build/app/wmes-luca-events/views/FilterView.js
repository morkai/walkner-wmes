define(["underscore","app/core/views/FilterView","app/core/util/forms/dateTimeRange","../dictionaries","app/wmes-luca-events/templates/filter","app/core/util/ExpandableSelect"],function(e,t,n,r,a){"use strict";return t.extend({template:a,events:e.assign({"click a[data-date-time-range]":n.handleRangeEvent},t.prototype.events),termToForm:{time:n.rqlToForm,order:function(e,t,n){n[e]=t.args[1]},type:function(e,t,n){n[e]="in"===t.name?t.args[1]:[t.args[1]]},line:"type",station:"order"},serialize:function(){return e.assign(t.prototype.serialize.call(this),{types:r.types,lines:r.lines})},serializeFormToQuery:function(t){var r=this;n.formToRql(r,t),["type","line"].forEach(function(n){var a=(r.$id(n).val()||[]).filter(function(t){return!e.isEmpty(t)});a.length&&t.push({name:"in",args:[n,a]})}),["order","station"].forEach(function(e){var n=r.$id(e).val().trim();n.length&&t.push({name:"eq",args:[e,n]})})},afterRender:function(){t.prototype.afterRender.call(this),this.$(".is-expandable").expandableSelect()},destroy:function(){t.prototype.destroy.call(this),this.$(".is-expandable").expandableSelect("destroy")}})});