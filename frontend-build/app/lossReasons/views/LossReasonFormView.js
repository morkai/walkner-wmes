// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/views/FormView","app/lossReasons/templates/form"],function(e,t){"use strict";return e.extend({template:t,afterRender:function(){e.prototype.afterRender.call(this),this.options.editMode&&(this.$(".form-control[name=_id]").attr("readonly",!0),this.$(".form-control[name=label]").focus())}})});