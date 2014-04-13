define(["../i18n","../time","../data/divisions","../data/views/renderOrgUnitPath","../core/Model"],function(e,t,i,n,l){return l.extend({urlRoot:"/hourlyPlans",clientUrlRoot:"#hourlyPlans",topicPrefix:"hourlyPlans",privilegePrefix:"HOURLY_PLANS",nlsDomain:"hourlyPlans",defaults:{division:null,date:null,shift:null,flows:null,createdAt:null,creator:null,updatedAt:null,updater:null},getLabel:function(){return this.get("division")+", "+t.format(this.get("date"),"LL")},serialize:function(){var l=i.get(this.get("division"));return{division:l?n(l,!1,!1):"?",date:t.format(this.get("date"),"LL"),shift:e("core","SHIFT:"+this.get("shift")),flows:this.get("flows")}},isEditable:function(e){if(e.isAllowedTo("PROD_DATA:MANAGE"))return!0;if(!e.isAllowedTo("HOURLY_PLANS:MANAGE"))return!1;var t=e.getDivision();if(!e.isAllowedTo("HOURLY_PLANS:ALL")&&t&&t.id!==this.get("division"))return!1;var i=Date.parse(this.get("createdAt"));return Date.now()<i+288e5},handleUpdateMessage:function(e){var t=this.get("flows");if(t){var i=t[e.flowIndex];if(i){if("plan"===e.type)i.noPlan=e.newValue,i.level=0,i.hours=i.hours.map(function(){return 0});else{if("count"!==e.type)return;"number"==typeof e.hourIndex?i.hours[e.hourIndex]=e.newValue:i.level=e.newValue}this.trigger("change:flows"),this.trigger("change")}}}})});