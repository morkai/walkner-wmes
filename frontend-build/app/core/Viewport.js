define(["require","underscore","jquery","./View","./util","./views/MessagesView","app/core/templates/dialogContainer"],function(t,i,e,o,s,n,r){function l(t){o.call(this,t),this.msg=t.messagesView?t.messagesView:new n({el:this.el}),this.document=t.document||window.document,this.layouts={},this.currentLayout=null,this.currentLayoutName=null,this.currentPage=null,this.$dialog=null,this.dialogQueue=[],this.currentDialog=null,this.closeDialog=this.closeDialog.bind(this),this.$el.on("click",".viewport-dialog .cancel",this.closeDialog)}var a=function(t){return new t};return s.inherits(l,o),l.prototype.cleanup=function(){this.broker.destroy(),this.msg.remove(),this.$dialog.remove(),this.currentPage&&this.currentPage.remove(),this.currentLayout&&this.currentLayout.remove(),this.currentDialog&&this.currentDialog.remove(),i.invoke(this.dialogQueue.filter(i.isObject),"remove"),this.$el.off("click",".viewport-dialog .cancel",this.closeDialog),this.broker=null,this.msg=null,this.$dialog=null,this.currentLayout=null,this.currentDialog=null,this.dialogQueue=null,this.layouts=null},l.prototype.afterRender=function(){return null!==this.$dialog?this.closeDialog():(this.$dialog=e(r()).appendTo(this.el).modal({show:!1,backdrop:!0}),this.$dialog.on("shown.bs.modal",this.onDialogShown.bind(this)),void this.$dialog.on("hidden.bs.modal",this.onDialogHidden.bind(this)))},l.prototype.registerLayout=function(t,i){return this.layouts[t]=i,this},l.prototype.loadPage=function(e,o){this.msg.loading(),i.isFunction(o)||(o=a);var s=this;t([].concat(e),function(){s.showPage(o.apply(null,arguments)),s.msg.loaded()})},l.prototype.showPage=function(t){function o(){return e.when.apply(e,i.map(arguments,t.promised,t))}function s(){null!==l.currentPage&&l.currentPage.remove(),l.currentPage=t;var e=l.setLayout(r);i.isFunction(e.setUpPage)&&e.setUpPage(t),i.isFunction(t.setUpLayout)&&t.setUpLayout(e),i.isObject(t.view)&&t.setView(t.view),e.setView(e.pageContainerSelector,t),l.isRendered()?e.isRendered()?t.render():e.render():l.render()}function n(){t.remove()}var r=i.result(t,"layoutName");if(!i.isObject(this.layouts[r]))throw new Error("Unknown layout: `"+r+"`");var l=this;i.isFunction(t.load)?t.load(o).then(s,n):s()},l.prototype.showDialog=function(t,e){if(null!==this.currentDialog)return this.dialogQueue.push(t,e),this;t.render(),this.currentDialog=t;var o=this.$dialog.find(".modal-header");return e?(o.find(".modal-title").text(e),o.show()):o.hide(),t.dialogClassName&&this.$dialog.addClass(i.result(t,"dialogClassName")),this.$dialog.find(".modal-body").empty().append(t.el),this.$dialog.modal("show"),this},l.prototype.closeDialog=function(t){return null===this.currentDialog?this:(this.$dialog.modal("hide"),t&&t.preventDefault(),this)},l.prototype.closeAllDialogs=function(){this.dialogQueue=[],this.closeDialog()},l.prototype.setLayout=function(t){if(t===this.currentLayoutName)return i.isFunction(this.currentLayout.reset)&&this.currentLayout.reset(),this.currentLayout;var e=this.layouts[t],o=this.options.selector||"";return i.isObject(this.currentLayout)&&this.removeView(o),this.currentLayoutName=t,this.currentLayout=e(),this.setView(o,this.currentLayout),this.currentLayout},l.prototype.onDialogShown=function(){this.currentDialog.$("[autofocus]").focus(),i.isFunction(this.currentDialog.onDialogShown)&&this.currentDialog.onDialogShown(this),this.broker.publish("viewport.dialog.shown",this.currentDialog)},l.prototype.onDialogHidden=function(){this.currentDialog.dialogClassName&&this.$dialog.removeClass(i.result(this.currentDialog,"dialogClassName")),i.isFunction(this.currentDialog.remove)&&(this.currentDialog.remove(),this.broker.publish("viewport.dialog.hidden")),this.currentDialog=null,this.dialogQueue.length&&this.showDialog(this.dialogQueue.shift(),this.dialogQueue.shift())},l});