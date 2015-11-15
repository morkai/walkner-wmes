// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../time","../user","../core/Model","../data/orgUnits"],function(t,r,e,n,i){"use strict";var s={days:!0,shifts:!0,divisions:!0,subdivisionTypes:!0,prodLines:!0},o={fap0:6,startup:3,shutdown:4,meetings:5,sixS:6,tpm:7,trainings:8,breaks:30,coTime:9,downtime:3,unplanned:0};return n.extend({defaults:function(){var e=r.getMoment().startOf("day"),n=e.valueOf(),s={from:e.subtract(7,"days").valueOf(),to:n,interval:"day",unit:"m",days:["1","2","3","4","5","6","7","noWork"],shifts:["1","2","3"],divisions:i.getAllByType("division").filter(function(t){return"prod"===t.get("type")}).map(function(t){return t.id}),subdivisionTypes:["assembly","press"],prodLines:[]};return t.extend(s,o)},serializeToObject:function(){var r=this.toJSON();return t.forEach(r,function(e,n){t.isArray(e)&&(r[n]=e.join(","))}),r},serializeToString:function(){var r="";return t.forEach(this.attributes,function(t,e){r+="&"+e+"="+t}),r.substr(1)}},{NUMERIC_PROPS:o,prepareAttrsFromQuery:function(r){var e={};return t.forEach(r,function(t,r){s[r]?t=t.split(","):/^[0-9]+$/.test(t)&&(t=parseInt(t,10)),e[r]=t}),e},fromQuery:function(t,r){return new this(this.prepareAttrsFromQuery(t),r)}})});