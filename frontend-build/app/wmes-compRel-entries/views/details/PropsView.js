define(["app/viewport","app/core/views/DetailsView","app/planning/util/contextMenu","app/wmes-compRel-entries/dictionaries","app/wmes-compRel-entries/Entry","app/wmes-compRel-entries/templates/details/props"],function(e,n,t,a,o,s){"use strict";return n.extend({template:s,remoteTopics:[],events:Object.assign({"click #-changeReason":function(e){this.showChangeReasonMenu(e.pageY,e.pageX)}},n.prototype.events),initialize:function(){n.prototype.initialize.apply(this,arguments),this.usedProps=[]},getTemplateData:function(){return{canChangeReason:o.can.changeReason(this.model)}},afterRender:function(){n.prototype.afterRender.apply(this,arguments),this.usedProps=this.$(".prop[data-prop]").map(function(){return this.dataset.prop}).get().concat(["oldCode","oldName","newCode","newName"])},onModelChanged:function(e){this.usedProps.some(function(n){return void 0!==e.changed[n]})&&this.render()},showChangeReasonMenu:function(e,n){var o=this,s=o.model.get("reason"),i=[o.t("changeReason:header"),{label:a.reasons.getLabel(s),handler:o.changeReason.bind(o,s)}];a.reasons.forEach(function(e){e.id!==s&&e.get("active")&&i.push({label:e.getLabel(),handler:o.changeReason.bind(o,e.id)})}),t.show(this,e,n,i)},changeReason:function(n){var t=this;if(t.model.get("reason")!==n){e.msg.saving();var a=t.ajax({method:"PUT",url:"/compRel/entries/"+t.model.id,data:JSON.stringify({reason:n})});a.fail(function(){e.msg.savingFailed()}),a.done(function(){e.msg.saved(),t.model.set("reason",n)})}}})});