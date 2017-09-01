// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/View","app/orders/templates/componentList"],function(t,e){"use strict";return t.extend({template:e,events:{"click .orders-bom-item":function(t){return this.item=t.currentTarget.textContent.trim(),null===this.contents?this.loadContents():null===this.document?this.trigger("bestDocumentRequested",this.item,this.contents):this.mark(),!1}},initialize:function(){this.item=null,this.document=null,this.contents=null},serialize:function(){return{idPrefix:this.idPrefix,paint:!!this.options.paint,bom:this.model.get("bom").toJSON()}},beforeRender:function(){this.stopListening(this.model,"change:bom",this.render)},afterRender:function(){this.listenToOnce(this.model,"change:bom",this.render),this.$el.toggleClass("hidden",0===this.model.get("bom").length),this.updateItems()},markDocument:function(t,e){this.document=t,this.window=e,null===this.contents?this.loadContents():this.updateItems()},unmarkDocument:function(){this.document=null,this.window=null,this.updateItems()},loadContents:function(){var t=this;t.loadContentsReq||(t.loadContentsReq=t.ajax({url:"/orders/"+t.model.id+"/documentContents"}),t.loadContentsReq.always(function(){t.loadContentsReq=null}),t.loadContentsReq.done(function(e){t.contents=e,null===t.document?t.trigger("bestDocumentRequested",t.item,e):t.updateItems()}))},updateItems:function(){var t=this;t.contents&&(t.$(".orders-bom-item").each(function(){var e=this.textContent.trim();t.contents[e]&&t.contents[e][t.document]&&(e="<a>"+e+"</a>"),this.innerHTML=e}),this.mark())},mark:function(){this.window&&this.window.focus(),this.item&&this.document&&this.contents&&this.contents[this.item]&&this.window.showMarks(this.contents[this.item][this.document]||[])}})});