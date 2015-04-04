// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/core/pages/AddFormPage","../ProdTaskCollection","../views/ProdTaskFormView"],function(e,a,s,r){"use strict";return a.extend({FormView:r,load:function(a){var r=this.model;r.allTags=[],r.allTasks=new s;var o=r.allTasks.fetch({reset:!0}),l=e.ajax({url:"/prodTaskTags",success:function(e){r.allTags=e}});return a(o,l)}})});