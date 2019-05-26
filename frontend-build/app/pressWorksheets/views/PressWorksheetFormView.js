define(["underscore","jquery","app/time","app/i18n","app/viewport","app/data/downtimeReasons","app/data/prodLines","app/core/Model","app/core/views/FormView","app/users/util/setUpUserSelect2","../PressWorksheetCollection","app/pressWorksheets/templates/form","app/pressWorksheets/templates/ordersTable","app/pressWorksheets/templates/ordersTableRow","app/pressWorksheets/templates/ordersTableNotesRow"],function(e,t,s,i,r,o,n,a,d,l,h,p,f,u,c){"use strict";return d.extend({template:p,events:{keydown:function(e){13===e.keyCode&&"TEXTAREA"!==e.target.tagName&&e.preventDefault()},"click button[type=submit]":function(e){this.checkOverlapping=e.target.classList.contains("btn-primary")},submit:function(e){return this.removeIsOverlapping(),this.submitForm(e)},"blur .pressWorksheets-form-time":function(e){var t=e.target.value;if(/opWorkDuration$/.test(e.target.name)&&/[0-9]+%/.test(e.target.value)){var i=this.$(e.target).closest("tr"),r=s.utc.getMoment(i.find('input[name$="startedAt"]').val(),"HH:mm"),o=s.utc.getMoment(i.find('input[name$="finishedAt"]').val(),"HH:mm").diff(r);o>0?(o*=parseInt(t,10)/100,t=Math.round(o/6e4).toString()):t=""}if(t=t.trim(),/^[0-9]+$/.test(t)&&(t+="m"),/[a-z]/.test(t)&&(t=s.toString(s.toSeconds(t),!0).split(":").slice(0,2).join(":")),0!==(t=t.replace(/[^0-9: \-]+/g,"").trim()).length){var n=t.match(/^([0-9]+)(?::| +|-)+([0-9]+)$/),a=0,d=0;n?(a=parseInt(n[1],10),d=parseInt(n[2],10)):4===t.length?(a=parseInt(t.substr(0,2),10),d=parseInt(t.substr(2),10)):3===t.length?(a=parseInt(t[0],10),d=parseInt(t.substr(1),10)):d=parseInt(t,10);var l=isNaN(a)||a>=24,h=isNaN(d)||d>=60;l&&(a=0),h&&(d=0),e.target.value=(a<10?"0":"")+a.toString(10)+":"+(d<10?"0":"")+d.toString(10),this.validateTimes(e.target)}else e.target.value=""},"blur .pressWorksheets-form-count":function(e){var t=parseInt(e.target.value,10);e.target.value=isNaN(t)?"":t,e.target.classList.contains("is-downtime")&&this.validateTimes(e.target)},"blur .pressWorksheets-form-quantityDone":function(e){var t=parseInt(e.target.value,10);e.target.value=isNaN(t)||t<0?"":t},"focus input":function(e){e.target.classList.contains("select2-focusser")&&e.target.parentNode.classList.contains("pressWorksheets-form-part")?this.$(".table-responsive").prop("scrollLeft",0):e.target.classList.contains("pressWorksheets-form-time")&&e.target.parentNode.classList.contains("form-group")&&(this.paintShopTimeFocused=!0)},"focus .pressWorksheets-form-order input":function(e){var t=this.$(e.target);t.closest("td").addClass("is-focused"),t.hasClass("select2-focusser")&&(t=t.parent().next("input")),t.length&&t[0].dataset.column&&this.$('th[data-column="'+t[0].dataset.column+'"]').addClass("is-focused")},"blur .pressWorksheets-form-order input":function(e){this.$(e.target).closest("td").removeClass("is-focused"),this.$("th.is-focused").removeClass("is-focused")},"change input[name=shift]":function(){this.checkShiftStartTimeValidity(),this.validateTimes(null),this.checkForExistingWorksheet()},"change input[name=date]":function(){this.checkShiftStartTimeValidity(),this.checkForExistingWorksheet()},"change input[name=operator]":function(){this.checkForExistingWorksheet()},"change input[name=type]":function(){this.prepareProdLinesData(),this.togglePaintShop(),this.filling||(this.renderOrdersTable(),this.addOrderRow())},"click .pressWorksheets-form-comment":function(e){var t=this.$(e.currentTarget).closest(".pressWorksheets-form-order").next(".pressWorksheets-form-notes");t[t.is(":visible")?"fadeOut":"fadeIn"]("fast",function(){t.find("textarea").focus()})}},initialize:function(){d.prototype.initialize.apply(this,arguments),this.checkOverlapping=!0,this.filling=!1,this.lastOrderNo=-1,this.lossReasons=[],this.downtimeReasons=[],this.paintShopTimeFocused=!1,this.onKeyDown=this.onKeyDown.bind(this),this.existingWorksheets=new h(null,{rqlQuery:"select(rid)"}),this.listenTo(this.existingWorksheets,"request",function(){this.$id("existingWarning").fadeOut()}),this.listenTo(this.existingWorksheets,"reset",this.toggleExistingWarning),t(document.body).on("keydown."+this.idPrefix,this.onKeyDown)},destroy:function(){t(document.body).off("."+this.idPrefix)},afterRender:function(){d.prototype.afterRender.call(this),this.prepareProdLinesData(),l(this.$id("master"));var e=l(this.$id("operator")),t=l(this.$id("operators"),{multiple:!0}),s=this;t.on("change",function(){e.select2("data")||(e.select2("data",t.select2("data")[0]),s.checkForExistingWorksheet())}),this.fillType(),this.togglePaintShop(),this.renderOrdersTable(),this.fillModelData(),this.addOrderRow(),this.model.id||this.$id("type").focus()},prepareProdLinesData:function(){var e=Date.parse(this.model.get("createdAt")||new Date)<s.getMoment().subtract(1,"days").valueOf();this.prodLinesData=n.filter(function(t){var s=t.getSubdivision();if(!s)return!1;var i=s.get("type");return("press"===i||"paintShop"===i)&&(e||!t.get("deactivatedAt"))}).map(function(e){return{id:e.id,text:e.id}})},renderOrdersTable:function(){var e="optics"===this.getType(),t=e?"opticsPosition":"pressPosition";this.lossReasons=e?[]:this.model.lossReasons.toJSON(),this.downtimeReasons=o.filter(function(e){return e.get(t)>=0}).map(function(e){return e.toJSON()}).sort(function(e,s){return e[t]-s[t]}),this.lastOrderNo=-1,this.$id("ordersTable").html(this.renderPartial(f,{rowspan:this.lossReasons.length||this.downtimeReasons.length?2:0,lossReasons:this.lossReasons,downtimeReasons:this.downtimeReasons}))},serializeForm:function(e){var t=this.$(".pressWorksheets-form-order");e.orders=(e.orders||[]).filter(function(e){return e.part&&e.part.length&&e.operation&&e.operation.length}).map(this.serializeOrder.bind(this,t,this.model.lossReasons)),e.operators=this.$id("operators").select2("data").map(r),e.operator=r(this.$id("operator").select2("data")),e.master=r(this.$id("master").select2("data")),e.shift=parseInt(e.shift,10);var s={},i={};function r(e){return{id:e.id,label:e.text}}return e.orders.forEach(function(e){s[e.division]=1,i[e.prodLine]=1}),e.divisions=Object.keys(s),e.prodLines=Object.keys(i),e},serializeOrder:function(t,s,i,r){var a=t.eq(r),d=a.find(".pressWorksheets-form-part"),l=d.select2("data").data;l._id&&(l.nc12=l._id,delete l._id);var h=e.find(l.operations,function(e){return e.no===i.operation}),p=[];i.losses&&Object.keys(i.losses).forEach(function(e){e=s.get(e),i.losses[e.id]>0&&p.push({reason:e.id,label:e.get("label"),count:parseInt(i.losses[e.id],10)})});var f=[];i.downtimes&&Object.keys(i.downtimes).forEach(function(e){var t=parseInt(i.downtimes[e],10);if(t>0){e=o.get(e);var s=a.find('.is-downtime[data-reason="'+e.id+'"]');f.push({prodDowntime:s.attr("data-prodDowntime")||null,reason:e.id,label:e.get("label"),duration:t})}});var u=n.get(i.prodLine).getSubdivision(),c=0;if(i.opWorkDuration){var m=i.opWorkDuration.split(":");c=1e3*(3600*m[0]+60*m[1])/36e5}return{prodShiftOrder:d.attr("data-prodShiftOrder")||null,division:u?u.get("division"):null,prodLine:i.prodLine,nc12:l.nc12,name:l.name,operationNo:h.no,operationName:h.name,orderData:l,quantityDone:i.quantityDone,startedAt:i.startedAt||null,finishedAt:i.finishedAt||null,opWorkDuration:c,losses:p,downtimes:f,notes:i.notes||""}},checkShiftStartTimeValidity:function(){var e=this.$id("date"),t=this.getShiftMoment();if(e[0].setCustomValidity(t.valueOf()>Date.now()?i("pressWorksheets","FORM:ERROR:date"):""),this.isPaintShop()){var s=this.$id("startedAt"),r=this.$id("finishedAt");if(!t.isValid())return;this.paintShopTimeFocused||(s.val(t.format("HH:mm")),r.val(t.add(8,"hours").format("HH:mm")))}},getShiftMoment:function(){var e=this.$id("date"),t=parseInt(this.$("input[name=shift]:checked").val(),10);return s.getMoment(e.val()+" 06:00:00","YYYY-MM-DD HH:mm:ss").add(8*(t-1),"hours")},getType:function(){return this.$("input[name=type]:checked").val()},isPaintShop:function(){return"paintShop"===this.getType()},showFieldError:function(e,t){return e.hasClass("select2-offscreen")?e.select2("focus"):e.focus(),this.$errorMessage=r.msg.show({type:"error",time:3e3,text:i("pressWorksheets","FORM:ERROR:"+t)}),!1},setUpOrderSelect2:function(e){var t=this;e.removeClass("form-control"),e.select2({allowClear:!0,minimumInputLength:10,ajax:{cache:!0,quietMillis:300,url:function(e){return"/production/orders?nc12="+encodeURIComponent(e)},results:function(e){return{results:(e||[]).map(function(e){return{id:e._id,text:e._id+" - "+(e.name||"?"),data:e}})}}}}),e.on("change",function(s){var i=e.closest(".pressWorksheets-form-order"),r=i.next(),o=t.isLastOrderRow(i);if(!s.added&&!o){var n=i.next().next();return n.length||(n=i.prev().prev()),n.find(".pressWorksheets-form-part").select2("focus"),r.is(":visible")?r.fadeOut(function(){r.remove()}):r.remove(),i.fadeOut(function(){i.remove(),t.setUpPartValidation(),t.recalcOrderNoColumn()}),void(s.added||2!==t.$(".pressWorksheets-form-order").length||t.$id("typeChangeWarning").fadeOut())}var a=[];s.added&&Array.isArray(s.added.data.operations)&&s.added.data.operations.forEach(function(e){""!==e.workCenter&&-1!==e.laborTime&&a.push(e)});var d=i.find(".pressWorksheets-form-operation");t.setUpOperationSelect2(d,a.map(function(e){return{id:e.no,text:e.no+" - "+(e.name||"?")}})),a.length?d.select2("val",a[0].no).select2("focus"):(d.select2("destroy"),d.select2("destroy"),d.addClass("form-control").val(""),e.select2("focus")),o&&t.addOrderRow(i)})},setUpOperationSelect2:function(e,t){e.removeClass("form-control"),e.select2({openOnEnter:null,allowClear:!1,data:t||[]})},setUpProdLineSelect2:function(e,t){e.removeClass("form-control"),e.select2({width:"185px",openOnEnter:null,allowClear:!1,data:this.prodLinesData}),t&&e.select2("val",t.find(".pressWorksheets-form-prodLine").select2("val"))},isLastOrderRow:function(e){return this.$("tbody > tr:last-child").prev()[0]===e[0]},addOrderRow:function(e,s){s=!1!==s,++this.lastOrderNo;var i=t(u({no:this.lastOrderNo,lossReasons:this.lossReasons,downtimeReasons:this.downtimeReasons})),r=t(c({no:this.lastOrderNo,colspan:i.find("td").length}));r.hide(),this.lastOrderNo>0&&s&&i.hide(),this.$(".pressWorksheets-form-prodLine:last-child").attr("required",!0),this.$(".pressWorksheets-form-quantityDone:last-child").attr("required",!0),this.isPaintShop()||(this.$(".pressWorksheets-form-startedAt:last-child").attr("required",!0),this.$(".pressWorksheets-form-finishedAt:last-child").attr("required",!0)),this.$(".pressWorksheets-form-orders > tbody").append(i).append(r),this.lastOrderNo>0&&s&&i.fadeIn(),this.setUpOrderSelect2(i.find(".pressWorksheets-form-part")),this.setUpProdLineSelect2(i.find(".pressWorksheets-form-prodLine"),e);var o=this.$id("typeChangeWarning");return s?this.lastOrderNo>0?o.fadeIn():o.fadeOut():o.toggle(this.lastOrderNo>0),s&&(this.setUpPartValidation(),this.recalcOrderNoColumn()),e&&this.copyDataFromPrevRow(e),i},copyDataFromPrevRow:function(e){var t=e.prev();t.length&&(e.find(".pressWorksheets-form-prodLine").select2("val",t.find(".pressWorksheets-form-prodLine").select2("val")),e.find(".pressWorksheets-form-startedAt").val(t.find(".pressWorksheets-form-finishedAt").val()))},setUpPartValidation:function(){var e=this.$("input.pressWorksheets-form-part");e.last().attr("required",1===e.length)},recalcOrderNoColumn:function(){this.$(".pressWorksheets-form-order").each(function(e){var s=t(this),i=s.next();s.find(".pressWorksheets-form-no").text(e+1+".");var r=e%2!=0;s.toggleClass("is-even",r),i.toggleClass("is-even",r)})},togglePaintShop:function(){var e=this.isPaintShop();this.$el.toggleClass("pressWorksheets-form-paintShop",e),this.$(".pressWorksheets-form-group-paintShop input").attr("required",e)},validateTimes:function(e){if(this.isPaintShop())this.checkPaintShopValidity();else if(e)this.checkOrderTimesValidity(e);else{var t=this;this.$(".pressWorksheets-form-startedAt").each(function(){t.checkOrderTimesValidity(this)})}},checkPaintShopValidity:function(){var e=this.$id("startedAt"),t=this.$id("finishedAt");e[0].setCustomValidity(""),t[0].setCustomValidity(""),this.checkTimesValidity(null,e,t)},checkOrderTimesValidity:function(e){var t=this.$(e).closest(".pressWorksheets-form-order"),s=t.find(".pressWorksheets-form-startedAt"),i=t.find(".pressWorksheets-form-finishedAt");s[0].setCustomValidity(""),i[0].setCustomValidity(""),s.prop("required")&&""!==s.val()&&""!==i.val()&&this.checkTimesValidity(t,s,i)},checkTimesValidity:function(e,t,r){var o=this.$id("date").val();o||(o=s.format(new Date,"YYYY-MM-DD"));var n=this.getShiftMoment().valueOf(),a=n+288e5,d=this.getTimeFromString(o,t.val(),!1),l=this.getTimeFromString(o,r.val(),!0);if(d<n||d>a)return t[0].setCustomValidity(i("pressWorksheets","FORM:ERROR:startedAt:boundries"));if(l<n||l>a)return r[0].setCustomValidity(i("pressWorksheets","FORM:ERROR:finishedAt:boundries"));if(l<=d)return r[0].setCustomValidity(i("pressWorksheets","FORM:ERROR:finishedAt:gt"));var h=(l-d)/36e5;return this.countDowntimeDuration(this.isPaintShop()?null:e)>=h?r[0].setCustomValidity(i("pressWorksheets","FORM:ERROR:finishedAt:downtime")):void 0},checkValidity:function(){if(!this.checkOverlapping)return!0;for(var e=this.el.querySelectorAll(".pressWorksheets-form-order"),t=e.length-1,s=this.$id("date").val(),i={},r=0;r<t;++r){var o=e[r],n=o.querySelector("input.pressWorksheets-form-prodLine").value;i[n]||(i[n]=[]),i[n].push({orderRowEl:o,startedAt:this.getTimeFromString(s,o.querySelector(".pressWorksheets-form-startedAt").value,!1),finishedAt:this.getTimeFromString(s,o.querySelector(".pressWorksheets-form-finishedAt").value,!1)})}var a=!0,d=this;return Object.keys(i).forEach(function(e){if(a)for(var t=i[e];t.length;)for(var s=t.shift(),r=0,o=t.length;r<o;++r){var n=t[r];if(n.startedAt>=s.startedAt&&n.startedAt<s.finishedAt||n.finishedAt>s.startedAt&&n.finishedAt<=s.finishedAt)return void(a=d.showOverlappingError(s,n));if(s.startedAt>=n.startedAt&&s.startedAt<n.finishedAt||s.finishedAt>n.startedAt&&s.finishedAt<=n.finishedAt)return void(a=d.showOverlappingError(n,s))}}),a},showOverlappingError:function(e,t){return this.$errorMessage=r.msg.show({type:"error",time:5e3,text:i("pressWorksheets","FORM:ERROR:overlapping")}),e.orderRowEl.classList.add("is-overlapping"),t.orderRowEl.classList.add("is-overlapping"),this.timers.removeIsOverlapping=setTimeout(this.removeIsOverlapping.bind(this),5e3),this.$(".btn-danger").fadeIn(),!1},removeIsOverlapping:function(){this.timers.removeIsOverlapping&&(clearTimeout(this.timers.removeIsOverlapping),this.timers.removeIsOverlapping=null),this.$(".is-overlapping").removeClass("is-overlapping"),this.$(".btn-danger").fadeOut()},countDowntimeDuration:function(e){var t=0;return(e||this.$el).find(".pressWorksheets-form-count.is-downtime").each(function(){var e=parseInt(this.value,10);t+=isNaN(e)||e<=0?0:e}),t/60},getTimeFromString:function(e,t,i){var r=s.getMoment(e+" "+t+":00","YYYY-MM-DD HH:mm:ss");return i&&6===r.hours()&&0===r.minutes()&&r.hours(5).minutes(59).seconds(59).milliseconds(999),r.hours()<6&&r.add(1,"days"),r.valueOf()},serializeToForm:function(){return{type:this.model.get("type")}},fillModelData:function(){this.filling=!0,this.fillPersonnel(),this.fillDateAndTimes();var e=this.model.get("orders");Array.isArray(e)&&e.length&&e.forEach(this.fillOrder,this),this.filling=!1},fillType:function(){this.$("input[name=type][value="+this.model.get("type")+"]").trigger("click",!0)},fillPersonnel:function(){var e=this.model.get("operators"),t=this.model.get("operator"),s=this.model.get("master");function i(e){return{id:e.id,text:e.label}}Array.isArray(e)&&e.length&&this.$id("operators").select2("data",e.map(i)),t&&this.$id("operator").select2("data",i(t)),s&&this.$id("master").select2("data",i(s))},fillDateAndTimes:function(){this.$id("date").val(s.format(this.model.get("date"),"YYYY-MM-DD")),this.$("input[name=shift][value="+this.model.get("shift")+"]").click(),"paintShop"===this.model.get("type")&&(this.$id("startedAt").val(this.model.get("startedAt")),this.$id("finishedAt").val(this.model.get("finishedAt")))},fillOrder:function(t){var i=this.addOrderRow(null,!1),r=i.find(".pressWorksheets-form-part"),o=i.find(".pressWorksheets-form-operation");if(r.attr("data-prodShiftOrder",t.prodShiftOrder).select2("data",{id:t.nc12,text:t.nc12+" - "+(t.name||"?"),data:t.orderData}),this.setUpOperationSelect2(o,e.map(t.orderData.operations,function(e){return{id:e.no,text:e.no+" - "+(e.name||"?")}})),o.select2("val",t.operationNo),i.find(".pressWorksheets-form-prodLine").select2("val",t.prodLine),i.find(".pressWorksheets-form-quantityDone").val(t.quantityDone),Array.isArray(t.losses)&&t.losses.forEach(this.fillLoss.bind(this,i)),Array.isArray(t.downtimes)&&t.downtimes.forEach(this.fillDowntime.bind(this,i)),"paintShop"!==this.model.get("type")){var n=t.opWorkDuration>0?s.toString(3600*t.opWorkDuration,!0).split(":").slice(0,2).join(":"):"";i.find('input[name$="startedAt"]').val(t.startedAt),i.find('input[name$="finishedAt"]').val(t.finishedAt),i.find('input[name$="opWorkDuration"]').val(n)}t.notes&&i.next().show().find("textarea").val(t.notes)},fillLoss:function(e,t){e.find('.is-loss[data-reason="'+t.reason+'"]').val(t.count)},fillDowntime:function(e,t){e.find('.is-downtime[data-reason="'+t.reason+'"]').attr("data-prodDowntime",t.prodDowntime).val(t.duration)},toggleExistingWarning:function(){var e=this.$id("existingWarning");this.existingWorksheets.length?e.html(i("pressWorksheets","FORM:existingWarning",{count:this.existingWorksheets.length,links:this.existingWorksheets.map(function(e){return'<a href="'+e.genClientUrl()+'">'+e.getLabel()+"</a>"}).join(", ")})).fadeIn():e.fadeOut()},checkForExistingWorksheet:function(){var e=s.getMoment(this.$id("date").val()+" 06:00:00","YYYY-MM-DD HH:mm:ss").toDate(),t=parseInt(this.$("input[name=shift]:checked").val(),10),i=this.$id("operator").val(),r=this.$id("existingWarning");if(isNaN(e.getTime())||!t||!i.length)return r.fadeOut();2===t?e.setHours(14):3===t&&e.setHours(22);var o=this.existingWorksheets.rqlQuery.selector;o.args=[{name:"eq",args:["date",e.getTime()]},{name:"eq",args:["operators.id",i]}],this.model.id&&o.args.push({name:"ne",args:["_id",this.model.id]}),this.promised(this.existingWorksheets.fetch({reset:!0}))},onKeyDown:function(e){e.altKey&&13===e.keyCode&&this.$(".pressWorksheets-form-order").last().find(".pressWorksheets-form-part").select2("focus")}})});