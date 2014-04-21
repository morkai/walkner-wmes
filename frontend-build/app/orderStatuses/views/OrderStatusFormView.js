// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/FormView","app/orderStatuses/templates/form","bootstrap-colorpicker"],function(o,r){return o.extend({template:r,idPrefix:"model",events:{submit:"submitForm","change .orderStatuses-form-color-input":"updatePickerColor"},$colorPicker:null,destroy:function(){null!==this.$colorPicker&&(this.$colorPicker.colorpicker("destroy"),this.$colorPicker=null),o.prototype.destroy.call(this)},afterRender:function(){this.$colorPicker=this.$(".orderStatuses-form-color-picker").colorpicker(),this.options.editMode&&(this.$(".form-control[name=_id]").attr("readonly",!0),this.$(".form-control[name=label]").focus())},updatePickerColor:function(o){o.originalEvent&&this.$colorPicker.colorpicker("setValue",o.target.value)}})});