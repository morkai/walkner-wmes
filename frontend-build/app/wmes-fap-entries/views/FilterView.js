define(["underscore","app/time","app/user","app/core/views/FilterView","app/core/util/forms/dateTimeRange","app/users/util/setUpUserSelect2","app/wmes-fap-entries/templates/filter","app/core/util/ExpandableSelect"],function(e,t,r,s,a,i,n){"use strict";return s.extend({template:n,events:e.assign({"click a[data-date-time-range]":a.handleRangeEvent,'change input[name="userType"]':"toggleUserSelect2"},s.prototype.events),defaultFormData:function(){return{userType:"others"}},termToForm:{createdAt:a.rqlToForm,orderNo:function(e,t,r){r.order=t.args[1]},nc12:"orderNo","observers.id":function(e,t,s){t.args[1]===r.data._id?(s.userType="mine",s.user=r.data._id):(s.userType="others",s.user=t.args[1])},status:function(e,t,r){r[e]="in"===t.name?t.args[1]:[t.args[1]]}},serialize:function(){return e.assign(s.prototype.serialize.call(this),{statuses:["pending","started","finished"]})},serializeFormToQuery:function(t){var s=this.$('input[name="userType"]:checked').val(),i=(this.$id("status").val()||[]).filter(function(t){return!e.isEmpty(t)}),n=this.$id("user").val(),o=this.$id("order").val().trim();a.formToRql(this,t),"mine"===s?t.push({name:"eq",args:["observers.id",r.data._id]}):n&&t.push({name:"eq",args:["observers.id",n]}),9===o.length?t.push({name:"eq",args:["orderNo",o]}):7!==o.length&&12!==o.length||t.push({name:"eq",args:["nc12",o]}),i.length&&t.push({name:"in",args:["status",i]})},afterRender:function(){s.prototype.afterRender.call(this),this.$(".is-expandable").expandableSelect(),i(this.$id("user"),{width:"280px",view:this}),this.toggleUserSelect2()},destroy:function(){s.prototype.destroy.call(this),this.$(".is-expandable").expandableSelect("destroy")},toggleUserSelect2:function(){var e=this.$('input[name="userType"]:checked').val();this.$id("user").select2("enable","others"===e)}})});