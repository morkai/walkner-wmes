define(["underscore","jquery","app/i18n","app/viewport","app/core/View","app/core/util/embedded","app/orderDocuments/templates/preview","app/orderDocuments/templates/documentWindow"],function(e,i,t,o,r,n,s,a){"use strict";return r.extend({template:s,initialize:function(){this.showMarksCounter=0,this.$iframe=null,this.listenTo(this.model,"change:localFile change:localOrder change:remoteOrder",e.debounce(this.onOrderChange.bind(this),1,!0)),this.listenTo(this.model,"marksRequested",this.onMarksRequested),this.timers.blurIframe=setInterval(this.blurIframe.bind(this),333)},destroy:function(){this.$iframe.remove(),this.$iframe=null},afterRender:function(){this.$iframe=this.$id("iframe"),this.resize(null,window.innerHeight),this.loadDocument()},openDocumentWindow:function(){var e=this.model.getCurrentOrderInfo(),i=.95*window.innerWidth,r=.95*window.innerHeight,n=Math.floor((window.innerWidth-i)/2),s="resizable,scrollbars,location=no,top="+Math.floor((window.innerHeight-r)/2)+",left="+n+",width="+Math.floor(i)+",height="+Math.floor(r),l=window.open("",e.documentNc15,s);l?(l.document.write(a({title:e.documentName,src:this.$iframe.attr("src")})),l.document.close()):o.msg.show({type:"error",time:3e3,text:t("orderDocuments","popup:document")})},loadDocument:function(){if(this.$iframe){var e=this.$id("loading").removeClass("hidden is-failure");this.$iframe.css({visibility:"hidden"});var i=this.model.get("localFile");if(i)return this.model.setFileSource("local"),this.setLoadingMessage("localFile"),void this.loadFile(URL.createObjectURL(i.file));var t=this.model.getCurrentOrder();if(!t.nc15)return this.model.setFileSource(null),e.addClass("hidden"),void this.$iframe.prop("src","").css({visibility:"visible"});this.tryLoadRemoteDocument(t.nc15)}},resize:function(e,i){null!==this.$iframe&&(null!==e&&this.$iframe.prop("width",e+"px"),null!==i&&this.$iframe.prop("height",i+"px"))},blurIframe:function(){this.$iframe&&document.activeElement===this.$iframe[0]&&this.$iframe.blur()},onOrderChange:function(){this.loadDocument()},loadFile:function(i){var t=this,o=e.once(function(){window.WMES_PAGE_LOADED=e.without(window.WMES_PAGE_LOADED,o),t.$id("loading").addClass("hidden"),t.$iframe.css({visibility:"visible"}),t.trigger("loadDocument:success",i)});window.WMES_PAGE_LOADED||(window.WMES_PAGE_LOADED=[]),window.WMES_PAGE_LOADED.push(o),t.$iframe.one("load",o),-1!==t.$iframe.prop("src").indexOf(i)?t.$iframe[0].contentWindow.location.reload():t.$iframe.prop("src",i)},tryLoadRemoteDocument:function(e){var i=this;if(i.model.setFileSource("remote"),i.setLoadingMessage("remoteServer"),"ORDER"===e)return i.loadFile(window.location.pathname+window.location.search+"#orders/"+i.model.getCurrentOrder().no);var t=i.model.getRemoteFileUrl(e)+"?"+i.getRemoteFileUrlQuery();i.req&&i.req.abort(),i.req=this.ajax({type:"HEAD",url:t}),i.req.fail(function(){i.req=null,i.$id("loading").addClass("is-failure"),i.$iframe.prop("src","").css({visibility:"visible"}),i.model.setFileSource(null),i.trigger("loadDocument:failure")}),i.req.done(function(e,o,r){var n=r.getResponseHeader("X-Document-Source");n&&i.model.setFileSource(n),i.req=null,i.loadFile(t)})},setLoadingMessage:function(e){this.$id("message").text(t("orderDocuments","preview:msg:loading:"+e))},getRemoteFileUrlQuery:function(){var e="order="+(this.model.getCurrentOrder().no||"")+"&w="+this.$iframe.width()+"&h="+this.$iframe.height();return n.isEnabled()||(e+="&pdf=1"),e},onMarksRequested:function(e){var i=this.model.getCurrentOrder();e.nc15!==i.nc15?(this.model.selectDocument(e.nc15),this.showMarksAfterLoad(e.page,e.marks)):this.showMarks(e.page,e.marks)},showMarks:function(e,i){if(this.$iframe){var t=this.$iframe[0].contentWindow;t.showMarks&&t.showMarks(i,e)}},showMarksAfterLoad:function(e,i){var t=this,o=++t.showMarksCounter;function r(){s(),t.showMarksCounter===o&&t.showMarks(e,i)}function n(){s()}function s(){t.off("loadDocument:success",r),t.off("loadDocument:failure",n)}t.on("loadDocument:success",r),t.on("loadDocument:failure",n)}})});