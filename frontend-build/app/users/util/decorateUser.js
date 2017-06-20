// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/data/aors","app/data/companies","app/data/prodFunctions","app/data/divisions","app/data/subdivisions","app/data/views/renderOrgUnitPath"],function(a,n,r,e,i,t,o){"use strict";return function(d){var s=d.toJSON(),p=r.get(s.company);s.company=p?p.getLabel():"-",s.active=a("users","active:"+s.active),Array.isArray(s.aors)?s.aors=s.aors.map(function(a){var r=n.get(a);return r?r.getLabel():null}).filter(function(a){return!!a}):s.aors=[];var v=e.get(s.prodFunction);if(s.prodFunction=v?v.getLabel():"-",s.orgUnitType&&s.orgUnitId){var c;switch(s.orgUnitType){case"division":c=i.get(s.orgUnitId);break;case"subdivision":c=t.get(s.orgUnitId)}c&&(s.orgUnit=o(c,!1,!1))}return s.vendor&&(s.vendor.name?s.vendor=s.vendor.name+" ("+s.vendor._id+")":s.vendor._id&&(s.vendor=s.vendor._id)),s}});