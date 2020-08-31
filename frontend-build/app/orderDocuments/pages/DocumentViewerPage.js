define(["underscore","jquery","app/i18n","app/user","app/core/View","app/core/util/embedded","app/production/snManager","../views/DocumentViewerControlsView","../views/DocumentViewerPreviewView","../views/BomView","app/orderDocuments/templates/page"],function(e,i,o,t,n,s,d,r,c,l,h){"use strict";var u=window.navigator.userAgent.match(/(Chrome)\/([0-9]+)/)||["Unknown/0","Unknown",0];return n.extend({template:h,layoutName:"blank",localTopics:{"socket.connected":"onConnectionStatusChange","socket.disconnected":"onConnectionStatusChange"},remoteTopics:{"orderDocuments.remoteChecked.*":"onRemoteDocumentChecked","orderDocuments.eto.synced":"onEtoSynced","compRel.orders.updated.*":"onCompRelOrderUpdated"},initialize:function(){this.loadedFilesCount=0,this.$els={controls:null,viewer:null},this.defineViews(),this.defineBindings(),d.bind(this),this.setView("#-controls",this.controlsView),this.setView("#-preview",this.previewView),this.setView("#-bom",this.bomView)},defineViews:function(){this.controlsView=new r({model:this.model}),this.previewView=new c({model:this.model}),this.bomView=new l({model:this.model})},defineBindings:function(){var o=this,t=e.debounce(o.updateClientState.bind(o),1e3),n=e.debounce(o.joinProdLine.bind(o),1);o.listenTo(o.model,"change:prodLine change:station",n),o.listenTo(o.model,"change:prodLine",o.onProdLineChanged),o.listenTo(o.model,"change:spigotCheck",o.defineSpigotBindings),o.listenTo(o.model,"change:bom",o.onBomChanged),o.listenTo(o.model,"save",function(){t(),o.model.isBomActive()&&!o.model.isConfirmableDocumentSelected()||o.model.set("bom",null)}),o.listenTo(o.controlsView,"documentReloadRequested",o.previewView.loadDocument.bind(o.previewView)),o.listenTo(o.controlsView,"documentWindowRequested",setTimeout.bind(window,o.previewView.openDocumentWindow.bind(o.previewView),1)),o.listenTo(o.previewView,"loadDocument:success",o.onFileLoaded),o.socket.on("orderDocuments.remoteOrderUpdated",o.onRemoteOrderUpdated.bind(o)),o.defineSpigotBindings(),i(window).on("resize."+o.idPrefix,e.debounce(o.resize.bind(o),1)),i(window).on("keydown."+o.idPrefix,o.onKeyDown.bind(o)),s.isEnabled()&&(i(window).on("contextmenu."+o.idPrefix,function(e){e.preventDefault()}),o.cancelPinchZoom=function(e){e.touches&&e.touches.length>1&&e.preventDefault()},window.addEventListener("touchstart",o.cancelPinchZoom,{passive:!1}))},defineSpigotBindings:function(){var e=this.model.get("prodLine")._id;if(e&&this.model.get("spigotCheck")){if(this.spigotCheckSub){if(this.spigotCheckSub.prodLineId===e)return;this.spigotCheckSub.cancel()}this.spigotCheckSub=this.pubsub.subscribe("production.spigotCheck.*."+e,this.onSpigotMessage.bind(this)),this.spigotCheckSub.prodLineId=e}else this.spigotCheckSub&&(this.spigotCheckSub.cancel(),this.spigotCheckSub=null)},destroy:function(){i("body").removeClass("no-overflow orderDocuments"),i(window).off("."+this.idPrefix),this.cancelPinchZoom&&window.removeEventListener("touchstart",this.cancelPinchZoom)},load:function(e){return e(this.model.load())},afterRender:function(){this.$els.controls=this.$id("controls"),this.$els.viewport=this.$id("viewport"),i("body").addClass("no-overflow orderDocuments"),this.toggleConnectionStatus(),this.resize(),this.checkInitialConfig(),s.isEnabled()&&(window.WMES_DOCS_BOM_TOGGLE=this.toggleBom.bind(this),window.WMES_DOCS_BOM_ACTIVE=this.model.isBomActive.bind(this.model),this.onBomChanged(),window.parent.postMessage({type:"ready",app:"documents"},"*"))},resize:function(){this.controlsView.resize(null,window.innerHeight),this.previewView.resize(null,window.innerHeight),this.resizeBom()},resizeBom:function(){var e=this.controlsView.$id("filterForm")[0],i=e?e.offsetTop:0;this.$id("bom").css("height",window.innerHeight-i+1+"px")},toggleConnectionStatus:function(){this.$el.removeClass("is-connected is-disconnected").addClass(this.socket.isConnected()?"is-connected":"is-disconnected")},joinProdLine:function(){if(this.socket.isConnected()){var e=this.model,i=e.get("prodLine");i._id&&(this.socket.emit("orderDocuments.join",{clientId:e.id,prodLineId:i._id,station:e.get("station"),settings:e.getSettings(),orderInfo:e.getCurrentOrderInfo()}),this.defineSpigotBindings())}},updateClientState:function(){this.socket.isConnected()&&this.socket.emit("orderDocuments.update",{clientId:this.model.id,settings:this.model.getSettings(),orderInfo:this.model.getCurrentOrderInfo()})},checkInitialConfig:function(){this.model.get("prodLine")._id||this.controlsView.openSettingsDialog()},onSpigotMessage:function(e,i){switch(i.split(".")[2]){case"requested":this.onSpigotRequested(e);break;case"failure":this.onSpigotFailure(e);break;case"success":this.onSpigotSuccess(e);break;case"aborted":this.onSpigotAborted()}},scheduleSpigotMessageHideTimer:function(){var e=this;clearTimeout(e.timers.hideSpigotMessage),e.timers.hideSpigotMessage=setTimeout(function(){e.skipNextSpigotRequest=!1,e.onSnScanned=null,d.hideMessage()},7500)},onSpigotAborted:function(){clearTimeout(this.timers.hideSpigotMessage),this.skipNextSpigotRequest=!1,this.onSnScanned=null,d.hideMessage()},onSpigotRequested:function(e){this.onSnScanned=this.onSpigotScanned.bind(this),this.skipNextSpigotRequest?this.skipNextSpigotRequest=!1:d.showMessage({_id:"",orderNo:e.orderNo},"warning",function(){return o("orderDocuments","spigot:request",{component:e.component?e.component.name:"?"})},15e3),this.scheduleSpigotMessageHideTimer()},onSpigotFailure:function(e){this.skipNextSpigotRequest=!0,d.showMessage({_id:e.input,orderNo:e.orderNo},"error",function(){return o("orderDocuments","spigot:failure")},15e3),this.scheduleSpigotMessageHideTimer()},onSpigotSuccess:function(e){this.skipNextSpigotRequest=!0,d.showMessage({_id:e.input,orderNo:e.orderNo},"success",function(){return o("orderDocuments","spigot:success")},"spigotChecker"===e.source?3e3:15e3),this.scheduleSpigotMessageHideTimer()},onSpigotScanned:function(e){this.skipNextSpigotRequest=!0,d.showMessage({_id:e._id},"warning",function(){return o("orderDocuments","spigot:checking")},15e3),this.pubsub.publish("production.spigotCheck.scanned."+this.model.get("prodLine")._id,{nc12:e._id}),this.scheduleSpigotMessageHideTimer()},onKeyDown:function(e){if(!s.isEnabled())return e.ctrlKey&&70===e.keyCode?(this.controlsView.focusFilter(),!1):void(27===e.keyCode&&(this.controlsView.clearFilter(),this.controlsView.scrollIntoView()))},onConnectionStatusChange:function(){this.toggleConnectionStatus(),this.joinProdLine()},onRemoteOrderUpdated:function(e){null!==e.no&&(this.model.setRemoteOrder(e),this.model.save())},onRemoteDocumentChecked:function(e){null===this.model.get("localFile")&&(this.model.getCurrentOrder().nc15===e.nc15&&this.previewView.loadDocument())},onEtoSynced:function(e){var i=this.model.getCurrentOrder();"ETO"!==i.nc15||i.nc12!==e.nc12?this.model.checkEtoExistence(e.nc12):this.previewView.loadDocument()},onFileLoaded:function(){this.controlsView.checkNotes(),"Chrome"!==u[1]||u[2]>=49||(this.loadedFilesCount+=1,6===this.loadedFilesCount&&this.listenTo(this.model,"change:localFile change:localOrder change:remoteOrder",function(){var e=this.model.get("fileSource");if("remote"===e||"local"===e)return setTimeout(window.location.reload.bind(window.location),10)}))},toggleBom:function(e,i){if(!this.model.getCurrentOrder().no)return i(!0);this.model.isConfirmableDocumentSelected()?e=!1:null===e&&(e=!this.model.isBomActive()),e?this.showBom(i):this.hideBom(i)},hideBom:function(i){var o=this.model.get("bom");o&&o.active&&(o=e.defaults({active:!1},o),this.model.set("bom",o)),i&&i()},showBom:function(i){var o=this;if(o.model.isBomActive())i&&i();else{if(o.model.isBomAvailable()){var t=e.defaults({active:!0},this.model.get("bom"));return o.model.set("bom",t),void(i&&i())}var n=o.model.getCurrentOrder(),s=o.ajax({url:"/orders/"+n.no+"/documentContents?result=bom"});s.fail(function(){o.hideBom(function(){i&&i(!0)})}),s.done(function(e){e.active=!0,e.orderNo=n.no,o.model.set("bom",e),i&&i()})}},onBomChanged:function(){var e=this.model.isBomActive(),i=this.previewView.$iframe;i&&i.length&&i[0].contentWindow.toggleBom&&i[0].contentWindow.toggleBom(e),e&&(this.resizeBom(),this.bomView.render()),this.$id("bom").toggleClass("hidden",!e)},onProdLineChanged:function(){this.setUpConfirmedSub()},setUpConfirmedSub:function(){this.confirmedSub&&(this.confirmedSub.cancel(),this.confirmedSub=null);var e=this.model.get("prodLine")._id;e&&(this.confirmedSub=this.pubsub.subscribe("orderDocuments.confirmed."+e,this.onDocumentConfirmed.bind(this)))},onDocumentConfirmed:function(e){this.model.handleConfirmation(e)},onCompRelOrderUpdated:function(e){[this.model.get("localOrder"),this.model.get("remoteOrder")].forEach(function(i){i.no===e.orderNo&&(i.compRels=e.compRels)});var i=this.model.getCurrentOrderInfo();i.orderNo!==e.orderNo||"BOM"!==i.documentNc15&&i.documentNc15!==o(this.nlsDomain,"compRel")||this.previewView.loadDocument()}})});