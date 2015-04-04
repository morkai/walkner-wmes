// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/core/pages/EditFormPage","../ProdTaskCollection","../views/ProdTaskFormView"],function(e,s,a,t){"use strict";return s.extend({FormView:t,load:function(s){var t=this.model;t.allTags=[],t.allTasks=new a;var o=t.allTasks.fetch({reset:!0}),r=e.ajax({url:"/prodTaskTags",success:function(e){t.allTags=e}});return s(t.fetch(this.options.fetchOptions),o,r)}})});