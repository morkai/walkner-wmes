define(["underscore","app/time","app/core/views/FilterView","app/core/util/forms/dateTimeRange","app/users/util/setUpUserSelect2","app/kaizenOrders/dictionaries","app/minutesForSafetyCards/templates/filter","app/core/util/ExpandableSelect"],function(e,t,s,n,r,a,i){"use strict";return s.extend({template:i,events:e.assign({"click a[data-date-time-range]":n.handleRangeEvent,'change input[name="userType"]':"toggleUserSelect2","keyup select":function(e){if(27===e.keyCode)return e.target.selectedIndex=-1,!1},"dblclick select":function(e){e.target.selectedIndex=-1}},s.prototype.events),defaultFormData:function(){return{status:[],section:[],userType:"others",user:null}},termToForm:{date:n.rqlToForm,"owner.id":function(e,t,s){s.userType="owner",s.user=t.args[1]},users:function(e,t,s){"mine"===t.args[1]?(s.userType="mine",s.user=null):(s.userType="others",s.user=t.args[1])},section:function(e,t,s){s[e]="in"===t.name?t.args[1]:[t.args[1]]},status:function(e,t,s){s[e]="in"===t.name?t.args[1]:[t.args[1]]}},getTemplateData:function(){return{statuses:a.statuses,sections:a.sections.toJSON()}},serializeFormToQuery:function(t){var s=this.$('input[name="userType"]:checked').val(),r=this.$id("user").val();n.formToRql(this,t),"owner"===s?t.push({name:"eq",args:["owner.id",r]}):"mine"===s?t.push({name:"eq",args:["users","mine"]}):r&&t.push({name:"eq",args:["users",r]}),["status","section"].forEach(function(s){var n=(this.$id(s).val()||[]).filter(function(t){return!e.isEmpty(t)});1===n.length?t.push({name:"eq",args:[s,n[0]]}):n.length&&t.push({name:"in",args:[s,n]})},this)},afterRender:function(){s.prototype.afterRender.call(this),this.$(".is-expandable").expandableSelect(),r(this.$id("user"),{width:"300px",view:this}),this.toggleUserSelect2()},destroy:function(){s.prototype.destroy.call(this),this.$(".is-expandable").expandableSelect("destroy")},toggleUserSelect2:function(){var e=this.$('input[name="userType"]:checked').val();this.$id("user").select2("enable","others"===e||"owner"===e)}})});