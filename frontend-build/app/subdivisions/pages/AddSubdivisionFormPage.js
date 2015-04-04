// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/core/pages/AddFormPage","../views/SubdivisionFormView"],function(e,r,i){"use strict";return r.extend({FormView:i,load:function(r){var i=this.model;return r(e.ajax({url:"/prodTaskTags",success:function(e){i.allTags=e}}))}})});