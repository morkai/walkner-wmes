// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/core/pages/EditFormPage","../ProdTaskCollection","../views/ProdTaskFormView"],function(e,a,s,o){return a.extend({FormView:o,load:function(a){var o=this.model;o.allTags=[],o.allTasks=new s;var r=o.allTasks.fetch({reset:!0}),t=e.ajax({url:"/prodTaskTags",success:function(e){o.allTags=e}});return a(o.fetch(this.options.fetchOptions),r,t)}})});