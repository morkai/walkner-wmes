// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/data/mrpControllers","app/data/views/renderOrgUnitPath"],function(r,e,n){return function(t,l){var o=t.toJSON();return o.subdivision=n(t.getSubdivision(),!0,!1),o.mrpControllers=(o.mrpController||[]).map(function(n){var t=e.get(n);return t?l?'<a href="'+t.genClientUrl()+'">'+r.escape(t.getLabel())+"</a>":{href:t.genClientUrl(),label:t.getLabel()}:null}).filter(function(r){return!!r}),l&&(o.mrpControllers=o.mrpControllers.join("; ")),o}});