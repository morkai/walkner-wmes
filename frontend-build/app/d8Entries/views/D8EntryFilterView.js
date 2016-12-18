// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/time","app/core/views/FilterView","app/users/util/setUpUserSelect2","app/d8Entries/dictionaries","app/d8Entries/templates/filter"],function(e,s,t,r,i,n){"use strict";return t.extend({template:n,events:e.extend({'change input[name="userType"]':"toggleUserSelect2","keyup select":function(e){return 27===e.keyCode?(e.target.selectedIndex=-1,!1):void 0},"dblclick select":function(e){e.target.selectedIndex=-1}},t.prototype.events),defaultFormData:function(){return{status:[].concat(i.statuses),division:null,entrySource:null,problemSource:null,userType:"others",user:null,from:"",to:""}},termToForm:{division:function(e,s,t){t[e]=s.args[1]},"owner.id":function(e,s,t){t.userType="owner",t.user=s.args[1]},"observers.user.id":function(e,s,t){"mine"===s.args[1]?(t.userType="mine",t.user=null):"unseen"===s.args[1]?(t.userType="unseen",t.user=null):(t.userType="others",t.user=s.args[1])},crsRegisterDate:function(e,t,r){r["ge"===t.name?"from":"to"]=s.format(t.args[1],"YYYY-MM-DD")},status:"division",entrySource:"division",problemSource:"division"},serialize:function(){return e.extend(t.prototype.serialize.call(this),{statuses:i.statuses,divisions:i.divisions.toJSON(),entrySources:i.entrySources.toJSON(),problemSources:i.problemSources.toJSON()})},serializeFormToQuery:function(e){var t=s.getMoment(this.$id("from").val(),"YYYY-MM-DD"),r=s.getMoment(this.$id("to").val(),"YYYY-MM-DD"),i=this.$('input[name="userType"]:checked').val(),n=this.$id("user").val();t.isValid()&&e.push({name:"ge",args:["crsRegisterDate",t.valueOf()]}),r.isValid()&&(r.valueOf()===t.valueOf()&&this.$id("to").val(r.add(1,"days").format("YYYY-MM-DD")),e.push({name:"lt",args:["crsRegisterDate",r.valueOf()]})),"mine"===i||"unseen"===i?e.push({name:"eq",args:["observers.user.id",i]}):n&&e.push({name:"eq",args:["owner"===i?"owner.id":"observers.user.id",n]}),["entrySource","problemSource","division","status"].forEach(function(s){var t=this.$id(s).val();t&&e.push({name:"eq",args:[s,t]})},this)},afterRender:function(){t.prototype.afterRender.call(this),r(this.$id("user"),{view:this}),this.toggleUserSelect2()},toggleUserSelect2:function(){var e=this.$('input[name="userType"]:checked').val();this.$id("user").select2("enable","others"===e||"owner"===e)}})});