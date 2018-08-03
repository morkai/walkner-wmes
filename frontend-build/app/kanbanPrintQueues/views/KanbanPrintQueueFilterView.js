// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/core/views/FilterView","app/kanbanPrintQueues/templates/filter"],function(t,e,o){"use strict";return e.extend({template:o,defaultFormData:{todo:""},termToForm:{todo:function(t,e,o){o[t]=e.args[1].toString()}},events:t.assign({"click #-groupByWorkstations":function(t){t.currentTarget.classList.toggle("active"),this.model.setGroupByWorkstations(t.currentTarget.classList.contains("active"))}},e.prototype.events),afterRender:function(){e.prototype.afterRender.apply(this,arguments),this.toggleButtonGroup("todo"),this.$id("groupByWorkstations").toggleClass("active",this.model.getGroupByWorkstations())},serializeFormToQuery:function(t,e){var o=this,r=o.getButtonGroupValue("todo");r||(r="true",o.$id("todo").find('input[value="true"]').prop("checked",!0),o.toggleButtonGroup("todo")),t.push({name:"eq",args:["todo","true"===r]}),e.sort="true"===r?{todo:1,createdAt:1}:{todo:1,createdAt:-1},e.limit=10}})});