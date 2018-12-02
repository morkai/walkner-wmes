define(["underscore","app/time","app/user","app/core/views/FilterView","app/core/util/forms/dateTimeRange","app/core/util/idAndLabel","app/users/util/setUpUserSelect2","app/mrpControllers/util/setUpMrpSelect2","app/data/delayReasons","app/wmes-fap-entries/templates/filter","app/core/util/ExpandableSelect"],function(e,t,r,s,a,i,n,p,l,o){"use strict";return s.extend({template:o,events:e.assign({"click a[data-date-time-range]":a.handleRangeEvent,'change input[name="userType"]':"toggleUserSelect2"},s.prototype.events),defaultFormData:function(){return{userType:"others"}},termToForm:{createdAt:a.rqlToForm,orderNo:function(e,t,r){r.order=t.args[1]},nc12:"orderNo","observers.id":function(e,t,s){t.args[1]===r.data._id?(s.userType="mine",s.user=r.data._id):(s.userType="others",s.user=t.args[1])},status:function(e,t,r){r[e]="in"===t.name?t.args[1]:[t.args[1]]},mrp:function(e,t,r){r.mrp=Array.isArray(t.args[1])?t.args[1].join(","):""},category:"mrp"},serialize:function(){return e.assign(s.prototype.serialize.call(this),{statuses:["pending","started","finished"]})},serializeFormToQuery:function(t){var s=this.$('input[name="userType"]:checked').val(),i=(this.$id("status").val()||[]).filter(function(t){return!e.isEmpty(t)}),n=this.$id("user").val(),p=this.$id("order").val().trim(),l=this.$id("mrp").val(),o=this.$id("category").val();a.formToRql(this,t),"mine"===s?t.push({name:"eq",args:["observers.id",r.data._id]}):n&&t.push({name:"eq",args:["observers.id",n]}),9===p.length?t.push({name:"eq",args:["orderNo",p]}):7!==p.length&&12!==p.length||t.push({name:"eq",args:["nc12",p]}),i.length&&t.push({name:"in",args:["status",i]}),l&&l.length&&t.push({name:"in",args:["mrp",l.split(",")]}),o&&o.length&&t.push({name:"in",args:["category",o.split(",")]})},afterRender:function(){s.prototype.afterRender.call(this),this.$(".is-expandable").expandableSelect(),p(this.$id("mrp"),{own:!0,view:this}),n(this.$id("user"),{width:"280px",view:this}),this.toggleUserSelect2(),this.$id("category").select2({width:"450px",multiple:!0,allowClear:!0,data:l.map(i)})},destroy:function(){s.prototype.destroy.call(this),this.$(".is-expandable").expandableSelect("destroy")},toggleUserSelect2:function(){var e=this.$('input[name="userType"]:checked').val();this.$id("user").select2("enable","others"===e)}})});