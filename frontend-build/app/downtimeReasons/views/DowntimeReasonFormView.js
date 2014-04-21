// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/FormView","app/downtimeReasons/templates/form"],function(e,t){return e.extend({template:t,afterRender:function(){e.prototype.afterRender.call(this),this.options.editMode&&(this.$(".form-control[name=_id]").attr("readonly",!0),this.$(".form-control[name=label]").focus())},serializeToForm:function(){var e=this.model.toJSON();return e.scheduled=String(e.scheduled),e},serializeForm:function(e){return"null"===e.scheduled&&(e.scheduled=null),e}})});