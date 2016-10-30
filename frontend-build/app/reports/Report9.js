// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","../time","../core/Model","../core/util/colorLabel"],function(n,t,s,i){"use strict";var u=20,o=3,r=7.5,e=["-","_","."];return s.extend({urlRoot:"/reports/9",defaults:function(){return{daysInMonth:{},shiftsInDay:{},hoursInShift:null,customLines:{},months:[],groups:[],cags:[],lines:[]}},serializeQuery:function(){var t=this.attributes,s=[],i=null==t.hoursInShift?0:1;return s.push("days="+n.map(t.daysInMonth,function(n,t){return i++,t+"="+n})),s.push("shifts="+n.map(t.shiftsInDay,function(n,t){return i++,t+"="+n})),s.push("hours="+(null==t.hoursInShift?"":t.hoursInShift)),s.push("lines="+n.map(t.customLines,function(n,t){return i++,t+"="+n})),i>0?s.join("&"):""},clearOptions:function(){this.set({daysInMonth:{},shiftsInDay:{},hoursInShift:null,customLines:{}},{silent:!0}),this.recountCags(),this.trigger("clearOptions")},parse:function(n){n.groups[null]={_id:null,name:"???",cags:[],color:"#FFFFFF"};var t=this.parseMonths(n),s=this.parseGroups(n),i={months:t,groups:s,cags:this.parseCags(n,t),lines:this.parseLines(n)};return this.recountGroupUtilization(s),i},parseMonths:function(s){return n.map(s.months,function(n){var s=t.getMoment(n);return this.recountMonth({_id:n,key:s.format("YYMM"),label:s.format("MMMM YYYY"),days:0,customDays:null,shifts:0,customShifts:null})},this)},parseCags:function(t,s){var i=this.attributes,r=null==i.daysInMonth.summary?u:i.daysInMonth.summary,e=null==i.shiftsInDay.summary?o:i.shiftsInDay.summary;return n.map(t.cags,function(n){return n.shortName=this.shortenCagName(n.name),n.group=t.groups[n.group],this.recountCag(n,r,e,s)},this)},parseGroups:function(t){return n.map(t.groups,function(n){return n.color||(n.color="#FFFFFF"),n.contrast=i.requiresContrast(n.color),n.plan=[0,0,0,0],n.maxOnLines=[0,0,0,0],n.utilization=[0,0,0,0],n})},parseLines:function(t){return n.map(t.lines,function(n,t){return{_id:t,name:this.wrapLineName(t),cags:n}},this)},shortenCagName:function(n){return n.length>28?n.substr(0,13).trim()+"..."+n.substr(-10).trim():""},wrapLineName:function(n){var t=n+"\n\n";if(n.length<=4)return t;for(var s=0;s<e.length;++s){var i=e[s],u=n.split(i);if(2===u.length)return u.join("\n"+i);if(u.length>2)return t=u.pop(),1===t.length&&(t=u.pop()+i+t),u.join(i)+"\n"+i+t}return t},recountMonth:function(n){var t=this.attributes,s=t.daysInMonth[n.key],i=t.daysInMonth.summary,r=t.shiftsInDay[n.key],e=t.shiftsInDay.summary;return n.days=null==i?u:i,n.customDays=null==s?null:s,n.shifts=null==e?o:e,n.customShifts=null==r?null:r,n},recountCags:function(){var t=this.attributes,s=null==t.daysInMonth.summary?u:t.daysInMonth.summary,i=null==t.shiftsInDay.summary?o:t.shiftsInDay.summary;this.resetGroupUtilization(),n.forEach(t.cags,function(n){this.recountCag(n,s,i,t.months)},this),this.recountGroupUtilization()},recountCag:function(t,s,i,r){var e=this.attributes;null==s&&(s=null==e.daysInMonth.summary?u:e.daysInMonth.summary),null==i&&(i=null==e.shiftsInDay.summary?o:e.shiftsInDay.summary),r||(r=e.months);var a=e.customLines[t._id];return t.customLines=null==a?null:a,t.customMonthLines=n.map(r,function(n){var s=e.customLines[t._id+n.key];return null==s?null:s}),t.maxOnLine=t.avgQPerShift*s*i,t.maxOnLines=t.maxOnLine*(null===t.customLines?t.lines:a),t.utilization=n.map(t.plan,function(n,s){var i=r[s],u=t.customMonthLines[s],o=null!==u?u:null!==t.customLines?t.customLines:t.lines,e=null===i.customDays?i.days:i.customDays,a=null===i.customShifts?i.shifts:i.customShifts,h=t.avgQPerShift*e*a,l=h*o,c=Math.round(n/l*100);return t.group.plan[s]+=n,t.group.maxOnLines[s]+=l,isNaN(c)||!isFinite(c)?0:c}),t},resetGroupUtilization:function(){n.forEach(this.attributes.groups,function(n){for(var t=0;t<4;++t)n.plan[t]=0,n.maxOnLines[t]=0,n.utilization[t]=0})},recountGroupUtilization:function(t){n.forEach(t||this.attributes.groups,function(t){n.forEach(t.utilization,function(n,s){var i=t.plan[s],u=t.maxOnLines[s];t.utilization[s]=0===u?0:Math.round(i/u*100)})}),this.trigger("recountGroupUtilization")},setCustomLines:function(t,s,i){var u=this.attributes,o=u.cags[t];if(o){var r=u.months[s];if(r||(s=-1),s!==-1){if(i===o.customMonthLines[s])return;null===i?delete u.customLines[o._id+r.key]:u.customLines[o._id+r.key]=i}else{if(i===o.customLines)return;null===i?delete u.customLines[o._id]:u.customLines[o._id]=i}n.forEach(o.utilization,function(n,t){var s=o.plan[t],i=0===n?0:100*s/n;o.group.plan[t]-=s,o.group.maxOnLines[t]-=i}),this.recountCag(o),this.recountGroupUtilization([o.group]),this.trigger("change:option",{option:"customLines",cagIndex:t,monthIndex:s}),this.trigger("change:customLines",{cagIndex:t,monthIndex:s,newValue:i}),this.trigger("change")}},setDaysInMonth:function(n,t){this.setMonthsOption("daysInMonth",u,n,t)},setShiftsInDay:function(n,t){this.setMonthsOption("shiftsInDay",o,n,t)},setMonthsOption:function(t,s,i,u){var o=this.attributes,r=o.months[i],e=o[t],a="summary";if(r?a=r.key:i=-1,u!==e[a]){null===u?delete e[a]:e[a]=u;var h=null==e.summary?s:e.summary;i!==-1&&null!==u&&(h=u),i===-1?n.forEach(o.months,this.recountMonth,this):this.recountMonth(o.months[i]),this.recountCags(),this.trigger("change:option",{option:t,cagIndex:-1,monthIndex:i}),this.trigger("change:"+t,{option:t,monthIndex:i,newValue:u,displayValue:h}),this.trigger("change")}},setHoursInShift:function(n){var t=this.attributes;n!==t.hoursInShift&&(t.hoursInShift=n,this.trigger("change:option",{option:"hoursInShift",cagIndex:-1,monthIndex:-1}),this.trigger("change:hoursInShift",{option:"hoursInShift",monthIndex:-1,newValue:n,displayValue:null===n?r:n}),this.trigger("change"))},serializeToCsv:function(){var s=[],i=this.get("months"),u=this.get("lines"),o=function(n){return'"'+n+'"'};return s.push(["cag","","","summary","","",""]),s.push(["id","name","group","avgQPerShift","maxOnLine","lineCount","maxOnLines"]),n.forEach(i,function(n){s[0].push(t.format(n._id,"YYYY-MM-DD"),"",""),s[1].push("plan","%util","lineCount")}),n.forEach(u,function(n,t){s[0].push(t>0?"":"lines"),s[1].push(o(n._id))}),n.forEach(this.get("cags"),function(t){var i=null===t.customLines?t.lines:t.customLines,r=[o(t._id),o(t.name),o(t.group.name),t.avgQPerShift,t.maxOnLine,i,t.maxOnLines];n.forEach(t.plan,function(n,s){r.push(n,t.utilization[s]+"%",null===t.customMonthLines[s]?i:t.customMonthLines[s])}),n.forEach(u,function(n){r.push(n.cags[t._id]||0)}),s.push(r)}),s.map(function(n){return n.join(";")}).join("\r\n")}},{DEFAULTS:{daysInMonth:u,shiftsInDay:o,hoursInShift:r},fromQuery:function(n){var t={},s=function(n,t){n&&n.split(",").forEach(function(n){var s=n.split("=");t[s[0]]=parseInt(s[1],10)})};n.days&&s(n.days,t.daysInMonth={}),n.shifts&&s(n.shifts,t.shiftsInDay={});var i=parseFloat(n.hours);return isNaN(i)||(t.hoursInShift=i),n.lines&&s(n.lines,t.customLines={}),new this(t)}})});