// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/core/pages/AddFormPage","app/kaizenOrders/dictionaries","../views/SuggestionFormView"],function(e,o,t,n,s,r){"use strict";return n.extend({FormView:r,getFormViewOptions:function(){return e.extend(n.prototype.getFormViewOptions.call(this),{standalone:this.options.standalone,operator:this.options.operator})},baseBreadcrumb:!0,breadcrumbs:function(){return this.options.standalone?[t.bound("suggestions","BREADCRUMBS:base"),t.bound("suggestions","BREADCRUMBS:addForm")]:n.prototype.breadcrumbs.call(this)},load:function(e){return e(s.load())},destroy:function(){n.prototype.destroy.call(this),s.unload(),o("body").removeClass("suggestions-standalone")},afterRender:function(){n.prototype.afterRender.call(this),s.load(),o("body").toggleClass("suggestions-standalone",!!this.options.standalone)}})});