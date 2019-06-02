define(["app/user","app/viewport","app/core/View","app/orders/templates/componentList"],function(t,e,n,i){"use strict";return n.extend({template:i,events:{"click .orders-bom-item":function(t){if(this.options.linkDocuments)return this.item=t.currentTarget.textContent.trim(),null===this.contents?this.loadContents():null===this.document?this.trigger("bestDocumentRequested",this.item,this.contents):this.mark(),!1},"mousedown .orders-bom-pfep":function(t){t.preventDefault()},"mouseup .orders-bom-pfep":function(t){e.msg.loading();var n=this,i=n.model.get("nc12"),o=n.ajax({url:"/pfep/entries?select(_id)&nc12=string:"+i});return o.fail(function(){e.msg.loadingFailed()}),o.done(function(o){var s;if(e.msg.loaded(),1===o.totalCount)s="#pfep/entries/"+o.collection[0]._id;else{if(!(o.totalCount>1)){var l=n.$(t.target).closest("td");return void l.html(l.text())}s="#pfep/entries?sort(-rid)&limit(15)&nc12=string:"+i}1===t.button?window.open(s):window.location.href=s}),!1}},initialize:function(){this.item=null,this.document=null,this.window=null,this.contents=null},getTemplateData:function(){return{paint:!!this.options.paint,linkPfep:!!this.options.linkPfep&&t.isAllowedTo("PFEP:VIEW"),bom:this.model.get("bom").toJSON()}},beforeRender:function(){this.stopListening(this.model,"change:bom",this.render)},afterRender:function(){this.listenToOnce(this.model,"change:bom",this.render),this.$el.toggleClass("hidden",0===this.model.get("bom").length),this.updateItems()},markDocument:function(t,e){this.document=t,this.window=e,null===this.contents?this.loadContents():this.updateItems()},unmarkDocument:function(){this.document=null,this.window=null,this.updateItems()},loadContents:function(){var t=this;t.loadContentsReq||(t.loadContentsReq=t.ajax({url:"/orders/"+t.model.id+"/documentContents"}),t.loadContentsReq.always(function(){t.loadContentsReq=null}),t.loadContentsReq.done(function(e){t.contents=e,null===t.document?t.trigger("bestDocumentRequested",t.item,e):t.updateItems()}))},updateItems:function(){var t=this;t.contents&&(t.$(".orders-bom-item").each(function(){var e=this.textContent.trim();t.contents[e]&&t.contents[e][t.document]&&this.nextElementSibling.textContent.trim().length&&(e="<a>"+e+"</a>"),this.innerHTML=e}),this.mark())},mark:function(){var t=this.window;if(t&&t.showMarks){t&&t.focus();var e=this.item,n=this.document,i=this.contents;e&&n&&i&&i[e]&&t.showMarks(i[e][n]||[])}}})});