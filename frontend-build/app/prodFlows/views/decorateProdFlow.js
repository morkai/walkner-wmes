define(["underscore","app/data/mrpControllers","app/data/views/renderOrgUnitPath"],function(e,t,n){return function(r,i){var o=r.toJSON();return o.subdivision=n(r.getSubdivision(),!0,!1),o.mrpControllers=(o.mrpController||[]).map(function(n){var r=t.get(n);return r?i?'<a href="'+r.genClientUrl()+'">'+e.escape(r.getLabel())+"</a>":{href:r.genClientUrl(),label:r.getLabel()}:null}).filter(function(e){return!!e}),i&&(o.mrpControllers=o.mrpControllers.join("; ")),o}});