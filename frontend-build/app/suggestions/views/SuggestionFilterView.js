define(["underscore","app/time","app/user","app/core/views/FilterView","app/core/util/forms/dateTimeRange","app/core/util/forms/dropdownRadio","app/users/util/setUpUserSelect2","app/kaizenOrders/dictionaries","app/suggestions/templates/filter","app/core/util/ExpandableSelect"],function(e,t,s,r,i,n,a,o,u){"use strict";return r.extend({template:u,events:e.assign({"click a[data-date-time-range]":i.handleRangeEvent,'change input[name="userType"]':function(){this.toggleUserSelect2(!0)},"keyup select":function(e){if(27===e.keyCode)return e.target.selectedIndex=-1,!1},"dblclick select":function(e){e.target.selectedIndex=-1}},r.prototype.events),defaultFormData:function(){return{status:[],section:[],categories:[],productFamily:[],userType:"others",user:null,dateType:"date"}},termToForm:{date:function(e,t,s){s.dateType=e,i.rqlToForm.call(this,e,t,s)},finishedAt:"date","owners.id":function(e,t,s){s.userType=e.split(".")[0],s.user=t.args[1]},"confirmer.id":"owners.id","superior.id":"owners.id","suggestionOwners.id":"owners.id","kaizenOwners.id":"owners.id","observers.user.id":function(e,t,s){"mine"===t.args[1]?(s.userType="mine",s.user=null):"unseen"===t.args[1]?(s.userType="unseen",s.user=null):(s.userType="others",s.user=t.args[1])},status:function(e,t,s){s[e]="in"===t.name?t.args[1]:[t.args[1]]},categories:"status",section:"status",area:"status",productFamily:"status"},getTemplateData:function(){return{statuses:o.kzStatuses.concat("kom"),sections:o.sections.toJSON(),areas:o.areas.toJSON(),categories:e.invoke(o.categories.inSuggestion(),"toJSON"),productFamilies:o.productFamilies.toJSON()}},serializeFormToQuery:function(t,s){var r=this.$('input[name="dateType"]:checked').val(),n=this.$('input[name="userType"]').val(),a=this.$id("user").val();s.sort={},s.sort[r]=-1,i.formToRql(this,t),t.forEach(function(e){"date"===e.args[0]&&(e.args[0]=r)}),"mine"===n||"unseen"===n?t.push({name:"eq",args:["observers.user.id",n]}):a&&("others"===n&&(n="observers.user"),t.push({name:"eq",args:[n+".id",a]})),["status","categories","section","area","productFamily"].forEach(function(s){var r=(this.$id(s).val()||[]).filter(function(t){return!e.isEmpty(t)});1===r.length?t.push({name:"eq",args:[s,r[0]]}):r.length&&t.push({name:"in",args:[s,r]})},this)},afterRender:function(){r.prototype.afterRender.call(this),this.$(".is-expandable").expandableSelect(),a(this.$id("user"),{view:this,width:"275px",noPersonnelId:!0}),this.setUpUserType(),this.toggleUserSelect2(!1)},destroy:function(){r.prototype.destroy.call(this),this.$(".is-expandable").expandableSelect("destroy")},setUpUserType:function(){var e=this,t=["mine","unseen","others","confirmer","superior","owners","suggestionOwners","kaizenOwners"].map(function(t){return{value:t,title:e.t("filter:user:"+t+":title"),optionLabel:e.t("filter:user:"+t)}});n(e.$id("userType"),{label:e.t("filter:user:others"),options:t})},toggleUserSelect2:function(e){var t=this.$('input[name="userType"]').val(),r="mine"===t||"unseen"===t,i=this.$id("user").select2("enable",!r);!e||!r&&i.val()||i.select2("data",{id:s.data._id,text:s.getLabel()})}})});