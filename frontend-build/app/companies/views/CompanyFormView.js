define(["app/core/views/FormView","app/companies/templates/form","i18n!app/nls/companies"],function(e,n){return e.extend({template:n,afterRender:function(){e.prototype.afterRender.call(this),this.options.editMode&&(this.$(".form-control[name=_id]").attr("readonly",!0),this.$(".form-control[name=name]").focus())}})});