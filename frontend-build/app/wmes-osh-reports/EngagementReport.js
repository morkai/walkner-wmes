define(["underscore","h5.rql/index","app/i18n","app/time","app/core/Model"],function(t,e,r,n,s){"use strict";return s.extend({urlRoot:"/osh/reports/engagement",nlsDomain:"wmes-osh-reports",defaults:function(){return{settings:{},months:[],orgUnits:[],users:[]}},initialize:function(t,r){this.rqlQuery=r.rqlQuery&&!r.rqlQuery.isEmpty()?r.rqlQuery:e.parse(`date>=${n.getMoment().startOf("month").subtract(3,"months").valueOf()}`)},fetch:function(e){return t.isObject(e)||(e={}),e.data=this.rqlQuery.toString(),s.prototype.fetch.call(this,e)},genClientUrl:function(){return`${this.urlRoot}?${this.rqlQuery.toString()}`},parse:function(t){return{settings:t.settings,months:t.months,orgUnits:t.orgUnits,users:t.users}}})});