define(["jquery","app/core/pages/EditFormPage","../views/SubdivisionFormView"],function(e,t,n){return t.extend({FormView:n,load:function(t){var n=this.model;return t(this.model.fetch(this.options.fetchOptions),e.ajax({url:"/prodTaskTags",success:function(e){n.allTags=e}}))}})});