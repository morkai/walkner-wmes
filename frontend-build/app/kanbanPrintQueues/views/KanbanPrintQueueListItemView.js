// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/time","app/viewport","app/data/localStorage","app/core/View","app/core/views/DialogView","app/kanbanPrintQueues/templates/item","app/kanbanPrintQueues/templates/_hd","app/kanbanPrintQueues/templates/_job","app/kanbanPrintQueues/templates/ignoreDialog","app/kanbanPrintQueues/templates/restoreDialog"],function(e,t,i,n,o,a,s,r,l,d,h,c){"use strict";return a.extend({template:r,events:{"click #-hd":function(e){this.$(e.target).closest(".kanbanPrintQueues-actions").length||this.model.collection.toggleExpand(this.model.id)},"click #-print":function(){this.model.collection.toggleExpand(this.model.id,!0),this.model.collection.trigger("print:next",this.$id("print")[0].dataset.what)},"click a[data-what]":function(e){this.model.collection.toggleExpand(this.model.id,!0),this.model.collection.trigger("print:next",e.currentTarget.dataset.what)},"click #-ignore":function(){return this.model.collection.toggleExpand(this.model.id,!1),this.showIgnoreDialog(),!1},"click #-restore":function(){return this.showRestoreDialog(),!1},'click .btn[data-action="print"]':function(t){var i=this.$(t.currentTarget).closest("tr")[0].dataset.id,n=e.find(this.model.get("jobs"),function(e){return e._id===i});this.model.collection.trigger("print:specific",this.model,[n])},'click .btn[data-action="ignore"]':function(t){var i=this.$(t.currentTarget).closest("tr")[0].dataset.id,n=e.find(this.model.get("jobs"),function(e){return e._id===i});this.showIgnoreDialog(n)}},initialize:function(){this.listenTo(this.model.collection,"expand",this.onExpand),this.listenTo(this.model.collection,"printing",this.onPrinting),this.listenTo(this.model,"change:todo",this.onQueueChange),this.listenTo(this.model,"change:jobs",this.onJobsChange)},getTemplateData:function(){return{renderHd:l,renderJob:d,expanded:this.model.collection.isExpanded(this.model.id),queue:this.model.serialize(),what:this.model.collection.getPrintingWhat()}},onExpand:function(e){e===this.model.id?(this.$el.addClass("is-expanded"),this.$id("hd")[0].scrollIntoView({behavior:"smooth",block:"nearest"})):this.$el.removeClass("is-expanded")},onPrinting:function(e){this.$id("print").prop("data-what",e).find("span").text(this.t("action:print:"+e))},updateHd:function(e){this.el.dataset.status=e.status,this.$id("hd").replaceWith(l({idPrefix:this.idPrefix,helpers:this.getTemplateHelpers(),queue:e,what:this.model.collection.getPrintingWhat()}))},updateJob:function(e,t){this.$('tr[data-id="'+t._id+'"]').replaceWith(d({idPrefix:this.idPrefix,helpers:this.getTemplateHelpers(),queue:e,job:t}))},onQueueChange:function(){!1===this.model.changed.todo?this.render():this.updateHd(this.model.serialize())},onJobsChange:function(e){var t=this;if(!1!==t.model.changed.todo){var i=t.model.serialize();void 0===t.model.changed.todo&&t.updateHd(i),e.forEach(function(e){t.updateJob(i,e)})}},showIgnoreDialog:function(e){var t=e?"job":"queue",i=new s({template:h,model:{type:t}});this.listenTo(i,"answered",function(t){"yes"===t&&this.ignore(e)}),n.showDialog(i,this.t("ignore:title:"+t))},showRestoreDialog:function(){var e=new s({template:c});this.listenTo(e,"answered",function(e){"yes"===e&&this.restore()}),n.showDialog(e,this.t("restore:title"))},ignore:function(e){var t=this,i=e?t.$('tr[data-id="'+e._id+'"] .btn[data-action="ignore"]'):t.$id("ignore"),o=i.find(".fa");i.prop("disabled",!0),o.removeClass("fa-ban").addClass("fa-spinner fa-spin");var a=t.ajax({method:"POST",url:"/kanban/printQueues;ignore",data:JSON.stringify({queue:t.model.id,job:e?e._id:null})});a.fail(function(){i.prop("disabled",!1),n.msg.show({type:"error",time:2500,text:t.t("ignore:failure")})}),a.always(function(){o.removeClass("fa-spinner fa-spin").addClass("fa-ban")})},restore:function(){var e=this,t=e.$id("restore"),i=t.find(".fa");t.prop("disabled",!0),i.removeClass("fa-plus").addClass("fa-spinner fa-spin");var o=e.ajax({method:"POST",url:"/kanban/printQueues;restore",data:JSON.stringify({queue:e.model.id})});o.fail(function(){t.prop("disabled",!1),n.msg.show({type:"error",time:2500,text:e.t("restore:failure")})}),o.always(function(){i.removeClass("fa-spinner fa-spin").addClass("fa-plus")})}})});