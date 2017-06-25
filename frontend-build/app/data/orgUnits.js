// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["./divisions","./subdivisions","./mrpControllers","./prodFlows","./workCenters","./prodLines"],function(r,i,n,t,e,o){"use strict";function l(r,i,n){return r.filter(function(r){var t=r.get(i);return!!t&&(Array.isArray(t)?t.indexOf(n.id)!==-1:t===n.id)})}var s={division:"subdivision",subdivision:"mrpController",mrpController:"prodFlow",mrpControllers:"prodFlow",prodFlow:"workCenter",workCenter:"prodLine",prodLine:null},d={prodLine:"workCenter",workCenter:"prodFlow",prodFlow:"mrpController",mrpController:"subdivision",mrpControllers:"subdivision",subdivision:"division",division:null},u={division:r,subdivision:i,mrpController:n,mrpControllers:n,prodFlow:t,workCenter:e,prodLine:o};return{getProdFlowsForSubdivision:function(r){return"string"==typeof r&&(r=i.get(r)),r?t.filter(function(i){return i.getSubdivision()===r}):[]},getAllByType:function(r){return u[r].models},getAllDivisions:function(){return r.models},getAllForProdLine:function(l){"string"==typeof l&&(l=o.get(l));var s={division:null,subdivision:null,mrpControllers:null,prodFlow:null,workCenter:null,prodLine:null};if(!l)return s;s.prodLine=l.id;var d=e.get(l.get("workCenter"));if(!d)return s;s.workCenter=d.id;var u=t.get(d.get("prodFlow"));if(!u)return s;s.prodFlow=u.id;var p=u.get("mrpController");if(!Array.isArray(p)||!p.length)return s;if(s.mrpControllers=p,p=n.get(p[0]),!p)return s;var f=i.get(p.get("subdivision"));if(!f)return s;s.subdivision=f.id;var g=r.get(f.get("division"));return g?(s.division=g.id,s):s},getType:function(l){if(null===l)return null;if(l.constructor===o.model)return"prodLine";if(l.constructor===e.model)return"workCenter";if(l.constructor===t.model)return"prodFlow";if(l.constructor===n.model)return"mrpController";if(l.constructor===i.model)return"subdivision";if(l.constructor===r.model)return"division";throw new Error("Unknown org unit type!")},getChildType:function(r){return s[r]||"division"},getChildren:function(r){var i=this.getType(r),n=this.getChildType(i),t=u[n];return t?l(t,i,r):[]},getByTypeAndId:function(r,i){var n=u[r];return n?n.get(i)||null:null},getParent:function(r){if(!r)return null;var i=this.getType(r),n=d[i],t=r.get(n);return!t||Array.isArray(t)&&!t.length?null:this.getByTypeAndId(n,Array.isArray(t)?t[0]:t)},RELATION_TYPES:{SIBLINGS:"siblings",TYPES:"types",CHILD:"child",DIFFERENT_CHILD:"differentChild",PARENT:"parent",DIFFERENT_PARENT:"differentParent",UNRELATED:"unrelated"},getRelationType:function(r,i,n,t){if(null===r&&"division"===n)return this.RELATION_TYPES.CHILD;if("division"===r&&null===n)return this.RELATION_TYPES.PARENT;var e=this.getByTypeAndId(r,i),o=this.getByTypeAndId(n,t);return r===n?this.getParent(e)===this.getParent(o)?this.RELATION_TYPES.SIBLINGS:this.RELATION_TYPES.TYPES:s[r]===n?this.getParent(o)===e?this.RELATION_TYPES.CHILD:this.RELATION_TYPES.DIFFERENT_PARENT:d[r]===n?this.getParent(e)===o?this.RELATION_TYPES.PARENT:this.RELATION_TYPES.DIFFERENT_CHILD:this.RELATION_TYPES.UNRELATED},getSubdivisionFor:function(n){return n&&n.constructor!==r.model?n.constructor===i.model?n:this.getSubdivisionFor(this.getParent(n)):null},containsProdLine:function(r,i,n){if("prodLine"===r)return Array.isArray(i)?i.indexOf(n)!==-1:i===n;for(var t=this.getByTypeAndId("prodLine",n);;){var e=this.getParent(t);if(!e)return!1;if(this.getType(e)===r)return Array.isArray(i)?i.indexOf(e.id)!==-1:i===e.id;t=e}}}});