// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/core/pages/AddFormPage","../ProdTaskCollection","../views/ProdTaskFormView"],function(e,a,s,r){"use strict";return a.extend({FormView:r,load:function(a){var r=this.model;r.allTags=[],r.allTasks=new s;var o=r.allTasks.fetch({reset:!0}),l=e.ajax({url:"/prodTaskTags",success:function(e){r.allTags=e}});return a(o,l)}})});