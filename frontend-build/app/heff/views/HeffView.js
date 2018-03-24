// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/data/localStorage","app/core/View","app/core/util/getShiftStartInfo","app/production/snManager","app/heff/templates/page"],function(t,e,i,s,n,o,a,r,d,h,c){"use strict";var u=[2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1];return r.extend({template:c,remoteTopics:function(){var t={};return this.model.prodLineId&&(t["heff.reload."+this.model.prodLineId]="loadData"),t},localTopics:{"socket.connected":"loadData","production.taktTime.snScanned":"onSnScanned"},events:{"click #-line":function(){var i=this.$id("line");i.find("select").length||(i.html('<i class="fa fa-spinner fa-spin"></i>'),this.ajax({url:"/prodLines?select(_id)&deactivatedAt=null"}).done(function(s){var n="";t.forEach(s.collection,function(e){n+="<option>"+t.escape(e._id)+"</option>"});var o=e("<select></select>").html(n);i.empty().append(o),o.val(a.getItem("HEFF:LINE")).on("change",function(){a.setItem("HEFF:LINE",o.val()),window.location.reload()})}))},"click #-snMessage":"hideSnMessage","mousedown #-switchApps":function(t){this.startActionTimer("switchApps",t)},"touchstart #-switchApps":function(){this.startActionTimer("switchApps")},"mouseup #-switchApps":function(){this.stopActionTimer("switchApps")},"touchend #-switchApps":function(){this.stopActionTimer("switchApps")},"mousedown #-reboot":function(t){this.startActionTimer("reboot",t)},"touchstart #-reboot":function(){this.startActionTimer("reboot")},"mouseup #-reboot":function(){this.stopActionTimer("reboot")},"touchend #-reboot":function(){this.stopActionTimer("reboot")},"mousedown #-shutdown":function(t){this.startActionTimer("shutdown",t)},"touchstart #-shutdown":function(){this.startActionTimer("shutdown")},"mouseup #-shutdown":function(){this.stopActionTimer("shutdown")},"touchend #-shutdown":function(){this.stopActionTimer("shutdown")}},initialize:function(){this.periodicUpdate=this.periodicUpdate.bind(this),this.loadData=this.loadData.bind(this),this.currentHour=-1,this.shiftStartInfo=null,this.actionTimer={action:null,time:null},e(window).on("keydown."+this.idPrefix,this.onKeyDown.bind(this))},destroy:function(){e(window).off("."+this.idPrefix)},serialize:function(){return{idPrefix:this.idPrefix,showParentControls:window.parent!==window}},afterRender:function(){this.updateLine(),this.periodicUpdate(),this.loadData(),window.parent!==window&&window.parent.postMessage({type:"ready",app:"heff"},"*")},loadData:function(){var e=this;if(e.model.prodLineId){var i="/heff/"+encodeURIComponent(e.model.prodLineId);clearTimeout(e.timers.loadData),e.ajax({url:i}).done(function(i){e.updateData(i),e.timers.loadData=setTimeout(e.loadData,t.random(25e3,35e3))})}},periodicUpdate:function(){var t=s.getMoment(),e=t.hours();this.updateDate(t),e!==this.currentHour&&(this.currentHour=e,this.hourlyUpdate(t)),this.timers.periodicUpdate=setTimeout(this.periodicUpdate,1e3)},hourlyUpdate:function(t){this.updateShift(t),this.updateTitle(t)},updateDate:function(t){this.$id("date").html(t.format("dddd, LL<br>LTS"))},updateShift:function(t){this.shiftStartInfo=d(t.valueOf());var e=i("core","SHIFT:"+this.shiftStartInfo.shift);this.$id("shift").html(i("heff","shift",{shift:e}))},updateLine:function(){this.$id("line").html(this.model.prodLineId||"?")},updateTitle:function(t){this.$id("title").html(i("heff","title",{from:this.shiftStartInfo.moment.format("H:00"),to:t.clone().add(1,"hours").format("H:00")}))},updateData:function(t){for(var e=s.getMoment(),i=e.hours(),n=u[i],o=e.minutes(),a=0,r=0,d=0,h=0,c=0;c<8;++c){var p=t[c].planned,f=t[c].actual;d+=p,h+=f,c<n?(a+=p,r+=p):c===n&&(r+=p,a+=Math.round(p*(o/60)*1e3)/1e3)}this.$id("planned").text(r),this.$id("actual").text(h),this.$id("remaining").text(Math.max(d-h,0)),this.$id("eff").removeClass("fa-smile-o fa-frown-o fa-meh-o").addClass(h>=a?"fa-smile-o":"fa-frown-o")},startActionTimer:function(t,e){this.actionTimer.action=t,this.actionTimer.time=Date.now(),e&&e.preventDefault()},stopActionTimer:function(t){if(this.actionTimer.action===t){var e=Date.now()-this.actionTimer.time>3e3;"switchApps"===t?e?window.parent.postMessage({type:"config"},"*"):window.parent.postMessage({type:"switch",app:"heff"},"*"):"reboot"===t?e?window.parent.postMessage({type:"reboot"},"*"):window.parent.postMessage({type:"refresh"},"*"):e&&"shutdown"===t&&window.parent.postMessage({type:"shutdown"},"*"),this.actionTimer.action=null,this.actionTimer.time=null}},onKeyDown:function(t){var e=t.target.tagName,i="INPUT"===e&&"BUTTON"!==t.target.type||"SELECT"===e||"TEXTAREA"===e;8!==t.keyCode||i&&!t.target.readOnly&&!t.target.disabled||t.preventDefault(),h.handleKeyboardEvent(t)},onSnScanned:function(t){if(!o.currentDialog){var e=this;if(!t.orderNo)return e.showSnMessage(t,"error","UNKNOWN_CODE");if(h.contains(t._id))return e.showSnMessage(t,"error","ALREADY_USED");e.showSnMessage(t,"warning","CHECKING");var i={_id:null,instanceId:window.INSTANCE_ID,type:"checkSerialNumber",data:t,createdAt:s.getMoment().toDate(),creator:n.getInfo(),prodLine:e.model.prodLineId};t.sapTaktTime=-1;var a=e.ajax({method:"POST",url:"/production/checkSerialNumber",data:JSON.stringify(i),timeout:6e3});a.fail(function(i){if(i.status<200)return void e.showSnMessage(t,"success","SUCCESS");e.showSnMessage(t,"error","SERVER_FAILURE")}),a.done(function(i){"SUCCESS"===i.result?e.showSnMessage(i.serialNumber,"success","SUCCESS"):("ALREADY_USED"===i.result&&h.add(i.serialNumber),e.showSnMessage(t,"error",i.result))})}},showSnMessage:function(t,e,s){var n=this.$id("snMessage");this.$id("snMessage-text").html(i("heff","snMessage:"+s)),this.$id("snMessage-scannedValue").text(t._id.length>19?t._id.substring(0,16)+"...":t._id),this.$id("snMessage-orderNo").text(t.orderNo||"-"),this.$id("snMessage-serialNo").text(t.serialNo||"-"),n.css({top:"50%",marginTop:"-80px"}).removeClass("hidden is-success is-error is-warning").addClass("is-"+e),this.timers.hideSnMessage&&clearTimeout(this.timers.hideSnMessage),this.timers.hideSnMessage=setTimeout(this.hideSnMessage.bind(this),6e3)},hideSnMessage:function(){this.timers.hideSnMessage=null,this.$id("snMessage").addClass("hidden")}})});