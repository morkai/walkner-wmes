define(["underscore","app/data/mrpControllers","app/data/views/renderOrgUnitPath"],function(r,e,n){return function(t,l){var o=t.toJSON();return o.subdivision=n(t.getSubdivision(),!0,!1),o.mrpControllers=(o.mrpController||[]).map(function(n){var t=e.get(n);return t?l?'<a href="'+t.genClientUrl()+'">'+r.escape(t.getLabel())+"</a>":{href:t.genClientUrl(),label:t.getLabel()}:null}).filter(function(r){return!!r}),l&&(o.mrpControllers=o.mrpControllers.join("; ")),o}});