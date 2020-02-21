define(["underscore","jquery","app/i18n","app/viewport","app/core/View","app/core/util/embedded","app/core/util/getShiftStartInfo","app/data/localStorage","app/production/snManager","./LocalOrderPickerView","./DocumentViewerSettingsView","app/orderDocuments/templates/documentListItem","app/orderDocuments/templates/controls","app/orderDocuments/templates/uiLock"],function(e,t,o,n,i,s,r,d,c,a,l,u,h,m){"use strict";return i.extend({template:h,events:{"click #-reloadDocument":function(e){this.control(e,function(){this.trigger("documentReloadRequested")})},"click #-openDocumentWindow":function(e){this.control(e,function(){this.trigger("documentWindowRequested")})},"click #-openLocalOrderDialog":function(e){this.control(e,function(){var e=this.$id("openLocalOrderDialog");e.hasClass("active")?(this.model.resetExternalDocument(),this.model.resetLocalOrder(),this.scrollIntoView()):this.openLocalOrderDialog(),e.blur()})},"click #-openSettingsDialog":function(e){this.control(e,function(){this.openSettingsDialog()})},"click #-openLocalFileDialog":function(e){this.control(e,function(){var e=this.$id("openLocalFileDialog");e.hasClass("active")?(this.model.resetLocalFile(),this.scrollIntoView()):this.$id("localFile").click(),e.blur()})},"click #-toggleAddImprovementButtons":function(){this.canUseControls()?(this.$id("addImprovementButtons").toggleClass("hidden"),this.$id("addImprovementButtons").hasClass("hidden")&&this.shrinkControls()):this.enlargeControls()},"click #-openAddNearMissWindow":function(e){this.control(e,function(){this.openAddNearMissWindow(),this.$id("addImprovementButtons").addClass("hidden")})},"click #-openAddSuggestionWindow":function(e){this.control(e,function(){this.openAddSuggestionWindow(),this.$id("addImprovementButtons").addClass("hidden")})},"click #-openAddObservationWindow":function(e){this.control(e,function(){this.openAddObservationWindow(),this.$id("addImprovementButtons").addClass("hidden")})},"change #-localFile":function(e){var t=e.target.files;t.length?this.model.setLocalFile(t[0].name,t[0]):this.model.resetLocalFile()},"click .orderDocuments-document-remove":function(e){return this.model.removeDocument(this.$(e.currentTarget).closest(".orderDocuments-document")[0].dataset.nc15),!1},"click .orderDocuments-document":function(e){var t,o=e.currentTarget;return o.classList.contains("is-search")&&(t=o.querySelector(".orderDocuments-document-name").textContent.trim(),this.clearFilter()),this.selectDocument(o.dataset.nc15,!1,t),!1},"keydown .orderDocuments-document":function(e){if(!s.isEnabled()){var t=e.keyCode,o=e.currentTarget,n=this;return 27===t?(o.blur(),!1):13===t||32===t?(n.$(o).click(),setTimeout(function(){n.focusDocument(o.dataset.nc15)},1),!1):40===t?(n.focusNextDocument(o),!1):38===t?(n.focusPrevDocument(o),!1):37===t?(n.focusFirstDocument(),!1):39===t?(n.focusLastDocument(),!1):void 0}},"wheel .is-expanded":function(e){var o=this.$id("documents"),n=o.scrollTop(),i=e.originalEvent.deltaY>0;if((i||0!==n)&&!(i&&n+o.innerHeight()>=o[0].scrollHeight)){var s=t(e.currentTarget).outerHeight()*(i?1:-1);o.scrollTop(n+s);var r=this.$(".is-expanded"),d=r[s>0?"next":"prev"]();r.remove(),this.expandDocument(d)}},"submit #-filterForm":function(){return this.$id("documents").find(".orderDocuments-document:not(.hidden)").first().click(),!1},"input #-filterPhrase":function(e){this.filter(e.currentTarget.value)},"focus #-filterPhrase":function(){this.timers.hideNumpad&&(clearTimeout(this.timers.hideNumpad),this.timers.hideNumpad=null),this.shrinkControls(),this.showNumpad()},"blur #-filterPhrase":function(){this.timers.hideNumpad=setTimeout(this.hideNumpad.bind(this),100)},"click #-prodLine":"toggleControls","click #-order":"toggleControls","click #-numpad > .btn":function(e){this.pressNumpadKey(e.currentTarget.dataset.key)},"click #-lockUi":function(e){this.control(e,this.lockUi)},"click #-confirm":"confirmDocument","click #-notes":"confirmNotes"},localTopics:{"socket.connected":"updateButtons","socket.disconnected":"updateButtons"},initialize:function(){t(window).on("keypress."+this.idPrefix,this.onKeyPress.bind(this))},destroy:function(){t(window).off("."+this.idPrefix)},getTemplateData:function(){return{touch:s.isEnabled()}},beforeRender:function(){this.stopListening(this.model)},afterRender:function(){this.listenTo(this.model,"change:prodLine",this.updateProdLine),this.listenTo(this.model,"change:localFile",this.onLocalFileChange),this.listenTo(this.model,"change:fileSource",this.onFileSourceChange),this.listenTo(this.model,"change:prefixFilterMode change:prefixFilter change:documents change:confirmations",e.debounce(this.updateDocuments.bind(this),1,!0)),this.listenTo(this.model,"change:localFile change:localOrder change:remoteOrder",e.debounce(this.onOrderChange.bind(this),1)),this.updateButtons(),this.updateProdLine(),this.updateCurrentOrderInfo(),this.updateDocuments();var t=this.$(".is-active");t.length&&t[0].scrollIntoView(),window.WMES_DOCS_LOCK_UI=this.lockUi.bind(this),"1"===d.getItem("WMES_DOCS_UI_LOCKED")&&this.lockUi(),s.render(this,{container:this.$id("embedded"),left:!0})},canUseControls:function(){return!this.$el.hasClass("is-touch")||this.$id("buttons").hasClass("is-enlarged")},enlargeControls:function(){this.$el.hasClass("is-touch")&&this.$id("buttons").addClass("is-enlarged")},shrinkControls:function(){this.$id("buttons").removeClass("is-enlarged"),this.$id("addImprovementButtons").addClass("hidden")},toggleControls:function(){this.$el.hasClass("is-touch")&&(this.$id("buttons").toggleClass("is-enlarged"),this.$id("addImprovementButtons").addClass("hidden"))},control:function(e,t){this.canUseControls()?(t.call(this,e),this.shrinkControls()):this.enlargeControls(),e.currentTarget.blur()},resize:function(e,t){null!==e&&(this.el.style.width=e+"px"),null!==t&&(this.el.style.height=t+"px")},expandDocument:function(e){var t=this.$(".is-expanded");if(t[0]!==e[0]&&(t.remove(),!e.hasClass("is-locked"))){var o=e.position(),n=e.clone().addClass("is-expanded").attr("tabindex","").css({position:"absolute",top:o.top+"px",left:o.left+"px"});n.on("mouseleave",function(){n.remove()}),n.insertAfter(e)}},selectDocument:function(e,t,o){this.shrinkControls(),(this.model.isConfirmableDocument(e)||"confirmed"===this.model.getOverallConfirmationStatus())&&(this.$id("confirm").find(".fa-spinner").length||(this.model.selectDocument(e,o),t&&this.focusDocument(e)))},focusDocument:function(e){var t=this.$id("documents").find('[data-nc15="'+e+'"]');t.length&&t.focus()[0].scrollIntoView()},focusNextDocument:function(e){var t=this.$(e).next();t.hasClass("is-expanded")&&(t=t.next()),t.length?t.focus():this.focusFirstDocument()},focusPrevDocument:function(e){var t=this.$(e).prev();t.hasClass("is-expanded")&&(t=t.prev()),t.length?t.focus():this.focusLastDocument()},focusFirstDocument:function(){this.$id("documents").children().first().focus()},focusLastDocument:function(){this.$id("documents").children().last().focus()},scrollIntoView:function(){var e=this.$(".is-active");e.length&&(e[0].scrollIntoView(!0),this.el.ownerDocument.body.scrollTop=0)},filter:function(e){this.$id("filterPhrase").val(e),e=e.trim().toLowerCase();var t=this.$(".orderDocuments-document");if(t.filter(".is-expanded").remove(),t.filter(".is-search").remove(),""===e)t.removeClass("hidden");else{var o=!1;t.each(function(){var t=-1===this.textContent.toLowerCase().indexOf(e);t||(o=!0),this.classList.toggle("hidden",t)}),o||this.search(e)}this.updateDocumentShortcuts()},search:function(e){var t=(e.match(/([0-9]{15})/)||[])[1];if(t){var o=this;o.ajax({type:"HEAD",url:"/orderDocuments/"+t+"?name=1"}).done(function(e,n,i){o.$id("documents").append(u({name:i.getResponseHeader("X-Document-Name")||"?",nc15:t,search:!0,external:!1,locked:"confirmed"!==o.model.getOverallConfirmationStatus()&&!o.model.isConfirmableDocument(t)})),o.$id("documents").find(".is-search").on("mouseenter",o.onDocumentMouseEnter.bind(o))})}},clearFilter:function(){var e=this.$id("filterPhrase");""!==e.val()&&(e.val(""),this.filter(""))},focusFilter:function(){this.$id("filterPhrase").select()},openLocalOrderDialog:function(){var e=new a({model:this.model});this.listenToOnce(e,"localOrder",function(e){n.closeDialog(),e&&(this.model.setLocalOrder(e),this.model.save())}),this.listenToOnce(e,"document",function(e){n.closeDialog(),e&&this.selectDocument(e.nc15,!0,e.name)}),n.showDialog(e,o("orderDocuments","localOrderPicker:title"))},openSettingsDialog:function(){var e=new l({model:this.model});this.listenToOnce(e,"settings",function(e){n.closeDialog(),e&&(this.model.set(e),this.model.save())}),n.showDialog(e,o("orderDocuments","settings:title"))},openAddNearMissWindow:function(){this.openAddImprovementWindow("/#kaizenOrders;add")},openAddSuggestionWindow:function(){this.openAddImprovementWindow("/#suggestions;add")},openAddObservationWindow:function(){this.openAddImprovementWindow("/#behaviorObsCards;add")},openAddImprovementWindow:function(e){e+="?standalone=1";var t=window.screen,i=t.availWidth>1350?1300:.7*t.availWidth,s=.8*t.availHeight,r=Math.floor((t.availWidth-i)/2),d="resizable,scrollbars,location=no,top="+Math.min(100,Math.floor((t.availHeight-s)/2))+",left="+r+",width="+Math.floor(i)+",height="+Math.floor(s);window.open(e,"WMES_IMPROVEMENTS",d)||n.msg.show({type:"error",time:3e3,text:o("orderDocuments","popup:improvement")})},updateProdLine:function(){this.$id("prodLine").text(this.model.get("prodLine").name||"")},updateCurrentOrderInfo:function(){var e=this.$id("order"),t=this.model.getCurrentOrderInfo();e.find("[data-property]").each(function(){var e=t[this.dataset.property];this.style.display=e?"":"none",this.textContent=e.replace(/\$__.*?__/g,"")})},updateDocuments:function(){var t=this.model,o=t.getCurrentOrder(),n="confirmed"===t.getOverallConfirmationStatus(),i=t.get("localFile"),s=this.$id("documents"),r="";s.find(".orderDocuments-document").off("mouseenter"),e.forEach(o.documents,function(e,o){t.filterNc15(o)&&!t.isIgnored(o)&&(r+=u({name:e.replace(/\$__.*?__/g,""),nc15:o,search:!1,external:-1!==e.indexOf("$__EXTERNAL__"),locked:!n&&!t.isConfirmableDocument(o)}))}),s.html(r).find(".orderDocuments-document").on("mouseenter",this.onDocumentMouseEnter.bind(this)),this.filter(this.$id("filterPhrase").val()),this.checkConfirmations(),!i&&o.documents[o.nc15]&&s.find('.orderDocuments-document[data-nc15="'+o.nc15+'"]').addClass("is-active")},updateDocumentShortcuts:function(){if(this.$(".orderDocuments-document-shortcut").remove(),!s.isEnabled())for(var e=this.$(".orderDocuments-document"),t=1,o=0;t<=9;){var n=e.eq(o++);if(!n.length)break;n.hasClass("hidden")||(n.hasClass("is-expanded")&&--t,n.find(".orderDocuments-document-name").prepend('<span class="orderDocuments-document-shortcut">'+t+". </span>"),++t)}},updateButtons:function(){var e=!this.socket.isConnected(),t=!!this.model.get("localFile"),o=!!this.model.get("localOrder").no||this.model.isExternalDocument(),n=this.$id("openLocalOrderDialog");n.toggleClass("active",o),o||n.prop("disabled",e),this.$id("openSettingsDialog").prop("disabled",e),this.$id("openLocalFileDialog").toggleClass("active",t),this.$id("reloadDocument").prop("disabled",t),this.toggleOpenDocumentWindowButton()},toggleOpenDocumentWindowButton:function(){this.$id("openDocumentWindow").prop("disabled",null===this.model.get("fileSource"))},pressNumpadKey:function(e){var t=this.$id("filterPhrase")[0],o=t.value,n=t.selectionStart,i=t.selectionEnd;"CLEAR"===e?(n=0,o=""):"BACKSPACE"===e?(n-=1,o=o.substring(0,n)+o.substring(i)):"LEFT"===e?n-=1:"RIGHT"===e?n+=1:(-1===t.maxLength||o.length<t.maxLength)&&(o=o.substring(0,n)+e+o.substring(i),n+=1),this.filter(o),t.value=o,"CLEAR"===e?this.hideNumpad():(t.focus(),t.setSelectionRange(n,n))},showNumpad:function(){this.$(".orderDocuments-controls-numpad").removeClass("hidden")},hideNumpad:function(){this.$(".orderDocuments-controls-numpad").addClass("hidden")},lockUi:function(){var e=this.$id("uiLock");e.length||((e=t(m({idPrefix:this.idPrefix}))).find("div").on("click",function(){d.removeItem("WMES_DOCS_UI_LOCKED"),e.remove()}),e.on("touchstart",function(e){if(!t(e.target).closest(".orderDocuments-uiLock-inner").length)return!1}),e.appendTo("body"),d.setItem("WMES_DOCS_UI_LOCKED","1"))},onOrderChange:function(){this.updateButtons(),this.updateCurrentOrderInfo(),this.updateDocuments()},onLocalFileChange:function(){null===this.model.get("localFile")&&this.$id("localFile").val("")},onFileSourceChange:function(){this.$el.removeClass("fileSource-search fileSource-remote fileSource-local");var e=this.model.get("fileSource");e&&this.$el.addClass("fileSource-"+e),this.toggleOpenDocumentWindowButton()},onDocumentMouseEnter:function(e){this.expandDocument(this.$(e.currentTarget))},onKeyPress:function(e){if(!s.isEnabled()){var t=document.activeElement;if("INPUT"!==t.tagName&&"TEXTAREA"!==t.tagName&&"SELECT"!==t.tagName&&!this.model.isBomActive()&&(e.charCode>=49||e.charCode<=57)){var o=e.charCode-49,n=this.$id("documents").find(".orderDocuments-document:visible")[o];n&&this.selectDocument(n.dataset.nc15,!0)}}},checkConfirmations:function(){this.updateConfirmButton();var e=this.model.getOverallConfirmationStatus();if("confirmed"!==e){var t=this.model.getCurrentOrder(),o=t.nc15;this.model.isConfirmableDocument(t.nc15)?"unknown"===e&&this.fetchConfirmations(o):this.selectDocument(this.model.getFirstUnconfirmedDocument(),!0)}},fetchConfirmations:function(t){var o=this;clearTimeout(o.timers.fetchConfirmations);var n=o.model.getCurrentOrder(),i=o.ajax({url:"/orders/"+n.no+"/documents",data:{line:o.model.get("prodLine")._id,station:o.model.get("station")}});i.fail(function(){o.timers.fetchConfirmations=setTimeout(o.fetchConfirmations.bind(o,t),5e3)}),i.done(function(n){var i=o.model.get("station"),s={};e.forEach(n.confirmations,function(e,t){var o=e[i];s[t]=void 0===o?"unknown":o}),o.model.setDocumentConfirmations(n.no,s),"confirmed"===o.model.getOverallConfirmationStatus()&&(t&&!o.model.isConfirmableDocument(t)||(t="ORDER"),o.selectDocument(t,!0))})},confirmDocument:function(){var e=this,t=e.$id("confirm"),o=t.find(".fa");if(!o.hasClass("fa-spinner")){o.removeClass("fa-thumbs-up").addClass("fa-spinner fa-spin");var n=e.model.getCurrentOrder(),i={clientId:e.model.id,line:e.model.get("prodLine")._id,station:e.model.get("station"),orderNo:n.no,nc15:n.nc15,name:n.documents[n.nc15]};e.socket.emit("orderDocuments.confirm",i,function(o,n){if(o)return t.removeClass("btn-success").addClass("btn-danger").find(".fa-spinner").removeClass("fa-spin"),e.timers.updateConfirmButton=setTimeout(e.updateConfirmButton.bind(e),3e3),void(o.errors&&o.errors.station&&e.handleNoStationError());e.model.handleConfirmation(n),e.updateConfirmButton(),e.selectDocument(e.model.getFirstUnconfirmedDocument()||"ORDER",!0)})}},handleNoStationError:function(){this.broker.subscribe("viewport.dialog.shown").setLimit(1).on("message",function(){c.showMessage({_id:""},"error",o.bind(o,"orderDocuments","controls:confirm:noStation"),3e3),n.currentDialog.$id("submit").click()}),this.openSettingsDialog()},updateConfirmButton:function(){var e=this.model.isConfirmedDocumentSelected(),t=this.model.isConfirmableDocumentSelected();this.$id("confirm").removeClass("btn-danger").addClass("btn-success").toggleClass("hidden",e||!t).find(".fa-spinner").removeClass("fa-spinner fa-spin").addClass("fa-thumbs-up")},checkNotes:function(){if("confirmed"===this.model.getOverallConfirmationStatus()){var e=this.model.getCurrentOrder();if(e.no&&Array.isArray(e.notes)&&e.notes.length){var t=JSON.parse(d.getItem("WMES_DOCS_NOTES")||"null")||{order:"",shift:0},o=r(Date.now()).startTime;t.order===e.no&&t.shift===o||this.showNotes()}}},showNotes:function(){this.hideNotes();var t=this.$id("notes"),o="<ul>";this.model.getCurrentOrder().notes.forEach(function(t){o+="<li>► "+e.escape(t)}),o+="</ul>",t.find(".orderDocuments-notes-bd").html(o),t.removeClass("hidden");var n=t.find(".orderDocuments-notes-content");n.css({marginTop:n.outerHeight()/2*-1+"px",marginLeft:n.outerWidth()/2*-1+"px"})},hideNotes:function(){this.$id("notes").addClass("hidden")},confirmNotes:function(){d.setItem("WMES_DOCS_NOTES",JSON.stringify({order:this.model.getCurrentOrder().no,shift:r(Date.now()).startTime})),this.hideNotes()}})});