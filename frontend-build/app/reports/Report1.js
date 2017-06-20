// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../i18n","../data/aors","../data/downtimeReasons","../data/orgUnits","../data/views/renderOrgUnitPath","../core/Model"],function(e,t,i,n,o,r,s){"use strict";return s.extend({urlRoot:"/reports/1",defaults:function(){return{isParent:!1,orgUnitType:null,orgUnit:null,coeffs:{quantityDone:[],downtime:[],scheduledDowntime:[],unscheduledDowntime:[],efficiency:[],productivity:[],productivityNoWh:[]},maxCoeffs:{quantityDone:0,downtime:0,scheduledDowntime:0,unscheduledDowntime:0,efficiency:0,productivity:0,productivityNoWh:0},downtimesByAor:[],maxDowntimesByAor:0,downtimesByReason:[],maxDowntimesByReason:0}},initialize:function(e,t){if(!t.query)throw new Error("query option is required!");this.query=t.query},fetch:function(t){return e.isObject(t)||(t={}),t.data=e.extend(t.data||{},this.query.serializeToObject(this.get("orgUnitType"),this.get("orgUnit"))),s.prototype.fetch.call(this,t)},parse:function(e){var t={coeffs:{quantityDone:[],downtime:[],scheduledDowntime:[],unscheduledDowntime:[],efficiency:[],productivity:[],productivityNoWh:[]},maxCoeffs:{quantityDone:0,downtime:0,scheduledDowntime:0,unscheduledDowntime:0,efficiency:0,productivity:0,productivityNoWh:0},downtimesByAor:[],maxDowntimesByAor:0,downtimesByReason:[],maxDowntimesByReason:0};return this.parseCoeffs(e.coeffs,t),this.parseDowntimesByAor(e.downtimes.byAor,t),this.parseDowntimesByReason(e.downtimes.byReason,t),t},parseCoeffs:function(e,t){function i(e,t,i){o[e].push({x:t,y:i}),i>r[e]&&(r[e]=i)}function n(e,t,n){i(e,t,Math.round(100*(n||0)))}for(var o=t.coeffs,r=t.maxCoeffs,s=0,u=e.length;s<u;++s){var a=e[s],d=Date.parse(a.key);i("quantityDone",d,a.quantityDone||0),n("downtime",d,a.downtime),n("scheduledDowntime",d,a.scheduledDowntime),n("unscheduledDowntime",d,a.unscheduledDowntime),n("efficiency",d,a.efficiency),n("productivity",d,a.productivity),n("productivityNoWh",d,a.productivityNoWh)}},parseDowntimesByAor:function(e,n){if(e){for(var o=Object.keys(e),r=0,s=o.length;r<s;++r){var u,a,d=o[r];if("null"===d)u=t("reports","downtimesByAor:press:longText"),a=t("reports","downtimesByAor:press:shortText");else{var y=i.get(d);u=y?y.getLabel():d;var c=u.indexOf("-");a=c===-1?u>13?u.substr(0,10).trim()+"...":u:u.substr(0,c).trim()}var f=Math.round(100*e[d])/100;n.downtimesByAor.push({key:d,longText:u,shortText:a,value:f}),f>n.maxDowntimesByAor&&(n.maxDowntimesByAor=f)}n.downtimesByAor.sort(function(e,t){return t.value-e.value})}},parseDowntimesByReason:function(e,t){if(e){for(var i=Object.keys(e),o=0,r=i.length;o<r;++o){var s=i[o],u=n.get(s),a=Math.round(100*e[s])/100;t.downtimesByReason.push({key:s,longText:u?u.getLabel():s,shortText:s,value:a}),a>t.maxDowntimesByReason&&(t.maxDowntimesByReason=a)}t.downtimesByReason.sort(function(e,t){return t.value-e.value})}},getOrgUnitTitle:function(){var e=this.get("orgUnitType");if(!e)return t("reports","charts:title:overall");var i=this.get("orgUnit");return"subdivision"===e?r(i,!1,!1):i.getLabel()},getMaxDowntimesByAor:function(e,t){return this.getMaxDowntimesValue(e,t,i,"downtimesByAor")},getMaxDowntimesByReason:function(e,t){return this.getMaxDowntimesValue(e,t,n,"downtimesByReason")},getMaxDowntimesValue:function(e,t,i,n){var o=0;return this.get(n).forEach(function(n){if(e[n.key]){n.value>o&&(o=n.value);var r=i.get(n.key);if(r&&t[n.key]){var s=r.get("refValue");s>o&&(o=s)}}}),o},getReferenceOrgUnitId:function(){var e=this.get("orgUnitType"),t=this.get("orgUnit"),i=this.query.get("subdivisionType");if(null===e)return i||"overall";if("division"===e)return this.getReferenceOrgUnitIdByDivision(i,t);if("subdivision"===e)return t.id;var n=o.getSubdivisionFor(t);return n?n.id:null},getReferenceOrgUnitIdByDivision:function(e,t){if(null===e)return t.id;"prod"===e&&(e="assembly");var i=o.getChildren(t).filter(function(t){return t.get("type")===e});return i.length?i[0].id:null}})});