define(["underscore","jquery","app/time","app/i18n","app/viewport","app/data/downtimeReasons","app/data/prodLines","app/core/Model","app/core/views/FormView","app/users/util/setUpUserSelect2","../PressWorksheetCollection","app/pressWorksheets/templates/form","app/pressWorksheets/templates/ordersTable","app/pressWorksheets/templates/ordersTableRow","app/pressWorksheets/templates/ordersTableNotesRow"],function(t,e,s,i,r,o,n,a,d,l,h,p,u,c,f){"use strict";return d.extend({template:p,events:{keydown:function(t){13===t.keyCode&&"TEXTAREA"!==t.target.tagName&&t.preventDefault()},"click button[type=submit]":function(t){this.checkOverlapping=t.target.classList.contains("btn-primary")},submit:function(t){return this.removeIsOverlapping(),this.submitForm(t)},"blur .pressWorksheets-form-time":function(t){var e=t.target.value;if(/opWorkDuration$/.test(t.target.name)&&/[0-9]+%/.test(t.target.value)){var i=this.$(t.target).closest("tr"),r=s.utc.getMoment(i.find('input[name$="startedAt"]').val(),"HH:mm"),o=s.utc.getMoment(i.find('input[name$="finishedAt"]').val(),"HH:mm").diff(r);o>0?(o*=parseInt(e,10)/100,e=Math.round(o/6e4).toString()):e=""}if(e=e.trim(),/^[0-9]+$/.test(e)&&(e+="m"),/[a-z]/.test(e)&&(e=s.toString(s.toSeconds(e),!0).split(":").slice(0,2).join(":")),0!==(e=e.replace(/[^0-9: \-]+/g,"").trim()).length){var n=e.match(/^([0-9]+)(?::| +|-)+([0-9]+)/),a=0,d=0;n?(a=parseInt(n[1],10),d=parseInt(n[2],10)):4===e.length?(a=parseInt(e.substr(0,2),10),d=parseInt(e.substr(2),10)):3===e.length?(a=parseInt(e[0],10),d=parseInt(e.substr(1),10)):d=parseInt(e,10);var l=isNaN(a)||a>=24,h=isNaN(d)||d>=60;l&&(a=0),h&&(d=0),t.target.value=(a<10?"0":"")+a.toString(10)+":"+(d<10?"0":"")+d.toString(10),this.validateTimes(t.target)}else t.target.value=""},"blur .pressWorksheets-form-count":function(t){var e=parseInt(t.target.value,10);t.target.value=isNaN(e)?"":e,t.target.classList.contains("is-downtime")&&this.validateTimes(t.target)},"blur .pressWorksheets-form-quantityDone":function(t){var e=parseInt(t.target.value,10);t.target.value=isNaN(e)||e<0?"":e,this.calcOpWorkDuration(t.currentTarget)},"focus input":function(t){t.target.classList.contains("select2-focusser")&&t.target.parentNode.classList.contains("pressWorksheets-form-part")?this.$(".table-responsive").prop("scrollLeft",0):t.target.classList.contains("pressWorksheets-form-time")&&t.target.parentNode.classList.contains("form-group")&&(this.paintShopTimeFocused=!0)},"focus .pressWorksheets-form-order input":function(t){var e=this.$(t.target);e.closest("td").addClass("is-focused"),e.hasClass("select2-focusser")&&(e=e.parent().next("input")),e.length&&e[0].dataset.column&&this.$('th[data-column="'+e[0].dataset.column+'"]').addClass("is-focused")},"blur .pressWorksheets-form-order input":function(t){this.$(t.target).closest("td").removeClass("is-focused"),this.$("th.is-focused").removeClass("is-focused")},"change input[name=shift]":function(){this.checkShiftStartTimeValidity(),this.validateTimes(null),this.checkForExistingWorksheet()},"change input[name=date]":function(){this.checkShiftStartTimeValidity(),this.checkForExistingWorksheet()},"change input[name=operator]":function(){this.checkForExistingWorksheet()},"change input[name=type]":function(){this.prepareProdLinesData(),this.togglePaintShop(),this.filling||(this.renderOrdersTable(),this.addOrderRow())},'change input[name$=".part"]':function(t){this.calcOpWorkDuration(t.currentTarget)},'change input[name$=".operation"]':function(t){this.calcOpWorkDuration(t.currentTarget)},"click .pressWorksheets-form-comment":function(t){var e=this.$(t.currentTarget).closest(".pressWorksheets-form-order").next(".pressWorksheets-form-notes");e[e.is(":visible")?"fadeOut":"fadeIn"]("fast",function(){e.find("textarea").focus()})}},initialize:function(){d.prototype.initialize.apply(this,arguments),this.checkOverlapping=!0,this.filling=!1,this.lastOrderNo=-1,this.lossReasons=[],this.downtimeReasons=[],this.paintShopTimeFocused=!1,this.onKeyDown=this.onKeyDown.bind(this),this.existingWorksheets=new h(null,{rqlQuery:"select(rid)"}),this.listenTo(this.existingWorksheets,"request",function(){this.$id("existingWarning").fadeOut()}),this.listenTo(this.existingWorksheets,"reset",this.toggleExistingWarning),e(document.body).on("keydown."+this.idPrefix,this.onKeyDown)},destroy:function(){e(document.body).off("."+this.idPrefix)},afterRender:function(){d.prototype.afterRender.call(this),this.prepareProdLinesData(),l(this.$id("master"));var t=l(this.$id("operator")),e=l(this.$id("operators"),{multiple:!0}),s=this;e.on("change",function(){t.select2("data")||(t.select2("data",e.select2("data")[0]),s.checkForExistingWorksheet())}),this.fillType(),this.togglePaintShop(),this.renderOrdersTable(),this.fillModelData(),this.addOrderRow(),this.model.id||this.$id("type").focus()},prepareProdLinesData:function(){var t=Date.parse(this.model.get("createdAt")||new Date)<s.getMoment().subtract(1,"days").valueOf();this.prodLinesData=n.filter(function(e){var s=e.getSubdivision();if(!s)return!1;var i=s.get("type");return("press"===i||"paintShop"===i)&&(t||!e.get("deactivatedAt"))}).map(function(t){return{id:t.id,text:t.id}})},renderOrdersTable:function(){var t="optics"===this.getType(),e=t?"opticsPosition":"pressPosition";this.lossReasons=t?[]:this.model.lossReasons.toJSON(),this.downtimeReasons=o.filter(function(t){return t.get(e)>=0}).map(function(t){return t.toJSON()}).sort(function(t,s){return t[e]-s[e]}),this.lastOrderNo=-1,this.$id("ordersTable").html(this.renderPartial(u,{rowspan:this.lossReasons.length||this.downtimeReasons.length?2:0,lossReasons:this.lossReasons,downtimeReasons:this.downtimeReasons}))},serializeForm:function(t){var e=this.$(".pressWorksheets-form-order");t.orders=(t.orders||[]).filter(function(t){return t.part&&t.part.length&&t.operation&&t.operation.length}).map(this.serializeOrder.bind(this,e,this.model.lossReasons)),t.operators=this.$id("operators").select2("data").map(r),t.operator=r(this.$id("operator").select2("data")),t.master=r(this.$id("master").select2("data")),t.shift=parseInt(t.shift,10);var s={},i={};function r(t){return{id:t.id,label:t.text}}return t.orders.forEach(function(t){s[t.division]=1,i[t.prodLine]=1}),t.divisions=Object.keys(s),t.prodLines=Object.keys(i),t},serializeOrder:function(e,s,i,r){var a=e.eq(r),d=a.find(".pressWorksheets-form-part"),l=d.select2("data").data;l._id&&(l.nc12=l._id,delete l._id);var h=t.find(l.operations,function(t){return t.no===i.operation}),p=[];i.losses&&Object.keys(i.losses).forEach(function(t){t=s.get(t),i.losses[t.id]>0&&p.push({reason:t.id,label:t.get("label"),count:parseInt(i.losses[t.id],10)})});var u=[];i.downtimes&&Object.keys(i.downtimes).forEach(function(t){var e=parseInt(i.downtimes[t],10);if(e>0){t=o.get(t);var s=a.find('.is-downtime[data-reason="'+t.id+'"]');u.push({prodDowntime:s.attr("data-prodDowntime")||null,reason:t.id,label:t.get("label"),duration:e})}});var c=n.get(i.prodLine).getSubdivision(),f=0;if(i.opWorkDuration){var m=i.opWorkDuration.split(":");f=1e3*(3600*m[0]+60*m[1])/36e5}return{prodShiftOrder:d.attr("data-prodShiftOrder")||null,division:c?c.get("division"):null,prodLine:i.prodLine,nc12:l.nc12,name:l.name,operationNo:h.no,operationName:h.name,orderData:l,quantityDone:i.quantityDone,startedAt:i.startedAt||null,finishedAt:i.finishedAt||null,opWorkDuration:f,losses:p,downtimes:u,notes:i.notes||""}},checkShiftStartTimeValidity:function(){var t=this.$id("date"),e=this.getShiftMoment();if(t[0].setCustomValidity(e.valueOf()>Date.now()?i("pressWorksheets","FORM:ERROR:date"):""),this.isPaintShop()){var s=this.$id("startedAt"),r=this.$id("finishedAt");if(!e.isValid())return;this.paintShopTimeFocused||(s.val(e.format("HH:mm")),r.val(e.add(8,"hours").format("HH:mm")))}},getShiftMoment:function(){var t=this.$id("date"),e=parseInt(this.$("input[name=shift]:checked").val(),10);return s.getMoment(t.val()+" 06:00:00","YYYY-MM-DD HH:mm:ss").add(8*(e-1),"hours")},getType:function(){return this.$("input[name=type]:checked").val()},isPaintShop:function(){return"paintShop"===this.getType()},showFieldError:function(t,e){return t.hasClass("select2-offscreen")?t.select2("focus"):t.focus(),this.$errorMessage=r.msg.show({type:"error",time:3e3,text:i("pressWorksheets","FORM:ERROR:"+e)}),!1},setUpOrderSelect2:function(t){var e=this;t.removeClass("form-control"),t.select2({allowClear:!0,minimumInputLength:10,ajax:{cache:!0,quietMillis:300,url:function(t){return"/production/orders?nc12="+encodeURIComponent(t)},results:function(t){return{results:(t||[]).map(function(t){return{id:t._id,text:t._id+" - "+(t.name||"?"),data:t}})}}}}),t.on("change",function(s){var i=t.closest(".pressWorksheets-form-order"),r=i.next(),o=e.isLastOrderRow(i);if(!s.added&&!o){var n=i.next().next();return n.length||(n=i.prev().prev()),n.find(".pressWorksheets-form-part").select2("focus"),r.is(":visible")?r.fadeOut(function(){r.remove()}):r.remove(),i.fadeOut(function(){i.remove(),e.setUpPartValidation(),e.recalcOrderNoColumn()}),void(s.added||2!==e.$(".pressWorksheets-form-order").length||e.$id("typeChangeWarning").fadeOut())}var a=[];s.added&&Array.isArray(s.added.data.operations)&&s.added.data.operations.forEach(function(t){""!==t.workCenter&&-1!==t.laborTime&&a.push(t)});var d=i.find(".pressWorksheets-form-operation");e.setUpOperationSelect2(d,a.map(function(t){return{id:t.no,text:t.no+" - "+(t.name||"?")}})),a.length?d.select2("val",a[0].no).select2("focus"):(d.select2("destroy"),d.select2("destroy"),d.addClass("form-control").val(""),t.select2("focus")),o&&e.addOrderRow(i)})},setUpOperationSelect2:function(t,e){t.removeClass("form-control"),t.select2({openOnEnter:null,allowClear:!1,data:e||[]})},setUpProdLineSelect2:function(t,e){t.removeClass("form-control"),t.select2({width:"185px",openOnEnter:null,allowClear:!1,data:this.prodLinesData}),e&&t.select2("val",e.find(".pressWorksheets-form-prodLine").select2("val"))},isLastOrderRow:function(t){return this.$("tbody > tr:last-child").prev()[0]===t[0]},addOrderRow:function(t,s){s=!1!==s,++this.lastOrderNo;var i=e(c({no:this.lastOrderNo,lossReasons:this.lossReasons,downtimeReasons:this.downtimeReasons})),r=e(f({no:this.lastOrderNo,colspan:i.find("td").length}));r.hide(),this.lastOrderNo>0&&s&&i.hide(),this.$(".pressWorksheets-form-prodLine:last-child").attr("required",!0),this.$(".pressWorksheets-form-quantityDone:last-child").attr("required",!0),this.isPaintShop()||(this.$(".pressWorksheets-form-startedAt:last-child").attr("required",!0),this.$(".pressWorksheets-form-finishedAt:last-child").attr("required",!0)),this.$(".pressWorksheets-form-orders > tbody").append(i).append(r),this.lastOrderNo>0&&s&&i.fadeIn(),this.setUpOrderSelect2(i.find(".pressWorksheets-form-part")),this.setUpProdLineSelect2(i.find(".pressWorksheets-form-prodLine"),t);var o=this.$id("typeChangeWarning");return s?this.lastOrderNo>0?o.fadeIn():o.fadeOut():o.toggle(this.lastOrderNo>0),s&&(this.setUpPartValidation(),this.recalcOrderNoColumn()),t&&this.copyDataFromPrevRow(t),i},copyDataFromPrevRow:function(t){var e=t.prev();e.length&&(t.find(".pressWorksheets-form-prodLine").select2("val",e.find(".pressWorksheets-form-prodLine").select2("val")),t.find(".pressWorksheets-form-startedAt").val(e.find(".pressWorksheets-form-finishedAt").val()))},setUpPartValidation:function(){var t=this.$("input.pressWorksheets-form-part");t.last().attr("required",1===t.length)},recalcOrderNoColumn:function(){this.$(".pressWorksheets-form-order").each(function(t){var s=e(this),i=s.next();s.find(".pressWorksheets-form-no").text(t+1+".");var r=t%2!=0;s.toggleClass("is-even",r),i.toggleClass("is-even",r)})},togglePaintShop:function(){var t=this.isPaintShop();this.$el.toggleClass("pressWorksheets-form-paintShop",t),this.$(".pressWorksheets-form-group-paintShop input").attr("required",t)},validateTimes:function(t){if(this.isPaintShop())this.checkPaintShopValidity();else if(t)this.checkOrderTimesValidity(t);else{var e=this;this.$(".pressWorksheets-form-startedAt").each(function(){e.checkOrderTimesValidity(this)})}},checkPaintShopValidity:function(){var t=this.$id("startedAt"),e=this.$id("finishedAt");t[0].setCustomValidity(""),e[0].setCustomValidity(""),this.checkTimesValidity(null,t,e)},checkOrderTimesValidity:function(t){var e=this.$(t).closest(".pressWorksheets-form-order"),s=e.find(".pressWorksheets-form-startedAt"),i=e.find(".pressWorksheets-form-finishedAt");s[0].setCustomValidity(""),i[0].setCustomValidity(""),s.prop("required")&&""!==s.val()&&""!==i.val()&&this.checkTimesValidity(e,s,i)},checkTimesValidity:function(t,e,r){var o=this.$id("date").val();o||(o=s.format(new Date,"YYYY-MM-DD"));var n=this.getShiftMoment().valueOf(),a=n+288e5,d=this.getTimeFromString(o,e.val(),!1),l=this.getTimeFromString(o,r.val(),!0);if(d<n||d>a)return e[0].setCustomValidity(i("pressWorksheets","FORM:ERROR:startedAt:boundries"));if(l<n||l>a)return r[0].setCustomValidity(i("pressWorksheets","FORM:ERROR:finishedAt:boundries"));if(l<=d)return r[0].setCustomValidity(i("pressWorksheets","FORM:ERROR:finishedAt:gt"));var h=(l-d)/36e5;return this.countDowntimeDuration(this.isPaintShop()?null:t)>=h?r[0].setCustomValidity(i("pressWorksheets","FORM:ERROR:finishedAt:downtime")):void 0},checkValidity:function(){if(!this.checkOverlapping)return!0;for(var t=this.el.querySelectorAll(".pressWorksheets-form-order"),e=t.length-1,s=this.$id("date").val(),i={},r=0;r<e;++r){var o=t[r],n=o.querySelector("input.pressWorksheets-form-prodLine").value;i[n]||(i[n]=[]),i[n].push({orderRowEl:o,startedAt:this.getTimeFromString(s,o.querySelector(".pressWorksheets-form-startedAt").value,!1),finishedAt:this.getTimeFromString(s,o.querySelector(".pressWorksheets-form-finishedAt").value,!1)})}var a=!0,d=this;return Object.keys(i).forEach(function(t){if(a)for(var e=i[t];e.length;)for(var s=e.shift(),r=0,o=e.length;r<o;++r){var n=e[r];if(n.startedAt>=s.startedAt&&n.startedAt<s.finishedAt||n.finishedAt>s.startedAt&&n.finishedAt<=s.finishedAt)return void(a=d.showOverlappingError(s,n));if(s.startedAt>=n.startedAt&&s.startedAt<n.finishedAt||s.finishedAt>n.startedAt&&s.finishedAt<=n.finishedAt)return void(a=d.showOverlappingError(n,s))}}),a},showOverlappingError:function(t,e){return this.$errorMessage=r.msg.show({type:"error",time:5e3,text:i("pressWorksheets","FORM:ERROR:overlapping")}),t.orderRowEl.classList.add("is-overlapping"),e.orderRowEl.classList.add("is-overlapping"),this.timers.removeIsOverlapping=setTimeout(this.removeIsOverlapping.bind(this),5e3),this.$(".btn-danger").fadeIn(),!1},removeIsOverlapping:function(){this.timers.removeIsOverlapping&&(clearTimeout(this.timers.removeIsOverlapping),this.timers.removeIsOverlapping=null),this.$(".is-overlapping").removeClass("is-overlapping"),this.$(".btn-danger").fadeOut()},countDowntimeDuration:function(t){var e=0;return(t||this.$el).find(".pressWorksheets-form-count.is-downtime").each(function(){var t=parseInt(this.value,10);e+=isNaN(t)||t<=0?0:t}),e/60},getTimeFromString:function(t,e,i){var r=s.getMoment(t+" "+e+":00","YYYY-MM-DD HH:mm:ss");return i&&6===r.hours()&&0===r.minutes()&&r.hours(5).minutes(59).seconds(59).milliseconds(999),r.hours()<6&&r.add(1,"days"),r.valueOf()},serializeToForm:function(){return{type:this.model.get("type")}},fillModelData:function(){this.filling=!0,this.fillPersonnel(),this.fillDateAndTimes();var t=this.model.get("orders");Array.isArray(t)&&t.length&&t.forEach(this.fillOrder,this),this.filling=!1},fillType:function(){this.$("input[name=type][value="+this.model.get("type")+"]").trigger("click",!0)},fillPersonnel:function(){var t=this.model.get("operators"),e=this.model.get("operator"),s=this.model.get("master");function i(t){return{id:t.id,text:t.label}}Array.isArray(t)&&t.length&&this.$id("operators").select2("data",t.map(i)),e&&this.$id("operator").select2("data",i(e)),s&&this.$id("master").select2("data",i(s))},fillDateAndTimes:function(){this.$id("date").val(s.format(this.model.get("date"),"YYYY-MM-DD")),this.$("input[name=shift][value="+this.model.get("shift")+"]").click(),"paintShop"===this.model.get("type")&&(this.$id("startedAt").val(this.model.get("startedAt")),this.$id("finishedAt").val(this.model.get("finishedAt")))},fillOrder:function(e){var i=this.addOrderRow(null,!1),r=i.find(".pressWorksheets-form-part"),o=i.find(".pressWorksheets-form-operation");if(r.attr("data-prodShiftOrder",e.prodShiftOrder).select2("data",{id:e.nc12,text:e.nc12+" - "+(e.name||"?"),data:e.orderData}),this.setUpOperationSelect2(o,t.map(e.orderData.operations,function(t){return{id:t.no,text:t.no+" - "+(t.name||"?")}})),o.select2("val",e.operationNo),i.find(".pressWorksheets-form-prodLine").select2("val",e.prodLine),i.find(".pressWorksheets-form-quantityDone").val(e.quantityDone),Array.isArray(e.losses)&&e.losses.forEach(this.fillLoss.bind(this,i)),Array.isArray(e.downtimes)&&e.downtimes.forEach(this.fillDowntime.bind(this,i)),"paintShop"!==this.model.get("type")){var n=e.opWorkDuration>0?s.toString(3600*e.opWorkDuration,!0).split(":").slice(0,2).join(":"):"";i.find('input[name$="startedAt"]').val(e.startedAt),i.find('input[name$="finishedAt"]').val(e.finishedAt),i.find('input[name$="opWorkDuration"]').val(n)}e.notes&&i.next().show().find("textarea").val(e.notes)},fillLoss:function(t,e){t.find('.is-loss[data-reason="'+e.reason+'"]').val(e.count)},fillDowntime:function(t,e){t.find('.is-downtime[data-reason="'+e.reason+'"]').attr("data-prodDowntime",e.prodDowntime).val(e.duration)},toggleExistingWarning:function(){var t=this.$id("existingWarning");this.existingWorksheets.length?t.html(i("pressWorksheets","FORM:existingWarning",{count:this.existingWorksheets.length,links:this.existingWorksheets.map(function(t){return'<a href="'+t.genClientUrl()+'">'+t.getLabel()+"</a>"}).join(", ")})).fadeIn():t.fadeOut()},checkForExistingWorksheet:function(){var t=s.getMoment(this.$id("date").val()+" 06:00:00","YYYY-MM-DD HH:mm:ss").toDate(),e=parseInt(this.$("input[name=shift]:checked").val(),10),i=this.$id("operator").val(),r=this.$id("existingWarning");if(isNaN(t.getTime())||!e||!i.length)return r.fadeOut();2===e?t.setHours(14):3===e&&t.setHours(22);var o=this.existingWorksheets.rqlQuery.selector;o.args=[{name:"eq",args:["date",t.getTime()]},{name:"eq",args:["operators.id",i]}],this.model.id&&o.args.push({name:"ne",args:["_id",this.model.id]}),this.promised(this.existingWorksheets.fetch({reset:!0}))},onKeyDown:function(t){t.altKey&&13===t.keyCode&&this.$(".pressWorksheets-form-order").last().find(".pressWorksheets-form-part").select2("focus")},calcOpWorkDuration:function(e){var i=this.$(e).closest(".pressWorksheets-form-order"),r=i.find('input[name$=".opWorkDuration"]'),o=i.find('input[name$=".part"]').select2("data"),n=i.find('input[name$=".operation"]').select2("data"),a=parseInt(i.find('input[name$=".quantityDone"]').val(),10);if(o&&n&&a){var d=t.find(o.data.operations,function(t){return t.no===n.id});if(d&&d.laborTime.toFixed(3)!==d.machineTime.toFixed(3)){var l=Math.round(d.laborTime/100*a*3600),h=s.toString(l,!0,!1).split(":");h.pop();var p=h.join(":");r.val(p)}else r.val("")}else r.val("")}})});