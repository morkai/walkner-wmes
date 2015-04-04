// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../time","../core/Model","../data/orgUnits","./Report1"],function(t,e,i,n,o){"use strict";return i.extend({defaults:{orgUnitType:null,orgUnitId:null,from:null,to:null,interval:"hour",subdivisionType:null},reset:function(e){this.set(t.defaults(e,this.defaults),{reset:!0})},createReports:function(t,e,i){var r=[],s=this.get("orgUnitType"),u=n.getByTypeAndId(s,this.get("orgUnitId"));t||(t=new o({orgUnitType:this.get("orgUnitType"),orgUnit:u},i)),r.push(t);var g,d=n.getChildType(s);return g=u?n.getChildren(u):n.getAllDivisions().filter(function(t){return"prod"===t.get("type")}),g.sort(function(t,e){return t.getLabel().localeCompare(e.getLabel())}),g.forEach(function(t){r.push(e&&t===e.get("orgUnit")?e:new o({orgUnitType:d,orgUnit:t},i))}),r},serializeToObject:function(t,e){var i={subdivisionType:this.get("subdivisionType")||void 0,interval:this.get("interval"),from:this.get("from"),to:this.get("to")};if(!i.from||!i.to){var n=this.getFirstShiftMoment();i.from=n.toISOString(),i.to=n.add(1,"days").toISOString()}return t&&e&&(i.orgUnitType=t,i.orgUnitId=e.id),i},serializeToString:function(t,e){var i="",n=this.attributes;return n.interval&&(i+="&interval="+n.interval),n.subdivisionType&&(i+="&subdivisionType="+n.subdivisionType),n.from&&n.to&&(i+="&from="+encodeURIComponent(n.from),i+="&to="+encodeURIComponent(n.to)),2===arguments.length&&void 0!==t?t&&(i+="&orgUnitType="+t,i+="&orgUnitId="+encodeURIComponent(e)):n.orgUnitType&&(i+="&orgUnitType="+n.orgUnitType,i+="&orgUnitId="+encodeURIComponent(n.orgUnitId)),i.substr(1)},getFirstShiftMoment:function(){var t=e.getMoment();return t.hours()>=0&&t.hours()<6&&t.subtract(1,"days"),t.hours(6).minutes(0).seconds(0).milliseconds(0)},isAutoMode:function(){return!this.get("from")&&!this.get("to")}})});