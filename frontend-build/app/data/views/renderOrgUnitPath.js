// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../divisions","../subdivisions","../mrpControllers","../workCenters","../prodFlows","../prodLines"],function(t,n,e,o,r,l,u){return function(i,s,c){if(!i)return null;var d=[];return i.constructor!==u.model||(d.unshift(i),i=r.get(i.get("workCenter")))?i.constructor!==r.model||(d.unshift(i),i=i.get("prodFlow")?l.get(i.get("prodFlow")):o.get(i.get("mrpController")))?i.constructor!==l.model||(d.unshift(i),i=o.get((i.get("mrpController")||[])[0]))?i.constructor!==o.model||(d.unshift(i),i=e.get(i.get("subdivision")))?i.constructor!==e.model||(d.unshift(i),i=n.get(i.get("division")))?(i.constructor===n.model&&d.unshift(i),c!==!1&&d.pop(),0===d.length?null:d.map(function(n){var e=t.escape(n.getLabel());return s?'<a href="'+n.genClientUrl()+'">'+e+"</a>":e}).join(" \\ ")):null:null:null:null:null}});