define(["underscore","jquery","app/broker","app/viewport","app/i18n","app/time","app/user","app/data/prodLog","app/data/localStorage","app/production/views/BomCheckerDialogView","app/production/templates/snMessage","i18n!app/nls/production"],function(e,t,n,a,i,s,o,r,d,c,l){"use strict";var u=/[A-Z0-9]{4}\.000000000\.0000/,g=null,p="",h=JSON.parse(d.getItem("PRODUCTION:SN")||"{}"),m={_id:"",count:0,time:0},f=null,S=[];function w(e){if(e&&(p=e),e=p.trim(),p="",S.length>100&&S.pop(),S.unshift({buffer:e,timestamp:new Date}),"<ESC>"===e||"1337000027"===e)return a.closeAllDialogs();var t=e.match(/P0*([0-9]{9})([0-9]{4})/);t||(t=e.match(/([A-Z0-9]{4}\.([0-9]{9})\.([0-9]{4}))$/))&&/^[A-Z0-9]+\.[0-9]+\.[0-9]+\.[A-Z0-9]+$/.test(e)&&(t=null),t?n.publish("production.taktTime.snScanned",{_id:t[1],scannedAt:new Date,orderNo:t[2],serialNo:+t[3]}):e.length>5&&n.publish("production.taktTime.snScanned",{_id:e,scannedAt:new Date,orderNo:null,serialNo:null})}return window.scanBufferLog=S,window.fakeSN=w,{handleKeyboardEvent:function(e){e.target.classList.contains("form-control")&&void 0===e.target.dataset.snAccept||e.key&&1===e.key.length&&(p+=e.key.toUpperCase(),clearTimeout(g),g=setTimeout(w,50))},contains:function(e){return!u.test(e)&&!!h[e]},add:function(e){u.test(e)||(h[e._id]=[Date.parse(e.scannedAt),e.prodShiftOrder,e.prodLine],d.setItem("PRODUCTION:SN",JSON.stringify(h)))},clear:function(){h={},d.removeItem("PRODUCTION:SN")},getLocalTaktTime:function(t,n,a){var i=1,s=1,o=t.scannedAt.getTime(),r=new Date(n.get("startedAt")).getTime(),d=(new Date).getHours(),c=n.get("prodLine");Object.keys(h).forEach(function(e){var t=h[e];t[1]===n.id&&(i+=1,r=t[0]),t[2]===c&&new Date(t[0]).getHours()===d&&(s+=1)});var l=o-r;return{result:"SUCCESS",serialNumber:e.assign({taktTime:l,prodShiftOrder:n.id,prodLine:c},t),quantityDone:i,lastTaktTime:l,avgTaktTime:0,hourlyQuantityDone:{index:a,value:s}}},showMessage:function(n,a,s,o){if(this.view){var r=t("#snMessage");r.length||(r=t(l()).appendTo("body")).on("click",this.hideMessage.bind(this));var d=n._id.length>43?n._id.substring(0,40)+"...":n._id;!o&&e.includes(["MAX_TOTAL","MAX_LINE"],s)&&(o=18e3),t("#snMessage-text").html("function"==typeof s?s():i("production","snMessage:"+s));var c=0===d.length,u=0===(n.orderNo||"").length,g=0===(n.serialNo||"").length;r.find(".production-snMessage-props").toggleClass("hidden",c&&u&&g),t("#snMessage-scannedValue").text(d).closest(".production-snMessage-prop").toggleClass("hidden",c),t("#snMessage-orderNo").text(n.orderNo||"-").closest(".production-snMessage-prop").toggleClass("hidden",u),t("#snMessage-serialNo").text(n.serialNo||"-").closest(".production-snMessage-prop").toggleClass("hidden",g),r.css({top:"50%",marginTop:"-80px"}).removeClass("hidden is-success is-error is-warning").addClass("is-"+a),this.view.timers.hideSnMessage&&clearTimeout(this.view.timers.hideSnMessage),this.view.timers.hideSnMessage=setTimeout(this.hideMessage.bind(this),o||6e3)}},hideMessage:function(){this.view&&(this.view.timers.hideSnMessage&&clearTimeout(this.view.timers.hideSnMessage),this.view.timers.hideSnMessage=null,t("#snMessage").addClass("hidden"))},createDynamicLogEntry:function(e){var t={_id:null,instanceId:window.INSTANCE_ID,type:"checkSerialNumber",data:e,createdAt:s.getMoment().toDate(),creator:o.getInfo(),prodLine:window.WMES_LINE_ID,station:window.WMES_STATION||0};return e.sapTaktTime=-1,t},bind:function(e){var n=this;if(n.view)throw new Error("snManager already bound!");n.view=e;var s=e.destroy;function o(e){var t=e.target.tagName,n="INPUT"===t&&"BUTTON"!==e.target.type||"SELECT"===t||"TEXTAREA"===t;8!==e.keyCode||n&&!e.target.readOnly&&!e.target.disabled||e.preventDefault(),e.target.classList.contains("form-control")&&void 0===e.target.dataset.snAccept||e.key&&1===e.key.length&&(p+=e.key.toUpperCase(),clearTimeout(g),g=setTimeout(w,50))}function d(e){if(e){if(a.currentDialog){if(!(a.currentDialog instanceof c))return;return void(e.orderNo?function(e){var t=a.currentDialog.model.logEntry.data;if(e._id===t._id)return void d();0===e.serialNo&&/^0+$/.test(e.orderNo)||e.orderNo!==t.orderNo?(a.closeAllDialogs(),l(e)):(a.currentDialog.onSnScanned(e),d())}(e):(a.currentDialog.onSnScanned(e),d()))}e.orderNo?l(e):l({_id:"0000.000000000.0000",orderNo:"000000000",serialNo:0,scannedAt:(t=e).scannedAt},t)}else{var t;f&&(f.length?d(f.shift()):f=null)}}function l(t,a){if(e.createCheckSn)e.createCheckSn(t,a,u);else{var i=n.contains(t._id)?"ALREADY_USED":null;i&&n.showMessage(t,"error",i),u(i,n.createDynamicLogEntry(t),a)}}function u(t,s,o){if(t)d();else{var l=e.model,g=l&&l.updateTaktTime&&l.updateTaktTimeLocally;n.showMessage(s.data,"warning","CHECKING"),m._id===s.data._id&&m.count>=2&&s.data.scannedAt-m.time<3e3&&(s.data.skipMaxCheck=!0);var p=e.ajax({method:"POST",url:"/production/checkSerialNumber?bomCheck="+(o?1:0),data:JSON.stringify(s),timeout:6e3});p.fail(function(e){if(e.status<200)return g&&l.updateTaktTimeLocally(s),n.showMessage(s.data,"success","SUCCESS"),void d();g&&(s.data.error="SERVER_FAILURE",r.record(l,s)),n.showMessage(s.data,"error","SERVER_FAILURE"),d()}),p.done(function(t){"MAX_TOTAL"===t.result||"MAX_LINE"===t.result?(m._id===s.data._id&&s.data.scannedAt-m.time<3e3?m.count+=1:(m._id=s.data._id,m.count=1),m.time=s.data.scannedAt.getTime()):m._id="","CHECK_BOM"===t.result?function(t,s){n.hideMessage(),s&&(t.logEntry.data._id="0000.000000000.0000",t.logEntry.data.serialNo=0);var o=!1,r=new c({model:t,snMessage:{show:n.showMessage.bind(n),hide:n.hideMessage.bind(n)}});e.listenToOnce(r,"dialog:hidden",function(){o||(o=!0,d())}),e.listenToOnce(r,"dialog:shown",function(){s&&r.onSnScanned(s),o||(o=!0,d())}),e.listenToOnce(r,"checked",function(e){o=!0,a.closeAllDialogs(),u(null,e)}),a.showDialog(r,i("production","bomChecker:title"))}(t,o):"SUCCESS"===t.result?(g&&l.updateTaktTime(t),n.showMessage(t.serialNumber,"success","SUCCESS"),d()):("ALREADY_USED"===t.result&&n.add(t.serialNumber),g&&(s.data.error=t.result,r.record(l,s)),n.showMessage(s.data,"error",t.result),d())})}}e.destroy=function(){t(window).off("keydown",o),s.apply(e,arguments)},e.broker.subscribe("production.taktTime.snScanned",function(e){if(n.view&&n.view.onSnScanned)return void n.view.onSnScanned(e);if(f)return void f.push(e);f=[],d(e)}),t(window).on("keydown",o)}}});