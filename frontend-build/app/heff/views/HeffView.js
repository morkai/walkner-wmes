// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/data/localStorage","app/core/View","app/core/util/getShiftStartInfo","app/heff/templates/page"],function(t,i,e,o,n,s,a,r){"use strict";var h=[2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1];return s.extend({template:r,remoteTopics:function(){var t={};return this.model.prodLineId&&(t["heff.reload."+this.model.prodLineId]="loadData"),t},localTopics:{"socket.connected":"loadData"},events:{"click #-line":function(){var e=this.$id("line");e.find("select").length||(e.html('<i class="fa fa-spinner fa-spin"></i>'),this.ajax({url:"/prodLines?select(_id)&deactivatedAt=null"}).done(function(o){var s="";t.forEach(o.collection,function(i){s+="<option>"+t.escape(i._id)+"</option>"});var a=i("<select></select>").html(s);e.empty().append(a),a.val(n.getItem("HEFF:LINE")).on("change",function(){n.setItem("HEFF:LINE",a.val()),window.location.reload()})}))},"mousedown #-switchApps":function(t){this.startActionTimer("switchApps",t)},"touchstart #-switchApps":function(){this.startActionTimer("switchApps")},"mouseup #-switchApps":function(){this.stopActionTimer("switchApps")},"touchend #-switchApps":function(){this.stopActionTimer("switchApps")},"mousedown #-reboot":function(t){this.startActionTimer("reboot",t)},"touchstart #-reboot":function(){this.startActionTimer("reboot")},"mouseup #-reboot":function(){this.stopActionTimer("reboot")},"touchend #-reboot":function(){this.stopActionTimer("reboot")},"mousedown #-shutdown":function(t){this.startActionTimer("shutdown",t)},"touchstart #-shutdown":function(){this.startActionTimer("shutdown")},"mouseup #-shutdown":function(){this.stopActionTimer("shutdown")},"touchend #-shutdown":function(){this.stopActionTimer("shutdown")}},initialize:function(){this.periodicUpdate=this.periodicUpdate.bind(this),this.loadData=this.loadData.bind(this),this.currentHour=-1,this.shiftStartInfo=null,this.actionTimer={action:null,time:null}},serialize:function(){return{idPrefix:this.idPrefix,showParentControls:window.parent!==window}},afterRender:function(){this.updateLine(),this.periodicUpdate(),this.loadData(),window.parent!==window&&window.parent.postMessage({type:"ready",app:"heff"},"*")},loadData:function(){var i=this,e="/prodShifts?select(date,shift,quantitiesDone)&sort(date)&prodLine="+encodeURIComponent(i.model.prodLineId)+"&date>="+i.shiftStartInfo.moment.clone().hours(6).valueOf();clearTimeout(i.timers.loadData),i.ajax({url:e}).done(function(e){e.collection&&e.collection.length&&i.updateData(e.collection),i.timers.loadData=setTimeout(i.loadData,t.random(3e4,4e4))})},periodicUpdate:function(){var t=o.getMoment(),i=t.hours();this.updateDate(t),i!==this.currentHour&&(this.currentHour=i,this.hourlyUpdate(t)),this.timers.periodicUpdate=setTimeout(this.periodicUpdate,1e3)},hourlyUpdate:function(t){this.updateShift(t),this.updateTitle(t)},updateDate:function(t){this.$id("date").html(t.format("dddd, LL<br>LTS"))},updateShift:function(t){this.shiftStartInfo=a(t.valueOf());var i=e("core","SHIFT:"+this.shiftStartInfo.shift);this.$id("shift").html(e("heff","shift",{shift:i}))},updateLine:function(){this.$id("line").html(this.model.prodLineId||"?")},isFirstHour:function(){return this.currentHour===this.shiftStartInfo.moment.hours()},isLastHour:function(){return this.currentHour===this.shiftStartInfo.moment.hours()+7},updateTitle:function(t){var i,o=this.shiftStartInfo.moment.format("H:00");i=this.isFirstHour()||this.isLastHour()?t.clone().add(1,"hours").format("H:00"):t.format("H:00"),this.$id("title").html(e("heff","title",{from:o,to:i}))},updateData:function(t){for(var i=this.shiftStartInfo.moment.valueOf(),e=this.isFirstHour(),n=this.isLastHour(),s=h[this.currentHour],a=0,r=0,u=0,c=0,d=0;d<t.length;++d){var p=t[d];if(p.date=o.getMoment(p.date),p.date.valueOf()===i){var f=p.date.clone();u+=a+=p.quantitiesDone[0].planned,c+=r+=p.quantitiesDone[0].actual;for(var l=1;8>l;++l){f.add(1,"hour");var m=p.quantitiesDone[l];(h[f.hours()]<s||n&&f.hours()===this.currentHour)&&(a+=m.planned,r+=m.actual),u+=m.planned,c+=m.actual}}}this.$id("planned").text(a),this.$id("actual").text(r),this.$id("remaining").text(Math.max(u-c,0));var w=this.$id("eff").removeClass("fa-smile-o fa-frown-o fa-meh-o");e?w.addClass("fa-meh-o"):w.addClass(r>=a?"fa-smile-o":"fa-frown-o")},startActionTimer:function(t,i){this.actionTimer.action=t,this.actionTimer.time=Date.now(),i&&i.preventDefault()},stopActionTimer:function(t){if(this.actionTimer.action===t){var i=Date.now()-this.actionTimer.time>3e3;"switchApps"===t?i?window.parent.postMessage({type:"config"},"*"):window.parent.postMessage({type:"switch",app:"heff"},"*"):"reboot"===t?i?window.parent.postMessage({type:"reboot"},"*"):window.parent.postMessage({type:"refresh"},"*"):i&&"shutdown"===t&&window.parent.postMessage({type:"shutdown"},"*"),this.actionTimer.action=null,this.actionTimer.time=null}}})});