// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/core/pages/AddFormPage","../views/SubdivisionFormView"],function(e,r,i){"use strict";return r.extend({FormView:i,load:function(r){var i=this.model;return r(e.ajax({url:"/prodTaskTags",success:function(e){i.allTags=e}}))}})});