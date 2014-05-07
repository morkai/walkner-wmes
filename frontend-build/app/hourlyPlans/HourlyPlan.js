// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../i18n","../time","../data/divisions","../data/views/renderOrgUnitPath","../core/Model"],function(e,t,i,n,r){return r.extend({urlRoot:"/hourlyPlans",clientUrlRoot:"#hourlyPlans",topicPrefix:"hourlyPlans",privilegePrefix:"HOURLY_PLANS",nlsDomain:"hourlyPlans",defaults:{division:null,date:null,shift:null,flows:null,createdAt:null,creator:null,updatedAt:null,updater:null},getLabel:function(){return this.get("division")+", "+t.format(this.get("date"),"LL")},serialize:function(){var r=i.get(this.get("division"));return{division:r?n(r,!1,!1):"?",date:t.format(this.get("date"),"LL"),shift:e("core","SHIFT:"+this.get("shift")),flows:this.get("flows")}},isEditable:function(e){if(e.isAllowedTo("PROD_DATA:MANAGE"))return!0;if(!e.isAllowedTo(this.getPrivilegePrefix()+":MANAGE"))return!1;var t=Date.parse(this.get("createdAt"));if(Date.now()>=t+288e5)return!1;var i=e.getDivision();if(!i||e.isAllowedTo(this.getPrivilegePrefix()+":ALL"))return!0;var n=this.get("division");return n===i.id},handleUpdateMessage:function(e){var t=this.get("flows");if(t){var i=t[e.flowIndex];if(i){if("plan"===e.type)i.noPlan=e.newValue,i.level=0,i.hours=i.hours.map(function(){return 0});else{if("count"!==e.type)return;"number"==typeof e.hourIndex?i.hours[e.hourIndex]=e.newValue:i.level=e.newValue}this.trigger("change:flows"),this.trigger("change")}}}})});