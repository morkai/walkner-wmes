define(["underscore","app/time","app/user","app/core/views/FilterView","app/core/util/forms/dateTimeRange","app/core/util/idAndLabel","app/data/orgUnits","app/users/util/setUpUserSelect2","app/mrpControllers/util/setUpMrpSelect2","../dictionaries","../Entry","app/wmes-fap-entries/templates/filter","app/core/util/ExpandableSelect"],function(e,t,i,s,a,r,n,o,l,u,p,c){"use strict";var d=["createdAt","order","mrp","category","subdivisionType","divisions","level","limit"],g={orderNo:"order",nc12:"order",productName:"search",problem:"search"};return s.extend({template:c,events:e.assign({"click a[data-date-time-range]":a.handleRangeEvent,'change input[name="userType"]':function(){this.toggleUserSelect2(!0)},'change input[name="statusType"]':"toggleStatus","click a[data-filter]":function(e){e.preventDefault(),this.showFilter(e.currentTarget.dataset.filter)},"click #-level .active":function(e){setTimeout(function(){e.currentTarget.classList.remove("active"),e.currentTarget.querySelector("input").checked=!1},1)}},s.prototype.events),defaultFormData:function(){return{userType:"others",statusType:"specific"}},termToForm:{createdAt:a.rqlToForm,orderNo:function(e,t,i){i.order=t.args[1]},nc12:"orderNo",search:function(e,t,i){i[e]=t.args[1]},level:"search","observers.user.id":function(e,t,s){t.args[1]===i.data._id?(s.userType="mine",s.user=i.data._id):"unseen"===t.args[1]?(s.userType="unseen",s.user=null):(s.userType="others",s.user=t.args[1])},status:function(e,t,i){i[e]="in"===t.name?t.args[1]:[t.args[1]]},divisions:"status",mrp:function(e,t,i){i[e]=Array.isArray(t.args[1])?t.args[1].join(","):""},category:"mrp",subCategory:"mrp",analysisNeed:function(e,t,i){i[e]=t.args[1],i.statusType=void 0===i.analysisNeed||void 0===i.analysisDone?"specific":"analysis"},analysisDone:"analysisNeed",subdivisionType:"divisions"},serializeTermToForm:function(e,t){if("or"===e.name){var i=[];return e.args.forEach(function(e){"in"!==e.name||"category"!==e.args[0]&&"subCategory"!==e.args[0]||(i=i.concat(e.args[1]))}),void(i.length&&(t.category=i.join(",")))}s.prototype.serializeTermToForm.apply(this,arguments)},serialize:function(){return e.assign(s.prototype.serialize.call(this),{filters:d,statuses:["pending","started","finished"],divisions:n.getAllByType("division").filter(function(e){return e.isActive()&&"prod"===e.get("type")}).map(r),subdivisionTypes:p.SUBDIVISION_TYPES})},serializeFormToQuery:function(t){var s=this.$('input[name="userType"]:checked').val(),r=this.$('input[name="statusType"]:checked').val(),n=this.$('input[name="level"]:checked').val(),o=(this.$id("status").val()||[]).filter(function(t){return!e.isEmpty(t)}),l=(this.$id("divisions").val()||[]).filter(function(t){return!e.isEmpty(t)}),p=(this.$id("subdivisionType").val()||[]).filter(function(t){return!e.isEmpty(t)}),c=this.$id("user").val(),d=this.$id("order").val().trim(),g=this.$id("mrp").val(),h=this.$id("category").val(),f=this.$id("search").val().trim();if(a.formToRql(this,t),"mine"===s?t.push({name:"eq",args:["observers.user.id",i.data._id]}):"unseen"===s?t.push({name:"eq",args:["observers.user.id",s]}):c&&t.push({name:"eq",args:["observers.user.id",c]}),9===d.length?t.push({name:"eq",args:["orderNo",d]}):d.length&&t.push({name:"eq",args:["nc12",d]}),"specific"===r&&o.length?t.push({name:"in",args:["status",o]}):"analysis"===r&&t.push({name:"eq",args:["analysisNeed",!0]},{name:"eq",args:["analysisDone",!1]}),n>=0&&t.push({name:"eq",args:["level",+n]}),g&&g.length&&t.push({name:"in",args:["mrp",g.split(",")]}),h&&h.length){var m=[],v=[];h.split(",").forEach(function(e){u.categories.get(e)?m.push(e):u.subCategories.get(e)&&v.push(e)}),m.length&&v.length?t.push({name:"or",args:[{name:"in",args:["category",m]},{name:"in",args:["subCategory",v]}]}):m.length?t.push({name:"in",args:["category",m]}):v.length&&t.push({name:"in",args:["subCategory",v]})}l.length&&t.push({name:"in",args:["divisions",l]}),p.length&&t.push({name:"in",args:["subdivisionType",p]}),f.length&&t.push({name:"eq",args:["search",f]})},afterRender:function(){s.prototype.afterRender.call(this),this.$id("limit").parent().attr("data-filter","limit"),this.$(".is-expandable").expandableSelect(),o(this.$id("user"),{view:this,width:"300px"}),l(this.$id("mrp"),{own:!0,view:this,width:"250px"}),this.setUpCategorySelect2(),this.toggleButtonGroup("level"),this.toggleUserSelect2(!1),this.toggleStatus(),this.toggleFilters()},destroy:function(){s.prototype.destroy.call(this),this.$(".is-expandable").expandableSelect("destroy")},setUpCategorySelect2:function(){var e={};u.subCategories.forEach(function(t){if(t.get("active")){var i=t.get("parent");e[i]||(e[i]=[]),e[i].push(t)}}),this.$id("category").select2({width:"280px",multiple:!0,allowClear:!0,data:u.categories.filter(function(e){return e.get("active")}).map(function(t){var i=e[t.id];return{id:t.id,text:t.getLabel(),children:i?i.map(r):[]}})})},toggleUserSelect2:function(e){var t=this.$('input[name="userType"]:checked').val(),s=this.$id("user").select2("enable","others"===t);e&&s.val()===i.data._id&&s.select2("data",null)},toggleStatus:function(){var e=this.$('input[name="statusType"]:checked').val();this.$id("status").prop("disabled","specific"!==e)},toggleFilters:function(){var e=this;d.forEach(function(t){e.$('.form-group[data-filter="'+t+'"]').toggleClass("hidden","limit"===t||!e.filterHasValue(t))})},filterHasValue:function(e){if("createdAt"===e){var t=this.$id("from-date"),i=this.$id("to-date");return t.val().length>0||i.val().length>0}var s=this.$id(e),a=s.hasClass("btn-group")?s.find(".active > input").val():s.val();return"string"==typeof a&&a.length>0},showFilter:function(e){this.$('.form-group[data-filter="'+(g[e]||e)+'"]').removeClass("hidden").find("input, select").first().focus()}})});