define(["underscore","app/data/companies","app/core/views/FormView","app/core/templates/colorPicker","app/prodFunctions/templates/form","bootstrap-colorpicker"],function(e,o,r,t,i){"use strict";return r.extend({template:i,events:e.assign({},r.prototype.events,{"change [name=direct]":"toggleDirIndirRatio","change [name=color]":"updateColorPicker"}),destroy:function(){this.$(".colorpicker-component").colorpicker("destroy")},afterRender:function(){r.prototype.afterRender.call(this),this.options.editMode&&(this.$(".form-control[name=_id]").attr("readonly",!0),this.$(".form-control[name=label]").focus()),this.$id("color").parent().colorpicker(),this.toggleDirIndirRatio()},serialize:function(){return e.assign(r.prototype.serialize.call(this),{renderColorPicker:t})},serializeToForm:function(){var e=this.model.toJSON();return e.direct+="",e},toggleDirIndirRatio:function(){this.$id("dirIndirRatio").prop("readonly","false"===this.$("[name=direct]:checked").val())},updateColorPicker:function(e){e.originalEvent&&this.$(e.target).closest(".colorpicker-component").colorpicker("setValue",e.target.value)}})});