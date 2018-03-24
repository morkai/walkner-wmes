// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/i18n","app/core/View","../util/limitQuantityDone","app/production/templates/endWorkDialog"],function(t,i,e,n,o){"use strict";return e.extend({template:o,dialogClassName:"production-modal",events:{"focus [data-vkb]":function(t){this.options.embedded&&this.options.vkb&&this.options.vkb.show(t.target,this.onVkbValueChange)},"focus #-spigot-nc12":function(){this.options.embedded&&this.options.vkb&&this.options.vkb.hide()},'input input[type="text"][max]':"checkMinMaxValidity",'blur input[type="text"][max]':"checkMinMaxValidity",submit:function(t){t.preventDefault();var e=this.$(".btn-warning")[0];if(!e.disabled){e.disabled=!0;var n=this.$id("spigot-nc12");if(n.length){var o=n.val().match(/([0-9]{12})/),s=o?o[1]:"";if(!s.length||!this.model.checkSpigot(null,s))return n[0].setCustomValidity(i("production","endWorkDialog:spigot:invalid")),void(this.timers.submit=setTimeout(function(){e.disabled=!1,e.click()},1,this))}var a=this.parseInt("quantitiesDone"),r=this.parseInt("quantityDone"),d=this.parseInt("workerCount");this.model.changeCurrentQuantitiesDone(a),r!==this.model.prodShiftOrder.get("quantityDone")&&this.model.changeQuantityDone(r),d!==this.model.prodShiftOrder.get("workerCount")&&this.model.changeWorkerCount(d),this.model.endWork(),this.closeDialog()}}},initialize:function(){this.onVkbValueChange=this.onVkbValueChange.bind(this),this.lastKeyPressAt=0,this.listenTo(this.model.prodShiftOrder,"qtyMaxChanged",this.limitQuantityDone),t(window).on("keydown."+this.idPrefix,this.onKeyDown.bind(this)).on("keypress."+this.idPrefix,this.onKeyPress.bind(this))},destroy:function(){t(window).off("."+this.idPrefix),this.options.vkb&&this.options.vkb.hide()},serialize:function(){var t=this.model,i=t.prodShiftOrder;return{idPrefix:this.idPrefix,spigot:t.settings.getValue("spigotFinish")&&!!i.get("spigot"),downtime:t.isDowntime(),hourRange:t.getCurrentQuantityDoneHourRange(),quantitiesDone:t.getQuantityDoneInCurrentHour(),quantityDone:i.get("quantityDone")||0,workerCount:i.getWorkerCountForEdit(),maxQuantitiesDone:t.getMaxQuantitiesDone(),maxQuantityDone:i.getMaxQuantityDone(),maxWorkerCount:i.getMaxWorkerCount(),embedded:this.options.embedded}},afterRender:function(){this.limitQuantityDone()},limitQuantityDone:function(){n(this,this.model.prodShiftOrder)},onDialogShown:function(t){this.closeDialog=t.closeDialog.bind(t)},closeDialog:function(){},parseInt:function(t){var i=parseInt(this.$id(t).val(),10);return isNaN(i)||i<0?0:i},isIgnoredTarget:function(t){return"number"===t.type||-1!==t.className.indexOf("select2")||"1"===t.dataset.ignoreKey},onVkbValueChange:function(t){this.checkMinMaxValidity({target:t})},onKeyDown:function(t){if(8===t.keyCode&&!this.isIgnoredTarget(t.target))return this.lastKeyPressAt=Date.now(),this.$id("spigot-nc12").val("")[0].setCustomValidity(""),!1},onKeyPress:function(t){var i=this.$id("spigot-nc12");if(i.length){if(13===t.keyCode)return i[0]!==t.target;if(!(t.keyCode<32||t.keyCode>126||this.isIgnoredTarget(t.target))){var e=Date.now(),n=e-this.lastKeyPressAt>333?"":i.val(),o=String.fromCharCode(t.keyCode);return i.val(n+o)[0].setCustomValidity(""),i.focus(),this.lastKeyPressAt=e,!1}}},checkMinMaxValidity:function(t){var e=t.target,n=parseInt(e.getAttribute("max"),10);if(!isNaN(n)){var o=parseInt(e.getAttribute("min"),10)||0,s=parseInt(e.value,10)||0,a="";s<o?a=i("production","error:min",{min:o}):s>n&&(a=i("production","error:max",{max:n})),e.setCustomValidity(a)}}})});