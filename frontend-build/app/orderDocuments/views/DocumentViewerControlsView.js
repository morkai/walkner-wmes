// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/viewport","app/core/View","app/prodShiftOrders/ProdShiftOrderCollection","./LocalOrderPickerView","./DocumentViewerSettingsView","app/orderDocuments/templates/documentListItem","app/orderDocuments/templates/controls"],function(t,e,o,i,n,s,r,c,d,l){"use strict";return n.extend({template:l,events:{"click #-reloadDocument":function(t){this.control(t,function(){this.trigger("documentReloadRequested")})},"click #-openDocumentWindow":function(t){this.control(t,function(){this.trigger("documentWindowRequested")})},"click #-openLocalOrderDialog":function(t){this.control(t,function(){var t=this.$id("openLocalOrderDialog");t.hasClass("active")?(this.model.resetLocalOrder(),this.scrollIntoView()):this.openLocalOrderDialog(),t.blur()})},"click #-openSettingsDialog":function(t){this.control(t,function(){this.openSettingsDialog()})},"click #-openLocalFileDialog":function(t){this.control(t,function(){var t=this.$id("openLocalFileDialog");t.hasClass("active")?(this.model.resetLocalFile(),this.scrollIntoView()):this.$id("localFile").click(),t.blur()})},"click #-toggleAddImprovementButtons":function(){this.canUseControls()?(this.$id("addImprovementButtons").toggleClass("hidden"),this.$id("addImprovementButtons").hasClass("hidden")&&this.shrinkControls()):this.enlargeControls()},"click #-openAddNearMissWindow":function(t){this.control(t,function(){this.openAddNearMissWindow(),this.$id("addImprovementButtons").addClass("hidden")})},"click #-openAddSuggestionWindow":function(t){this.control(t,function(){this.openAddSuggestionWindow(),this.$id("addImprovementButtons").addClass("hidden")})},"click #-switchApps":function(){window.parent.postMessage({type:"switch",app:"documents"},"*")},"mousedown #-reboot":function(t){this.startActionTimer("reboot",t)},"touchstart #-reboot":function(){this.startActionTimer("reboot")},"mouseup #-reboot":function(){this.stopActionTimer("reboot")},"touchend #-reboot":function(){this.stopActionTimer("reboot")},"mousedown #-shutdown":function(t){this.startActionTimer("shutdown",t)},"touchstart #-shutdown":function(){this.startActionTimer("shutdown")},"mouseup #-shutdown":function(){this.stopActionTimer("shutdown")},"touchend #-shutdown":function(){this.stopActionTimer("shutdown")},"change #-localFile":function(t){var e=t.target.files;e.length?this.model.setLocalFile(e[0].name,e[0]):this.model.resetLocalFile()},"click .orderDocuments-document":function(t){return this.selectDocument(t.currentTarget.dataset.nc15,!1),!1},"keydown .orderDocuments-document":function(t){return 27===t.keyCode?(t.currentTarget.blur(),!1):13===t.keyCode||32===t.keyCode?(this.selectDocument(t.currentTarget.dataset.nc15,!0),!1):40===t.keyCode?(this.focusNextDocument(t.currentTarget),!1):38===t.keyCode?(this.focusPrevDocument(t.currentTarget),!1):37===t.keyCode?(this.focusFirstDocument(),!1):39===t.keyCode?(this.focusLastDocument(),!1):void 0},"wheel .is-expanded":function(t){var o=this.$id("documents"),i=o.scrollTop(),n=t.originalEvent.deltaY>0;if((n||0!==i)&&!(n&&i+o.innerHeight()>=o[0].scrollHeight)){var s=e(t.currentTarget).outerHeight()*(n?1:-1);o.scrollTop(i+s);var r=this.$(".is-expanded"),c=r[s>0?"next":"prev"]();r.remove(),this.expandDocument(c)}},"submit #-filterForm":function(){return!1},"input #-filterPhrase":function(t){this.filter(t.currentTarget.value)},"focus #-filterPhrase":"shrinkControls","click #-prodLine":"toggleControls","click #-order":"toggleControls"},localTopics:{"socket.connected":"updateButtons","socket.disconnected":"updateButtons"},initialize:function(){this.actionTimer={action:null,time:null},e(window).on("keypress."+this.idPrefix,this.onKeyPress.bind(this))},destroy:function(){e(window).off("."+this.idPrefix)},serialize:function(){return{idPrefix:this.idPrefix,touch:-1!==window.location.search.indexOf("touch"),showBottomButtons:window.parent!==window}},beforeRender:function(){this.stopListening(this.model)},afterRender:function(){this.listenTo(this.model,"change:prodLine",this.updateProdLine),this.listenTo(this.model,"change:localFile",this.onLocalFileChange),this.listenTo(this.model,"change:fileSource",this.onFileSourceChange),this.listenTo(this.model,"change:prefixFilterMode change:prefixFilter change:documents",t.debounce(this.updateDocuments.bind(this),1,!0)),this.listenTo(this.model,"change:localFile change:localOrder change:remoteOrder",t.debounce(this.onOrderChange.bind(this),1)),this.updateButtons(),this.updateProdLine(),this.updateCurrentOrderInfo(),this.updateDocuments();var e=this.$(".is-active");e.length&&e[0].scrollIntoView()},startActionTimer:function(t,e){this.actionTimer.action=t,this.actionTimer.time=Date.now(),e&&e.preventDefault()},stopActionTimer:function(t){if(this.actionTimer.action===t){var e=Date.now()-this.actionTimer.time>3e3;"reboot"===t?e?window.parent.postMessage({type:"reboot"},"*"):window.location.reload():e&&"shutdown"===t&&window.parent.postMessage({type:"shutdown"},"*"),this.actionTimer.action=null,this.actionTimer.time=null}},canUseControls:function(){return!this.$el.hasClass("is-touch")||this.$id("buttons").hasClass("is-enlarged")},enlargeControls:function(){this.$el.hasClass("is-touch")&&this.$id("buttons").addClass("is-enlarged")},shrinkControls:function(){this.$id("buttons").removeClass("is-enlarged")},toggleControls:function(){this.$el.hasClass("is-touch")&&this.$id("buttons").toggleClass("is-enlarged")},control:function(t,e){this.canUseControls()?(e.call(this,t),this.shrinkControls()):this.enlargeControls(),t.currentTarget.blur()},resize:function(t,e){null!==t&&(this.el.style.width=t+"px"),null!==e&&(this.el.style.height=e+"px")},expandDocument:function(t){var e=this.$(".is-expanded");if(e[0]!==t[0]){e.remove();var o=t.position(),i=t.clone().addClass("is-expanded").attr("tabindex","").css({position:"absolute",top:o.top+"px",left:o.left+"px"});i.on("mouseleave",function(){i.remove()}),i.insertAfter(t)}},selectDocument:function(t,e){this.shrinkControls(),this.model.selectDocument(t),e&&this.$id("documents").find('[data-nc15="'+t+'"]').focus()},focusNextDocument:function(t){var e=this.$(t).next();e.hasClass("is-expanded")&&(e=e.next()),e.length?e.focus():this.focusFirstDocument()},focusPrevDocument:function(t){var e=this.$(t).prev();e.hasClass("is-expanded")&&(e=e.prev()),e.length?e.focus():this.focusLastDocument()},focusFirstDocument:function(){this.$id("documents").children().first().focus()},focusLastDocument:function(){this.$id("documents").children().last().focus()},scrollIntoView:function(){var t=this.$(".is-active");t.length&&(t[0].scrollIntoView(!0),this.el.ownerDocument.body.scrollTop=0)},filter:function(t){this.$id("filterPhrase").val(t),t=t.trim().toLowerCase();var e=this.$(".orderDocuments-document");e.filter(".is-expanded").remove(),""===t?e.removeClass("hidden"):e.each(function(){this.classList.toggle("hidden",-1===this.textContent.toLowerCase().indexOf(t))}),this.updateDocumentShortcuts()},clearFilter:function(){var t=this.$id("filterPhrase");""!==t.val()&&(t.val(""),this.filter(""))},focusFilter:function(){this.$id("filterPhrase").select()},openLocalOrderDialog:function(){var t=new r({collection:new s(null,{rqlQuery:"select(orderId)&sort(-startedAt)&limit(10)&prodLine="+this.model.get("prodLine")._id}),model:this.model});this.listenToOnce(t,"localOrder",function(t){i.closeDialog(),t&&(this.model.setLocalOrder(t),this.model.save())}),i.showDialog(t,o("orderDocuments","localOrderPicker:title"))},openSettingsDialog:function(){var t=new c({model:this.model});this.listenToOnce(t,"settings",function(t){i.closeDialog(),t&&(this.model.set(t),this.model.save())}),i.showDialog(t,o("orderDocuments","settings:title"))},openAddNearMissWindow:function(){this.openAddImprovementWindow("/#kaizenOrders;add")},openAddSuggestionWindow:function(){this.openAddImprovementWindow("/#suggestions;add")},openAddImprovementWindow:function(t){t+="?standalone=1";var e=window.screen,n=e.availWidth>1200?1200:.7*e.availWidth,s=.8*e.availHeight,r=Math.floor((e.availWidth-n)/2),c=Math.min(100,Math.floor((e.availHeight-s)/2)),d="resizable,scrollbars,location=no,top="+c+",left="+r+",width="+Math.floor(n)+",height="+Math.floor(s),l=window.open(t,"WMES_IMPROVEMENTS",d);l||i.msg.show({type:"error",time:3e3,text:o("orderDocuments","popup:improvement")})},updateProdLine:function(){this.$id("prodLine").text(this.model.get("prodLine").name||"")},updateCurrentOrderInfo:function(){var t=this.$id("order"),e=this.model.getCurrentOrderInfo();t.find("[data-property]").each(function(){var t=e[this.dataset.property];this.style.display=t?"":"none",this.textContent=t})},updateDocuments:function(){var e=this.model,o=e.getCurrentOrder(),i=e.get("localFile"),n=this.$id("documents"),s="";n.find(".orderDocuments-document").off("mouseenter"),t.forEach(o.documents,function(t,o){e.filterNc15(o)&&(s+=d({name:t,nc15:o}))}),n.html(s).find(".orderDocuments-document").on("mouseenter",this.onDocumentMouseEnter.bind(this)),this.filter(this.$id("filterPhrase").val()),!i&&o.documents[o.nc15]&&n.find('.orderDocuments-document[data-nc15="'+o.nc15+'"]').addClass("is-active")},updateDocumentShortcuts:function(){this.$(".orderDocuments-document-shortcut").remove();for(var t=this.$(".orderDocuments-document"),e=1,o=0;9>=e;){var i=t.eq(o++);if(!i.length)break;i.hasClass("hidden")||(i.hasClass("is-expanded")&&--e,i.find(".orderDocuments-document-name").prepend('<span class="orderDocuments-document-shortcut">'+e+". </span>"),++e)}},updateButtons:function(){var t=!this.socket.isConnected(),e=null!==this.model.get("localFile"),o=null!==this.model.get("localOrder").no,i=this.$id("openLocalOrderDialog");i.toggleClass("active",o),o||i.prop("disabled",t),this.$id("openSettingsDialog").prop("disabled",t),this.$id("openLocalFileDialog").toggleClass("active",e),this.$id("reloadDocument").prop("disabled",e),this.toggleOpenDocumentWindowButton()},toggleOpenDocumentWindowButton:function(){this.$id("openDocumentWindow").prop("disabled",null===this.model.get("fileSource"))},onOrderChange:function(){this.updateButtons(),this.updateCurrentOrderInfo(),this.updateDocuments()},onLocalFileChange:function(){null===this.model.get("localFile")&&this.$id("localFile").val("")},onFileSourceChange:function(){this.$el.removeClass("fileSource-search fileSource-remote fileSource-local");var t=this.model.get("fileSource");t&&this.$el.addClass("fileSource-"+t),this.toggleOpenDocumentWindowButton()},onDocumentMouseEnter:function(t){this.expandDocument(this.$(t.currentTarget))},onKeyPress:function(t){var e=document.activeElement;if("INPUT"!==e.tagName&&"TEXTAREA"!==e.tagName&&"SELECT"!==e.tagName&&(t.charCode>=49||t.charCode<=57)){var o=t.charCode-49,i=this.$id("documents").find(".orderDocuments-document:visible"),n=i[o];n&&this.selectDocument(n.dataset.nc15,!0)}}})});