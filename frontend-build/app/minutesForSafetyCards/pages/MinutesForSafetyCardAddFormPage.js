define(["app/core/pages/AddFormPage","app/kaizenOrders/dictionaries","../views/MinutesForSafetyCardFormView"],function(e,r,a){"use strict";return e.extend({pageClassName:"page-max-flex",FormView:a,baseBreadcrumb:!0,load:function(e){return e(r.load())},destroy:function(){e.prototype.destroy.call(this),r.unload()},afterRender:function(){e.prototype.afterRender.call(this),r.load()}})});