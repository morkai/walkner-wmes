define(["require","underscore","jquery","./View","./util","./views/MessagesView","app/core/templates/dialogContainer"],function(t,e,i,o,s,n,r){function l(t){o.call(this,t),this.msg=t.messagesView?t.messagesView:new n({el:this.el}),this.document=t.document||window.document,this.layouts={},this.currentLayout=null,this.currentLayoutName=null,this.currentPage=null,this.$dialog=null,this.dialogQueue=[],this.currentDialog=null,this.closeDialog=this.closeDialog.bind(this),this.$el.on("click",".viewport-dialog .cancel",this.closeDialog)}var a=function(t){return new t};return s.inherits(l,o),l.prototype.cleanup=function(){this.broker.destroy(),this.msg.remove(),this.$dialog.remove(),this.currentPage&&this.currentPage.remove(),this.currentLayout&&this.currentLayout.remove(),this.currentDialog&&this.currentDialog.remove(),e.invoke(this.dialogQueue.filter(e.isObject),"remove"),this.$el.off("click",".viewport-dialog .cancel",this.closeDialog),this.broker=null,this.msg=null,this.$dialog=null,this.currentLayout=null,this.currentDialog=null,this.dialogQueue=null,this.layouts=null},l.prototype.afterRender=function(){return null!==this.$dialog?this.closeDialog():(this.$dialog=i(r()).appendTo(this.el).modal({show:!1,backdrop:!0}),this.$dialog.on("shown.bs.modal",this.onDialogShown.bind(this)),this.$dialog.on("hidden.bs.modal",this.onDialogHidden.bind(this)),void 0)},l.prototype.registerLayout=function(t,e){return this.layouts[t]=e,this},l.prototype.loadPage=function(i,o){this.msg.loading(),e.isFunction(o)||(o=a);var s=this;t([i],function(t){s.showPage(o(t)),s.msg.loaded()})},l.prototype.showPage=function(t){function o(){return i.when.apply(i,e.map(arguments,t.promised,t))}function s(){null!==l.currentPage&&l.currentPage.remove(),l.currentPage=t;var i=l.setLayout(r);e.isFunction(i.setUpPage)&&i.setUpPage(t),e.isFunction(t.setUpLayout)&&t.setUpLayout(i),e.isObject(t.view)&&t.setView(t.view),i.setView(i.pageContainerSelector,t),l.isRendered()?i.isRendered()?t.render():i.render():l.render()}function n(){console.log("onPageLoadFailure"),t.remove()}var r=e.result(t,"layoutName");if(!e.isObject(this.layouts[r]))throw new Error("Unknown layout: `"+r+"`");var l=this;e.isFunction(t.load)?t.load(o).then(s,n):s()},l.prototype.showDialog=function(t,i){if(null!==this.currentDialog)return this.dialogQueue.push(t,i),this;t.render(),this.currentDialog=t;var o=this.$dialog.find(".modal-header");return i?(o.find(".modal-title").text(i),o.show()):o.hide(),t.dialogClassName&&this.$dialog.addClass(e.result(t,"dialogClassName")),this.$dialog.find(".modal-body").empty().append(t.el),this.$dialog.modal("show"),this},l.prototype.closeDialog=function(t){return null===this.currentDialog?this:(this.$dialog.modal("hide"),t&&t.preventDefault(),this)},l.prototype.closeAllDialogs=function(){this.dialogQueue=[],this.closeDialog()},l.prototype.setLayout=function(t){if(t===this.currentLayoutName)return e.isFunction(this.currentLayout.reset)&&this.currentLayout.reset(),this.currentLayout;var i=this.layouts[t],o=this.options.selector||"";return e.isObject(this.currentLayout)&&this.removeView(o),this.currentLayoutName=t,this.currentLayout=i(),this.setView(o,this.currentLayout),this.currentLayout},l.prototype.onDialogShown=function(){this.currentDialog.$("[autofocus]").focus(),e.isFunction(this.currentDialog.onDialogShown)&&this.currentDialog.onDialogShown(this),this.broker.publish("viewport.dialog.shown",this.currentDialog)},l.prototype.onDialogHidden=function(){this.currentDialog.dialogClassName&&this.$dialog.removeClass(e.result(this.currentDialog,"dialogClassName")),e.isFunction(this.currentDialog.remove)&&(this.currentDialog.remove(),this.broker.publish("viewport.dialog.hidden")),this.currentDialog=null,this.dialogQueue.length&&this.showDialog(this.dialogQueue.shift(),this.dialogQueue.shift())},l});