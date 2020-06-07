define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/data/clipboard","app/planning/util/contextMenu","app/planning/PlanSapOrder","../WhOrder","app/core/templates/userInfo","app/wh/templates/pickup/set/set","app/wh/templates/pickup/set/setItem","app/wh/templates/pickup/set/setPickupPopover","app/wh/templates/pickup/set/cartsEditor","app/wh/templates/pickup/set/problemEditor","app/wh/templates/pickup/set/printLabels"],function(t,e,i,n,r,a,s,o,d,c,u,l,f,p,h,m,g,w){"use strict";var v={picklistDone:[{value:"success",icon:"fa-thumbs-o-up"},{value:"failure",icon:"fa-thumbs-o-down"},{value:"pending",manage:!0}],picklist:[{value:"require",icon:"fa-check"},{value:"ignore",icon:"fa-times"},{value:"pending",manage:!0}],pickup:[{value:"success",icon:"fa-thumbs-o-up"},{value:"failure",icon:"fa-thumbs-o-down"},{value:"pending",manage:!0}]},b={Tab:!0,ArrowUp:!0,ArrowDown:!0,ArrowLeft:!0,ArrowRight:!0,KeyW:!0,KeyS:!0,KeyA:!0,KeyD:!0};return s.extend({template:f,dialogClassName:"wh-set-dialog modal-no-keyboard",modelProperty:"whOrders",events:{"focus .fa[tabindex]":function(t){var e=this.$(t.target).closest(".wh-set-action"),i=e.closest(".wh-set-item");this.focused.whOrderId=i[0].dataset.id,this.focused.func=e[0].dataset.func,this.focused.prop=e[0].dataset.prop},"keydown [tabindex]":function(t){if(!this.$editor&&!d.isVisible(this)){var e=t.originalEvent.code;if(b[e]){var i=t.currentTarget;if("Tab"===e)return t.shiftKey&&i===this.el.querySelector(".fa[tabindex]")?(this.$("[tabindex]").last().focus(),!1):t.shiftKey||i!==this.$("[tabindex]").last()[0]?void 0:(this.el.querySelector(".fa[tabindex]").focus(),!1);switch(e){case"ArrowUp":case"KeyW":this.focusUp(i);break;case"ArrowDown":case"KeyS":this.focusDown(i);break;case"ArrowLeft":case"KeyA":this.focusPrev(i);break;case"ArrowRight":case"KeyD":this.focusNext(i)}}}},"keydown .is-clickable":function(t){var e=t.originalEvent.code;if("Enter"===e||"Space"===e)return clearTimeout(this.timers.showUpdateMenu),this.timers.showUpdateMenu=setTimeout(this.showUpdateMenuByEvent.bind(this,t),1),!1},"click .is-clickable":function(t){this.showUpdateMenuByEvent(t)},"contextmenu .wh-set-action":function(){return!1},"mousedown .wh-set-action":function(t){if(!t.currentTarget.classList.contains("is-clickable")){var e=this.whOrders.get(this.$(t.target).closest(".wh-set-item").attr("data-id")),i=t.currentTarget.dataset.func,n=t.currentTarget.dataset.prop;this.timers.showFixUpdateMenu=setTimeout(this.showFixUpdateMenu.bind(this,e,i,n,t),500)}},"mouseup .wh-set-action":function(){clearTimeout(this.timers.showFixUpdateMenu),this.timers.showFixUpdateMenu=null},click:function(){this.hideEditor(),this.focus()},'click .btn[data-action="printLabels"]':function(t){var i=this,n=e(w());return n.on("submit",function(){var t=n.data("whOrderId"),e=+n.find("input").val();i.$('.wh-set-item[data-id="'+t+'"] .btn[data-action="printLabels"]').prop("disabled",!0).find(".fa").removeClass("fa-print").addClass("fa-spinner fa-spin"),i.hideEditor();var r=i.whOrders.act("printLabels",{order:t,qty:e,funcId:i.model.user?i.model.user.func:"fmx"});return r.fail(function(){a.msg.show({type:"error",time:2500,text:i.t("printLabels:failure")})}),r.always(function(){i.$('.wh-set-item[data-id="'+t+'"] .btn[data-action="printLabels"]').prop("disabled",!1).find(".fa").removeClass("fa-spinner fa-spin").addClass("fa-print"),i.focus()}),!1}),i.showEditor(n,i.$(t.target).closest(".wh-set-actions")[0]),n.find("input").select(),!1}},localTopics:{"planning.contextMenu.hidden":"focus"},initialize:function(){var t=this;t.focused={whOrderId:null,func:null,prop:null},t.listenTo(t.plan.sapOrders,"reset",t.onOrdersReset),t.listenTo(t.whOrders,"reset",t.onOrdersReset),t.listenTo(t.whOrders,"change",t.onOrderChanged),e(window).on("keydown."+this.idPrefix,function(e){if("Escape"===e.key)return t.$editor?(t.hideEditor(),t.focus()):a.closeDialog(),!1})},destroy:function(){e(window).off("keydown."+this.idPrefix),this.$el.popover("destroy"),this.hideEditor()},getTemplateData:function(){return{renderItem:this.renderPartialHtml.bind(this,p),items:this.serializeItems()}},serializeItems:function(){return this.whOrders.serializeSet(this.model.set,this.plan,this.model.user)},beforeRender:function(){clearTimeout(this.timers.render)},afterRender:function(){var t=this;t.updateSummary(),t.$el.popover({selector:"[data-popover]",container:"body",trigger:"hover",placement:"bottom",html:!0,content:function(){var e=t.whOrders.get(t.$(this).closest(".wh-set-item")[0].dataset.id).getFunc(this.dataset.func);if(e.carts.length||e.problemArea||e.comment)return t.renderPartial(h,{func:e})},template:function(t){return e(t).addClass("wh-set-popover")}}),t.$el.on("show.bs.popover",function(){e(".wh-set-popover").remove()}),t.focus()},scheduleRender:function(){clearTimeout(this.timers.render),!this.plan.isAnythingLoading()&&this.isRendered()&&(this.timers.render=setTimeout(this.renderIfNotLoading.bind(this),1))},renderIfNotLoading:function(){this.plan.isAnythingLoading()||this.render()},updateSummary:function(){var e=this,i=0,r=0,a=0,s={};this.$(".wh-set-item").each(function(){var t=e.whOrders.get(this.dataset.id);if(t&&t.get("date")===e.model.date&&t.get("set")===e.model.set){if("problem"!==t.get("status")){var n=e.plan.orders.get(t.get("order"));i+=t.get("qty"),r+=n?n.get("quantityTodo"):0,a+=Date.parse(t.get("finishTime"))-Date.parse(t.get("startTime"))}t.get("funcs").forEach(function(t){void 0===s[t._id]&&(s[t._id]=""),t.user&&(s[t._id]=t.user.label)})}}),e.$id("qty").text(i.toLocaleString()+"/"+r.toLocaleString()),e.$id("time").text(n.toString(a/1e3,!0,!1)),t.forEach(s,function(t,i){var n=t.split(/\s+/),r=n[0];n.length>1&&(r+=" "+n[1].charAt(0)+(n[1].length>1?".":"")),e.$id(i).text(r).attr("title",t)})},focus:function(){if(!this.$editor&&!d.isVisible(this)){var t=this.focused,e=this.$('.wh-set-item[data-id="'+t.whOrderId+'"]'),i='td[data-prop="'+t.prop+'"]';t.func&&(i+='[data-func="'+t.func+'"]');var n=e.find(i),r=n.find(".fa[tabindex]");if(!r.length){if(!(n=this.$(".is-clickable").first()).length)return t.whOrderId=null,t.func=null,void(t.prop=null);e=n.closest(".wh-set-item"),r=n.find(".fa[tabindex]"),t.whOrderId=e[0].dataset.id,t.func=n[0].dataset.func,t.prop=n[0].dataset.prop}n.hasClass("is-clickable")&&r.focus()}},hideMenu:function(){d.hide(this)},showUpdateMenuByEvent:function(t){var e=this.whOrders.get(this.$(t.currentTarget).closest(".wh-set-item").attr("data-id")),i=t.currentTarget.dataset.func,n=t.currentTarget.dataset.prop;this.showUpdateMenu(e,i,n,t)},showUpdateMenu:function(t,e,i,n){var a=this,s=r.isAllowedTo("WH:MANAGE"),o=[],c=a.$('.wh-set-item[data-id="'+t.id+'"]'),u='.is-clickable[data-prop="'+i+'"]';e&&(u+='[data-func="'+e+'"]');var l=c.find(u);if(l.length&&(a.focused.whOrderId=t.id,a.focused.func=e,a.focused.prop=i),s||"pickup"!==i||"success"!==t.getFunc(e).pickup||t.isDelivered()||!r.isAllowedTo("WH:MANAGE:CARTS")?"platformer"===e&&"pickup"===i&&"pending"===t.getFunc(e).pickup?setTimeout(a.handleUpdate.bind(a),1,t,e,i,"success"):v[i].forEach(function(n){n.manage&&!s||"platformer"===e&&"pickup"===i&&"failure"===n.value||o.push({icon:n.icon,label:a.t("menu:"+i+":"+(n.label||n.value)),handler:a.handleUpdate.bind(a,t,e,i,n.value)})}):o.push({icon:"fa-edit",label:a.t("menu:pickup:editCarts"),handler:a.handleUpdate.bind(a,t,e,"pickup","success",{edit:!0})}),o.length){var f=n.pageY,p=n.pageX;if(f)f-=17,p-=17;else{var h=l.find(".fa");if(!h.length)return;var m=h[0].getBoundingClientRect();f=Math.round(m.y+m.height/2)+document.scrollingElement.scrollTop,p=Math.round(m.x+m.width/2)}d.show(a,f,p,{className:"wh-set-menu",menu:o})}},showFixUpdateMenu:function(t,e,i,n){var r=t.getUserFunc(this.model.user);if(r){var a=t.get("picklistDone");switch(i){case"picklistDone":if("pending"===a||t.get("picklistFunc")!==r._id)return;break;case"picklist":if("success"!==a||"pending"===r.status||e!==r._id)return;break;case"pickup":if("pending"===r.picklist||"ignore"===r.pickup||e!==r._id)return}this.showUpdateMenu(t,e,i,n)}},showEditor:function(t,e){var i=this;i.hideEditor();var n=i.$(e).closest(".wh-set-item");n.length&&(t.data("whOrderId",n[0].dataset.id).attr("data-func",e.dataset.func).css({left:e.offsetLeft+"px",top:e.offsetTop+"px"}).appendTo(".modal-content"),t.on("keydown",function(t){if("Escape"===t.key)return i.hideEditor(),i.focus(),!1}),i.$editor=t)},hideEditor:function(){this.$editor&&(this.onOrderChanged(this.whOrders.get(this.$editor.data("whOrderId"))),this.$editor.remove(),this.$editor=null)},handleUpdate:function(t,e,i,n,r){var s=this,o=JSON.parse(JSON.stringify(t.attributes));s.$action(t.id,i,e).removeClass("is-clickable").find(".fa").removeClass().addClass("fa fa-spinner fa-spin").blur(),s.updateHandlers[i].call(s,o,n,e,r||{},function(n){if(s.hideEditor(),!n)return s.onOrderChanged(t);var r=n(JSON.parse(JSON.stringify(t.attributes)),[]),o=s.promised(s.whOrders.act(i,r));o.fail(function(){s.onOrderChanged(t);var e=o.responseJSON&&o.responseJSON.error&&o.responseJSON.error.code||"failure";a.msg.show({type:"error",time:2500,text:s.t.has("update:"+e)?s.t("update:"+e):s.t("update:failure")})}),o.done(function(n){n.order&&t.set(n.order),s.$action(t.id,i,e).hasClass("is-clickable")||s.onOrderChanged(t)})})},$order:function(t){return this.$('.wh-set-item[data-id="'+t+'"]')},$action:function(t,e,i){return this.$order(t).find('.wh-set-action[data-prop="'+e+'"]'+(i?'[data-func="'+i+'"]':""))},updateHandlers:{picklistDone:function(t,e,i,n,r){r(function(t){return{whOrderId:t._id,newValue:e}})},picklist:function(t,e,i,n,r){r(function(t){return{whOrderId:t._id,funcId:i,newValue:e}})},pickup:function(t,e,i,n,r){if("pending"===e)return r(function(t){return{whOrderId:t._id,funcId:i,newValue:e}});if("success"===e)return this.updateHandlers.handlePickupSuccess.call(this,t,i,n,r);if("failure"===e)return this.updateHandlers.handlePickupFailure.call(this,t,i,r);throw new Error("Invalid pickup value.")},handlePickupSuccess:function(e,i,r,a){var s=this,o=s.$('.wh-set-item[data-id="'+e._id+'"]').find('.wh-set-action[data-prop="pickup"][data-func="'+i+'"]'),d={multiline:"packer"===i,carts:e.funcs[u.FUNC_TO_INDEX[i]].carts.join(" "),fmxCarts:[],kitterCarts:[]};"platformer"===i&&(d.fmxCarts=e.funcs[u.FUNC_TO_INDEX.fmx].carts,d.kitterCarts=e.funcs[u.FUNC_TO_INDEX.kitter].carts);var c=s.renderPartial(m,d);c.find(".form-control").on("input",function(t){t.currentTarget.setCustomValidity("")}).on("keydown",function(t){if("TEXTAREA"===t.target.tagName&&"Enter"===t.key)return c.find(".btn").click(),!1}),c.on("click","a[data-cart]",function(i){var n=i.currentTarget.dataset.func,r=i.currentTarget.dataset.cart,a=c.find(".form-control"),s=a.val().toUpperCase().split(/[,\s]+/).filter(function(t){return/^[A-Z0-9]+$/.test(t)});"all"===r?s=s.concat(e.funcs[u.FUNC_TO_INDEX[n]].carts):s.push(r),(s=t.uniq(s)).sort(function(t,e){return t.localeCompare(e,void 0,{numeric:!0})}),a.val(s.join(" ")).focus()}),c.on("submit",function(){var r=c.find(".form-control"),o=t.uniq(r.val().toUpperCase().split(/[,\s]+/).filter(function(t){return/^[A-Z0-9]+$/.test(t)}).sort(function(t,e){return t.localeCompare(e,void 0,{numeric:!0})}));if(r.val(o.join(" ")),0===o.length)return s.timers.resubmit=setTimeout(function(){c.find(".btn").click()}),!1;var d=s.whOrders.get(e._id).getFunc(i).carts.sort(function(t,e){return t.localeCompare(e,void 0,{numeric:!0})});if(t.isEqual(o,d))return a();var u=c.find(".form-control, .btn").prop("disabled",!0),l="components";"packer"===i?l="packaging":"painter"===i&&(l="ps");var p=s.ajax({url:"/old/wh/setCarts?select(date,set,cart)status=in=(completing,completed,delivering)&kind="+l+"&cart=in=("+o.join(",")+")"});return p.fail(function(){s.$editor===c&&f(o)}),p.done(function(t){if(s.$editor===c){var i=Date.parse(e.date)+":"+e.set,r=(t.collection||[]).filter(function(t){return Date.parse(t.date)+":"+t.set!==i});if(r.length){var a=s.t("set:cartsEditor:used:error",{count:r.length});r.forEach(function(t,e){e>0&&(a+=", "),a+=" "+s.t("set:cartsEditor:used:cart",{cart:t.cart,date:n.utc.format(t.date,"L"),set:t.set})}),c.find(".form-control")[0].setCustomValidity(a),u.prop("disabled",!1),c.find(".btn").click()}else f(o)}}),!1}),s.showEditor(c,o[0]);var l=c.find(".form-control");function f(t){a(function(e){return{whOrderId:e._id,funcId:i,newValue:"success",carts:t,edit:!!r.edit}})}l[0].selectionStart=9999,l.focus()},handlePickupFailure:function(t,i,n){var r=t.funcs[u.FUNC_TO_INDEX[i]],a=this.$('.wh-set-item[data-id="'+t._id+'"]').find('.wh-set-action[data-prop="pickup"][data-func="'+i+'"]'),s=e(g({problemArea:r.problemArea,comment:r.comment}));s.on("submit",function(){return n(function(t){return{whOrderId:t._id,funcId:i,newValue:"failure",problemArea:s.find("input").val().trim(),comment:s.find("textarea").val().trim()}}),!1}),this.showEditor(s,a[0]),s.find("input").select()}},onCommentChange:function(t){this.plan.orders.get(t.id)&&this.$('.wh-set-item[data-order="'+t.id+'"] .planning-mrp-lineOrders-comment').html(t.getCommentWithIcon())},onOrdersReset:function(t,e){e.reload||this.scheduleRender()},onPsStatusChanged:function(t){var e=this.$('.wh-set-item[data-order="'+t.id+'"]');if(e.length){var n=this.plan.sapOrders.getPsStatus(t.id);e.find(".planning-mrp-list-property-psStatus").attr("title",i("planning","orders:psStatus:"+n)).attr("data-ps-status",n)}},onOrderChanged:function(t){var e=this,i=e.$('.wh-set-item[data-id="'+t.id+'"]');if(i.length){if(this.updateSummary(),t.get("date")!==this.model.date||t.get("set")!==this.model.set)return 1===e.$(".wh-set-item").length?void a.closeDialog():void i.fadeOut("fast",function(){i.remove(),e.$(".wh-set-item").length||a.closeDialog()});i.replaceWith(this.renderPartialHtml(p,{item:t.serializeSet({i:this.whOrders.indexOf(t),delivered:this.whOrders.isSetDelivered(t.get("set"))},this.plan,this.model.user)})),this.focused.whOrderId===t.id&&this.focus()}},onDialogShown:function(){this.focus()},focusUp:function(t){var e=this.$(t).parent(),i=e[0],n="";t.classList.contains("btn")?(i=t,n='.btn[data-action="'+t.dataset.action+'"]'):(n='.is-clickable[data-prop="'+e[0].dataset.prop+'"]',e[0].dataset.func&&(n+='[data-func="'+e[0].dataset.func+'"]'));for(var r=this.$(n),a=-1,s=0;s<r.length;++s)if(r[s]===i){a=s-1;break}r[a]||(a=r.length-1);var o=r.eq(a);-1===o[0].tabIndex?o.find("[tabindex]").focus():o.focus()},focusDown:function(t){var e=this.$(t).parent(),i=e[0],n="";t.classList.contains("btn")?(i=t,n='.btn[data-action="'+t.dataset.action+'"]'):(n='.is-clickable[data-prop="'+e[0].dataset.prop+'"]',e[0].dataset.func&&(n+='[data-func="'+e[0].dataset.func+'"]'));for(var r=this.$(n),a=-1,s=0;s<r.length;++s)if(r[s]===i){a=s+1;break}r[a]||(a=0);var o=r.eq(a);-1===o[0].tabIndex?o.find("[tabindex]").focus():o.focus()},focusPrev:function(t){for(var e=this.$("[tabindex]"),i=-1,n=0;n<e.length;++n)if(e[n]===t){i=n-1;break}e[i]||(i=e.length-1),e[i].focus()},focusNext:function(t){for(var e=this.$("[tabindex]"),i=-1,n=0;n<e.length;++n)if(e[n]===t){i=n+1;break}e[i]||(i=0),e[i].focus()}})});