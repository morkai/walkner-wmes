define(["underscore","jquery","app/i18n","app/viewport","app/core/View","app/core/util/bindLoadingMessage","app/data/isaPalletKinds","../IsaRequest","../views/IsaShiftPersonnelView","../views/IsaLineStatesView","../views/IsaEventsView","../views/IsaResponderPickerView","app/isa/templates/page","app/isa/templates/messages/whmanNotFound","app/isa/templates/messages/noAction","app/isa/templates/messages/acceptFailure","app/isa/templates/messages/finishFailure","app/isa/templates/messages/acceptSuccess","app/isa/templates/messages/finishSuccess"],function(e,s,t,i,n,o,r,h,a,d,l,c,u,f,p,g,m,v,w){"use strict";var y={8:"Backspace",16:"Shift",18:"Alt",32:"Space",70:"KeyF",80:"KeyP",112:"F1"};return n.extend({template:u,layoutName:"page",pageId:"isa",title:[t.bound("isa","BREADCRUMBS:base")],actions:[],localTopics:{"socket.connected":function(){this.promised(this.warehousemen.fetch({reset:!0})),this.promised(this.requests.fetch({reset:!0})),this.promised(this.shiftPersonnel.fetch()),this.$el.removeClass("isa-is-disconnected")},"socket.disconnected":function(){this.$el.addClass("isa-is-disconnected")}},remoteTopics:{"isaShiftPersonnel.updated":function(e){this.shiftPersonnel.set(e)},"isaRequests.created.**":function(e){e=new h(h.parse(e)),this.pendingChanges?this.pendingChanges.push(e):this.applyChanges(e)},"isaRequests.updated.**":function(e){e=h.parse(e),this.pendingChanges?this.pendingChanges.push(e):this.applyChanges(e)},"isaEvents.saved":function(e){this.eventz.unshift(e),this.eventz.length>50&&this.eventz.pop()}},events:{"click #-shiftPersonnel":function(e){e.currentTarget.blur();var s=new a({model:this.shiftPersonnel});s.listenToOnce(this.shiftPersonnel,"sync",i.closeDialog.bind(i)),i.showDialog(s,t("isa","shiftPersonnel:title"))},"click #-responderFilter":function(){var e=this.$id("responderFilter").removeClass("isa-attract"),s=new c({model:this.model.shiftPersonnel,includeSelf:!0});this.listenToOnce(s,"picked",function(e){s.hide(),this.model.selectedResponder=e,localStorage.ISA_SELECTED_RESPONDER=JSON.stringify(e),this.$id("selectedResponder").text(e?e.label:""),this.requests.trigger("filter")}),s.show(e,this.model.selectedResponder?this.model.selectedResponder.id:null)},"click .isa-tab":function(e){var s=this.$(e.currentTarget);s.hasClass("active")||(this.$(".isa-tab.active").removeClass("active"),s.addClass("active"),this.el.dataset.tab=e.currentTarget.dataset.tab)},"click .is-collapsed":function(e){this.$(e.currentTarget).removeClass("is-collapsed is-collapsing"),localStorage.removeItem("ISA_EVENTS_COLLAPSED")},"click #-collapseEvents":"collapseEvents","click #-toggleFullscreen":"toggleFullscreen","click #-toggleHotkeys":"toggleHotkeysVisibility"},initialize:function(){this.onResize=e.debounce(this.resize.bind(this),30),this.onActivity=e.debounce(this.handleInactivity.bind(this),3e4),this.pendingChanges=[],this.keys={AltLeft:!1,AltRight:!1,ShiftLeft:!1,ShiftRight:!1},this.personnelIdBuffer="",this.timers.updateTime=setInterval(this.updateTimes.bind(this),15e3),this.defineModels(),this.defineViews(),this.defineBindings(),this.setView("#"+this.idPrefix+"-requests",this.requestsView),this.setView("#"+this.idPrefix+"-responses",this.responsesView),this.setView("#"+this.idPrefix+"-events",this.eventsView)},destroy:function(){document.body.style.overflow="",document.body.classList.remove("isa-is-fullscreen"),s(window).off("."+this.idPrefix)},defineModels:function(){this.warehousemen=o(this.model.warehousemen,this),this.shiftPersonnel=o(this.model.shiftPersonnel,this),this.requests=o(this.model.requests,this),this.eventz=o(this.model.events,this),this.listenTo(this.requests,"change:status",function(e){var s=e.previous("status"),t=e.get("status");"new"===s&&"accepted"===t&&window.innerWidth>800&&e.matchResponder(this.model.selectedResponder)&&this.moveRequest(e)})},defineViews:function(){this.requestsView=new d({mode:"requests",model:this.model}),this.responsesView=new d({mode:"responses",model:this.model}),this.eventsView=new l({collection:this.eventz})},defineBindings:function(){this.listenTo(this.requests,"request",function(e){e!==this.requests||this.pendingChanges||(this.pendingChanges=[])}),this.listenTo(this.requests,"error sync",this.applyPendingChanges),this.listenTo(this.requests,"add",this.requests.sort.bind(this.requests)),this.listenTo(this.shiftPersonnel,"change:users",this.attractToShiftPersonnel),this.listenTo(this.requestsView,"recount",this.recount.bind(this,"requests")),this.listenTo(this.responsesView,"recount",this.recount.bind(this,"responses")),s(window).on("resize."+this.idPrefix,this.onResize).on("mouseenter."+this.idPrefix,this.onActivity).on("keydown."+this.idPrefix,this.onKeyDown.bind(this)).on("keyup."+this.idPrefix,this.onKeyUp.bind(this))},load:function(e){return this.model.selectedResponder=null,e(this.warehousemen.fetch({reset:!0}),this.shiftPersonnel.fetch(),this.requests.fetch({reset:!0}),this.eventz.fetch({reset:!0}))},applyPendingChanges:function(){this.pendingChanges&&(this.pendingChanges.forEach(this.applyChanges,this),this.pendingChanges=null)},applyChanges:function(e){if(e instanceof h){var s=e,t=this.requests.get(s.id);t?s.get("updatedAt")>t.get("updatedAt")&&t.set(s.attributes):this.requests.add(s)}else{var i=this.requests.get(e._id);if(!i)return this.scheduleRequestReload();e.updatedAt>i.get("updatedAt")&&i.set(e)}},scheduleRequestReload:function(){clearTimeout(this.timers.reloadRequests),this.timers.reloadRequests=setTimeout(function(e){e.promised(e.requests.fetch({reset:!0}))},1,this)},serialize:function(){return{idPrefix:this.idPrefix,height:this.calcHeight(),disconnected:!this.socket.isConnected(),mobile:/iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent),selectedResponder:this.model.selectedResponder?this.model.selectedResponder.label:"",eventsCollapsed:!!localStorage.ISA_EVENTS_COLLAPSED,hotkeysVisible:!!localStorage.ISA_HOTKEYS_VISIBILITY}},afterRender:function(){document.body.style.overflow="hidden",this.resize(),this.model.shiftPersonnel.isEmpty()&&this.$id("shiftPersonnel").addClass("isa-attract"),this.model.selectedResponder&&this.$id("responderFilter").addClass("isa-attract")},attractToShiftPersonnel:function(){var e=this.$id("shiftPersonnel").removeClass("isa-attract");this.model.shiftPersonnel.isEmpty()&&e.addClass("isa-attract")},resize:function(){this.$el.height(this.calcHeight())},calcHeight:function(){var e=this.options.fullscreen||window.innerWidth<=800||window.outerWidth===window.screen.width&&window.outerHeight===window.screen.height,t=window.innerHeight-15;return document.body.classList.toggle("isa-is-fullscreen",e),e?(t-=15,localStorage.ISA_HOTKEYS_VISIBILITY&&(t-=this.$id("hotkeys").outerHeight())):t-=s(".hd").outerHeight(!0)+s(".ft").outerHeight(!0),t},updateTimes:function(){this.requests.forEach(function(e){e.updateTime(!0)}),this.requestsView.updateTimes(),this.responsesView.updateTimes()},moveRequest:function(e){var s=this;s.model.moving[e.id]=!0,s.requestsView.move(e,function(){s.responsesView.insert(e,function(){delete s.model.moving[e.id]})})},handleInactivity:function(){this.$(".isa-section-body").prop("scrollTop",0)},recount:function(e,s){this.$id("count-"+e).text(s||"")},getKeyCode:function(e){var s=e.code;if(!s)switch(s=y[e.keyCode]||e.keyIdentifier||"",e.location){case 1:s+="Left";break;case 2:s+="Right"}return s},onKeyDown:function(e){e=e.originalEvent;var s=this.getKeyCode(e),t=e.target.tagName;if("INPUT"!==t&&"TEXTAREA"!==t&&"SELECT"!==t){if("Backspace"===s)return!1;if("Space"===s)return this.hideMessage(),!1;if("F1"===s)return void e.preventDefault();"Escape"!==s&&"Enter"!==s||this.hideMessage()}if("boolean"==typeof this.keys[s])return this.keys[s]=!0,"AltRight"===s&&(this.keys.ShiftLeft=!1,this.$el.removeClass("isa-hotkey-ShiftLeft")),this.$el.addClass("isa-hotkey-"+s),!1},onKeyUp:function(e){e=e.originalEvent,this.onActivity();var s=this.getKeyCode(e);if("boolean"==typeof this.keys[s])return this.keys[s]=!1,this.$el.removeClass("isa-hotkey-"+s),!1;if("F1"!==s)if("KeyP"!==s)if("KeyF"!==s){var t=e.keyCode-48;if(!(t<0||t>9)){var i,n;if(this.keys.ShiftLeft?(i=this.requestsView,n="accept"):this.keys.AltLeft?(i=this.responsesView,n="finish"):this.keys.AltRight?(i=this.requestsView,n="cancel"):this.keys.ShiftRight&&(i=this.responsesView,n="cancel"),i&&0!==t)return i.actAt(n,t),!1;this.personnelIdBuffer+=t.toString(),this.schedulePersonnelIdCheck()}}else this.$id("responderFilter").click();else this.$id("shiftPersonnel").click();else this.toggleHotkeysVisibility()},schedulePersonnelIdCheck:function(){this.timers.personnelIdCheck&&clearTimeout(this.timers.personnelIdCheck),this.timers.personnelIdCheck=setTimeout(this.checkPersonnelId.bind(this),200)},checkPersonnelId:function(){var e=this.personnelIdBuffer;if(this.personnelIdBuffer="",!this.timers.hideMessage){var s=this.findWarehousemanByPersonnelId(e);if(!s){if(e.length<=3)return;return this.showMessage("error",5e3,f({personnelId:e}))}var t=this.findResponseByResponder(s);if(t)return this.finishResponse(t);var i=this.findRequest();if(i)return this.acceptRequest(i,s);this.showMessage("error",5e3,p({whman:s.getLabel()}))}},findWarehousemanByPersonnelId:function(e){var s=e.replace(/^0+/,"");return this.warehousemen.find(function(t){return t.get("personellId")===e||t.get("card")===s||t.get("cardUid")===s})},findResponseByResponder:function(e){return this.requests.find(function(s){return"accepted"===s.get("status")&&s.getWhman().id===e.id})},findRequest:function(){return this.requests.find(function(e){return"new"===e.get("status")})},acceptRequest:function(e,s){var t=this;this.requests.accept(e.id,{id:s.id,label:s.getLabel()},function(i){i?t.showMessage("error",5e3,g({error:i.message})):t.showMessage("info",1e4,v({whman:s.getLabel(),requestType:e.get("type"),orgUnit:e.get("orgUnit"),palletKind:e.getFullPalletKind()}))})},finishResponse:function(e){var s=this,t=e.get("type");this.requests.finish(e.id,function(i){i?s.showMessage("error",5e3,m({error:i.message})):s.showMessage("success",2500,w({type:t,line:e.getProdLineId()}))})},showMessage:function(e,s,t){this.timers.hideMessage&&clearTimeout(this.timers.hideMessage);var i=this.$id("messageOverlay"),n=this.$id("message");i.css("display","block"),n.html(t).css({display:"block",marginLeft:"-5000px"}).removeClass("message-error message-warning message-success message-info").addClass("message-"+e),n.css({display:"none",marginTop:n.outerHeight()/2*-1+"px",marginLeft:n.outerWidth()/2*-1+"px"}),n.fadeIn(),this.timers.hideMessage=setTimeout(this.hideMessage.bind(this),s)},hideMessage:function(){if(this.timers.hideMessage){clearTimeout(this.timers.hideMessage);var e=this,s=e.$id("messageOverlay"),t=e.$id("message");t.fadeOut(function(){s.css("display","none"),t.css("display","none"),e.timers.hideMessage=null})}},collapseEvents:function(){var e=this.$(".isa-section-events");e.addClass("is-collapsing"),e.css("width","25px"),this.timers.collapsed=setTimeout(function(){e.addClass("is-collapsed")},400),localStorage.ISA_EVENTS_COLLAPSED="1"},toggleFullscreen:function(){this.options.fullscreen=!this.options.fullscreen,this.broker.publish("router.navigate",{url:"#isa"+(this.options.fullscreen?"?fullscreen=1":""),replace:!0,trigger:!1}),this.resize()},toggleHotkeysVisibility:function(){localStorage.ISA_HOTKEYS_VISIBILITY?(localStorage.removeItem("ISA_HOTKEYS_VISIBILITY"),this.$id("hotkeys").addClass("hidden")):(localStorage.ISA_HOTKEYS_VISIBILITY="1",this.$id("hotkeys").removeClass("hidden")),this.resize()}})});