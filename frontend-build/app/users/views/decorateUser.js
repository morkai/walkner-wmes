define(["app/i18n","app/data/aors","app/data/companies","app/data/prodFunctions","app/data/divisions","app/data/subdivisions","app/data/views/renderOrgUnitPath"],function(e,t,n,r,i,o,a){return function(s){var l=n.get(s.company);s.company=l?l.getLabel():e("users","NO_DATA:company"),s.aors=Array.isArray(s.aors)?s.aors.map(function(e){var n=t.get(e);return n?n.getLabel():null}).filter(function(e){return!!e}).join("; "):"",s.aors.length||(s.aors=e("users","NO_DATA:aors"));var d=r.get(s.prodFunction);if(s.prodFunction=d?d.getLabel():e("users","NO_DATA:prodFunction"),s.orgUnitType&&s.orgUnitId){var u;switch(s.orgUnitType){case"division":u=i.get(s.orgUnitId);break;case"subdivision":u=o.get(s.orgUnitId)}u&&(s.orgUnit=a(u,!1,!1))}return s}});