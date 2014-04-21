// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/FormView","app/companies/templates/form"],function(e,t){return e.extend({template:t,afterRender:function(){e.prototype.afterRender.call(this),this.options.editMode&&(this.$(".form-control[name=_id]").attr("readonly",!0),this.$(".form-control[name=name]").focus())}})});