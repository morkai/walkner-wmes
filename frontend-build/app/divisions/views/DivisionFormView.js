define(["underscore","app/core/views/FormView","app/divisions/templates/form"],function(e,t,i){return t.extend({template:i,idPrefix:"divisionForm",afterRender:function(){t.prototype.afterRender.call(this),this.options.editMode&&this.$id("_id").attr("disabled",!0)}})});