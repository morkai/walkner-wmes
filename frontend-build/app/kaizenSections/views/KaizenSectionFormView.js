// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/views/FormView","app/kaizenSections/templates/form"],function(e,t){"use strict";return e.extend({template:t,afterRender:function(){e.prototype.afterRender.call(this),this.options.editMode&&(this.$id("id").prop("readonly",!0),this.$id("name").focus())}})});