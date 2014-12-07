// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/core/pages/AddFormPage","../ProdTaskCollection","../views/ProdTaskFormView"],function(e,a,r,s){return a.extend({FormView:s,load:function(a){var s=this.model;s.allTags=[],s.topLevelTasks=new r(null,{rqlQuery:"parent=null&sort(name)"});var o=s.topLevelTasks.fetch({reset:!0}),l=e.ajax({url:"/prodTaskTags",success:function(e){s.allTags=e}});return a(o,l)}})});