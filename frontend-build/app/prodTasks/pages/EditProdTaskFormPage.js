define(["jquery","app/core/pages/EditFormPage","../views/ProdTaskFormView"],function(e,o,s){return o.extend({FormView:s,load:function(o){var s=this.model;return o(this.model.fetch(this.options.fetchOptions),e.ajax({url:"/prodTaskTags",success:function(e){s.allTags=e}}))}})});