// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/View","app/production/templates/endWorkDialog"],function(t,e,i){return e.extend({template:i,dialogClassName:"production-modal",events:{submit:function(t){t.preventDefault();var e=this.$(".btn-warning")[0];if(!e.disabled){e.disabled=!0;var i=this.parseInt("quantitiesDone"),n=this.parseInt("quantityDone"),o=this.parseInt("workerCount");this.model.changeCurrentQuantitiesDone(i),n!==this.model.prodShiftOrder.get("quantityDone")&&this.model.changeQuantityDone(n),o!==this.model.prodShiftOrder.get("workerCount")&&this.model.changeWorkerCount(o),this.model.endWork(),this.closeDialog()}}},serialize:function(){return{idPrefix:this.idPrefix,downtime:this.model.isDowntime(),hourRange:this.model.getCurrentQuantityDoneHourRange(),quantitiesDone:this.model.getQuantityDoneInCurrentHour(),quantityDone:this.model.prodShiftOrder.get("quantityDone")||0,workerCount:this.model.prodShiftOrder.getWorkerCountForEdit(),maxQuantitiesDone:this.model.getMaxQuantitiesDone(),maxQuantityDone:this.model.prodShiftOrder.getMaxQuantityDone(),maxWorkerCount:this.model.prodShiftOrder.getMaxWorkerCount()}},onDialogShown:function(t){this.closeDialog=t.closeDialog.bind(t)},closeDialog:function(){},parseInt:function(t){var e=parseInt(this.$id(t).val(),10);return isNaN(e)||0>e?0:e}})});