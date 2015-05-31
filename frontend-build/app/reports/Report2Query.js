// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../time","../core/Model","../data/orgUnits","./Report2"],function(t,e,r,i,n){"use strict";return r.extend({defaults:function(){var t=e.getMoment().hours(0).minutes(0).seconds(0).milliseconds(0);return{orgUnitType:null,orgUnitId:null,to:t.valueOf(),from:t.subtract(1,"days").valueOf(),interval:"day",limit:12,skip:0,orderNo:"",filter:"red",statuses:""}},reset:function(e){this.set(t.defaults(e,this.defaults()),{reset:!0})},createReports:function(t,e,r){var o=[],s=this.get("orgUnitType"),g=i.getByTypeAndId(s,this.get("orgUnitId"));t||(t=new n({orgUnitType:this.get("orgUnitType"),orgUnit:g},r)),o.push(t);var l,u=i.getChildType(s);return g?(l=i.getChildren(g),"subdivision"===u&&(l=l.filter(function(t){return"assembly"===t.get("type")}))):l=i.getAllDivisions().filter(function(t){return"prod"===t.get("type")}),l.sort(function(t,e){return t.getLabel().localeCompare(e.getLabel())}),l.forEach(function(t){o.push(e&&t===e.get("orgUnit")?e:new n({orgUnitType:u,orgUnit:t},r))}),o},serializeToObject:function(t,e){var r={interval:this.get("interval"),from:this.get("from"),to:this.get("to")};return t&&e&&(r.orgUnitType=t,r.orgUnitId=e.id),r},serializeToString:function(t,e){var r="",i=this.attributes;return i.interval&&(r+="&interval="+i.interval),i.from&&i.to&&(r+="&from="+i.from,r+="&to="+i.to),2===arguments.length&&void 0!==t?t&&(r+="&orgUnitType="+t,r+="&orgUnitId="+encodeURIComponent(e)):i.orgUnitType&&(r+="&orgUnitType="+i.orgUnitType,r+="&orgUnitId="+encodeURIComponent(i.orgUnitId)),r+="&limit="+i.limit,r+="&skip="+i.skip,r+="&filter="+i.filter,r+="&statuses="+i.statuses,i.orderNo.length>=6&&(r+="&orderNo="+i.orderNo),r.substr(1)}})});