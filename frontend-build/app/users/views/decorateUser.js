define(["app/i18n","app/data/aors","app/data/companies","app/data/divisions","app/data/subdivisions","app/data/views/renderOrgUnitPath"],function(a,n,r,i,t,o){return function(e){var s=r.get(e.company);if(e.company=s?s.getLabel():a("users","NO_DATA:company"),e.aors=Array.isArray(e.aors)?e.aors.map(function(a){var r=n.get(a);return r?r.getLabel():null}).filter(function(a){return!!a}).join("; "):"",e.aors.length||(e.aors=a("users","NO_DATA:aors")),e.prodFunction&&(e.prodFunction=a("users","PROD_FUNCTION:"+e.prodFunction)),e.orgUnitType&&e.orgUnitId){var p;switch(e.orgUnitType){case"division":p=i.get(e.orgUnitId);break;case"subdivision":p=t.get(e.orgUnitId)}p&&(e.orgUnit=o(p,!1,!1))}return e}});