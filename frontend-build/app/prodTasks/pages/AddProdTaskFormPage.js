// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/core/pages/AddFormPage","../ProdTaskCollection","../views/ProdTaskFormView"],function(a,e,s,r){return e.extend({FormView:r,load:function(e){var r=this.model;r.allTags=[],r.allTasks=new s;var o=r.allTasks.fetch({reset:!0}),l=a.ajax({url:"/prodTaskTags",success:function(a){r.allTags=a}});return e(o,l)}})});