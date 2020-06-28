define(["underscore","app/time","app/user","app/viewport","app/core/views/FormView","app/users/util/setUpUserSelect2","app/kaizenOrders/dictionaries","app/suggestions/templates/accept"],function(e,t,i,s,n,r,a,c){"use strict";return n.extend({template:c,events:e.assign({"click #-accept":function(){this.status="inProgress",this.checkKaizenOwnersValidity(),this.el.reportValidity()&&this.submitForm()},"click #-reject":function(){this.status="new",this.checkKaizenOwnersValidity(),this.el.reportValidity()&&this.submitForm()},"click #-cancel":function(){this.status="cancelled",this.checkKaizenOwnersValidity(),this.el.reportValidity()&&this.submitForm()}},n.prototype.events),afterRender:function(){n.prototype.afterRender.apply(this,arguments),this.setUpKaizenOwnersSelect2()},setUpKaizenOwnersSelect2:function(){r(this.$id("kaizenOwners"),{multiple:!0,activeOnly:!0,noPersonnelId:!0,maximumSelectionSize:2}).select2("data",this.model.get("suggestionOwners").map(function(e){return{id:e.id,text:e.label}}))},serializeToForm:function(){return{}},serializeForm:function(e){return{status:this.status,kaizenOwners:"inProgress"===this.status?r.getUserInfo(this.$id("kaizenOwners")):[],kaizenStartDate:"inProgress"===this.status?t.getMoment().startOf("day").toISOString():null,kaizenFinishDate:null,comment:e.comment}},request:function(e){return this.ajax({method:"PUT",url:this.model.url(),data:JSON.stringify(e)})},getFailureText:function(){return this.t("accept:failure")},handleSuccess:function(){s.closeDialog()},checkKaizenOwnersValidity:function(){var e=this.$id("kaizenOwners"),t="";"inProgress"===this.status&&""===e.val()&&(t=this.t("accept:kaizenOwners:required")),e[0].setCustomValidity(t)}})});