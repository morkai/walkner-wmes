define(["underscore","app/i18n","app/core/View","app/production/templates/endWorkDialog","i18n!app/nls/production"],function(e,t,n,r){return n.extend({template:r,events:{submit:function(e){e.preventDefault();var t=this.$(".btn-warning")[0];if(!t.disabled){t.disabled=!0;var n=this.parseInt("quantityDone"),r=this.parseInt("quantityDone"),i=this.parseInt("workerCount");this.model.changeCurrentQuantitiesDone(n),r!==this.model.prodShiftOrder.get("quantityDone")&&this.model.changeQuantityDone(r),i!==this.model.prodShiftOrder.get("workerCount")&&this.model.changeWorkerCount(i),this.model.endWork(),this.closeDialog()}}},initialize:function(){this.idPrefix=e.uniqueId("endWorkDialog")},serialize:function(){return{idPrefix:this.idPrefix,downtime:this.model.isDowntime(),hourRange:this.model.getCurrentQuantityDoneHourRange(),quantitiesDone:this.model.getQuantityDoneInCurrentHour(),quantityDone:this.model.prodShiftOrder.get("quantityDone")||0,workerCount:this.model.prodShiftOrder.get("workerCount")||0}},onDialogShown:function(e){this.closeDialog=e.closeDialog.bind(e)},closeDialog:function(){},parseInt:function(e){var t=parseInt(this.$id(e).val(),10);return isNaN(t)||0>t?0:t}})});