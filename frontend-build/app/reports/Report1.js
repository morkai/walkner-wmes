define(["underscore","../i18n","../data/aors","../data/downtimeReasons","../data/orgUnits","../orgUnits/util/renderOrgUnitPath","../core/Model"],function(e,t,i,n,o,r,s){"use strict";return s.extend({urlRoot:"/reports/1",defaults:function(){return{isParent:!1,orgUnitType:null,orgUnit:null,categorizedCoeffs:{categories:[],quantityDone:[],downtime:[],scheduledDowntime:[],unscheduledDowntime:[],efficiency:[],productivity:[],productivityNoWh:[]},coeffs:{quantityDone:[],downtime:[],scheduledDowntime:[],unscheduledDowntime:[],efficiency:[],productivity:[],productivityNoWh:[]},maxCoeffs:{quantityDone:0,downtime:0,scheduledDowntime:0,unscheduledDowntime:0,efficiency:0,productivity:0,productivityNoWh:0},downtimesByAor:[],maxDowntimesByAor:0,downtimesByReason:[],maxDowntimesByReason:0}},initialize:function(e,t){if(!t.query)throw new Error("query option is required!");this.query=t.query},fetch:function(t){return e.isObject(t)||(t={}),t.data=e.assign(t.data||{},this.query.serializeToObject(this.get("orgUnitType"),this.get("orgUnit"))),s.prototype.fetch.call(this,t)},isPaintShop:function(){var e=o.getSubdivisionFor(this.get("orgUnit"));return!!e&&"paintShop"===e.get("type")},parse:function(e){var t={categorizedCoeffs:{categories:[],quantityDone:[],downtime:[],scheduledDowntime:[],unscheduledDowntime:[],efficiency:[],productivity:[],productivityNoWh:[],mmh:[]},coeffs:{quantityDone:[],downtime:[],scheduledDowntime:[],unscheduledDowntime:[],efficiency:[],productivity:[],productivityNoWh:[],mmh:[]},maxCoeffs:{quantityDone:0,downtime:0,scheduledDowntime:0,unscheduledDowntime:0,efficiency:0,productivity:0,productivityNoWh:0},downtimesByAor:[],maxDowntimesByAor:0,downtimesByReason:[],maxDowntimesByReason:0};return this.parseCoeffs(e.coeffs,t),this.parseDowntimesByAor(e.downtimes.byAor,t),this.parseDowntimesByReason(e.downtimes.byReason,t),t},parseCoeffs:function(e,t){for(var i=t.categorizedCoeffs,n=t.coeffs,r=t.maxCoeffs,s=o.getSubdivisionFor(this.get("orgUnit")),u=s&&"assembly"===s.get("type"),d=0,a=e.length;d<a;++d){var c=e[d],y=c.orderCount||0,f=c.quantityDone||0,m=c.mmh||0,h=Date.parse(c.key);l(n,"quantityDone",h,f),g(n,"downtime",h,c.downtime),g(n,"scheduledDowntime",h,c.scheduledDowntime),g(n,"unscheduledDowntime",h,c.unscheduledDowntime),g(n,"efficiency",h,c.efficiency),g(n,"productivity",h,c.productivity),g(n,"productivityNoWh",h,c.productivityNoWh),l(n,"mmh",h,m),0===y||u&&0===f||(i.categories.push(h),l(i,"quantityDone",h,f),g(i,"downtime",h,c.downtime),g(i,"scheduledDowntime",h,c.scheduledDowntime),g(i,"unscheduledDowntime",h,c.unscheduledDowntime),g(i,"efficiency",h,c.efficiency),g(i,"productivity",h,c.productivity),g(i,"productivityNoWh",h,c.productivityNoWh),l(i,"mmh",h,m))}function l(e,t,n,o){e===i?e[t].push({y:o,time:n}):e[t].push({x:n,y:o}),o>r[t]&&(r[t]=o)}function g(e,t,i,n){l(e,t,i,Math.round(100*(n||0)))}},parseDowntimesByAor:function(e,n){if(e){for(var o=Object.keys(e),r=0,s=o.length;r<s;++r){var u,d,a=o[r];if("null"===a)u=t("reports","downtimesByAor:press:longText"),d=t("reports","downtimesByAor:press:shortText");else{var c=i.get(a),y=(u=c?c.getLabel():a).indexOf("-");d=-1===y?u>13?u.substr(0,10).trim()+"...":u:u.substr(0,y).trim()}var f=Math.round(100*e[a])/100;n.downtimesByAor.push({key:a,longText:u,shortText:d,value:f}),f>n.maxDowntimesByAor&&(n.maxDowntimesByAor=f)}n.downtimesByAor.sort(function(e,t){return t.value-e.value})}},parseDowntimesByReason:function(e,t){if(e){for(var i=Object.keys(e),o=0,r=i.length;o<r;++o){var s=i[o],u=n.get(s),d=Math.round(100*e[s])/100;t.downtimesByReason.push({key:s,longText:u?u.getLabel():s,shortText:s,value:d}),d>t.maxDowntimesByReason&&(t.maxDowntimesByReason=d)}t.downtimesByReason.sort(function(e,t){return t.value-e.value})}},getOrgUnitTitle:function(){var e=this.get("orgUnitType");if(!e)return t("reports","charts:title:overall");var i=this.get("orgUnit");return"subdivision"===e?r(i,!1,!1):i.getLabel()},getMaxDowntimesByAor:function(e,t){return this.getMaxDowntimesValue(e,t,i,"downtimesByAor")},getMaxDowntimesByReason:function(e,t){return this.getMaxDowntimesValue(e,t,n,"downtimesByReason")},getMaxDowntimesValue:function(e,t,i,n){var o=0;return this.get(n).forEach(function(n){if(e[n.key]){n.value>o&&(o=n.value);var r=i.get(n.key);if(r&&t[n.key]){var s=r.get("refValue");s>o&&(o=s)}}}),o},getReferenceOrgUnitId:function(){var e=this.get("orgUnitType"),t=this.get("orgUnit"),i=this.query.get("subdivisionType");if(null===e)return i||"overall";if("division"===e)return this.getReferenceOrgUnitIdByDivision(i,t);if("subdivision"===e)return t.id;var n=o.getSubdivisionFor(t);return n?n.id:null},getReferenceOrgUnitIdByDivision:function(e,t){if(null===e)return t.id;"prod"===e&&(e="assembly");var i=o.getChildren(t).filter(function(t){return t.get("type")===e});return i.length?i[0].id:null},isEmpty:function(){return 0===this.get("coeffs").efficiency.length}})});