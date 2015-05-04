// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["require","underscore","jquery","./View","./util","./views/MessagesView","app/core/templates/dialogContainer"],function(t,e,i,o,s,r,n){"use strict";function a(t){o.call(this,t),this.msg=t.messagesView?t.messagesView:new r({el:this.el}),this.document=t.document||window.document,this.layouts={},this.currentLayout=null,this.currentLayoutName=null,this.currentPage=null,this.$dialog=null,this.dialogQueue=[],this.currentDialog=null,this.closeDialog=this.closeDialog.bind(this),this.$el.on("click",".viewport-dialog .cancel",this.closeDialog)}var l=function(t){return new t};return s.inherits(a,o),a.prototype.cleanup=function(){this.broker.destroy(),this.msg.remove(),this.$dialog.remove(),this.currentPage&&this.currentPage.remove(),this.currentLayout&&this.currentLayout.remove(),this.currentDialog&&this.currentDialog.remove(),e.invoke(this.dialogQueue.filter(e.isObject),"remove"),this.$el.off("click",".viewport-dialog .cancel",this.closeDialog),this.broker=null,this.msg=null,this.$dialog=null,this.currentLayout=null,this.currentDialog=null,this.dialogQueue=null,this.layouts=null},a.prototype.afterRender=function(){return null!==this.$dialog?this.closeDialog():(this.$dialog=i(n()).appendTo(this.el).modal({show:!1,backdrop:!0}),this.$dialog.on("shown.bs.modal",this.onDialogShown.bind(this)),void this.$dialog.on("hidden.bs.modal",this.onDialogHidden.bind(this)))},a.prototype.registerLayout=function(t,e){return this.layouts[t]=e,this},a.prototype.loadPage=function(i,o){this.msg.loading(),e.isFunction(o)||(o=l);var s=this;t([].concat(i),function(){s.showPage(o.apply(null,arguments)),s.msg.loaded()})},a.prototype.showPage=function(t){function o(){for(var o=[],s=0;s<arguments.length;++s){var r=arguments[s];Array.isArray(r)?o.push.apply(o,r):o.push(r)}return i.when.apply(i,e.map(o,t.promised,t))}function s(){null!==a.currentPage&&a.currentPage.remove(),a.currentPage=t;var i=a.setLayout(n);e.isFunction(i.setUpPage)&&i.setUpPage(t),e.isFunction(t.setUpLayout)&&t.setUpLayout(i),e.isObject(t.view)&&t.setView(t.view),i.setView(i.pageContainerSelector,t),a.isRendered()?i.isRendered()?t.render():i.render():a.render()}function r(){t.remove()}var n=e.result(t,"layoutName");if(!e.isObject(this.layouts[n]))throw new Error("Unknown layout: `"+n+"`");var a=this;e.isFunction(t.load)?t.load(o).then(s,r):s()},a.prototype.showDialog=function(t,i){if(null!==this.currentDialog)return this.dialogQueue.push(t,i),this;var o=t.afterRender,s=this;t.afterRender=function(){var i=s.$dialog.find(".modal-body");i.children()[0]!==t.el&&i.empty().append(t.el),s.$dialog.modal("show"),e.isFunction(o)&&o.apply(t,arguments)},this.currentDialog=t;var r=this.$dialog.find(".modal-header");return i?(r.find(".modal-title").text(i),r.show()):r.hide(),t.dialogClassName&&this.$dialog.addClass(e.result(t,"dialogClassName")),t.render(),this},a.prototype.closeDialog=function(t){return null===this.currentDialog?this:(this.$dialog.modal("hide"),t&&t.preventDefault(),this)},a.prototype.closeAllDialogs=function(){this.dialogQueue=[],this.closeDialog()},a.prototype.setLayout=function(t){if(t===this.currentLayoutName)return e.isFunction(this.currentLayout.reset)&&this.currentLayout.reset(),this.currentLayout;var i=this.layouts[t],o=this.options.selector||"";return e.isObject(this.currentLayout)&&this.removeView(o),this.currentLayoutName=t,this.currentLayout=i(),this.setView(o,this.currentLayout),this.currentLayout},a.prototype.onDialogShown=function(){this.currentDialog.$("[autofocus]").focus(),e.isFunction(this.currentDialog.onDialogShown)&&this.currentDialog.onDialogShown(this),this.broker.publish("viewport.dialog.shown",this.currentDialog)},a.prototype.onDialogHidden=function(){this.currentDialog.dialogClassName&&this.$dialog.removeClass(e.result(this.currentDialog,"dialogClassName")),e.isFunction(this.currentDialog.remove)&&(this.currentDialog.remove(),this.broker.publish("viewport.dialog.hidden",this.currentDialog)),this.currentDialog=null,this.dialogQueue.length&&this.showDialog(this.dialogQueue.shift(),this.dialogQueue.shift())},a});