define(["underscore","app/data/divisions","app/data/subdivisions","app/data/mrpControllers","app/data/workCenters","app/data/prodFlows","app/data/prodLines"],function(t,r,e,n,o,i,a){"use strict";return function(t,u,p){if(!t)return"?";var d=[],c="???";return(t.constructor!==a.model||(d.unshift(t),c=t.get("workCenter"),t=o.get(c)))&&(t.constructor!==o.model||(d.unshift(t),c=t.get("prodFlow")||t.get("mrpController"),t=t.get("prodFlow")?i.get(c):n.get(c)))?t.constructor!==i.model||(d.unshift(t),(t=(c=t.get("mrpController")||[]).map(function(t){return n.get(t)}).filter(t=>!!t)).length)?(!(t.constructor===n.model||t[0]&&t[0].constructor===n.model)||(d.unshift(t),c=(t[0]||t).get("subdivision"),t=e.get(c)))&&(t.constructor!==e.model||(d.unshift(t),c=t.get("division"),t=r.get(c)))?(t.constructor===r.model&&d.unshift(t),!1!==p&&d.pop(),0===d.length?"???":d.map(function(t){return Array.isArray(t)?t.map(function(t){return s(t,u)}).join("; "):s(t,u)}).join(" \\ ")):"???"+c+"???":"???"+c.join("; ")+"???":"???"+c+"???"};function s(r,e){var n=t.escape(r.getLabel()),o=r.get("deactivatedAt")?"text-decoration: line-through!important":"";return e?'<a href="'+r.genClientUrl()+'" style="'+o+'">'+n+"</a>":'<span style="'+o+'">'+n+"</span>"}});