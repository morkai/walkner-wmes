define(["underscore","../i18n","../time","../core/Model"],function(t,e,i,r){"use strict";return r.extend({urlRoot:"/qi/reports/count",nlsDomain:"qiResults",defaults:function(){return{from:0,to:0,interval:"month",productFamilies:[],kinds:[],errorCategories:[],faultCodes:[],inspector:"",divisions:{},selectedGroupKey:null,groups:{},ignoredDivisions:{}}},fetch:function(e){t.isObject(e)||(e={});var i=e.data=t.assign(e.data||{},t.pick(this.attributes,["from","to","interval","productFamilies","kinds","errorCategories","faultCodes","inspector"]));return i.kinds=i.kinds.join(","),i.errorCategories=i.errorCategories.join(","),i.faultCodes=i.faultCodes.join(","),r.prototype.fetch.call(this,e)},genClientUrl:function(){return"/qi/reports/count?from="+this.get("from")+"&to="+this.get("to")+"&interval="+this.get("interval")+"&productFamilies="+this.get("productFamilies")+"&kinds="+this.get("kinds")+"&errorCategories="+this.get("errorCategories")+"&faultCodes="+this.get("faultCodes")+"&inspector="+this.get("inspector")},parse:function(t){return{divisions:t.divisions,selectedGroupKey:null,groups:t.groups}},getSelectedGroup:function(){var e=this.get("selectedGroupKey"),i=this.get("groups");return e?t.find(i,function(t){return t.key===e}):i[0]},selectNearestGroup:function(t){for(var e=this.get("groups"),i=null,r=0;r<e.length;++r){var s=e[r].key,o=e[r+1];if(!o||t<s){i=s;break}var n=o.key;if(t>=s&&t<n){i=s;break}}this.set("selectedGroupKey",i)},toggleDivision:function(e,i){var r=t.clone(this.attributes.ignoredDivisions);i?delete r[e]:r[e]=!0,this.set("ignoredDivisions",r)},hasAnyIgnoredDivisions:function(){return!t.isEmpty(this.attributes.ignoredDivisions)},isIgnoredDivision:function(t){return!!this.attributes.ignoredDivisions[t]}},{fromQuery:function(e){var r=+e.from,s=+e.to;return r||s||(r=i.getMoment().startOf("month").subtract(6,"months").valueOf()),new this({from:r||0,to:s||0,interval:e.interval||void 0,productFamilies:t.isEmpty(e.productFamilies)?"":e.productFamilies,kinds:t.isEmpty(e.kinds)?[]:e.kinds.split(","),errorCategories:t.isEmpty(e.errorCategories)?[]:e.errorCategories.split(","),faultCodes:t.isEmpty(e.faultCodes)?[]:e.faultCodes.split(","),inspector:t.isEmpty(e.inspector)?"":e.inspector})}})});