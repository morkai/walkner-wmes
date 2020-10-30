define(["underscore","jquery","app/i18n","app/time","app/user","app/viewport","app/core/View","app/core/util/embedded","app/core/util/scrollbarSize","app/data/clipboard","app/planning/util/contextMenu","app/planning/PlanSapOrder","../WhOrder","app/core/templates/userInfo","app/wh/templates/pickup/set/set","app/wh/templates/pickup/set/setItem","app/wh/templates/pickup/set/setPickupPopover","app/wh/templates/pickup/set/cartsEditor","app/wh/templates/pickup/set/problemEditor","app/wh/templates/pickup/set/printLabels"],function(e,t,i,n,r,a,s,o,d,c,u,l,h,f,p,m,g,b,w,v){"use strict";var k={picklistDone:[{value:"success",icon:"fa-thumbs-o-up"},{value:"failure",icon:"fa-thumbs-o-down"},{value:"pending",manage:!0}],picklist:[{value:"require",icon:"fa-check"},{value:"ignore",icon:"fa-times"},{value:"pending",manage:!0}],pickup:[{value:"success",icon:"fa-thumbs-o-up"},{value:"failure",icon:"fa-thumbs-o-down"},{value:"pending",manage:!0}]},E={Tab:!0,ArrowUp:!0,ArrowDown:!0,ArrowLeft:!0,ArrowRight:!0,KeyW:!0,KeyS:!0,KeyA:!0,KeyD:!0};return s.extend({template:p,dialogClassName:"wh-set-dialog modal-no-keyboard",dialogBackdrop:function(){return!o.isEnabled()||"static"},modelProperty:"whOrders",events:{"focus .fa[tabindex]":function(e){var t=this.$(e.target).closest(".wh-set-action"),i=t.closest(".wh-set-item");this.focused.whOrderId=i[0].dataset.id,this.focused.func=t[0].dataset.func,this.focused.prop=t[0].dataset.prop},"keydown [tabindex]":function(e){if(!this.$editor&&!u.isVisible(this)){var t=e.originalEvent.code;if(E[t]){var i=e.currentTarget;if("Tab"===t)return e.shiftKey&&i===this.el.querySelector(".fa[tabindex]")?(this.$("[tabindex]").last().focus(),!1):e.shiftKey||i!==this.$("[tabindex]").last()[0]?void 0:(this.el.querySelector(".fa[tabindex]").focus(),!1);switch(t){case"ArrowUp":case"KeyW":this.focusUp(i);break;case"ArrowDown":case"KeyS":this.focusDown(i);break;case"ArrowLeft":case"KeyA":this.focusPrev(i);break;case"ArrowRight":case"KeyD":this.focusNext(i)}}}},"keydown td.is-clickable":function(e){var t=e.originalEvent.code;if("Enter"===t||"Space"===t)return clearTimeout(this.timers.showUpdateMenu),this.timers.showUpdateMenu=setTimeout(this.showUpdateMenuByEvent.bind(this,e),1),!1},"click .is-clickable":function(e){if("TH"===e.currentTarget.tagName&&"func"===e.currentTarget.dataset.prop)return this.showFuncMenu(e.currentTarget.dataset.func,e.pageX,e.pageY),!1;this.showUpdateMenuByEvent(e)},"touchstart .wh-set-action":"scheduleFixUpdateMenu","mousedown .wh-set-action":"scheduleFixUpdateMenu","mouseup .wh-set-action":function(){clearTimeout(this.timers.showFixUpdateMenu),this.timers.showFixUpdateMenu=null},click:function(){this.hideEditor(),this.focus()},'click .btn[data-action="printLabels"]':function(e){var i=this,n=t(v());return n.on("submit",function(){var e=n.data("whOrderId"),t=+n.find("input").val();i.$('.wh-set-item[data-id="'+e+'"] .btn[data-action="printLabels"]').prop("disabled",!0).find(".fa").removeClass("fa-print").addClass("fa-spinner fa-spin"),i.hideEditor();var r=i.whOrders.act("printLabels",{order:e,qty:t,funcId:i.model.user?i.model.user.func:"fmx"});return r.fail(function(){a.msg.show({type:"error",time:2500,text:i.t("printLabels:failure")})}),r.always(function(){i.$('.wh-set-item[data-id="'+e+'"] .btn[data-action="printLabels"]').prop("disabled",!1).find(".fa").removeClass("fa-spinner fa-spin").addClass("fa-print"),i.focus()}),!1}),i.showEditor(n,i.$(e.target).closest(".wh-set-actions")[0]),n.find("input").select(),!1}},scheduleFixUpdateMenu:function(e){if(!e.currentTarget.classList.contains("is-clickable")){var t=this.whOrders.get(this.$(e.target).closest(".wh-set-item").attr("data-id")),i=e.currentTarget.dataset.func,n=e.currentTarget.dataset.prop;this.timers.showFixUpdateMenu=setTimeout(this.showFixUpdateMenu.bind(this,t,i,n,e),500)}},localTopics:{"planning.contextMenu.shown":"hidePopover","planning.contextMenu.hidden":"focus"},initialize:function(){var e=this;e.focused={whOrderId:null,func:null,prop:null},e.listenTo(e.plan.sapOrders,"reset",e.onOrdersReset),e.listenTo(e.whOrders,"reset",e.onOrdersReset),e.listenTo(e.whOrders,"change",e.onOrderChanged),e.once("afterRender",function(){e.$el.parent().on("scroll."+e.idPrefix,e.onScroll.bind(e)),o.isEnabled()&&(e.$el.closest(".modal-content").find(".modal-header").addClass("cancel"),e.showCancelButton())}),t(window).on("resize."+e.idPrefix,e.onWindowResize.bind(e)).on("keydown."+e.idPrefix,e.onWindowKeyDown.bind(e))},destroy:function(){t(window).off("."+this.idPrefix),this.$el.closest(".modal-content").find(".modal-header").removeClass("cancel"),this.$el.parent().off("."+this.idPrefix),this.$el.popover("destroy"),this.hideCancelButton(),this.hideEditor()},getTemplateData:function(){return{renderItem:this.renderPartialHtml.bind(this,m),embedded:o.isEnabled(),hide:this.shouldHide(),items:this.serializeItems()}},serializeItems:function(){return this.whOrders.serializeSet(this.model.set,this.plan,this.model.user)},beforeRender:function(){clearTimeout(this.timers.render)},afterRender:function(){var e=this;e.updateSummary(),e.$el.popover({selector:"[data-popover]",container:"body",trigger:"hover",placement:"bottom",html:!0,content:function(){var t=e.whOrders.get(e.$(this).closest(".wh-set-item")[0].dataset.id).getFunc(this.dataset.func);if(t.carts.length||t.problemArea||t.comment)return e.renderPartial(g,{func:t})},template:function(e){return t(e).addClass("wh-set-popover")}}),e.$el.on("show.bs.popover",function(){t(".wh-set-popover").remove()}),e.focus()},scheduleRender:function(){clearTimeout(this.timers.render),!this.plan.isAnythingLoading()&&this.isRendered()&&(this.timers.render=setTimeout(this.renderIfNotLoading.bind(this),1))},renderIfNotLoading:function(){this.plan.isAnythingLoading()||this.render()},hidePopover:function(){t(".wh-set-popover").remove()},updateSummary:function(){var t=this,i=0,a=0,s=0,o={};this.$(".wh-set-item").each(function(){var e=t.whOrders.get(this.dataset.id);if(e&&e.get("date")===t.model.date&&e.get("set")===t.model.set){if("problem"!==e.get("status")){var n=t.plan.orders.get(e.get("order"));i+=e.get("qty"),a+=n?n.get("quantityTodo"):0,s+=Date.parse(e.get("finishTime"))-Date.parse(e.get("startTime"))}e.get("funcs").forEach(function(e){void 0===o[e._id]&&(o[e._id]={_id:e._id,user:{id:"",label:""}}),e.user&&(o[e._id]=e)})}}),t.$id("qty").text(i.toLocaleString()+"/"+a.toLocaleString()),t.$id("time").text(n.toString(s/1e3,!0,!1));var d=r.isAllowedTo("WH:MANAGE"),c=t.model.user&&t.model.user._id||"";e.forEach(o,function(e){var i=e.user.label,n=i.split(/\s+/),r=n[0];n.length>1&&(r+=" "+n[1].charAt(0)+(n[1].length>1?".":"")),t.$id(e._id).text(r).attr("title",i).parent().toggleClass("is-clickable",!!r&&(d||e.user&&e.user.id===c))})},focus:function(){if(!this.$editor&&!u.isVisible(this)){var e=this.focused,t=this.$('.wh-set-item[data-id="'+e.whOrderId+'"]'),i='td[data-prop="'+e.prop+'"]';e.func&&(i+='[data-func="'+e.func+'"]');var n=t.find(i),r=n.find(".fa[tabindex]");if(!r.length){if(!(n=this.$("td.is-clickable").first()).length)return e.whOrderId=null,e.func=null,void(e.prop=null);t=n.closest(".wh-set-item"),r=n.find(".fa[tabindex]"),e.whOrderId=t[0].dataset.id,e.func=n[0].dataset.func,e.prop=n[0].dataset.prop}n.hasClass("is-clickable")&&r.focus()}},hideMenu:function(){u.hide(this)},showUpdateMenuByEvent:function(e){var t=this.whOrders.get(this.$(e.currentTarget).closest(".wh-set-item").attr("data-id")),i=e.currentTarget.dataset.func,n=e.currentTarget.dataset.prop;t&&this.showUpdateMenu(t,i,n,e)},showUpdateMenu:function(e,t,i,n){var a=this,s=r.isAllowedTo("WH:MANAGE"),d=[],c=a.$('.wh-set-item[data-id="'+e.id+'"]'),l='td.is-clickable[data-prop="'+i+'"]';t&&(l+='[data-func="'+t+'"]');var h=c.find(l);if(h.length&&(a.focused.whOrderId=e.id,a.focused.func=t,a.focused.prop=i),s||"pickup"!==i||"success"!==e.getFunc(t).pickup||e.isDelivered()||!r.isAllowedTo("WH:MANAGE:CARTS")?"platformer"===t&&"pickup"===i&&"pending"===e.getFunc(t).pickup?setTimeout(a.handleUpdate.bind(a),1,e,t,i,"success"):k[i].forEach(function(n){n.manage&&!s||"platformer"===t&&"pickup"===i&&"failure"===n.value||d.push({icon:n.icon,label:a.t("menu:"+i+":"+(n.label||n.value)),handler:a.handleUpdate.bind(a,e,t,i,n.value)})}):d.push({icon:"fa-edit",label:a.t("menu:pickup:editCarts"),handler:a.handleUpdate.bind(a,e,t,"pickup","success",{edit:!0})}),d.length){var f=n.pageY,p=n.pageX,m=n.originalEvent.touches;if(m&&m.length&&(f=m[0].pageY,p=m[0].pageX),f)f-=17,p-=17;else{var g=h.find(".fa");if(!g.length)return;var b=g[0].getBoundingClientRect();f=Math.round(b.y+b.height/2)+document.scrollingElement.scrollTop,p=Math.round(b.x+b.width/2)}o.isEnabled()&&d.unshift(e.get("order")),u.show(a,f,p,{className:"wh-set-menu",menu:d})}},showFixUpdateMenu:function(e,t,i,n){if(e){var r=e.getUserFunc(this.model.user);if(r){var a=e.get("picklistDone");switch(i){case"picklistDone":if("pending"===a||e.get("picklistFunc")!==r._id)return;break;case"picklist":if("success"!==a||"pending"===r.status||t!==r._id)return;break;case"pickup":if("pending"===r.picklist||"ignore"===r.pickup||t!==r._id)return;if("platformer"===r._id&&"problem"===r.status)return}this.showUpdateMenu(e,t,i,n)}}},showFuncMenu:function(e,t,i){var n=[{icon:"fa-eraser",label:this.t("unassignSet:menu"),handler:this.handleUnassignSet.bind(this,e)}];n.length&&(this.hideEditor(),u.show(this,i-17,t-17,{className:"wh-set-menu",menu:n}))},handleUnassignSet:function(e){var t=this;a.msg.saving();var i=t.whOrders.act("unassignSet",{date:t.model.date,set:t.model.set,func:e});i.fail(function(){a.msg.saved();var e=i.responseJSON&&i.responseJSON.error&&i.responseJSON.error.code||"failure";t.t.has("unassignSet:"+e)||(e="failure"),a.msg.show({type:"error",time:2500,text:t.t("unassignSet:"+e)})}),i.done(function(){a.msg.saved()})},showEditor:function(e,t){var i=this;i.hideEditor();var n=i.$(t).closest(".wh-set-item");n.length&&(e.data("whOrderId",n[0].dataset.id).data("anchorEl",t).attr("data-func",t.dataset.func).css({top:"0",left:"-1000px",margin:"unset"}).appendTo(".modal-content"),e.on("keydown",function(e){if("Escape"===e.key)return i.hideEditor(),i.focus(),!1}),i.$editor=e,i.positionEditor(),i.vkb&&i.$editor.on("focus","[data-vkb]",i.showVkb.bind(i)).on("blur","[data-vkb]",i.scheduleHideVkb.bind(i)))},positionEditor:function(){var e=this.$editor;if(e&&this.$el[0].parentNode){var i=e.data("anchorEl").firstElementChild;if(i){var n=this.$(i).position();if(n){var r=i.getBoundingClientRect(),a=this.$el[0].parentNode.getBoundingClientRect(),s=e.outerWidth(),o=e.outerHeight(),c=t(".modal-header").outerHeight(),u=a.top-c,l=a.left,h=n.top+c,f=n.left-s+r.width;if(f+a.left+s+d.width>=window.innerWidth&&(f=a.width-s),f<0&&(f=0),h+o+2*u>=window.innerHeight&&(h=window.innerHeight-o-2*u),this.vkb&&this.vkb.isVisible()){var p=this.vkb.el.getBoundingClientRect(),m=h+u,g=f+l,b={top:m,bottom:m+o,left:g,right:g+s};b.right<p.left||b.left>p.right||b.bottom<p.top||b.top>p.bottom||(h-=m+o-p.top+10)}h<0&&(h=0),e.css({top:h+"px",left:f+"px"})}}}},hideEditor:function(){this.$editor&&(this.onOrderChanged(this.whOrders.get(this.$editor.data("whOrderId"))),this.$editor.removeData("anchorEl"),this.$editor.remove(),this.$editor=null,this.hideVkb())},handleUpdate:function(e,t,i,n,r){var s=this,o=JSON.parse(JSON.stringify(e.attributes)),d=s.$action(e.id,i,t).removeClass("is-clickable").find(".fa").removeClass().addClass("fa fa-spinner").blur();s.updateHandlers[i].call(s,o,n,t,r||{},function(n){if(s.hideEditor(),!n)return s.onOrderChanged(e);d.addClass("fa-spin");var r=n(JSON.parse(JSON.stringify(e.attributes)),[]),o=s.promised(s.whOrders.act(i,r));o.fail(function(){s.onOrderChanged(e);var t=o.responseJSON&&o.responseJSON.error&&o.responseJSON.error.code||"failure";a.msg.show({type:"error",time:2500,text:s.t.has("update:"+t)?s.t("update:"+t):s.t("update:failure")})}),o.done(function(n){n.order&&e.set(n.order),s.$action(e.id,i,t).hasClass("is-clickable")||s.onOrderChanged(e)})})},$order:function(e){return this.$('.wh-set-item[data-id="'+e+'"]')},$action:function(e,t,i){return this.$order(e).find('.wh-set-action[data-prop="'+t+'"]'+(i?'[data-func="'+i+'"]':""))},updateHandlers:{picklistDone:function(e,t,i,n,r){if("pending"===t||"success"===t)return r(function(e){return{whOrderId:e._id,newValue:t}});if("failure"===t)return this.updateHandlers.handlePicklistDoneFailure.call(this,e,r);throw new Error("Invalid pickup value.")},handlePicklistDoneFailure:function(e,i){var n=this,r=n.$('.wh-set-item[data-id="'+e._id+'"]').find('.wh-set-action[data-prop="picklistDone"]'),a=t(w({func:"lp10",problemArea:null,comment:e.problem,placeholder:n.t("set:problemEditor:comment:lp10",{qty:e.qty,line:e.line})}));a.find("textarea").on("focus",function(t){""===t.target.value&&(t.target.value=n.t("set:problemEditor:comment:lp10",{qty:e.qty,line:e.line}),t.target.setSelectionRange(t.target.value.length,t.target.value.length))}),a.on("submit",function(){return i(function(e){var t=a.find("textarea").val().trim()||n.t("set:problemEditor:comment:lp10",{qty:e.qty,line:e.line});return{whOrderId:e._id,newValue:"failure",comment:t}}),!1}),n.showEditor(a,r[0]),a.find(".btn").focus()},picklist:function(e,t,i,n,r){r(function(e){return{whOrderId:e._id,funcId:i,newValue:t}})},pickup:function(e,t,i,n,r){if("pending"===t)return r(function(e){return{whOrderId:e._id,funcId:i,newValue:t}});if("success"===t)return this.updateHandlers.handlePickupSuccess.call(this,e,i,n,r);if("failure"===t)return this.updateHandlers.handlePickupFailure.call(this,e,i,r);throw new Error("Invalid pickup value.")},handlePickupSuccess:function(t,i,r,a){var s=this,o=s.$('.wh-set-item[data-id="'+t._id+'"]').find('.wh-set-action[data-prop="pickup"][data-func="'+i+'"]'),d={multiline:"packer"===i,carts:t.funcs[h.FUNC_TO_INDEX[i]].carts.join(" "),otherCarts:[]};"platformer"===i&&(d.otherCarts.push({_id:"fmx",carts:t.funcs[h.FUNC_TO_INDEX.fmx].carts}),d.otherCarts.push({_id:"kitter",carts:t.funcs[h.FUNC_TO_INDEX.kitter].carts}));var c={};s.whOrders.getOrdersBySet(s.model.set).forEach(function(e){e.order.getFunc(i).carts.forEach(function(e){c[e]=1})}),(c=Object.keys(c)).length&&d.otherCarts.push({_id:i,carts:c});var u=s.renderPartial(b,d);u.find(".form-control").on("input",function(e){e.currentTarget.setCustomValidity("")}).on("keydown",function(e){if("TEXTAREA"===e.target.tagName&&"Enter"===e.key)return u.find(".btn").click(),!1}),u.on("click","a[data-cart]",function(t){var i=t.currentTarget.dataset.func,n=t.currentTarget.dataset.cart,r=u.find(".form-control"),a=r.val().toUpperCase().split(/[,\s]+/).filter(function(e){return/^[A-Z0-9]+$/.test(e)});"all"===n?u.find('td > a[data-func="'+i+'"]').each(function(){a.push(this.dataset.cart)}):a.push(n),(a=e.uniq(a)).sort(function(e,t){return e.localeCompare(t,void 0,{numeric:!0})}),r.val(a.join(" ")).focus()}),u.on("submit",function(){var r=u.find(".form-control"),o=e.uniq(r.val().toUpperCase().split(/[,\s]+/).filter(function(e){return/^[A-Z0-9]+$/.test(e)}).sort(function(e,t){return e.localeCompare(t,void 0,{numeric:!0})}));if(r.val(o.join(" ")),0===o.length)return s.timers.resubmit=setTimeout(function(){u.find(".btn").click()}),!1;var d=s.whOrders.get(t._id);if(d){var c=d.getFunc(i).carts.sort(function(e,t){return e.localeCompare(t,void 0,{numeric:!0})});if(e.isEqual(o,c))return a()}var l=u.find(".form-control, .btn").prop("disabled",!0),h="components";"packer"===i?h="packaging":"painter"===i&&(h="ps");var p=s.ajax({url:"/old/wh/setCarts?select(date,set,cart)status=in=(completing,completed,delivering)&kind="+h+"&cart=in=("+o.join(",")+")"});return p.fail(function(){s.$editor===u&&f(o)}),p.done(function(e){if(s.$editor===u){var i=Date.parse(t.date)+":"+t.set,r=(e.collection||[]).filter(function(e){return Date.parse(e.date)+":"+e.set!==i});if(r.length){var a=s.t("set:cartsEditor:used:error",{count:r.length});r.forEach(function(e,t){t>0&&(a+=", "),a+=" "+s.t("set:cartsEditor:used:cart",{cart:e.cart,date:n.utc.format(e.date,"L"),set:e.set})}),u.find(".form-control")[0].setCustomValidity(a),l.prop("disabled",!1),u.find(".btn").click()}else f(o)}}),!1}),s.showEditor(u,o[0]);var l=u.find(".form-control");function f(e){a(function(t){return{whOrderId:t._id,funcId:i,newValue:"success",carts:e,edit:!!r.edit}})}l[0].selectionStart=9999,l.focus()},handlePickupFailure:function(e,i,n){var r=this,a=e.funcs[h.FUNC_TO_INDEX[i]],s=r.$('.wh-set-item[data-id="'+e._id+'"]').find('.wh-set-action[data-prop="pickup"][data-func="'+i+'"]'),o=t(w({func:i,problemArea:a.problemArea,comment:a.comment,placeholder:r.t("set:problemEditor:comment:pickup",{problemArea:" ",func:i,qty:e.qty,line:e.line})}));o.find("textarea").on("focus",function(t){if(""===t.target.value){var n=" "+o.find("input").val().trim();n.length&&(n+=" "),t.target.value=r.t("set:problemEditor:comment:pickup",{problemArea:n,func:i,qty:e.qty,line:e.line}),t.target.setSelectionRange(t.target.value.length,t.target.value.length)}}),o.on("submit",function(){return n(function(e){var t=o.find("input").val().trim(),n=o.find("textarea").val().trim();return n.length||(n=r.t("set:problemEditor:comment:pickup",{problemArea:" "+t+" ",func:i,qty:e.qty,line:e.line})),{whOrderId:e._id,funcId:i,newValue:"failure",problemArea:t,comment:n}}),!1}),r.showEditor(o,s[0]),o.find("input").select()}},onCommentChange:function(e){this.plan.orders.get(e.id)&&this.$('.wh-set-item[data-order="'+e.id+'"] .planning-mrp-lineOrders-comment').html(e.getCommentWithIcon())},onOrdersReset:function(e,t){t.reload||this.scheduleRender()},onOrderChanged:function(e){if(e){var t=this,i=t.$('.wh-set-item[data-id="'+e.id+'"]');if(i.length){if(t.updateSummary(),e.get("date")!==this.model.date||e.get("set")!==this.model.set)return 1===t.$(".wh-set-item").length?void a.closeDialog():void i.fadeOut("fast",function(){i.remove(),t.$(".wh-set-item").length||a.closeDialog()});var n={i:t.whOrders.indexOf(e),delivered:t.whOrders.isSetDelivered(e.get("set"))};i.replaceWith(t.renderPartialHtml(m,{item:e.serializeSet(n,t.plan,t.model.user),hide:t.shouldHide(),embedded:o.isEnabled()})),t.focused.whOrderId===e.id&&t.focus()}}},shouldHide:function(){return window.innerWidth<1600&&o.isEnabled()},onDialogShown:function(){this.focus()},focusUp:function(e){var t=this.$(e).parent(),i=t[0],n="";e.classList.contains("btn")?(i=e,n='.btn[data-action="'+e.dataset.action+'"]'):(n='td.is-clickable[data-prop="'+t[0].dataset.prop+'"]',t[0].dataset.func&&(n+='[data-func="'+t[0].dataset.func+'"]'));for(var r=this.$(n),a=-1,s=0;s<r.length;++s)if(r[s]===i){a=s-1;break}r[a]||(a=r.length-1);var o=r.eq(a);-1===o[0].tabIndex?o.find("[tabindex]").focus():o.focus()},focusDown:function(e){var t=this.$(e).parent(),i=t[0],n="";e.classList.contains("btn")?(i=e,n='.btn[data-action="'+e.dataset.action+'"]'):(n='td.is-clickable[data-prop="'+t[0].dataset.prop+'"]',t[0].dataset.func&&(n+='[data-func="'+t[0].dataset.func+'"]'));for(var r=this.$(n),a=-1,s=0;s<r.length;++s)if(r[s]===i){a=s+1;break}r[a]||(a=0);var o=r.eq(a);-1===o[0].tabIndex?o.find("[tabindex]").focus():o.focus()},focusPrev:function(e){for(var t=this.$("[tabindex]"),i=-1,n=0;n<t.length;++n)if(t[n]===e){i=n-1;break}t[i]||(i=t.length-1),t[i].focus()},focusNext:function(e){for(var t=this.$("[tabindex]"),i=-1,n=0;n<t.length;++n)if(t[n]===e){i=n+1;break}t[i]||(i=0),t[i].focus()},onScroll:function(){this.positionEditor()},onWindowResize:function(){this.positionEditor()},onWindowKeyDown:function(e){if("Escape"===e.key)return this.$editor?(this.hideEditor(),this.focus()):a.closeDialog(),!1},scheduleHideVkb:function(){clearTimeout(this.timers.hideVkb),this.timers.hideVkb=setTimeout(this.hideVkb.bind(this),250)},hideVkb:function(){clearTimeout(this.timers.hideVkb),this.vkb&&(this.vkb.hide(),this.vkb.enableKeys())},showVkb:function(e){this.vkb&&(clearTimeout(this.timers.hideVkb),this.vkb.show(e.currentTarget,{onKeyPress:this.onVkbKeyPress.bind(this),adjustOverlap:!1,positioner:o.isEnabled()&&window.innerHeight>t(".modal-dialog").outerHeight(!0)+350?this.positionVkb.bind(this):null}),this.positionEditor())},positionVkb:function(e){e.bottom="unset",e.top=Math.max(t(".modal-dialog").outerHeight(!0),500)+"px",this.vkb.$el.css(e)},onVkbKeyPress:function(e){return"ENTER"!==e||(this.$editor.find(".btn").click(),!1)},showCancelButton:function(){this.$cancelButton=t('<button type="button" class="btn btn-danger wh-pickup-set-cancel"><i class="fa fa-times"></i></button>').appendTo(document.body),this.$cancelButton.on("click",function(){a.closeDialog()})},hideCancelButton:function(){this.$cancelButton&&(this.$cancelButton.remove(),this.$cancelButton=null)}})});