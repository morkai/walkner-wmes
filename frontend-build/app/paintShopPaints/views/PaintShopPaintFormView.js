// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/views/FormView","app/paintShopPaints/templates/form"],function(e,t){"use strict";return e.extend({template:t,afterRender:function(){e.prototype.afterRender.apply(this,arguments),this.options.editMode?(this.$id("_id").prop("readonly",!0),this.$id("shelf").focus()):this.$id("_id").focus()}})});