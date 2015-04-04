// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/core/pages/EditFormPage","../views/SubdivisionFormView"],function(e,i,s){"use strict";return i.extend({FormView:s,load:function(i){var s=this.model;return i(this.model.fetch(this.options.fetchOptions),e.ajax({url:"/prodTaskTags",success:function(e){s.allTags=e}}))}})});