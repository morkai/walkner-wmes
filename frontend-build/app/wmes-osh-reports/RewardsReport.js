define(["underscore","h5.rql/index","app/i18n","app/time","app/core/Model","./util/createDefaultFilter"],function(t,e,r,n,s,i){"use strict";return s.extend({urlRoot:"/osh/reports/rewards",nlsDomain:"wmes-osh-reports",defaults:function(){return{loading:!1,settings:{},users:[]}},initialize:function(t,e){this.rqlQuery=e.rqlQuery&&!e.rqlQuery.isEmpty()?e.rqlQuery:i({orgUnitProperty:null,dateProperty:!1,extraTerms:t=>{t.push({name:"eq",args:["status","payout"]})}}),this.on("request",()=>this.set({loading:!0,users:[]})),this.on("sync error",()=>this.set("loading",!1))},fetch:function(e){return t.isObject(e)||(e={}),e.data=this.rqlQuery.toString(),s.prototype.fetch.call(this,e)},genClientUrl:function(){return`${this.urlRoot}?${this.rqlQuery.toString()}`},parse:function(t){return t.loaded=!0,t},getMinPayout:function(){return this.get("settings").minPayout||1},hasAnyPayouts:function(){const t=this.getMinPayout();return this.get("users").some(e=>e.payout[1]>=t)},getPayouts:function(){const t=this.getMinPayout();return this.get("users").filter(e=>e.payout[1]>=t)}})});