// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/core/pages/EditFormPage","../views/SubdivisionFormView"],function(e,i,s){"use strict";return i.extend({FormView:s,load:function(i){var s=this.model;return i(this.model.fetch(this.options.fetchOptions),e.ajax({url:"/prodTaskTags",success:function(e){s.allTags=e}}))}})});