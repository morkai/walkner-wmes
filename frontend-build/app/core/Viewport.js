// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["require","underscore","jquery","./View","./util","./views/MessagesView","app/core/templates/dialogContainer"],function(t,e,i,o,r,s,n){"use strict";function a(t){o.call(this,t),this.msg=t.messagesView?t.messagesView:new s({el:this.el}),this.document=t.document||window.document,this.layouts={},this.currentLayout=null,this.currentLayoutName=null,this.currentPage=null,this.$dialog=null,this.dialogQueue=[],this.currentDialog=null,this.pageCounter=0,this.closeDialog=this.closeDialog.bind(this),this.$el.on("click",".viewport-dialog .cancel",this.closeDialog)}var l=function(t){return new t};return r.inherits(a,o),a.prototype.cleanup=function(){this.broker.destroy(),this.msg.remove(),this.$dialog.remove(),this.currentPage&&this.currentPage.remove(),this.currentLayout&&this.currentLayout.remove(),this.currentDialog&&this.currentDialog.remove(),e.invoke(this.dialogQueue.filter(e.isObject),"remove"),this.$el.off("click",".viewport-dialog .cancel",this.closeDialog),this.broker=null,this.msg=null,this.$dialog=null,this.currentLayout=null,this.currentDialog=null,this.dialogQueue=null,this.layouts=null},a.prototype.afterRender=function(){return null!==this.$dialog?this.closeDialog():(this.$dialog=i(n()).appendTo(this.el).modal({show:!1,backdrop:!0}),this.$dialog.on("shown.bs.modal",this.onDialogShown.bind(this)),void this.$dialog.on("hidden.bs.modal",this.onDialogHidden.bind(this)))},a.prototype.registerLayout=function(t,e){return this.layouts[t]=e,this},a.prototype.loadPage=function(i,o){this.msg.loading(),e.isFunction(o)||(o=l);var r=this,s=++this.pageCounter;t([].concat(i),function(){s===r.pageCounter&&r.showPage(o.apply(null,arguments)),r.msg.loaded()})},a.prototype.showPage=function(t){function o(){for(var o=[],r=0;r<arguments.length;++r){var s=arguments[r];Array.isArray(s)?o.push.apply(o,s):o.push(s)}return i.when.apply(i,e.map(o,t.promised,t))}function r(){a.broker.publish("viewport.page.loaded",{page:t}),null!==a.currentPage&&a.currentPage.remove(),a.currentPage=t;var i=a.setLayout(n);e.isFunction(i.setUpPage)&&i.setUpPage(t),e.isFunction(t.setUpLayout)&&t.setUpLayout(i),e.isObject(t.view)&&t.setView(t.view),i.setView(i.pageContainerSelector,t),a.isRendered()?i.isRendered()?t.render():i.render():a.render(),a.broker.publish("viewport.page.shown",t)}function s(e){t.remove(),a.broker.publish("viewport.page.loadingFailed",{page:t,xhr:e})}var n=e.result(t,"layoutName");if(!e.isObject(this.layouts[n]))throw new Error("Unknown layout: `"+n+"`");++this.pageCounter;var a=this;this.broker.publish("viewport.page.loading",{page:t}),e.isFunction(t.load)?t.load(o).then(r,s):r()},a.prototype.showDialog=function(t,i){if(null!==this.currentDialog)return this.dialogQueue.push(t,i),this;var o=t.afterRender,r=this;t.afterRender=function(){var i=r.$dialog.find(".modal-body");i.children()[0]!==t.el&&i.empty().append(t.el),r.$dialog.modal("show"),e.isFunction(o)&&o.apply(t,arguments)},this.currentDialog=t;var s=this.$dialog.find(".modal-header");return i?(s.find(".modal-title").text(i),s.show()):s.hide(),t.dialogClassName&&this.$dialog.addClass(e.result(t,"dialogClassName")),t.render(),this},a.prototype.closeDialog=function(t){return null===this.currentDialog?this:(this.$dialog.modal("hide"),t&&t.preventDefault&&t.preventDefault(),this)},a.prototype.closeDialogs=function(t,e){this.dialogQueue=this.dialogQueue.filter(e||t),"function"==typeof t&&this.currentDialog&&t(this.currentDialog)&&this.closeDialog()},a.prototype.closeAllDialogs=function(){this.dialogQueue=[],this.closeDialog()},a.prototype.setLayout=function(t){if(t===this.currentLayoutName)return e.isFunction(this.currentLayout.reset)&&this.currentLayout.reset(),this.currentLayout;var i=this.layouts[t],o=this.options.selector||"";return e.isObject(this.currentLayout)&&this.removeView(o),this.currentLayoutName=t,this.currentLayout=i(),this.setView(o,this.currentLayout),this.currentLayout},a.prototype.onDialogShown=function(){this.currentDialog.$("[autofocus]").focus(),e.isFunction(this.currentDialog.onDialogShown)&&this.currentDialog.onDialogShown(this),this.broker.publish("viewport.dialog.shown",this.currentDialog),this.currentDialog.trigger("dialog:shown")},a.prototype.onDialogHidden=function(){this.currentDialog.dialogClassName&&this.$dialog.removeClass(e.result(this.currentDialog,"dialogClassName")),e.isFunction(this.currentDialog.remove)&&(this.currentDialog.trigger("dialog:hidden"),this.currentDialog.remove(),this.broker.publish("viewport.dialog.hidden",this.currentDialog)),this.currentDialog=null,this.dialogQueue.length&&this.showDialog(this.dialogQueue.shift(),this.dialogQueue.shift())},a});