// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","app/i18n","app/viewport","app/core/View","app/orderDocuments/templates/preview","app/orderDocuments/templates/documentWindow"],function(e,i,t,o,r,n,l){"use strict";return r.extend({template:n,initialize:function(){this.$iframe=null,this.listenTo(this.model,"change:localFile change:localOrder change:remoteOrder",e.debounce(this.onOrderChange.bind(this),1,!0)),-1!==window.navigator.userAgent.indexOf("Chrome/")&&(this.timers.blurIframe=setInterval(this.blurIframe.bind(this),333))},destroy:function(){this.$iframe.remove(),this.$iframe=null},afterRender:function(){this.$iframe=this.$id("iframe"),this.resize(null,window.innerHeight),this.loadDocument()},openDocumentWindow:function(){var e=this.model.getCurrentOrderInfo(),i=.95*window.innerWidth,r=.95*window.innerHeight,n=Math.floor((window.innerWidth-i)/2),s=Math.floor((window.innerHeight-r)/2),a="resizable,scrollbars,location=no,top="+s+",left="+n+",width="+Math.floor(i)+",height="+Math.floor(r),d=window.open("",e.documentNc15,a);d?(d.document.write(l({title:e.documentName,src:this.$iframe.attr("src")})),d.document.close()):o.msg.show({type:"error",time:3e3,text:t("orderDocuments","popup")})},loadDocument:function(){if(this.$iframe){var e=this.$id("loading").removeClass("hidden is-failure");this.$iframe.prop("src","");var i=this.model.get("localFile");if(i)return this.model.set("fileSource","local"),this.setLoadingMessage("localFile"),void this.loadFile(URL.createObjectURL(i.file));var t=this.model.getCurrentOrder();return t.nc15?void this.tryLoadRemoteDocument(t.nc15):(this.model.set("fileSource",null),void e.addClass("hidden"))}},resize:function(e,i){null!==this.$iframe&&(null!==e&&this.$iframe.prop("width",e+"px"),null!==i&&this.$iframe.prop("height",i+"px"))},blurIframe:function(){document.activeElement===this.$iframe[0]&&this.$iframe.blur()},onOrderChange:function(){this.loadDocument()},loadFile:function(e){var i=this;this.$iframe.one("load",function(){i.$id("loading").addClass("hidden")}),this.$iframe.prop("src",e)},tryLoadRemoteDocument:function(e){this.model.set("fileSource","remote"),this.setLoadingMessage("remoteServer");var i=this,t=this.model.getRemoteFileUrl(e);this.req&&this.req.abort(),this.req=this.ajax({type:"HEAD",url:t}),this.req.fail(function(){i.req=null,i.tryLoadLocalDocument(e)}),this.req.done(function(e,o,r){var n=r.getResponseHeader("X-Document-Source");n&&i.model.set("fileSource",n),i.req=null,i.loadFile(t)})},tryLoadLocalDocument:function(e){this.model.set("fileSource","local"),this.setLoadingMessage("localServer");var i=this,t=this.model.getLocalFileUrl(e);return this.req&&(this.req.abort(),this.req=null),null===t?(this.$id("loading").addClass("is-failure"),void this.model.set("fileSource",null)):(this.req=this.ajax({type:"HEAD",url:t}),this.req.fail(function(){i.req=null,i.$id("loading").addClass("is-failure"),i.model.set("fileSource",null),i.setLoadingMessage("failure")}),void this.req.done(function(){i.req=null,i.loadFile(t)}))},setLoadingMessage:function(e){this.$id("message").text(t("orderDocuments","preview:msg:loading:"+e))}})});