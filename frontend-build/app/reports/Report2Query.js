// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../time","../core/Model","../data/orgUnits","./Report2"],function(t,e,i,n,r){"use strict";return i.extend({defaults:function(){var t=e.getMoment().hours(0).minutes(0).seconds(0).milliseconds(0);return{orgUnitType:null,orgUnitId:null,to:t.valueOf(),from:t.subtract(1,"days").valueOf(),interval:"day",limit:12,skip:0,filter:"nin",statuses:""}},reset:function(e){this.set(t.defaults(e,this.defaults()),{reset:!0})},createReports:function(t,e,i){var o=[],s=this.get("orgUnitType"),g=n.getByTypeAndId(s,this.get("orgUnitId"));t||(t=new r({orgUnitType:this.get("orgUnitType"),orgUnit:g},i)),o.push(t);var u,l=n.getChildType(s);return g?(u=n.getChildren(g),"subdivision"===l&&(u=u.filter(function(t){return"assembly"===t.get("type")}))):u=n.getAllDivisions().filter(function(t){return"prod"===t.get("type")}),u.sort(function(t,e){return t.getLabel().localeCompare(e.getLabel())}),u.forEach(function(t){o.push(e&&t===e.get("orgUnit")?e:new r({orgUnitType:l,orgUnit:t},i))}),o},serializeToObject:function(t,e){var i={interval:this.get("interval"),from:this.get("from"),to:this.get("to")};return t&&e&&(i.orgUnitType=t,i.orgUnitId=e.id),i},serializeToString:function(t,e){var i="",n=this.attributes;return n.interval&&(i+="&interval="+n.interval),n.from&&n.to&&(i+="&from="+n.from,i+="&to="+n.to),2===arguments.length&&void 0!==t?t&&(i+="&orgUnitType="+t,i+="&orgUnitId="+encodeURIComponent(e)):n.orgUnitType&&(i+="&orgUnitType="+n.orgUnitType,i+="&orgUnitId="+encodeURIComponent(n.orgUnitId)),i+="&limit="+n.limit,i+="&skip="+n.skip,n.statuses.length&&(i+="&filter="+n.filter,i+="&statuses="+n.statuses),i.substr(1)}})});