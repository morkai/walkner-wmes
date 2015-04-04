// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../time","../core/Model","../data/orgUnits","./Report2"],function(t,e,n,r,o){"use strict";return n.extend({defaults:function(){var t=e.getMoment().hours(0).minutes(0).seconds(0).milliseconds(0);return{orgUnitType:null,orgUnitId:null,to:t.valueOf(),from:t.subtract(1,"days").valueOf(),interval:"day"}},reset:function(e){this.set(t.defaults(e,this.defaults()),{reset:!0})},createReports:function(t,e,n){var i=[],s=this.get("orgUnitType"),g=r.getByTypeAndId(s,this.get("orgUnitId"));t||(t=new o({orgUnitType:this.get("orgUnitType"),orgUnit:g},n)),i.push(t);var u,a=r.getChildType(s);return u=g?r.getChildren(g):r.getAllDivisions().filter(function(t){return"prod"===t.get("type")}),u.sort(function(t,e){return t.getLabel().localeCompare(e.getLabel())}),u.forEach(function(t){i.push(e&&t===e.get("orgUnit")?e:new o({orgUnitType:a,orgUnit:t},n))}),i},serializeToObject:function(t,e){var n={interval:this.get("interval"),from:this.get("from"),to:this.get("to")};return t&&e&&(n.orgUnitType=t,n.orgUnitId=e.id),n},serializeToString:function(t,e){var n="",r=this.attributes;return r.interval&&(n+="&interval="+r.interval),r.from&&r.to&&(n+="&from="+r.from,n+="&to="+r.to),2===arguments.length&&void 0!==t?t&&(n+="&orgUnitType="+t,n+="&orgUnitId="+encodeURIComponent(e)):r.orgUnitType&&(n+="&orgUnitType="+r.orgUnitType,n+="&orgUnitId="+encodeURIComponent(r.orgUnitId)),n.substr(1)}})});