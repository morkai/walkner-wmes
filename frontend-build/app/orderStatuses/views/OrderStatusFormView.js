define(["app/core/views/FormView","app/orderStatuses/templates/form","bootstrap-colorpicker","i18n!app/nls/orderStatuses"],function(e,t){return e.extend({template:t,idPrefix:"model",events:{submit:"submitForm","change .orderStatuses-form-color-input":"updatePickerColor"},$colorPicker:null,destroy:function(){null!==this.$colorPicker&&(this.$colorPicker.colorpicker("destroy"),this.$colorPicker=null),e.prototype.destroy.call(this)},afterRender:function(){this.$colorPicker=this.$(".orderStatuses-form-color-picker").colorpicker(),this.options.editMode&&(this.$(".form-control[name=_id]").attr("readonly",!0),this.$(".form-control[name=label]").focus())},updatePickerColor:function(e){e.originalEvent&&this.$colorPicker.colorpicker("setValue",e.target.value)}})});