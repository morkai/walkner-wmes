define(["app/core/pages/EditFormPage","../dictionaries","../views/KaizenOrderFormView"],function(e,t,r){"use strict";return e.extend({pageClassName:"page-max-flex",baseBreadcrumb:!0,FormView:r,load:function(e){return e(this.model.fetch(),t.load())},destroy:function(){e.prototype.destroy.call(this),t.unload()},afterRender:function(){e.prototype.afterRender.call(this),t.load()}})});