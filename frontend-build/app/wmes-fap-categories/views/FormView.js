define(["underscore","app/time","app/data/orgUnits","app/data/prodFunctions","app/core/util/idAndLabel","app/core/views/FormView","app/users/util/setUpUserSelect2","app/wmes-fap-categories/templates/form"],function(t,i,e,n,s,o,a,r){"use strict";return o.extend({template:r,events:t.assign({"click #-addNotification":function(){this.addNotification({subdivisions:[],prodFunctions:[]}),this.$id("notifications").children().last().find("input").first().focus()},'click [data-action="removeNotification"]':function(t){var i=this.$(t.target).closest("tr");i.find("input").select2("destroy"),i.remove()},"input #-tester-mrp, #-tester-orderNo, #-tester-nc12":"testNotifications","change #-tester-date":"testNotifications",'change input[name^="notifications"]':"testNotifications"},o.prototype.events),initialize:function(){o.prototype.initialize.apply(this,arguments),this.i=0,this.subdivisions=e.getAllByType("division").map(function(t){var i=t.getLabel();return{text:i,children:e.getChildren(t).map(function(t){return{id:t.id,text:t.getLabel(),divisionText:i}})}}),this.prodFunctions=n.map(s)},afterRender:function(){o.prototype.afterRender.apply(this,arguments),a(this.$id("users"),{view:this,multiple:!0}),this.$notification=this.$id("notifications").children().first().detach(),this.$notifiedUser=this.$id("tester").children().first().detach(),(this.model.get("notifications")||[]).forEach(this.addNotification,this),this.addNotification({subdivisions:[],prodFunctions:[]})},addNotification:function(t){var i=this.$notification.clone(),e=++this.i;i.find('input[name$="subdivisions"]').prop("name","notifications["+e+"].subdivisions").val(t.subdivisions.join(",")).select2({width:"500px",placeholder:" ",allowClear:!0,multiple:!0,data:this.subdivisions,formatSelection:function(t,i,e){return e(t.divisionText+" \\ "+t.text)}}),i.find('input[name$="prodFunctions"]').prop("name","notifications["+e+"].prodFunctions").val(t.prodFunctions.join(",")).select2({width:"500px",placeholder:" ",allowClear:!0,multiple:!0,data:this.prodFunctions}),this.$id("notifications").append(i)},serializeToForm:function(){var t=this.model.toJSON();return t.users=(t.users||[]).map(function(t){return t.id}).join(","),t},serializeForm:function(t){return t.users=(this.$id("users").select2("data")||[]).map(function(t){return{id:t.id,label:t.text}}),t.notifications=(t.notifications||[]).map(function(t){return{subdivisions:(t.subdivisions||"").split(",").filter(function(t){return!!t.length}),prodFunctions:(t.prodFunctions||"").split(",").filter(function(t){return!!t.length})}}).filter(function(t){return!!t.prodFunctions.length}),t},testNotifications:function(){var e=this;e.testReq&&e.testReq.abort();var s=e.$id("tester-mrp").val(),o=e.$id("tester-orderNo").val(),a=e.$id("tester-nc12").val(),r=e.$id("tester-date").val(),d=e.getFormData();if(!(s.length<3&&o.length<9)){var c=i.getMoment(r,"YYYY-MM-DD[T]HH:mm");c.isValid()&&(r=c.valueOf()),e.testReq=e.ajax({method:"POST",url:"/fap/entries;resolve-participants",data:JSON.stringify({mrp:s,orderNo:o,nc12:a,date:r,users:d.users,notifications:d.notifications,category:null})}),e.testReq.fail(function(){e.$id("tester").empty()}),e.testReq.done(function(i){var s="";i.users.forEach(function(i){var o=n.get(i.prodFunction);s+='<tr><td class="is-min">'+t.escape(i.lastName)+" "+t.escape(i.firstName)+'</td><td class="is-min">'+t.escape(o?o.getLabel():i.prodFunction)+'</td><td class="is-min">'+t.escape(i.kdPosition)+'</td><td class="is-min">'+e.t("core","BOOL:"+i.sms)+"</td><td></td>"}),e.$id("tester").html(s)}),e.testReq.always(function(){e.testReq=null})}}})});