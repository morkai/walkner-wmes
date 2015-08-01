// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/time","app/core/views/FilterView","app/users/util/setUpUserSelect2","../dictionaries","app/kaizenOrders/templates/filter"],function(e,s,t,r,a,n){"use strict";return t.extend({template:n,events:e.extend({'change input[name="userType"]':"toggleUserSelect2","keyup select":function(e){return 27===e.keyCode?(e.target.selectedIndex=-1,!1):void 0},"dblclick select":function(e){e.target.selectedIndex=-1}},t.prototype.events),defaultFormData:function(){return{types:[].concat(a.types),status:[].concat(a.statuses),section:null,area:null,category:null,risk:null,cause:null,userType:"others",user:null,from:"",to:""}},termToForm:{types:function(e,s,t){t[e]=s.args[1]},nearMissCategory:function(e,s,t){t.category="nearMiss."+s.args[1]},suggestionCategory:function(e,s,t){t.category="suggestion."+s.args[1]},"owners.id":function(e,s,t){t.userType="owner",t.user=s.args[1]},"observers.user.id":function(e,s,t){"mine"===s.args[1]?(t.userType="mine",t.user=null):"unseen"===s.args[1]?(t.userType="unseen",t.user=null):(t.userType="others",t.user=s.args[1])},eventDate:function(e,t,r){r["ge"===t.name?"from":"to"]=s.format(t.args[1],"YYYY-MM-DD")},status:function(e,s,t){t.status="in"===s.name?"open":s.args[1]},section:"types",area:"types",risk:"types",cause:"types"},serialize:function(){return e.extend(t.prototype.serialize.call(this),{multi:!!window.KAIZEN_MULTI,types:a.types,statuses:a.statuses,sections:a.sections.toJSON(),areas:a.areas.toJSON(),nearMissCategories:e.invoke(a.categories.inNearMiss(),"toJSON"),suggestionCategories:e.invoke(a.categories.inSuggestion(),"toJSON"),risks:a.risks.toJSON(),causes:a.causes.toJSON()})},serializeFormToQuery:function(e){var t=s.getMoment(this.$id("from").val(),"YYYY-MM-DD"),r=s.getMoment(this.$id("to").val(),"YYYY-MM-DD"),a=this.$id("category").val().split("."),n=this.$('input[name="userType"]:checked').val(),i=this.$id("user").val(),o=this.$id("status").val();t.isValid()&&e.push({name:"ge",args:["eventDate",t.valueOf()]}),r.isValid()&&(r.valueOf()===t.valueOf()&&this.$id("to").val(r.add(1,"days").format("YYYY-MM-DD")),e.push({name:"lt",args:["eventDate",r.valueOf()]})),2===a.length&&e.push({name:"eq",args:[a[0]+"Category",a[1]]}),"mine"===n||"unseen"===n?e.push({name:"eq",args:["observers.user.id",n]}):i&&e.push({name:"eq",args:["owner"===n?"owners.id":"observers.user.id",i]}),"open"===o?e.push({name:"in",args:["status",["new","accepted","todo","inProgress","paused"]]}):o&&e.push({name:"eq",args:["status",o]}),["types","section","area","risk","cause"].forEach(function(s){var t=this.$id(s).val();t&&e.push({name:"eq",args:[s,t]})},this)},afterRender:function(){t.prototype.afterRender.call(this),r(this.$id("user"),{view:this}),this.toggleUserSelect2()},toggleUserSelect2:function(){var e=this.$('input[name="userType"]:checked').val();this.$id("user").select2("enable","others"===e||"owner"===e)}})});