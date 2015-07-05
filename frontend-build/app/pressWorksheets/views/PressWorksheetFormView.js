// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","app/time","app/i18n","app/viewport","app/data/downtimeReasons","app/data/prodLines","app/core/Model","app/core/views/FormView","app/users/util/setUpUserSelect2","../PressWorksheetCollection","app/pressWorksheets/templates/form","app/pressWorksheets/templates/ordersTable","app/pressWorksheets/templates/ordersTableRow","app/pressWorksheets/templates/ordersTableNotesRow"],function(e,t,s,i,r,o,n,a,d,l,h,p,f,c,u){"use strict";return d.extend({template:p,events:{keydown:function(e){13===e.keyCode&&"TEXTAREA"!==e.target.tagName&&e.preventDefault()},"click button[type=submit]":function(e){this.checkOverlapping=e.target.classList.contains("btn-primary")},submit:function(e){return this.removeIsOverlapping(),this.submitForm(e)},"blur .pressWorksheets-form-time":function(e){var t=e.target.value.trim().replace(/[^0-9: \-]+/g,"");if(0!==t.length){var s=t.match(/^([0-9]+)(?::| +|\-)+([0-9]+)$/),i=0,r=0;s?(i=parseInt(s[1],10),r=parseInt(s[2],10)):4===t.length?(i=parseInt(t.substr(0,2),10),r=parseInt(t.substr(2),10)):3===t.length?(i=parseInt(t[0],10),r=parseInt(t.substr(1),10)):r=parseInt(t,10);var o=isNaN(i)||i>=24,n=isNaN(r)||r>=60;o&&(i=0),n&&(r=0),e.target.value=(10>i?"0":"")+i.toString(10)+":"+(10>r?"0":"")+r.toString(10),this.validateTimes(e.target)}},"blur .pressWorksheets-form-count":function(e){var t=parseInt(e.target.value,10);e.target.value=isNaN(t)?"":t,e.target.classList.contains("is-downtime")&&this.validateTimes(e.target)},"blur .pressWorksheets-form-quantityDone":function(e){var t=parseInt(e.target.value,10);e.target.value=isNaN(t)||0>t?"":t},"focus input":function(e){e.target.classList.contains("select2-focusser")&&e.target.parentNode.classList.contains("pressWorksheets-form-part")?this.$(".table-responsive").prop("scrollLeft",0):e.target.classList.contains("pressWorksheets-form-time")&&e.target.parentNode.classList.contains("form-group")&&(this.paintShopTimeFocused=!0)},"focus .pressWorksheets-form-order input":function(e){var t=this.$(e.target);t.closest("td").addClass("is-focused"),t.hasClass("select2-focusser")&&(t=t.parent().next("input")),t.length&&t[0].dataset.column&&this.$('th[data-column="'+t[0].dataset.column+'"]').addClass("is-focused")},"blur .pressWorksheets-form-order input":function(e){this.$(e.target).closest("td").removeClass("is-focused"),this.$("th.is-focused").removeClass("is-focused")},"change input[name=shift]":function(){this.checkShiftStartTimeValidity(),this.validateTimes(null),this.checkForExistingWorksheet()},"change input[name=date]":function(){this.checkShiftStartTimeValidity(),this.checkForExistingWorksheet()},"change input[name=operator]":function(){this.checkForExistingWorksheet()},"change input[name=type]":function(){this.togglePaintShop(),this.filling||(this.renderOrdersTable(),this.addOrderRow())},"click .pressWorksheets-form-comment":function(e){var t=this.$(e.currentTarget).closest(".pressWorksheets-form-order").next(".pressWorksheets-form-notes");t[t.is(":visible")?"fadeOut":"fadeIn"]("fast",function(){t.find("textarea").focus()})}},initialize:function(){d.prototype.initialize.apply(this,arguments),this.checkOverlapping=!0,this.filling=!1,this.lastOrderNo=-1,this.lossReasons=[],this.downtimeReasons=[],this.paintShopTimeFocused=!1,this.onKeyDown=this.onKeyDown.bind(this),this.existingWorksheets=new h(null,{rqlQuery:"select(rid)"}),this.listenTo(this.existingWorksheets,"request",function(){this.$id("existingWarning").fadeOut()}),this.listenTo(this.existingWorksheets,"reset",this.toggleExistingWarning),t("body").on("keydown",this.onKeyDown)},destroy:function(){t("body").off("keydown",this.onKeyDown)},afterRender:function(){d.prototype.afterRender.call(this),this.prodLinesData=n.filter(function(e){var t=e.getSubdivision();return!e.get("deactivatedAt")&&t&&"press"===t.get("type")}).map(function(e){return{id:e.id,text:e.id}}),l(this.$id("master"));var e=l(this.$id("operator")),t=l(this.$id("operators"),{multiple:!0}),s=this;t.on("change",function(){e.select2("data")||(e.select2("data",t.select2("data")[0]),s.checkForExistingWorksheet())}),this.fillType(),this.renderOrdersTable(),this.fillModelData(),this.addOrderRow(),this.model.id||this.$id("type").focus()},renderOrdersTable:function(){var e="optics"===this.getType(),t=e?"opticsPosition":"pressPosition";this.lossReasons=e?[]:this.model.lossReasons.toJSON(),this.downtimeReasons=o.filter(function(e){return e.get(t)>=0}).map(function(e){return e.toJSON()}).sort(function(e,s){return e[t]-s[t]}),this.lastOrderNo=-1,this.$id("ordersTable").html(f({rowspan:this.lossReasons.length||this.downtimeReasons.length?2:0,lossReasons:this.lossReasons,downtimeReasons:this.downtimeReasons}))},serializeForm:function(e){function t(e){return{id:e.id,label:e.text}}var s=this.$(".pressWorksheets-form-order");e.orders=(e.orders||[]).filter(function(e){return e.part&&e.part.length&&e.operation&&e.operation.length}).map(this.serializeOrder.bind(this,s,this.model.lossReasons)),e.operators=this.$id("operators").select2("data").map(t),e.operator=t(this.$id("operator").select2("data")),e.master=t(this.$id("master").select2("data")),e.shift=parseInt(e.shift,10);var i={},r={};return e.orders.forEach(function(e){i[e.division]=1,r[e.prodLine]=1}),e.divisions=Object.keys(i),e.prodLines=Object.keys(r),e},serializeOrder:function(t,s,i,r){var a=t.eq(r),d=a.find(".pressWorksheets-form-part"),l=d.select2("data").data;l._id&&(l.nc12=l._id,delete l._id);var h=e.find(l.operations,function(e){return e.no===i.operation}),p=[];i.losses&&Object.keys(i.losses).forEach(function(e){e=s.get(e),i.losses[e.id]>0&&p.push({reason:e.id,label:e.get("label"),count:parseInt(i.losses[e.id],10)})});var f=[];i.downtimes&&Object.keys(i.downtimes).forEach(function(e){var t=parseInt(i.downtimes[e],10);if(t>0){e=o.get(e);var s=a.find('.is-downtime[data-reason="'+e.id+'"]');f.push({prodDowntime:s.attr("data-prodDowntime")||null,reason:e.id,label:e.get("label"),duration:t})}});var c=n.get(i.prodLine).getSubdivision();return{prodShiftOrder:d.attr("data-prodShiftOrder")||null,division:c?c.get("division"):null,prodLine:i.prodLine,nc12:l.nc12,name:l.name,operationNo:h.no,operationName:h.name,orderData:l,quantityDone:i.quantityDone,startedAt:i.startedAt||null,finishedAt:i.finishedAt||null,losses:p,downtimes:f,notes:i.notes||""}},checkShiftStartTimeValidity:function(){var e=this.$id("date"),t=this.getShiftMoment();if(e[0].setCustomValidity(t.valueOf()>Date.now()?i("pressWorksheets","FORM:ERROR:date"):""),this.isPaintShop()){var s=this.$id("startedAt"),r=this.$id("finishedAt");if(!t.isValid())return;this.paintShopTimeFocused||(s.val(t.format("HH:mm")),r.val(t.add(8,"hours").format("HH:mm")))}},getShiftMoment:function(){var e=this.$id("date"),t=parseInt(this.$("input[name=shift]:checked").val(),10);return s.getMoment(e.val()+" 06:00:00","YYYY-MM-DD HH:mm:ss").add(8*(t-1),"hours")},getType:function(){return this.$("input[name=type]:checked").val()},isPaintShop:function(){return"paintShop"===this.getType()},showFieldError:function(e,t){return e.hasClass("select2-offscreen")?e.select2("focus"):e.focus(),this.$errorMessage=r.msg.show({type:"error",time:3e3,text:i("pressWorksheets","FORM:ERROR:"+t)}),!1},setUpOrderSelect2:function(e){var t=this;e.removeClass("form-control"),e.select2({allowClear:!0,minimumInputLength:10,ajax:{cache:!0,quietMillis:300,url:function(e){return"/production/orders?nc12="+encodeURIComponent(e)},results:function(e){return{results:(e||[]).map(function(e){return{id:e._id,text:e._id+" - "+(e.name||"?"),data:e}})}}}}),e.on("change",function(s){var i=e.closest(".pressWorksheets-form-order"),r=i.next(),o=t.isLastOrderRow(i);if(!s.added&&!o){var n=i.next().next();return n.length||(n=i.prev().prev()),n.find(".pressWorksheets-form-part").select2("focus"),r.is(":visible")?r.fadeOut(function(){r.remove()}):r.remove(),i.fadeOut(function(){i.remove(),t.setUpPartValidation(),t.recalcOrderNoColumn()}),void(s.added||2!==t.$(".pressWorksheets-form-order").length||t.$id("typeChangeWarning").fadeOut())}var a=[];s.added&&Array.isArray(s.added.data.operations)&&s.added.data.operations.forEach(function(e){""!==e.workCenter&&-1!==e.laborTime&&a.push(e)});var d=i.find(".pressWorksheets-form-operation");t.setUpOperationSelect2(d,a.map(function(e){return{id:e.no,text:e.no+" - "+(e.name||"?")}})),a.length?d.select2("val",a[0].no).select2("focus"):(d.select2("destroy"),d.select2("destroy"),d.addClass("form-control").val(""),e.select2("focus")),o&&t.addOrderRow(i)})},setUpOperationSelect2:function(e,t){e.removeClass("form-control"),e.select2({openOnEnter:null,allowClear:!1,data:t||[]})},setUpProdLineSelect2:function(e,t){e.removeClass("form-control"),e.select2({width:"185px",openOnEnter:null,allowClear:!1,data:this.prodLinesData}),t&&e.select2("val",t.find(".pressWorksheets-form-prodLine").select2("val"))},isLastOrderRow:function(e){return this.$("tbody > tr:last-child").prev()[0]===e[0]},addOrderRow:function(e,s){s=s!==!1,++this.lastOrderNo;var i=t(c({no:this.lastOrderNo,lossReasons:this.lossReasons,downtimeReasons:this.downtimeReasons})),r=t(u({no:this.lastOrderNo,colspan:i.find("td").length}));r.hide(),this.lastOrderNo>0&&s&&i.hide(),this.$(".pressWorksheets-form-prodLine:last-child").attr("required",!0),this.$(".pressWorksheets-form-quantityDone:last-child").attr("required",!0),this.isPaintShop()||(this.$(".pressWorksheets-form-startedAt:last-child").attr("required",!0),this.$(".pressWorksheets-form-finishedAt:last-child").attr("required",!0)),this.$(".pressWorksheets-form-orders > tbody").append(i).append(r),this.lastOrderNo>0&&s&&i.fadeIn(),this.setUpOrderSelect2(i.find(".pressWorksheets-form-part")),this.setUpProdLineSelect2(i.find(".pressWorksheets-form-prodLine"),e);var o=this.$id("typeChangeWarning");return s?this.lastOrderNo>0?o.fadeIn():o.fadeOut():o.toggle(this.lastOrderNo>0),s&&(this.setUpPartValidation(),this.recalcOrderNoColumn()),e&&this.copyDataFromPrevRow(e),i},copyDataFromPrevRow:function(e){var t=e.prev();t.length&&(e.find(".pressWorksheets-form-prodLine").select2("val",t.find(".pressWorksheets-form-prodLine").select2("val")),e.find(".pressWorksheets-form-startedAt").val(t.find(".pressWorksheets-form-finishedAt").val()))},setUpPartValidation:function(){var e=this.$("input.pressWorksheets-form-part");e.last().attr("required",1===e.length)},recalcOrderNoColumn:function(){this.$(".pressWorksheets-form-order").each(function(e){var s=t(this),i=s.next();s.find(".pressWorksheets-form-no").text(e+1+".");var r=e%2!==0;s.toggleClass("is-even",r),i.toggleClass("is-even",r)})},togglePaintShop:function(){var e=this.isPaintShop();this.$el.toggleClass("pressWorksheets-form-paintShop",e),this.$(".pressWorksheets-form-group-paintShop input").attr("required",e)},validateTimes:function(e){if(this.isPaintShop())this.checkPaintShopValidity();else if(e)this.checkOrderTimesValidity(e);else{var t=this;this.$(".pressWorksheets-form-startedAt").each(function(){t.checkOrderTimesValidity(this)})}},checkPaintShopValidity:function(){var e=this.$id("startedAt"),t=this.$id("finishedAt");e[0].setCustomValidity(""),t[0].setCustomValidity(""),this.checkTimesValidity(null,e,t)},checkOrderTimesValidity:function(e){var t=this.$(e).closest(".pressWorksheets-form-order"),s=t.find(".pressWorksheets-form-startedAt"),i=t.find(".pressWorksheets-form-finishedAt");s[0].setCustomValidity(""),i[0].setCustomValidity(""),s.prop("required")&&""!==s.val()&&""!==i.val()&&this.checkTimesValidity(t,s,i)},checkTimesValidity:function(e,t,r){var o=this.$id("date").val();o||(o=s.format(new Date,"YYYY-MM-DD"));var n=this.getShiftMoment(),a=n.valueOf(),d=a+288e5,l=this.getTimeFromString(o,t.val(),!1),h=this.getTimeFromString(o,r.val(),!0);if(a>l||l>d)return t[0].setCustomValidity(i("pressWorksheets","FORM:ERROR:startedAt:boundries"));if(a>h||h>d)return r[0].setCustomValidity(i("pressWorksheets","FORM:ERROR:finishedAt:boundries"));if(l>=h)return r[0].setCustomValidity(i("pressWorksheets","FORM:ERROR:finishedAt:gt"));var p=(h-l)/36e5,f=this.countDowntimeDuration(this.isPaintShop()?null:e);return f>=p?r[0].setCustomValidity(i("pressWorksheets","FORM:ERROR:finishedAt:downtime")):void 0},checkValidity:function(){if(!this.checkOverlapping)return!0;for(var e=this.el.querySelectorAll(".pressWorksheets-form-order"),t=e.length-1,s=this.$id("date").val(),i={},r=0;t>r;++r){var o=e[r],n=o.querySelector("input.pressWorksheets-form-prodLine").value;i[n]||(i[n]=[]),i[n].push({orderRowEl:o,startedAt:this.getTimeFromString(s,o.querySelector(".pressWorksheets-form-startedAt").value,!1),finishedAt:this.getTimeFromString(s,o.querySelector(".pressWorksheets-form-finishedAt").value,!1)})}var a=!0,d=this;return Object.keys(i).forEach(function(e){if(a)for(var t=i[e];t.length;)for(var s=t.shift(),r=0,o=t.length;o>r;++r){var n=t[r];if(n.startedAt>=s.startedAt&&n.startedAt<s.finishedAt||n.finishedAt>s.startedAt&&n.finishedAt<=s.finishedAt)return void(a=d.showOverlappingError(s,n));if(s.startedAt>=n.startedAt&&s.startedAt<n.finishedAt||s.finishedAt>n.startedAt&&s.finishedAt<=n.finishedAt)return void(a=d.showOverlappingError(n,s))}}),a},showOverlappingError:function(e,t){return this.$errorMessage=r.msg.show({type:"error",time:5e3,text:i("pressWorksheets","FORM:ERROR:overlapping")}),e.orderRowEl.classList.add("is-overlapping"),t.orderRowEl.classList.add("is-overlapping"),this.timers.removeIsOverlapping=setTimeout(this.removeIsOverlapping.bind(this),5e3),this.$(".btn-danger").fadeIn(),!1},removeIsOverlapping:function(){this.timers.removeIsOverlapping&&(clearTimeout(this.timers.removeIsOverlapping),this.timers.removeIsOverlapping=null),this.$(".is-overlapping").removeClass("is-overlapping"),this.$(".btn-danger").fadeOut()},countDowntimeDuration:function(e){var t=0;return(e||this.$el).find(".pressWorksheets-form-count.is-downtime").each(function(){var e=parseInt(this.value,10);t+=isNaN(e)||0>=e?0:e}),t/60},getTimeFromString:function(e,t,i){var r=s.getMoment(e+" "+t+":00","YYYY-MM-DD HH:mm:ss");return i&&6===r.hours()&&0===r.minutes()&&r.hours(5).minutes(59).seconds(59).milliseconds(999),r.hours()<6&&r.add(1,"days"),r.valueOf()},serializeToForm:function(){return{}},fillModelData:function(){this.filling=!0,this.fillPersonnel(),this.fillDateAndTimes();var e=this.model.get("orders");Array.isArray(e)&&e.length&&e.forEach(this.fillOrder,this),this.filling=!1},fillType:function(){this.$("input[name=type][value="+this.model.get("type")+"]").trigger("click",!0)},fillPersonnel:function(){function e(e){return{id:e.id,text:e.label}}var t=this.model.get("operators"),s=this.model.get("operator"),i=this.model.get("master");Array.isArray(t)&&t.length&&this.$id("operators").select2("data",t.map(e)),s&&this.$id("operator").select2("data",e(s)),i&&this.$id("master").select2("data",e(i))},fillDateAndTimes:function(){this.$id("date").val(s.format(this.model.get("date"),"YYYY-MM-DD")),this.$("input[name=shift][value="+this.model.get("shift")+"]").click(),"paintShop"===this.model.get("type")&&(this.$id("startedAt").val(this.model.get("startedAt")),this.$id("finishedAt").val(this.model.get("finishedAt")))},fillOrder:function(t){var s=this.addOrderRow(null,!1),i=s.find(".pressWorksheets-form-part"),r=s.find(".pressWorksheets-form-operation");i.attr("data-prodShiftOrder",t.prodShiftOrder).select2("data",{id:t.nc12,text:t.nc12+" - "+(t.name||"?"),data:t.orderData}),this.setUpOperationSelect2(r,e.map(t.orderData.operations,function(e){return{id:e.no,text:e.no+" - "+(e.name||"?")}})),r.select2("val",t.operationNo),s.find(".pressWorksheets-form-prodLine").select2("val",t.prodLine),s.find(".pressWorksheets-form-quantityDone").val(t.quantityDone),Array.isArray(t.losses)&&t.losses.forEach(this.fillLoss.bind(this,s)),Array.isArray(t.downtimes)&&t.downtimes.forEach(this.fillDowntime.bind(this,s)),"paintShop"!==this.model.get("type")&&(s.find(".pressWorksheets-form-startedAt").val(t.startedAt),s.find(".pressWorksheets-form-finishedAt").val(t.finishedAt)),t.notes&&s.next().show().find("textarea").val(t.notes)},fillLoss:function(e,t){e.find('.is-loss[data-reason="'+t.reason+'"]').val(t.count)},fillDowntime:function(e,t){var s=e.find('.is-downtime[data-reason="'+t.reason+'"]');s.attr("data-prodDowntime",t.prodDowntime).val(t.duration)},toggleExistingWarning:function(){var e=this.$id("existingWarning");this.existingWorksheets.length?e.html(i("pressWorksheets","FORM:existingWarning",{count:this.existingWorksheets.length,links:this.existingWorksheets.map(function(e){return'<a href="'+e.genClientUrl()+'">'+e.getLabel()+"</a>"}).join(", ")})).fadeIn():e.fadeOut()},checkForExistingWorksheet:function(){var e=new Date(this.$id("date").val()+" 06:00:00"),t=parseInt(this.$("input[name=shift]:checked").val(),10),s=this.$id("operator").val(),i=this.$id("existingWarning");if(isNaN(e.getTime())||!t||!s.length)return i.fadeOut();2===t?e.setHours(14):3===t&&e.setHours(22);var r=this.existingWorksheets.rqlQuery.selector;r.args=[{name:"eq",args:["date",e.getTime()]},{name:"eq",args:["operators.id",s]}],this.model.id&&r.args.push({name:"ne",args:["_id",this.model.id]}),this.promised(this.existingWorksheets.fetch({reset:!0}))},onKeyDown:function(e){e.altKey&&13===e.keyCode&&this.$(".pressWorksheets-form-order:last-child").find(".pressWorksheets-form-part").select2("focus")}})});