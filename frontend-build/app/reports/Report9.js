// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../time","../core/Model","../core/util/colorLabel"],function(n,s,r,t){"use strict";function a(n){return n.length>28?n.substr(0,13).trim()+"..."+n.substr(-10).trim():""}var e=20,i=3;return r.extend({urlRoot:"/reports/9",defaults:function(){return{daysInMonth:{},shiftsInDay:{},hoursInShift:null,customLines:{},months:[],groups:[],cags:[],lines:[]}},parse:function(n){n.groups[null]={_id:null,name:"???",cags:[],color:"#FFFFFF"};var s={months:this.parseMonths(n),groups:this.parseGroups(n),cags:this.parseCags(n),lines:this.parseLines(n)};return s},parseMonths:function(r){var t=this.attributes;return n.map(r.months,function(n){var r=s.getMoment(n),a=r.format("YYMM");return{_id:n,key:r.format("YYMM"),label:r.format("MMMM YYYY"),days:t.daysInMonth[a]||t.daysInMonth.summary||e,shifts:t.shiftsInDay[a]||t.shiftsInDay.summary||i}})},parseCags:function(s){var r=this.attributes,t=r.daysInMonth.summary||e,o=r.shiftsInDay.summary||i;return n.map(s.cags,function(e){var i=r.customLines[e._id];return e.shortName=a(e.name),e.group=s.groups[e.group],e.customLines=i||null,e.maxOnLine=e.avgQPerShift*t*o,e.maxOnLines=e.maxOnLine*(i||e.lines),e.utilization=n.map(e.plan,function(n){var s=Math.round(n/e.maxOnLines*100);return isNaN(s)||!isFinite(s)?0:s}),e})},parseGroups:function(s){return n.map(s.groups,function(n){return n.color||(n.color="#FFFFFF"),n.contrast=t.requiresContrast(n.color),n})},parseLines:function(s){var r=[];return n.forEach(s.lines,function(n,s){var t,a=s;a.length>6&&-1!==a.indexOf("-")?(t=a.split("-"),a=t[0]+"\n-"+t[1]):-1!==a.indexOf("~")?(t=a.split("~"),a=t[0]+"\n~"+t[1]):a+="\n\n",r.push({_id:s,name:a,cags:n})}),r}})});