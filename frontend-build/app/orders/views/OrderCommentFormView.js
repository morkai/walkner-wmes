// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/core/views/FormView","app/core/util/idAndLabel","app/orders/templates/commentForm"],function(e,t,s,i){"use strict";return t.extend({template:i,events:e.extend({"change #-delayReason":function(e){var t=e.target.value!==this.model.get("delayReason");this.$id("submit-comment").toggleClass("hidden",t),this.$id("submit-edit").toggleClass("hidden",!t),this.$id("comment").prop("required",!t).prev().toggleClass("is-required",!t)}},t.prototype.events),afterRender:function(){t.prototype.afterRender.call(this),this.$id("delayReason").select2({allowClear:!0,placeholder:" ",data:this.delayReasons.map(s)})},request:function(e){return this.ajax({type:"POST",url:"/orders/"+this.model.id,data:JSON.stringify(e)})},handleSuccess:function(){this.$id("comment").val("").focus()}})});