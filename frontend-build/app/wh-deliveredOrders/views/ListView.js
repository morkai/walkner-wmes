define(["app/user","app/viewport","app/core/views/ListView","./FormView"],function(e,i,t,s){"use strict";return t.extend({className:"is-colored",localTopics:{"socket.connected":"refreshCollectionNow"},remoteTopics:function(){var e={};return e[this.collection.getTopicPrefix()+".updated"]="onUpdated",e},events:Object.assign({"click .action-edit":function(e){var t=this.collection.get(this.$(e.currentTarget).closest(".list-item")[0].dataset.id),n=new s({model:t});i.showDialog(n,this.t("FORM:edit:title"))},"click .action-finish":function(e){i.msg.saving();var t=this.collection.get(this.$(e.currentTarget).closest(".list-item")[0].dataset.id),s=this.promised(t.save({qtyDone:t.get("qtyTodo")},{wait:!0}));s.fail(function(){i.msg.savingFailed()}),s.done(function(){i.msg.saved()})}},t.prototype.events),columns:[{id:"line",className:"is-min",tdClassName:"text-fixed"},{id:"sapOrder",className:"is-min"},{id:"qty",className:"is-min text-right",tdClassName:"text-right"},{id:"pceTime",className:"is-min"},{id:"date",className:"is-min"},{id:"set",className:"is-min"},"-"],actions:function(){var i=this,t=e.isAllowedTo("WH:MANAGE");return function(e){var s=[];return t?(s.push({id:"finish",icon:"check",label:i.t("LIST:ACTION:finish"),className:e.qtyDone<e.qtyTodo?"":"disabled"}),s.push({id:"edit",icon:"edit",label:i.t("core","LIST:ACTION:edit")}),s):s}},initialize:function(){t.prototype.initialize.apply(this,arguments),this.once("afterRender",function(){this.listenTo(this.collection,"change",this.render)})},onUpdated:function(e){var i=this,t=!1,s=i.collection.getLineFilter(),n=i.collection.getSapOrderFilter();(e.added||[]).forEach(function(e){e.line!==s&&e.sapOrder!==n||(t=!0)}),(e.updated||[]).forEach(function(e){var o=i.collection.get(e._id);o?o.set(e):e.line!==s&&e.sapOrder!==n||(t=!0)}),t&&i.refreshCollection()}})});