define(["app/user","app/core/View","app/orders/templates/documentList"],function(e,t,n){"use strict";var o=null,i=null;return t.extend({template:n,events:{"click a":function(e){e.preventDefault();var t=e.currentTarget;return!t.dataset.checking&&(e.currentTarget.textContent.trim()===o&&i&&!i.closed?(i.focus(),!1):t.dataset.checked?(this.openDocumentWindow(t),!1):(this.tryOpenDocument(t),!1))}},initialize:function(){this.once("afterRender",function(){this.listenTo(this.model,"change:documents",this.render)})},getTemplateData:function(){return{orderNo:this.model.id,documents:this.model.get("documents").toJSON(),canView:!window.IS_EMBEDDED&&e.isAllowedTo("LOCAL","DOCUMENTS:VIEW")}},tryOpenDocument:function(e){var t=this;e.dataset.checking=1,t.ajax({method:"HEAD",url:e.href}).fail(function(){e.parentElement.textContent=e.textContent}).done(function(){t.openDocumentWindow(e)}).always(function(){e.dataset.checking="",e.dataset.checked=1})},openDocumentWindow:function(e){var t=this,n=!1,a=e.textContent.trim(),r=window.screen,c=.8*r.availWidth,l=.9*r.availHeight,d=Math.floor((r.availWidth-c)/2),s="resizable,scrollbars,location=no,top="+Math.floor((r.availHeight-l)/2)+",left="+d+",width="+Math.floor(c)+",height="+Math.floor(l),u="WMES_ORDER_DOCUMENT_PREVIEW",f=window.open(e.href,u,s);f&&(o=a,i=f,clearInterval(t.timers[u]),t.timers[u]=setInterval(function(){f.closed?(o=null,i=null,t.trigger("documentClosed",a),clearInterval(t.timers[u])):!n&&f.ready&&(n=!0,t.trigger("documentOpened",a,f),f.focus())},250))},openBestDocument:function(e,t){var n=this,o={};n.model.get("bom").forEach(function(i){var a=i.get("item");a===e&&t[a]&&Object.keys(t[a]).forEach(function(e){if(!o[e]){o[e]=0;var i=n.model.get("documents").get(e),r=(i&&i.get("name")||"").replace(/[^A-Za-z0-9]+/g,"").toUpperCase();-1!==r.indexOf("ASSEMBL")?o[e]+=10:-1!==r.indexOf("ASS")&&(o[e]+=5),-1!==r.indexOf("QAP")&&(o[e]-=10),-1!==r.indexOf("PALLET")&&(o[e]-=20)}o[e]+=1,t[a][e].forEach(function(t){t.s===a&&(o[e]+=15)})})});var i=0,a=null;Object.keys(o).forEach(function(e){var t=o[e];t>i&&(i=t,a=e)}),n.$('tr[data-nc15="'+a+'"]').find("a").click()}})});