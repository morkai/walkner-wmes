// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../time","../core/Model","../data/orgUnits","./Report2"],function(t,e,r,o,i){"use strict";return r.extend({defaults:function(){var t=e.getMoment().hours(0).minutes(0).seconds(0).milliseconds(0);return{orgUnitType:null,orgUnitId:null,to:t.valueOf(),from:t.subtract(1,"days").valueOf(),interval:"day",limit:15,skip:0,orderNo:"",hourMode:"inclusive",hour:"",filter:"red",statuses:""}},reset:function(e){this.set(t.defaults(e,this.defaults()),{reset:!0})},createReports:function(t,e,r){var n=[],s=this.get("orgUnitType"),u=o.getByTypeAndId(s,this.get("orgUnitId"));t||(t=new i({orgUnitType:this.get("orgUnitType"),orgUnit:u},r)),n.push(t);var l,g=o.getChildType(s);return u?(l=o.getChildren(u),"subdivision"===g&&(l=l.filter(function(t){return"assembly"===t.get("type")}))):l=o.getAllDivisions().filter(function(t){return"prod"===t.get("type")}),l.sort(function(t,e){return t.getLabel().localeCompare(e.getLabel())}),l.forEach(function(t){e&&t===e.get("orgUnit")?n.push(e):n.push(new i({orgUnitType:g,orgUnit:t},r))}),n},serializeToObject:function(t,e){var r={interval:this.get("interval"),from:this.get("from"),to:this.get("to")};return t&&e&&(r.orgUnitType=t,r.orgUnitId=e.id),r},serializeToString:function(t,e){var r="",o=this.attributes;return o.interval&&(r+="&interval="+o.interval),o.from&&o.to&&(r+="&from="+o.from,r+="&to="+o.to),2===arguments.length&&void 0!==t?t&&(r+="&orgUnitType="+t,r+="&orgUnitId="+encodeURIComponent(e)):o.orgUnitType&&(r+="&orgUnitType="+o.orgUnitType,r+="&orgUnitId="+encodeURIComponent(o.orgUnitId)),r+="&limit="+o.limit,r+="&skip="+o.skip,r+="&filter="+o.filter,r+="&statuses="+o.statuses,o.orderNo.length>=6&&(r+="&orderNo="+o.orderNo),o.hour.length&&(r+="&hourMode="+o.hourMode+"&hour="+o.hour),r.substr(1)}})});