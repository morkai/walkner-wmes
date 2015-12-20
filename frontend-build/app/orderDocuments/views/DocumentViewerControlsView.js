// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","app/i18n","app/viewport","app/core/View","app/prodShiftOrders/ProdShiftOrderCollection","./LocalOrderPickerView","./DocumentViewerSettingsView","app/orderDocuments/templates/documentListItem","app/orderDocuments/templates/controls"],function(e,t,o,i,n,s,r,c,l,d){"use strict";return n.extend({template:d,events:{"click #-reloadDocument":function(){this.trigger("documentReloadRequested")},"click #-openDocumentWindow":function(){this.trigger("documentWindowRequested")},"click #-openLocalOrderDialog":function(){var e=this.$id("openLocalOrderDialog");e.hasClass("active")?(this.model.resetLocalOrder(),this.scrollIntoView()):this.openLocalOrderDialog(),e.blur()},"click #-openSettingsDialog":function(e){this.openSettingsDialog(),e.currentTarget.blur()},"click #-openLocalFileDialog":function(){var e=this.$id("openLocalFileDialog");e.hasClass("active")?(this.model.resetLocalFile(),this.scrollIntoView()):this.$id("localFile").click(),e.blur()},"change #-localFile":function(e){var t=e.target.files;t.length?this.model.setLocalFile(t[0].name,t[0]):this.model.resetLocalFile()},"click .orderDocuments-document":function(e){return this.selectDocument(e.currentTarget.dataset.nc15,!1),!1},"keydown .orderDocuments-document":function(e){return 27===e.keyCode?(e.currentTarget.blur(),!1):13===e.keyCode||32===e.keyCode?(this.selectDocument(e.currentTarget.dataset.nc15,!0),!1):40===e.keyCode?(this.focusNextDocument(e.currentTarget),!1):38===e.keyCode?(this.focusPrevDocument(e.currentTarget),!1):37===e.keyCode?(this.focusFirstDocument(),!1):39===e.keyCode?(this.focusLastDocument(),!1):void 0},"wheel .is-expanded":function(e){var o=this.$id("documents"),i=o.scrollTop(),n=e.originalEvent.deltaY>0;if((n||0!==i)&&!(n&&i+o.innerHeight()>=o[0].scrollHeight)){var s=t(e.currentTarget).outerHeight()*(n?1:-1);o.scrollTop(i+s);var r=this.$(".is-expanded"),c=r[s>0?"next":"prev"]();r.remove(),this.expandDocument(c)}},"submit #-filterForm":function(){return!1},"input #-filterPhrase":function(e){this.filter(e.currentTarget.value)}},localTopics:{"socket.connected":"updateButtons","socket.disconnected":"updateButtons"},initialize:function(){t(window).on("keypress."+this.idPrefix,this.onKeyPress.bind(this))},destroy:function(){t(window).off("."+this.idPrefix)},beforeRender:function(){this.stopListening(this.model)},afterRender:function(){this.listenTo(this.model,"change:prodLine",this.updateProdLine),this.listenTo(this.model,"change:localFile",this.onLocalFileChange),this.listenTo(this.model,"change:fileSource",this.onFileSourceChange),this.listenTo(this.model,"change:prefixFilterMode change:prefixFilter",e.debounce(this.updateDocuments.bind(this),1,!0)),this.listenTo(this.model,"change:localFile change:localOrder change:remoteOrder",e.debounce(this.onOrderChange.bind(this),1)),this.updateButtons(),this.updateProdLine(),this.updateCurrentOrderInfo(),this.updateDocuments(),this.$(".is-active")[0].scrollIntoView()},resize:function(e,t){null!==e&&(this.el.style.width=e+"px"),null!==t&&(this.el.style.height=t+"px")},expandDocument:function(e){var t=this.$(".is-expanded");if(t[0]!==e[0]){t.remove();var o=e.position(),i=e.clone().addClass("is-expanded").attr("tabindex","").css({position:"absolute",top:o.top+"px",left:o.left+"px"});i.on("mouseleave",function(){i.remove()}),i.insertAfter(e)}},selectDocument:function(e,t){this.model.selectDocument(e),t&&this.$id("documents").find('[data-nc15="'+e+'"]').focus()},focusNextDocument:function(e){var t=this.$(e).next();t.hasClass("is-expanded")&&(t=t.next()),t.length?t.focus():this.focusFirstDocument()},focusPrevDocument:function(e){var t=this.$(e).prev();t.hasClass("is-expanded")&&(t=t.prev()),t.length?t.focus():this.focusLastDocument()},focusFirstDocument:function(){this.$id("documents").children().first().focus()},focusLastDocument:function(){this.$id("documents").children().last().focus()},scrollIntoView:function(){var e=this.$(".is-active");e.length&&(e[0].scrollIntoView(!0),this.el.ownerDocument.body.scrollTop=0)},filter:function(e){this.$id("filterPhrase").val(e),e=e.trim().toLowerCase();var t=this.$(".orderDocuments-document");t.filter(".is-expanded").remove(),""===e?t.removeClass("hidden"):t.each(function(){this.classList.toggle("hidden",-1===this.textContent.toLowerCase().indexOf(e))}),this.updateDocumentShortcuts()},clearFilter:function(){var e=this.$id("filterPhrase");""!==e.val()&&(e.val(""),this.filter(""))},focusFilter:function(){this.$id("filterPhrase").select()},openLocalOrderDialog:function(){var e=new r({collection:new s(null,{rqlQuery:"select(orderId)&sort(-startedAt)&limit(10)&prodLine="+this.model.get("prodLine")._id}),model:this.model});this.listenToOnce(e,"localOrder",function(e){i.closeDialog(),e&&(this.model.setLocalOrder(e),this.model.save())}),i.showDialog(e,o("orderDocuments","localOrderPicker:title"))},openSettingsDialog:function(){var e=new c({model:this.model});this.listenToOnce(e,"settings",function(e){i.closeDialog(),e&&(this.model.set(e),this.model.save())}),i.showDialog(e,o("orderDocuments","settings:title"))},updateProdLine:function(){this.$id("prodLine").text(this.model.get("prodLine").name||"")},updateCurrentOrderInfo:function(){var e=this.$id("order"),t=this.model.getCurrentOrderInfo();e.find("[data-property]").each(function(){var e=t[this.dataset.property];this.style.display=e?"":"none",this.textContent=e})},updateDocuments:function(){var t=this.model,o=t.getCurrentOrder(),i=t.get("localFile"),n=this.$id("documents"),s="";n.find(".orderDocuments-document").off("mouseenter"),e.forEach(o.documents,function(e,o){t.filterNc15(o)&&(s+=l({name:e,nc15:o}))}),n.html(s).find(".orderDocuments-document").on("mouseenter",this.onDocumentMouseEnter.bind(this)),this.filter(this.$id("filterPhrase").val()),!i&&o.documents[o.nc15]&&n.find('.orderDocuments-document[data-nc15="'+o.nc15+'"]').addClass("is-active")},updateDocumentShortcuts:function(){this.$(".orderDocuments-document-shortcut").remove();for(var e=this.$(".orderDocuments-document"),t=1,o=0;9>=t;){var i=e.eq(o++);if(!i.length)break;i.hasClass("hidden")||(i.hasClass("is-expanded")&&--t,i.find(".orderDocuments-document-name").prepend('<span class="orderDocuments-document-shortcut">'+t+". </span>"),++t)}},updateButtons:function(){var e=!this.socket.isConnected(),t=null!==this.model.get("localFile"),o=null!==this.model.get("localOrder").no,i=this.$id("openLocalOrderDialog");i.toggleClass("active",o),o||i.prop("disabled",e),this.$id("openSettingsDialog").prop("disabled",e),this.$id("openLocalFileDialog").toggleClass("active",t),this.$id("reloadDocument").prop("disabled",t),this.toggleOpenDocumentWindowButton()},toggleOpenDocumentWindowButton:function(){this.$id("openDocumentWindow").prop("disabled",null===this.model.get("fileSource"))},onOrderChange:function(){this.updateButtons(),this.updateCurrentOrderInfo(),this.updateDocuments()},onLocalFileChange:function(){null===this.model.get("localFile")&&this.$id("localFile").val("")},onFileSourceChange:function(){this.$el.removeClass("fileSource-search fileSource-remote fileSource-local");var e=this.model.get("fileSource");e&&this.$el.addClass("fileSource-"+e),this.toggleOpenDocumentWindowButton()},onDocumentMouseEnter:function(e){this.expandDocument(this.$(e.currentTarget))},onKeyPress:function(e){var t=document.activeElement;if("INPUT"!==t.tagName&&"TEXTAREA"!==t.tagName&&"SELECT"!==t.tagName&&(e.charCode>=49||e.charCode<=57)){var o=e.charCode-49,i=this.$id("documents").find(".orderDocuments-document:visible"),n=i[o];n&&this.selectDocument(n.dataset.nc15,!0)}}})});