define(["underscore","app/core/views/FormView","app/core/templates/colorPicker","app/opinionSurveyEmployers/templates/form","bootstrap-colorpicker"],function(e,o,r,t){"use strict";return o.extend({template:t,events:e.extend({},o.prototype.events,{"change [name=color]":"updateColorPicker"}),destroy:function(){this.$(".colorpicker-component").colorpicker("destroy")},afterRender:function(){o.prototype.afterRender.call(this),this.$id("color").parent().colorpicker(),this.options.editMode&&(this.$id("id").prop("readonly",!0),this.$id("short").focus())},serialize:function(){return e.extend(o.prototype.serialize.call(this),{renderColorPicker:r})},updateColorPicker:function(e){e.originalEvent&&this.$(e.target).closest(".colorpicker-component").colorpicker("setValue",e.target.value)}})});