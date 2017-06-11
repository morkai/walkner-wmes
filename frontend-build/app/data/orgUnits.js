// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["./divisions","./subdivisions","./mrpControllers","./prodFlows","./workCenters","./prodLines"],function(r,i,n,t,e,o){"use strict";function s(r,i,n){return r.filter(function(r){var t=r.get(i);return!!t&&(Array.isArray(t)?t.indexOf(n.id)!==-1:t===n.id)})}var l={division:"subdivision",subdivision:"mrpController",mrpController:"prodFlow",prodFlow:"workCenter",workCenter:"prodLine",prodLine:null},u={prodLine:"workCenter",workCenter:"prodFlow",prodFlow:"mrpController",mrpController:"subdivision",subdivision:"division",division:null},d={division:r,subdivision:i,mrpController:n,prodFlow:t,workCenter:e,prodLine:o};return{getProdFlowsForSubdivision:function(r){return"string"==typeof r&&(r=i.get(r)),r?t.filter(function(i){return i.getSubdivision()===r}):[]},getAllByType:function(r){return d[r].models},getAllDivisions:function(){return r.models},getAllForProdLine:function(s){"string"==typeof s&&(s=o.get(s));var l={division:null,subdivision:null,mrpControllers:null,prodFlow:null,workCenter:null,prodLine:null};if(!s)return l;l.prodLine=s.id;var u=e.get(s.get("workCenter"));if(!u)return l;l.workCenter=u.id;var d=t.get(u.get("prodFlow"));if(!d)return l;l.prodFlow=d.id;var f=d.get("mrpController");if(!Array.isArray(f)||!f.length)return l;if(l.mrpControllers=f,f=n.get(f[0]),!f)return l;var g=i.get(f.get("subdivision"));if(!g)return l;l.subdivision=g.id;var p=r.get(g.get("division"));return p?(l.division=p.id,l):l},getType:function(s){if(null===s)return null;if(s.constructor===o.model)return"prodLine";if(s.constructor===e.model)return"workCenter";if(s.constructor===t.model)return"prodFlow";if(s.constructor===n.model)return"mrpController";if(s.constructor===i.model)return"subdivision";if(s.constructor===r.model)return"division";throw new Error("Unknown org unit type!")},getChildType:function(r){return l[r]||"division"},getChildren:function(r){var i=this.getType(r),n=this.getChildType(i),t=d[n];return t?s(t,i,r):[]},getByTypeAndId:function(r,i){var n=d[r];return n?n.get(i)||null:null},getParent:function(r){if(!r)return null;var i=this.getType(r),n=u[i],t=r.get(n);return!t||Array.isArray(t)&&!t.length?null:this.getByTypeAndId(n,Array.isArray(t)?t[0]:t)},RELATION_TYPES:{SIBLINGS:"siblings",TYPES:"types",CHILD:"child",DIFFERENT_CHILD:"differentChild",PARENT:"parent",DIFFERENT_PARENT:"differentParent",UNRELATED:"unrelated"},getRelationType:function(r,i,n,t){if(null===r&&"division"===n)return this.RELATION_TYPES.CHILD;if("division"===r&&null===n)return this.RELATION_TYPES.PARENT;var e=this.getByTypeAndId(r,i),o=this.getByTypeAndId(n,t);return r===n?this.getParent(e)===this.getParent(o)?this.RELATION_TYPES.SIBLINGS:this.RELATION_TYPES.TYPES:l[r]===n?this.getParent(o)===e?this.RELATION_TYPES.CHILD:this.RELATION_TYPES.DIFFERENT_PARENT:u[r]===n?this.getParent(e)===o?this.RELATION_TYPES.PARENT:this.RELATION_TYPES.DIFFERENT_CHILD:this.RELATION_TYPES.UNRELATED},getSubdivisionFor:function(n){return n&&n.constructor!==r.model?n.constructor===i.model?n:this.getSubdivisionFor(this.getParent(n)):null},containsProdLine:function(r,i,n){if("prodLine"===r)return Array.isArray(i)?i.indexOf(n)!==-1:i===n;for(var t=this.getByTypeAndId("prodLine",n);;){var e=this.getParent(t);if(!e)return!1;if(this.getType(e)===r)return Array.isArray(i)?i.indexOf(e.id)!==-1:i===e.id;t=e}}}});