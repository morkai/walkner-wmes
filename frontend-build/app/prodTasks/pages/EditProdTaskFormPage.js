// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/core/pages/EditFormPage","../views/ProdTaskFormView"],function(e,o,s){return o.extend({FormView:s,load:function(o){var s=this.model;return o(this.model.fetch(this.options.fetchOptions),e.ajax({url:"/prodTaskTags",success:function(e){s.allTags=e}}))}})});