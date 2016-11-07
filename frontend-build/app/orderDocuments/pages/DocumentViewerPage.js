// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/user","app/core/View","../views/DocumentViewerControlsView","../views/DocumentViewerPreviewView","app/orderDocuments/templates/page"],function(e,t,i,o,n,s,d){"use strict";var r=6,c=window.navigator.userAgent.match(/(Chrome)\/([0-9]+)/)||["Unknown/0","Unknown",0];return o.extend({template:d,layoutName:"blank",localTopics:{"socket.connected":"onConnectionStatusChange","socket.disconnected":"onConnectionStatusChange"},remoteTopics:{"orderDocuments.remoteChecked.*":"onRemoteDocumentChecked","orderDocuments.eto.synced":"onEtoSynced"},initialize:function(){this.loadedFilesCount=0,this.$els={controls:null,viewer:null},this.controlsView=new n({model:this.model}),this.previewView=new s({model:this.model}),this.setView(".orderDocuments-page-controls",this.controlsView),this.setView(".orderDocuments-page-preview",this.previewView),t(window).on("resize."+this.idPrefix,e.debounce(this.resize.bind(this),1)),t(window).on("keydown."+this.idPrefix,this.onKeyDown.bind(this)),this.listenTo(this.model,"change:prodLine",this.joinProdLine),this.listenTo(this.model,"save",e.debounce(this.updateClientState.bind(this),1e3)),this.listenTo(this.controlsView,"documentReloadRequested",this.previewView.loadDocument.bind(this.previewView)),this.listenTo(this.controlsView,"documentWindowRequested",setTimeout.bind(window,this.previewView.openDocumentWindow.bind(this.previewView),1)),this.listenTo(this.previewView,"fileLoaded",this.onFileLoaded),this.socket.on("orderDocuments.remoteOrderUpdated",this.onRemoteOrderUpdated.bind(this))},destroy:function(){t("body").removeClass("no-overflow orderDocuments"),t(window).off("."+this.idPrefix)},load:function(e){return this.model.load(),e()},afterRender:function(){this.$els.controls=this.$id("controls"),this.$els.viewport=this.$id("viewport"),t("body").addClass("no-overflow orderDocuments"),this.toggleConnectionStatus(),this.resize(),this.checkInitialConfig()},resize:function(){this.controlsView.resize(null,window.innerHeight),this.previewView.resize(null,window.innerHeight)},toggleConnectionStatus:function(){this.$el.removeClass("is-connected is-disconnected").addClass(this.socket.isConnected()?"is-connected":"is-disconnected")},joinProdLine:function(){if(this.socket.isConnected()){var e=this.model,t=e.get("prodLine");t._id&&this.socket.emit("orderDocuments.join",{clientId:e.id,prodLineId:t._id,settings:e.getSettings(),orderInfo:e.getCurrentOrderInfo()})}},updateClientState:function(){this.socket.isConnected()&&this.socket.emit("orderDocuments.update",{clientId:this.model.id,settings:this.model.getSettings(),orderInfo:this.model.getCurrentOrderInfo()})},checkInitialConfig:function(){this.model.get("prodLine")._id||this.controlsView.openSettingsDialog()},onKeyDown:function(e){return e.ctrlKey&&70===e.keyCode?(this.controlsView.focusFilter(),!1):void(27===e.keyCode&&(this.controlsView.clearFilter(),this.controlsView.scrollIntoView()))},onConnectionStatusChange:function(){this.toggleConnectionStatus(),this.joinProdLine()},onRemoteOrderUpdated:function(e){null!==e.no&&(this.model.setRemoteOrder(e),this.model.save())},onRemoteDocumentChecked:function(e){if(null===this.model.get("localFile")){var t=this.model.getCurrentOrder();t.nc15===e.nc15&&this.previewView.loadDocument()}},onEtoSynced:function(e){var t=this.model.getCurrentOrder();return"ETO"===t.nc15&&t.nc12===e.nc12?void this.previewView.loadDocument():void this.model.checkEtoExistence(e.nc12)},onFileLoaded:function(){"Chrome"!==c[1]||c[2]>=49||(this.loadedFilesCount+=1,this.loadedFilesCount===r&&this.listenTo(this.model,"change:localFile change:localOrder change:remoteOrder",function(){var e=this.model.get("fileSource");return"remote"===e||"local"===e?setTimeout(window.location.reload.bind(window.location),10):void 0}))}})});