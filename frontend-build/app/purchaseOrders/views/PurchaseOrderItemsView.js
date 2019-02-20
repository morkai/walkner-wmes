define(["underscore","jquery","app/i18n","app/user","app/viewport","app/core/Model","app/core/View","../qzPrint","../labelConfigurations","./PurchaseOrderPrintDialogView","./PurchaseOrderVendorPrintDialogView","app/purchaseOrders/templates/items","app/purchaseOrders/templates/printsPopover"],function(t,e,i,s,n,r,o,l,a,d,h,p,c){"use strict";return o.extend({template:p,events:{"mouseover .pos-items-item":"highlightItemScheduleRows","mouseout .pos-items-item":"highlightItemScheduleRows","mouseover .pos-items-item-schedule":"highlightItemRow","mouseout .pos-items-item-schedule":"highlightItemRow","click .popover":function(t){return t.target.classList.contains("popover-title")},"change [name=status]":function(){this.state.set("status",this.$("[name=status]:checked").val())},"click .is-clickable":function(t){return this.showItemPrints(t.currentTarget.parentNode.dataset.itemId),!1},"click .is-selectable":function(e){if(!this.state.get("printing")){var i=this.state.get("selected"),s=e.currentTarget.dataset.itemId;-1===i.indexOf(s)?this.state.set("selected",[s].concat(i)):this.state.set("selected",t.without(i,s))}},"click #-selectAll":function(){var t=this.$(".pos-items-item:visible").map(function(){return this.dataset.itemId}).get();this.state.set("selected",t)},"click #-selectNone":function(){this.state.set("selected",[])},"click #-print":"showPrintDialog","click #-printVendor":"showVendorPrintDialog","click .action-showPrintPdf":function(t){window.open(t.currentTarget.getAttribute("href"))},"click .action-toggleCancelled":function(t){this.toggleCancelledPrint(this.$(t.currentTarget).closest("tr").attr("data-print-id"))}},initialize:function(){this.onBodyClick=this.onBodyClick.bind(this),this.deferRender=t.debounce(this.render.bind(this),1),this.state=new r({printing:!1,status:null,selected:[]}),this.print=new r({orderId:null,shippingNo:"",printer:"browser",paper:localStorage.getItem("POS:PAPER")||"a4",barcode:localStorage.getItem("POS:BARCODE")||"code128",items:[]}),this.printers=[],this.printWindow=null,this.$msg=null,this.$popover=null,this.lastPopoverId=null,this.listenTo(this.state,"change:printing",this.togglePrintingStatus),this.listenTo(this.state,"change:selected",this.toggleItemSelection),this.listenTo(this.state,"change:status",this.toggleItemVisibility),e("body").on("click",this.onBodyClick)},destroy:function(){e("body").off("click",this.onBodyClick),this.hideMessage(),this.hidePopover(!0),this.state=null,this.print=null,this.printWindow=null},serialize:function(){var t=this.model,e=0,i=0,n=0,r=t.get("items").map(function(t){return t.get("completed")?++n:(++e,t.get("printedQty")<t.get("qty")&&++i),t.serialize()});return{idPrefix:this.idPrefix,toolbarVisible:t.get("open")&&s.isAllowedTo("PURCHASE_ORDERS:MANAGE"),open:t.get("open"),items:r,itemToPrints:this.model.prints.byItem,waitingCount:e.toLocaleString(),inProgressCount:i.toLocaleString(),completedCount:n.toLocaleString(),vendorNc12Visible:!0===t.get("anyVendorNc12")}},beforeRender:function(){this.stopListening(this.model,"change:open",this.deferRender),this.stopListening(this.model.get("items"),"change",this.deferRender),null!==this.$popover&&(this.lastPopoverId=this.$popover.data("itemId"),this.lastPopoverScrollTop=this.$(".popover-content").prop("scrollTop"),this.hidePopover(!0))},afterRender:function(){this.listenToOnce(this.model,"change:open",this.deferRender),this.listenToOnce(this.model.get("items"),"change",this.deferRender),this.model.get("open")&&(this.fixLastItemRow(),this.fixToolbarState(),this.togglePrintingStatus(),this.toggleItemVisibility(),this.toggleItemSelection()),null!==this.lastPopoverId&&(this.$('.pos-items-item[data-item-id="'+this.lastPopoverId+'"]').find(".is-clickable").click(),this.$(".popover-content").prop("scrollTop",this.lastPopoverScrollTop),this.lastPopoverId=null,this.lastPopoverScrollTop=0)},hideMessage:function(){null!==this.$msg&&(n.msg.hide(this.$msg),this.$msg=null)},hidePopover:function(t){null!==this.$popover&&(this.$popover.popover(t?"destroy":"hide"),this.$popover=null)},fixLastItemRow:function(){var t=this.model.get("items").last();t.completed||1!==t.get("schedule").length&&this.$(".pos-items-item").last().addClass("is-last")},fixToolbarState:function(){this.$(".btn-toolbar").find("input[value="+this.state.get("status")+"]").attr("checked",!0).parent().addClass("active")},toggleItemVisibility:function(){if(!this.model.get("open"))return this.$(".hidden").removeClass("hidden");var t=this.state.get("status"),e=this.$("input[name=status]");null===t&&(t="waiting",e.filter("[value="+t+"]").attr("checked",!0).parent().addClass("active"),this.state.set("status",t,{silent:!0}));var i=this;e.each(function(){this.value!==t&&i.$(".is-"+this.value).addClass("hidden")}),i.$(".is-"+t).removeClass("hidden"),this.state.set("selected",[]);var s=this.state.get("printing"),n="completed"===t;this.$id("selectAll").prop("disabled",s||n),this.$id("selectNone").prop("disabled",s||n)},toggleItemSelection:function(){this.$(".is-selected").removeClass("is-selected");var t=this.state.get("selected"),e=this.state.get("printing");this.$id("print").prop("disabled",e||!t.length),this.$id("printVendor").prop("disabled",e||!t.length),t.length&&this.$(".is-selectable > .pos-rowSeparator").each(function(){if(-1!==t.indexOf(this.parentNode.dataset.itemId)){this.classList.add("is-selected");for(var e=this.parentNode;e.nextElementSibling&&((e=e.nextElementSibling).classList.contains("pos-items-item")||e.classList.contains("pos-items-item-schedule"));)e.classList.add("is-selected")}})},togglePrintingStatus:function(){var t=this.state.get("printing");this.$id("statuses").find(".btn").toggleClass("disabled",t),this.$id("selectAll").prop("disabled",t),this.$id("selectNone").prop("disabled",t),this.$id("print").prop("disabled",!0),this.$el.toggleClass("is-printing",t),t||this.state.set("selected",[])},highlightItemScheduleRows:function(t){this.$(".is-hovered").removeClass("is-hovered");var e=t.currentTarget,i=e.dataset.scheduleLength-1;if(0!==i&&"mouseout"!==t.type)for(var s=0;s<i;++s)(e=e.nextElementSibling).classList.add("is-hovered")},highlightItemRow:function(t){for(var e=t.currentTarget;null!==(e=e.previousElementSibling)&&(e.classList.toggle("is-hovered"),!e.classList.contains("pos-items-item")););for(e=t.currentTarget;null!==(e=e.nextElementSibling)&&!e.classList.contains("pos-items-item");)e.classList.toggle("is-hovered")},showPrintDialog:function(){this.$id("print").blur(),n.msg.loading();var s=this,r=this.model.get("items"),o=this.state.get("selected").map(function(t){var e=r.get(t),i=e.get("schedule");return{_id:+e.id,nc12:e.get("nc12"),packageQty:0,componentQty:0,remainingQty:i.length?i[0].qty:0}}).sort(function(t,e){return t._id-e._id}),a=e.Deferred(),h=e.Deferred();e.when(a,h).done(function(){var t=new d({model:s.print,printers:s.printers});s.listenToOnce(t,"print",s.onPrintRequest.bind(s)),n.msg.loaded(),n.showDialog(t,i("purchaseOrders","printDialog:title"))}),l.findPrinters(function(t,e){s.printers=e||[],a.resolve()}),this.ajax({type:"GET",url:"/purchaseOrders;getLatestComponentQty",data:{nc12:t.unique(t.pluck(o,"nc12"))}}).always(function(t,e){var i="success"===e?t:{};o.forEach(function(t){var e=i[t.nc12];!e||t.remainingQty<e||(t.packageQty=Math.floor(t.remainingQty/e),t.componentQty=e,t.remainingQty%=e)}),s.print.set({orderId:s.model.id,items:o}),h.resolve()})},showVendorPrintDialog:function(){this.$id("printVendor").blur(),n.msg.loading();var t=this,e=this.model.get("items"),s=this.state.get("selected").map(function(t){var i=e.get(t),s=i.get("schedule"),n=i.get("vendorNc12");return{_id:+i.id,nc12:i.get("nc12"),value:n?n.value:"",unit:n?n.unit:"",labelCount:s.length?s[0].qty:0}}).sort(function(t,e){return t._id-e._id});l.findPrinters(function(e,r){var o=new h({model:s,printers:(r||[]).filter(function(t){return-1!==t.indexOf("ZPL203")})});t.listenToOnce(o,"print",t.onVendorPrintRequest.bind(t)),n.msg.loaded(),n.showDialog(o,i("purchaseOrders","vendorPrintDialog:title"))})},onPrintRequest:function(t){this.state.set("printing",!0),this.broker.subscribe("viewport.dialog.hidden",this.doPrint.bind(this,t)).setLimit(1),n.closeDialog()},onVendorPrintRequest:function(t){this.state.set("printing",!0),this.broker.subscribe("viewport.dialog.hidden",this.doVendorPrint.bind(this,t)).setLimit(1),n.closeDialog()},doPrint:function(t){"104x42"===this.print.get("paper")&&/zpl.*203/i.test(this.print.get("printer"))?this.printZebra203Dpi104x42(t):"browser"!==this.print.get("printer")?this.printPdfDirectly():this.printPdfIndirectly()},doVendorPrint:function(t){t.items.length&&t.printer&&"cordLength"===t.labelType&&this.printZebra203DpiCordLengthLabels(t.printer,t.items)},printZebra203DpiCordLengthLabels:function(t,e){for(var s=[],r=0;r<e.length;++r)this.buildZebra203DpiCordLengthLabel(s,e[r]);var o=this;l.printRaw(t,s.join(""),function(t){t&&(console.error(t),n.msg.show({type:"error",time:6e3,text:i("purchaseOrders","qzPrint:msg:rawPrintError")})),o.state&&o.state.set("printing",!1)})},printZebra203Dpi104x42:function(t){for(var e=[],s=0,r=t.length;s<r;++s){var o=t[s];o.packageQty>0&&this.buildZpl203Dpi104x42(e,o,o.packageQty,o.componentQty),o.remainingQty>0&&this.buildZpl203Dpi104x42(e,o,1,o.remainingQty)}var a=this;l.printRaw(this.print.get("printer"),e.join(""),function(t){t&&(console.error(t),n.msg.show({type:"error",time:6e3,text:i("purchaseOrders","qzPrint:msg:rawPrintError")})),a.state&&a.state.set("printing",!1)})},buildZebra203DpiCordLengthLabel:function(e,i){var s=i.value;t.isEmpty(i.unit)||(s+=" "+i.unit),e.push("^XA","^PW559","^LL0320","^LS0","^FT89,28^A0R,45,45^FH\\^FD"+i.nc12+"^FS","^FT39,42^A0R,39,38^FH\\^FD"+s+"^FS","^PQ"+i.labelCount,"^XZ")},buildZpl203Dpi104x42:function(t,e,i,s){s=s.toFixed(2).replace(/\.00$/,"");var n=+e.purchaseOrder,r=+e.item,o=e.nc12,l=e.vendor,a=e.shippingNo,d="O"+n+"P"+o+"Q"+s+"L"+r+"S";if(d.length+a.length>64)d+=a.substr(-1*(64-d.length));else{for(var h=64-d.length-a.length,p=0;p<h;++p)d+="0";d+=a}t.push("^XA","^PW831","^LL0336","^LS0","^BY1,3,160^FT785,156^BCI,,N","^FD>:"+d+"^FS","^FT622,51^AAI,27,15^FH$^FDSHIPPING NO^FS","^FT622,24^AAI,27,15^FH$^FD"+(a||"-")+"^FS","^FT241,53^AAI,27,15^FH$^FDVENDOR NO^FS","^FT241,26^AAI,27,15^FH$^FD"+l+"^FS","^FT240,115^AAI,27,15^FH$^FDQUANTITY^FS","^FT240,88^AAI,27,15^FH$^FD"+s+"^FS","^FT622,114^AAI,27,15^FH$^FDPRODUCT 12NC^FS","^FT622,87^AAI,27,15^FH$^FD"+(o||"-")+"^FS","^FT785,114^AAI,27,15^FH$^FDORDER NO^FS","^FT785,87^AAI,27,15^FH$^FD"+n+"^FS","^FT785,51^AAI,27,15^FH$^FDITEM NO^FS","^FT785,24^AAI,27,15^FH$^FD"+r+"^FS","^PQ"+i,"^XZ")},printPdfDirectly:function(){var t=this,e=window.location.origin+"/purchaseOrders/"+this.model.id+"/prints/"+this.print.id+".pdf",s=a.getPaperOptions(this.print.get("paper"));l.printPdf(this.print.get("printer"),e,s,function(e){e&&(console.error(e),n.msg.show({type:"error",time:6e3,text:i("purchaseOrders","qzPrint:msg:pdfPrintError")})),t.state&&t.state.set("printing",!1)})},printPdfIndirectly:function(){var t="/purchaseOrders/"+this.model.id+"/prints/"+this.print.id+".pdf+html",e=window.screen,s=.6*e.availWidth,r=.8*e.availHeight,o=Math.floor((e.availWidth-s)/2),l="resizable,scrollbars,location=no,top="+Math.floor((e.availHeight-r)/2)+",left="+o+",width="+Math.floor(s)+",height="+Math.floor(r);if(this.printWindow=window.open(t,"WMES_PO_LABEL_PRINTING",l),this.printWindow){var a=this;this.printWindow.onbeforeunload=window.WMES_PO_PRINT_DONE=function(){a.printWindow.onbeforeunload=null,a.printWindow=null,delete window.WMES_PO_PRINT_DONE,a.state.set("printing",!1)}}else this.$msg=n.msg.show({type:"error",time:6e3,text:i("purchaseOrders","printDialog:msg:blocked")}),this.state.set("printing",!1)},showItemPrints:function(t){var e=null;null!==this.$popover&&(e=this.$popover.data("itemId"),this.hidePopover(!1)),t!==e&&(this.$popover=this.$('.pos-items-item[data-item-id="'+t+'"]').find(".pos-items-item-prints").data("itemId",t),this.$popover.popover({animation:null===this.lastPopoverId,trigger:"manual",html:!0,title:i("purchaseOrders","prints:title"),content:c({orderId:this.model.id,prints:this.model.prints.byItem[t].map(function(t){return t.serialize()})})}),this.$popover.popover("show"))},onBodyClick:function(t){var e=this.$(t.target);e.length&&e.closest(".popover").length||this.hidePopover(!1)},toggleCancelledPrint:function(t){var e=this.$('.pos-prints-print[data-print-id="'+t+'"]').find(".action-toggleCancelled");e.prop("disabled",!0);var i=this.model.prints.get(t);this.ajax({type:"POST",url:"/purchaseOrders/"+this.model.id+"/prints/"+t+";cancel",data:JSON.stringify({cancelled:!i.get("cancelled")})}).always(function(){e.prop("disabled",!1)})}})});