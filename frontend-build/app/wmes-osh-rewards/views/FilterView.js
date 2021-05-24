define(["app/user","app/core/views/FilterView","app/core/util/forms/dateTimeRange","app/users/util/setUpUserSelect2","app/wmes-osh-common/dictionaries","app/wmes-osh-common/views/OrgUnitPickerFilterView","app/wmes-osh-rewards/Reward","app/wmes-osh-rewards/templates/filter"],function(e,t,i,a,s,n,r,o){"use strict";return t.extend({template:o,events:Object.assign({"click a[data-date-time-range]":i.handleRangeEvent,'change input[name="mode"]':function(){this.toggleMode()}},t.prototype.events),filterMap:{createdAt:"date",paidAt:"date"},defaultFormData:function(){return{dateFilter:"createdAt"}},termToForm:{createdAt:i.rqlToForm,paidAt:i.rqlToForm,division:(e,t,i)=>{i.mode="orgUnit"},workplace:"division",department:"division",paid:(e,t,i)=>{i.status=t.args[1]?"paid":"unpaid"},leader:(e,t,i)=>{i[e]=t.args[1],i.mode="leader"},employee:(e,t,i)=>{i[e]=t.args[1],i.mode="employee"}},initialize:function(){t.prototype.initialize.apply(this,arguments),r.can.viewAll()&&(this.orgUnitPickerView=new n({filterView:this,emptyLabel:this.t("wmes-osh-reports","filter:orgUnit"),orgUnitTypes:["division","workplace","department"],labelInput:{name:"mode",value:"orgUnit"}}),this.setView("#-orgUnit",this.orgUnitPickerView))},serializeFormToQuery:function(t,a){const s=this.$('input[name="dateFilter"]:checked').val();a.sort={},a.sort[s]=-1,i.formToRql(this,t);const n=this.$id("status").val();"paid"===n?t.push({name:"eq",args:["paid",!0]}):"unpaid"===n&&t.push({name:"eq",args:["paid",!1]});const o=this.$('input[name="mode"]:checked').val();if("orgUnit"!==o)if(r.can.viewAll()){const e=this.$id(o).val();e&&t.push({name:"eq",args:[o,e]})}else t.push({name:"eq",args:[o,e.data._id]})},getTemplateData:function(){return{showOrgUnitFilter:r.can.viewAll()}},afterRender:function(){t.prototype.afterRender.call(this),a(this.$id("leader"),{view:this,width:"300px"}),a(this.$id("employee"),{view:this,width:"300px"}),this.toggleMode()},toggleMode:function(){const t=this.$('input[name="mode"]:checked').val();if(t)if(r.can.viewAll())this.orgUnitPickerView.toggle("orgUnit"===t),this.$id("leader").select2("enable","leader"===t),this.$id("employee").select2("enable","employee"===t);else{const t=a.userToData(Object.assign({},e.data));this.$id("leader").select2("data",t).select2("enable",!1),this.$id("employee").select2("data",t).select2("enable",!1)}else this.$('input[name="mode"]').first().click()}})});