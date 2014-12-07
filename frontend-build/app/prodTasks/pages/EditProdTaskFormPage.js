// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/core/pages/EditFormPage","../ProdTaskCollection","../views/ProdTaskFormView"],function(e,s,a,o){return s.extend({FormView:o,load:function(s){var o=this.model;o.allTags=[],o.topLevelTasks=new a(null,{rqlQuery:"parent=null&sort(name)"});var r=o.topLevelTasks.fetch({reset:!0}),t=e.ajax({url:"/prodTaskTags",success:function(e){o.allTags=e}});return s(o.fetch(this.options.fetchOptions),r,t)}})});