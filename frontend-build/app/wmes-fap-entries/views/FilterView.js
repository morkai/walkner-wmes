define(["underscore","app/time","app/user","app/core/views/FilterView","app/core/util/forms/dateTimeRange","app/core/util/idAndLabel","app/data/orgUnits","app/users/util/setUpUserSelect2","app/mrpControllers/util/setUpMrpSelect2","../dictionaries","app/wmes-fap-entries/templates/filter","app/core/util/ExpandableSelect"],function(e,t,s,i,a,r,n,l,o,u,d){"use strict";var p=["createdAt","order","mrp","category","divisions","limit"],c={orderNo:"order",nc12:"order",productName:"search",problem:"search"};return i.extend({template:d,events:e.assign({"click a[data-date-time-range]":a.handleRangeEvent,'change input[name="userType"]':function(){this.toggleUserSelect2(!0)},'change input[name="statusType"]':"toggleStatus","click a[data-filter]":function(e){e.preventDefault(),this.showFilter(e.currentTarget.dataset.filter)}},i.prototype.events),defaultFormData:function(){return{userType:"others",statusType:"specific"}},termToForm:{createdAt:a.rqlToForm,orderNo:function(e,t,s){s.order=t.args[1]},search:function(e,t,s){s.search=t.args[1]},nc12:"orderNo","observers.user.id":function(e,t,i){t.args[1]===s.data._id?(i.userType="mine",i.user=s.data._id):"unseen"===t.args[1]?(i.userType="unseen",i.user=null):(i.userType="others",i.user=t.args[1])},status:function(e,t,s){s[e]="in"===t.name?t.args[1]:[t.args[1]]},divisions:"status",mrp:function(e,t,s){s[e]=Array.isArray(t.args[1])?t.args[1].join(","):""},category:"mrp",analysisNeed:function(e,t,s){s[e]=t.args[1],s.statusType=void 0===s.analysisNeed||void 0===s.analysisDone?"specific":"analysis"},analysisDone:"analysisNeed"},serialize:function(){return e.assign(i.prototype.serialize.call(this),{filters:p,statuses:["pending","started","finished"],divisions:n.getAllByType("division").filter(function(e){return e.isActive()&&"prod"===e.get("type")}).map(r)})},serializeFormToQuery:function(t){var i=this.$('input[name="userType"]:checked').val(),r=this.$('input[name="statusType"]:checked').val(),n=(this.$id("status").val()||[]).filter(function(t){return!e.isEmpty(t)}),l=(this.$id("divisions").val()||[]).filter(function(t){return!e.isEmpty(t)}),o=this.$id("user").val(),u=this.$id("order").val().trim(),d=this.$id("mrp").val(),p=this.$id("category").val(),c=this.$id("search").val().trim();a.formToRql(this,t),"mine"===i?t.push({name:"eq",args:["observers.user.id",s.data._id]}):"unseen"===i?t.push({name:"eq",args:["observers.user.id",i]}):o&&t.push({name:"eq",args:["observers.user.id",o]}),9===u.length?t.push({name:"eq",args:["orderNo",u]}):7!==u.length&&12!==u.length||t.push({name:"eq",args:["nc12",u]}),"specific"===r&&n.length?t.push({name:"in",args:["status",n]}):"analysis"===r&&t.push({name:"eq",args:["analysisNeed",!0]},{name:"eq",args:["analysisDone",!1]}),d&&d.length&&t.push({name:"in",args:["mrp",d.split(",")]}),p&&p.length&&t.push({name:"in",args:["category",p.split(",")]}),l.length&&t.push({name:"in",args:["divisions",l]}),c.length&&t.push({name:"eq",args:["search",c]})},afterRender:function(){i.prototype.afterRender.call(this),this.$id("limit").parent().attr("data-filter","limit"),this.$(".is-expandable").expandableSelect(),l(this.$id("user"),{view:this,width:"300px"}),o(this.$id("mrp"),{own:!0,view:this,width:"250px"}),this.$id("category").select2({width:"280px",multiple:!0,allowClear:!0,data:u.categories.map(r)}),this.toggleUserSelect2(!1),this.toggleStatus(),this.toggleFilters()},destroy:function(){i.prototype.destroy.call(this),this.$(".is-expandable").expandableSelect("destroy")},toggleUserSelect2:function(e){var t=this.$('input[name="userType"]:checked').val(),i=this.$id("user").select2("enable","others"===t);e&&i.val()===s.data._id&&i.select2("data",null)},toggleStatus:function(){var e=this.$('input[name="statusType"]:checked').val();this.$id("status").prop("disabled","specific"!==e)},toggleFilters:function(){var e=this;p.forEach(function(t){e.$('.form-group[data-filter="'+t+'"]').toggleClass("hidden","limit"===t||!e.filterHasValue(t))})},filterHasValue:function(e){if("createdAt"===e){var t=this.$id("from-date"),s=this.$id("to-date");return t.val().length>0||s.val().length>0}return(this.$id(e).val()||"").length>0},showFilter:function(e){this.$('.form-group[data-filter="'+(c[e]||e)+'"]').removeClass("hidden").find("input, select").first().focus()}})});