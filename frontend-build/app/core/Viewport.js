define(["require","underscore","jquery","./View","./util","./views/MessagesView","app/core/templates/dialogContainer"],function(t,e,i,o,r,s,n){"use strict";var a=function(t){return new t};function l(t){o.call(this,t),this.msg=t.messagesView?t.messagesView:new s({el:this.el}),this.document=t.document||window.document,this.layouts={},this.currentLayout=null,this.currentLayoutName=null,this.currentPage=null,this.$dialog=null,this.dialogQueue=[],this.currentDialog=null,this.pageCounter=0,this.closeDialog=this.closeDialog.bind(this),this.$el.on("click",".viewport-dialog .cancel",this.closeDialog)}return r.inherits(l,o),l.prototype.cleanup=function(){this.broker.destroy(),this.msg.remove(),this.$dialog.remove(),this.currentPage&&this.currentPage.remove(),this.currentLayout&&this.currentLayout.remove(),this.currentDialog&&this.currentDialog.remove(),e.invoke(this.dialogQueue.filter(e.isObject),"remove"),this.$el.off("click",".viewport-dialog .cancel",this.closeDialog),this.broker=null,this.msg=null,this.$dialog=null,this.currentLayout=null,this.currentDialog=null,this.dialogQueue=null,this.layouts=null},l.prototype.afterRender=function(){if(null!==this.$dialog)return this.closeDialog();this.$dialog=i(n()).appendTo(this.el).modal({show:!1,backdrop:!0}),this.$dialog.on("shown.bs.modal",this.onDialogShown.bind(this)),this.$dialog.on("hidden.bs.modal",this.onDialogHidden.bind(this))},l.prototype.registerLayout=function(t,e){return this.layouts[t]=e,this},l.prototype.loadPage=function(i,o){this.msg.loading(),e.isFunction(o)||(o=a);var r=this,s=++this.pageCounter;t([].concat(i),function(){s===r.pageCounter&&r.showPage(o.apply(null,arguments)),r.msg.loaded()},function(t){s===r.pageCounter&&(r.msg.loadingFailed(),r.broker.publish("viewport.page.loadingFailed",{page:null,xhr:{status:0,responseText:t.stack||t.message}}))})},l.prototype.showPage=function(t){var o=e.result(t,"layoutName");if(!e.isObject(this.layouts[o]))throw new Error("Unknown layout: `"+o+"`");++this.pageCounter;var r=this;function s(){for(var o=[],r=0;r<arguments.length;++r){var s=arguments[r];Array.isArray(s)?o.push.apply(o,s):o.push(s)}return t.trigger("beforeLoad",t,o),i.when.apply(i,e.map(o,t.promised,t))}function n(){r.broker.publish("viewport.page.loaded",{page:t}),t.trigger("afterLoad",t),null!==r.currentPage&&r.currentPage.remove(),r.currentPage=t;var i=r.setLayout(o);e.isFunction(i.setUpPage)&&i.setUpPage(t),e.isFunction(t.setUpLayout)&&t.setUpLayout(i),e.isObject(t.view)&&t.setView(t.view),i.setView(i.pageContainerSelector,t),r.isRendered()?i.isRendered()?t.render():i.render():r.render(),r.broker.publish("viewport.page.shown",t)}function a(e){t.remove(),r.broker.publish("viewport.page.loadingFailed",{page:t,xhr:e})}this.broker.publish("viewport.page.loading",{page:t}),e.isFunction(t.load)?t.load(s).then(n,a):s().then(n,a)},l.prototype.showDialog=function(t,i){if(null!==this.currentDialog)return this.dialogQueue.push(t,i),this;var o=!0,r=t.afterRender,s=this;t.afterRender=function(){var i=s.$dialog.find(".modal-body");i.children()[0]!==t.el&&i.empty().append(t.el),o&&(o=!1,s.$dialog.modal("show")),e.isFunction(r)&&r.apply(t,arguments)},this.currentDialog=t;var n=this.$dialog.find(".modal-header");return i?(n.find(".modal-title").text(i),n.show()):n.hide(),t.dialogClassName&&this.$dialog.addClass(e.result(t,"dialogClassName")),t.render(),this},l.prototype.closeDialog=function(t){return null===this.currentDialog?this:(this.$dialog.modal("hide"),t&&t.preventDefault&&t.preventDefault(),this)},l.prototype.closeDialogs=function(t,e){this.dialogQueue=this.dialogQueue.filter(e||t),"function"==typeof t&&this.currentDialog&&t(this.currentDialog)&&this.closeDialog()},l.prototype.closeAllDialogs=function(){this.dialogQueue=[],this.closeDialog()},l.prototype.setLayout=function(t){if(t===this.currentLayoutName)return e.isFunction(this.currentLayout.reset)&&this.currentLayout.reset(),this.currentLayout;var i=this.layouts[t],o=this.options.selector||"";return e.isObject(this.currentLayout)&&this.removeView(o),this.currentLayoutName=t,this.currentLayout=i(),this.setView(o,this.currentLayout),this.trigger("layout:change",this.currentLayoutName,this.currentLayout),this.currentLayout},l.prototype.onDialogShown=function(){this.currentDialog&&(this.currentDialog.$("[autofocus]").focus(),e.isFunction(this.currentDialog.onDialogShown)&&this.currentDialog.onDialogShown(this),this.broker.publish("viewport.dialog.shown",this.currentDialog),this.currentDialog.trigger("dialog:shown"))},l.prototype.onDialogHidden=function(){this.currentDialog&&(this.currentDialog.dialogClassName&&this.$dialog.removeClass(e.result(this.currentDialog,"dialogClassName")),e.isFunction(this.currentDialog.remove)&&(this.currentDialog.trigger("dialog:hidden"),this.currentDialog.remove(),this.broker.publish("viewport.dialog.hidden",this.currentDialog)),this.currentDialog=null,this.dialogQueue.length&&this.showDialog(this.dialogQueue.shift(),this.dialogQueue.shift()))},l});