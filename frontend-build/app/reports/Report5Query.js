// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../time","../core/Model","../data/orgUnits","./Report5"],function(e,t,n,r,o){"use strict";return n.extend({defaults:function(){var e=t.getMoment().hours(0).minutes(0).seconds(0).milliseconds(0);return{orgUnitType:null,orgUnitId:null,to:e.valueOf(),from:e.subtract(1,"days").valueOf(),interval:"shift",weekends:!0}},reset:function(t){this.set(e.defaults(t,this.defaults()),{reset:!0})},createReports:function(e,t,n){var i=[],s=this.get("orgUnitType"),g=r.getByTypeAndId(s,this.get("orgUnitId"));e||(e=new o({orgUnitType:this.get("orgUnitType"),orgUnit:g},n)),i.push(e);var a,d=r.getChildType(s);return a=g?r.getChildren(g).sort(function(e,t){return e.getLabel().localeCompare(t.getLabel())}):r.getAllDivisions().sort(function(e,t){var n=e.get("type");return n===t.get("type")?e.id.localeCompare(t.id):"prod"===n?-1:1}),a.forEach(function(e){i.push(t&&e===t.get("orgUnit")?t:new o({orgUnitType:d,orgUnit:e},n))}),i},serializeToObject:function(e,t){var n={interval:this.get("interval"),from:this.get("from"),to:this.get("to"),weekends:this.get("weekends")};return e&&t&&(n.orgUnitType=e,n.orgUnitId=t.id),n},serializeToString:function(e,t){var n="",r=this.attributes;return r.interval&&(n+="&interval="+r.interval),r.weekends&&(n+="&weekends=1"),r.from&&r.to&&(n+="&from="+r.from,n+="&to="+r.to),2===arguments.length&&void 0!==e?e&&(n+="&orgUnitType="+e,n+="&orgUnitId="+encodeURIComponent(t)):r.orgUnitType&&(n+="&orgUnitType="+r.orgUnitType,n+="&orgUnitId="+encodeURIComponent(r.orgUnitId)),n.substr(1)}})});