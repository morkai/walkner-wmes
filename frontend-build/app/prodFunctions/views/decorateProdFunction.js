define(["app/i18n","app/data/companies"],function(n,e){return function(t){var i=t.toJSON();return i.direct=n("prodFunctions","direct:"+i.direct),i.companies=(i.companies||[]).map(function(n){var t=e.get(n);return t?t.getLabel():null}).filter(function(n){return!!n}).join("; "),i.companies.length||(i.companies="-"),i}});