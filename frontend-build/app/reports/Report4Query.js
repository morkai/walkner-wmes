// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["h5.rql/index","../time","../core/Model","../core/util/getShiftStartInfo"],function(e,t,i,s){"use strict";return i.extend({defaults:function(){var e=t.getMoment().weekday(0).hours(0).minutes(0).seconds(0).milliseconds(0),i=s(new Date);return{from:e.valueOf(),to:e.add(7,"days").valueOf(),interval:"day",mode:"shift",shift:i.shift,masters:void 0,operators:void 0,divisions:[],shifts:[1,2,3]}},serializeToObject:function(){var e={from:this.get("from"),to:this.get("to"),interval:this.get("interval"),mode:this.get("mode"),divisions:this.get("divisions").join(","),shifts:this.get("shifts").join(",")};return e.mode&&(e[e.mode]=this.get(e.mode),Array.isArray(e[e.mode])&&(e[e.mode]=this.serializeUsers())),e},serializeToString:function(){var e=this.attributes,t="from="+e.from+"&to="+e.to+"&interval="+e.interval;return e.mode&&(t+="&mode="+e.mode,t+="&"+e.mode+"=",Array.isArray(e[e.mode])?t+=this.serializeUsers():t+=e[e.mode]),t+="&divisions="+e.divisions.join(",")+"&shifts="+e.shifts.join(",")},serializeUsers:function(){var e=this.get(this.get("mode"));return Array.isArray(e)?e.map(function(e){return e._id?e._id:e}).join(","):""},getUsersForSelect2:function(){if("shift"===this.get("mode"))return[];var e=this.get(this.get("mode"));return Array.isArray(e)?e.map(function(e){return"string"==typeof e?{id:e,text:e}:e&&e._id?{id:e._id,text:e.lastName+" "+e.firstName+" ("+e.personellId+")"}:null}).filter(function(e){return null!==e}):[]},updateUsers:function(e){"shift"!==this.get("mode")&&this.set(this.get("mode"),e)}},{fromQuery:function(e){var t=this,i={};return e.from&&e.to&&(i.from=parseInt(e.from,10),i.to=parseInt(e.to,10)),e.interval&&(i.interval=e.interval),e.mode&&(i.mode=e.mode,"shift"===e.mode?(i.shift=parseInt(e.shift,10),(i.shift<1||i.shift>3)&&(delete i.mode,delete i.shift)):"masters"===e.mode||"operators"===e.mode?(i[i.mode]=String(e[i.mode]).split(","),0===i[i.mode].length&&(delete i.mode,delete i[i.mode])):delete i.mode),e.divisions&&(i.divisions=e.divisions.split(",")),e.shifts&&(i.shifts=e.shifts.split(",")),new t(i)}})});