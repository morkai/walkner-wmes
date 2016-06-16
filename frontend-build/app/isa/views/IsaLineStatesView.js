// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/i18n","app/viewport","app/core/View","app/core/views/DialogView","./IsaResponderPickerView","app/isa/templates/lineStates","app/isa/templates/lineState","app/isa/templates/cancelDialog"],function(e,t,i,n,s,a,r,o,l){"use strict";return n.extend({template:r,events:{"click .isa-lineState-accept":function(e){e.currentTarget.blur(),this.accept(this.findLineStateId(e.target))},"click .isa-lineState-finish":function(e){e.currentTarget.blur(),this.finish(this.findLineStateId(e.target))},"click .isa-lineState-cancel":function(e){e.currentTarget.blur(),this.cancel(this.findLineStateId(e.target))}},initialize:function(){this.requiredStatus="requests"===this.options.mode?"request":"response",this.cancelling=null;var e=this.model.lineStates;this.listenTo(e,"reset",this.render),this.listenTo(e,"filter",this.render),this.listenTo(e,"add",this.onAdd),this.listenTo(e,"remove",this.onRemove),this.listenTo(e,"change",this.onChange)},serialize:function(){var e="responses"===this.options.mode&&this.model.selectedResponder?this.model.selectedResponder:null;return{idPrefix:this.idPrefix,mode:this.options.mode,lineStates:this.model.lineStates.where({status:this.requiredStatus}).filter(function(t){return t.matchResponder(e)}).map(function(e){return e.serialize()}),renderLineState:o}},afterRender:function(){this.recount()},updateTimes:function(){var e=this.model.lineStates;this.$(".isa-lineState").each(function(){var t=e.get(this.dataset.id),i=t.get("time"),n=this.querySelector(".isa-lineState-time");n.setAttribute("datetime",i.iso),n.setAttribute("title",i["long"]),n.textContent=i.human})},actAt:function(e,t){var i=this.el.children[t];i&&this[e](i.dataset.id)},cancel:function(e){var n=this.model.lineStates.get(e);if(n){var a=this.findLineStateEl(n.id);if(a.length){var r=a.find(".btn").prop("disabled",!0),o=this,h=new s({template:l});this.listenToOnce(h,"dialog:hidden",function(){r.prop("disabled",!1),o.cancelling=null}),this.listenToOnce(h,"answered",function(e){"yes"===e&&n.cancel(null,function(e){e&&i.msg.show({type:"error",time:5e3,text:t.has("isa","cancel:"+e.message)?t("isa","cancel:"+e.message):t("isa","cancel:failure")})})}),i.showDialog(h,t("isa","cancel:title")),this.cancelling=e}}},accept:function(e){var n=this.model.lineStates.get(e);if(n){var s=this.findLineStateEl(n.id);if(s.length){var r=new a({model:this.model.shiftPersonnel});this.listenToOnce(r,"picked",function(e){r.hide(),e&&n.accept(e,function(e){e&&i.msg.show({type:"error",time:5e3,text:t.has("isa","accept:"+e.message)?t("isa","accept:"+e.message):t("isa","accept:failure")})})}),r.show(s.find(".isa-lineState-actions"))}}},finish:function(e){var n=this.model.lineStates.get(e);if(n){var s=this.findLineStateEl(n.id);s.length&&n.finish(function(e){e&&i.msg.show({type:"error",time:5e3,text:t.has("isa","finish:"+e.message)?t("isa","finish:"+e.message):t("isa","finish:failure")})})}},recount:function(){this.$(".btn").each(function(e){var t=e+1;t%2===1&&(t+=1);var i=t/2;this.children[1].textContent=i>9?"":i}),this.trigger("recount",this.el.childElementCount-1)},move:function(e,t){var i=this.findLineStateEl(e.id);if(!i.length)return t();var n=i.position();i.css({top:n.top+"px",left:n.left+"px",width:i.outerWidth()+"px",height:i.outerHeight()+"px"}),i.addClass("is-moving");var s=this;setTimeout(function(){i.remove(),t(),s.recount()},750)},insert:function(t,i){if(t.get("status")!==this.requiredStatus||"responses"===this.options.mode&&!t.matchResponder(this.model.selectedResponder))i&&i();else{var n=e(this.renderLineState(t));if("requests"===this.options.mode&&"delivery"===t.get("requestType")){var s=this.$('.isa-lineState[data-request-type="delivery"]').last();if(s.length)n.insertAfter(s);else{var a=this.$(".isa-lineState").first();a.length?n.insertBefore(a):this.$el.append(n)}}else this.$el.append(n);n.stop(!0,!1).fadeIn(i),this.recount()}},renderLineState:function(e){return o({hidden:!0,mode:this.options.mode,lineState:e.serialize(),hotkey:""})},findLineStateId:function(e){return this.$(e).closest(".isa-lineState").attr("data-id")},findLineStateEl:function(e){return this.$('.isa-lineState[data-id="'+e+'"]')},onAdd:function(e){this.onChange(e)},onRemove:function(e){var t=this;t.cancelling===e.id&&i.closeDialog();var n=t.findLineStateEl(e.id);n.length&&n.stop(!0,!1).fadeOut(function(){n.remove(),t.recount()})},onChange:function(e){if(e!==this.model.lineStates){var t=this.findLineStateEl(e.id);return t.length?void(e.get("status")===this.requiredStatus?(t.stop(!0,!0),t=this.findLineStateEl(e.id),t.length?t.fadeIn():this.insert(e)):this.model.moving[e.id]||this.onRemove(e)):void(e.get("status")!==this.requiredStatus||this.model.moving[e.id]||this.insert(e))}}})});