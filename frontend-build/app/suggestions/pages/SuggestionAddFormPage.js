define(["underscore","jquery","app/i18n","app/core/pages/AddFormPage","app/kaizenOrders/dictionaries","../views/SuggestionFormView"],function(e,o,t,s,n,a){"use strict";return s.extend({pageClassName:"page-max-flex",FormView:a,getFormViewOptions:function(){return e.assign(s.prototype.getFormViewOptions.call(this),{standalone:this.options.standalone,operator:this.options.operator})},baseBreadcrumb:!0,breadcrumbs:function(){return this.options.standalone?[t.bound("suggestions","BREADCRUMBS:base"),t.bound("suggestions","BREADCRUMBS:addForm")]:s.prototype.breadcrumbs.call(this)},load:function(e){return e(n.load())},destroy:function(){s.prototype.destroy.call(this),n.unload(),o("body").removeClass("suggestions-standalone")},afterRender:function(){s.prototype.afterRender.call(this),n.load(),o("body").toggleClass("suggestions-standalone",!!this.options.standalone)}})});