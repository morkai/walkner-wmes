// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/data/divisions","app/data/subdivisions","app/data/mrpControllers","app/data/workCenters","app/data/prodFlows","app/data/prodLines"],function(t,r,n,e,o,i,a){"use strict";function s(r,n){var e=t.escape(r.getLabel()),o=r.get("deactivatedAt")?"text-decoration: line-through!important":"";return n?'<a href="'+r.genClientUrl()+'" style="'+o+'">'+e+"</a>":'<span style="'+o+'">'+e+"</span>"}return function(t,u,l){if(!t)return null;var p=[];return(t.constructor!==a.model||(p.unshift(t),t=o.get(t.get("workCenter"))))&&(t.constructor!==o.model||(p.unshift(t),t=t.get("prodFlow")?i.get(t.get("prodFlow")):e.get(t.get("mrpController"))))&&(t.constructor!==i.model||(p.unshift(t),t=(t.get("mrpController")||[]).map(function(t){return e.get(t)}),t.length))&&(!(t.constructor===e.model||t[0]&&t[0].constructor===e.model)||(p.unshift(t),t=n.get((t[0]||t).get("subdivision"))))&&(t.constructor!==n.model||(p.unshift(t),t=r.get(t.get("division"))))?(t.constructor===r.model&&p.unshift(t),!1!==l&&p.pop(),0===p.length?null:p.map(function(t){return Array.isArray(t)?t.map(function(t){return s(t,u)}).join("; "):s(t,u)}).join(" \\ ")):null}});