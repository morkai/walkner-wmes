define(["underscore","jquery","app/i18n","app/viewport","app/user","app/core/View","app/wmes-drilling/DrillingEventCollection","app/wmes-drilling/templates/orderDetails","app/wmes-drilling/templates/orderChanges","app/wmes-drilling/templates/orderChange","app/wmes-drilling/templates/queueOrder"],function(e,i,t,n,o,s,r,a,h,l,c){"use strict";var d=null,u=null;return s.extend({template:a,dialogClassName:"drilling-orderDetails-dialog",events:{"keydown .form-control":function(e){if("Enter"===e.key)return this.$(e.currentTarget).next().click(),!1},"focus [data-vkb]":function(e){this.vkb&&(clearTimeout(this.timers.hideVkb),this.vkb.show(e.currentTarget)&&(this.vkb.$el.css({top:"auto",bottom:"30px"}),this.resizeChanges()))},"blur [data-vkb]":"scheduleHideVkb","click .btn[data-action]":function(e){this.handleAction(e.currentTarget.dataset)},'click a[data-action="openDocument"]':function(e){var i=e.currentTarget;return"1"!==i.dataset.checking&&(i.textContent.trim()===d&&u&&!u.closed?(u.focus(),!1):"1"!==i.dataset.checked?(this.tryOpenDocument(i),!1):(this.openDocumentWindow(i),!1))}},initialize:function(){this.vkb=this.options.vkb,this.drillEvents=r.forOrder(this.model.id),this.listenTo(this.model,"change",this.reloadChanges.bind(this)),this.vkb&&this.listenTo(this.vkb,"keyFocused",this.onVkbFocused),i(window).on("resize."+this.idPrefix,this.onWindowResize.bind(this))},destroy:function(){i(window).off("."+this.idPrefix),this.vkb&&this.vkb.hide(),this.$changes&&(this.$changes.remove(),this.$changes=null)},closeDialog:function(){},getTemplateData:function(){return{order:this.model.serialize(),fillerHeight:this.calcFillerHeight(),renderQueueOrder:c,canAct:this.canAct()}},canAct:function(){var e=this.options.embedded,i=o.isAllowedTo("LOCAL"),t=!!this.orders.user,n=o.isAllowedTo("DRILLING:DRILLER"),s=o.isAllowedTo("DRILLING:MANAGE");return e&&i&&t||n||s},beforeRender:function(){this.$changes&&(this.$changes.remove(),this.$changes=null)},afterRender:function(){0===this.options.height&&(this.options.height=this.$("tbody")[0].clientHeight,this.$id("filler").css("height",this.calcFillerHeight()+"px")),this.renderChanges(),this.reloadChanges()},renderChanges:function(){var e=this,t=i(h({canAct:e.canAct()}));t.find(".drilling-orderChanges-comment").on("focus",function(){e.options.vkb&&(clearTimeout(e.timers.hideVkb),e.options.vkb.show(this),e.resizeChanges())}).on("blur",function(){e.options.vkb&&e.scheduleHideVkb()}),t.find(".btn-primary").on("click",function(){e.handleAction({action:"comment"})}),t.appendTo(this.$el.parent()),this.$changes=t,this.resizeChanges()},reloadChanges:function(){var e=this;e.promised(e.drillEvents.fetch({reset:!0})).done(function(){var i=e.drillEvents.map(function(e){return l({change:e.serialize()})});e.$changes.find(".drilling-orderChanges-changes").html(i).prop("scrollTop",99999)})},scheduleHideVkb:function(){clearTimeout(this.timers.hideVkb),this.timers.hideVkb=setTimeout(this.hideVkb.bind(this),250)},hideVkb:function(){clearTimeout(this.timers.hideVkb),this.vkb&&(this.vkb.hide(),this.resizeChanges())},resizeChanges:function(){this.$changes.css("height",this.calcChangesHeight()+"px").find(".drilling-orderChanges-changes").prop("scrollTop",99999)},calcFillerHeight:function(){return Math.max(window.innerHeight-60-25-75-this.options.height,0)},calcChangesHeight:function(){var e=this.vkb?this.vkb.$el.outerHeight():0;return e||(e=-30),Math.max(window.innerHeight-2-60-30-e,0)},handleAction:function(e){var i=this,t=e.action,o=i.$changes.find(".drilling-orderChanges-comment"),s=o.val().trim(),r={qtyDone:parseInt(i.$id("qtyDone").val(),10)};if("comment"!==t||s){var a=i.$(".btn").prop("disabled",!0);i.act(t,s,r).fail(function(){a.prop("disabled",!1)}).done(function(){"comment"===t?(o.val(""),a.prop("disabled",!1)):i.closeDialog()})}else n.closeDialog()},act:function(i,t,o){var s=this,r=e.assign({action:i,orderId:s.model.id,comment:t},o);return s.model.collection.act(r,function(e){if(e)return n.msg.show({type:"error",time:3e3,text:s.t("MSG:"+i+":failure")})})},tryOpenDocument:function(e){var i=this;n.msg.loading(),e.dataset.checking="1",i.ajax({method:"HEAD",url:e.href}).done(function(){i.openDocumentWindow(e)}).always(function(){e.parentElement.textContent=e.textContent,e.dataset.checking="0",e.dataset.checked="1",n.msg.loaded()})},openDocumentWindow:function(e){var i=this,t=!1,n=e.textContent.trim(),o=window.screen,s=o.availHeight;o.availWidth===window.innerWidth&&o.availHeight!==window.innerHeight&&(s*=.9);var r=.8*o.availWidth,a=.9*s,h=Math.floor((o.availWidth-r)/2),l="resizable,scrollbars,location=no,top="+Math.floor((s-a)/2)+",left="+h+",width="+Math.floor(r)+",height="+Math.floor(a),c="WMES_ORDER_DOCUMENT_PREVIEW",g=window.open(e.href,c,l);g&&(d=n,u=g,clearInterval(i.timers[c]),i.timers[c]=setInterval(function(){g.closed?(d=null,u=null,clearInterval(i.timers[c])):!t&&g.ready&&(t=!0,g.focus())},250))},onVkbFocused:function(){clearTimeout(this.timers.hideVkb)},onDialogShown:function(e){this.closeDialog=e.closeDialog.bind(e)},onWindowResize:function(){this.$id("filler").css("height",this.calcFillerHeight()+"px"),this.resizeChanges()}})});