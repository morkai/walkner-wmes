define(["moment","../data/divisions","../data/views/renderOrgUnitPath","../core/Model"],function(e,t,n,i){return i.extend({urlRoot:"/hourlyPlans",clientUrlRoot:"#hourlyPlans",topicPrefix:"hourlyPlans",privilegePrefix:"HOURLY_PLANS",nlsDomain:"hourlyPlans",defaults:{division:null,date:null,shift:null,flows:null,locked:!1,createdAt:null,creatorId:null,creatorLabel:null,updatedAt:null,updaterId:null,updaterLabel:null},serialize:function(){var i=t.get(this.get("division"));return{division:i?n(i,!1,!1):"?",date:e(this.get("date")).format("LL"),shift:this.get("shift"),flows:this.get("flows"),locked:!!this.get("locked")}}})});