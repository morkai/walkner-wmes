define(["underscore","jquery","app/user","app/viewport","app/core/View","app/core/util/idAndLabel","app/data/orgUnits","app/users/util/setUpUserSelect2","app/planning/util/contextMenu","../dictionaries","../Entry","./ChatView","./ObserversView","./AttachmentsView","./NavbarView","app/wmes-fap-entries/templates/details"],function(e,t,a,i,n,s,o,r,d,l,p,c,u,f,h,m){"use strict";return n.extend({template:m,events:{"click .fap-editable-toggle":function(e){var t=this.$(e.target).closest(".fap-prop");this.showEditor(t,t[0].dataset.prop)},"mouseup .fap-autolink":function(e){var i=e.currentTarget.dataset.id;if(1===e.button)switch(e.currentTarget.dataset.type){case"order":window.open("#orders/"+i);break;case"product":window.open("/r/nc12/"+i);break;case"document":a.isAllowedTo("DOCUMENTS:VIEW")?window.open("#orderDocuments/tree?file="+i):window.open("/orderDocuments/"+i)}else h.appNavbarView?this.showAutolinkMenu(e):t(".navbar-search-phrase").first().val(i).focus();return!1}},initialize:function(){var e=this.model;this.setView("#-chat",new c({model:e})),this.insertView("#-observersAndAttachments",new u({model:e})),this.insertView("#-observersAndAttachments",new f({model:e})),this.listenTo(e,"change",this.update),this.listenTo(e,"editor:show",this.showEditor),this.listenTo(e,"editor:hide",this.hideEditor),t(window).on("keydown."+this.idPrefix,this.onKeyDown.bind(this))},destroy:function(){t(window).off("."+this.idPrefix)},getTemplateData:function(){return{model:this.model.serializeDetails()}},afterRender:function(){this.updateAuth(),this.updateUnseen()},update:function(){var e=this;e.isRendered()&&(Object.keys(e.model.changed).forEach(function(t){p.AUTH_PROPS[t]&&(cancelAnimationFrame(e.timers.auth),e.timers.auth=requestAnimationFrame(e.updateAuth.bind(e)));var a=e.resolveUpdater(t);a&&(cancelAnimationFrame(e.timers[t]),e.timers[t]=requestAnimationFrame(a.bind(e)))}),cancelAnimationFrame(e.timers.unseen),e.timers.unseen=requestAnimationFrame(e.updateUnseen.bind(e)))},resolveUpdater:function(e){switch(e){case"status":return this.updateMessage;case"why5":return this.updateWhy5;case"analysisNeed":case"analysisDone":return this.updateAnalysis;case"solver":return this.updateSolver;case"problem":case"solution":case"solutionSteps":return this.updateMultiline.bind(this,e);case"qtyTodo":case"qtyDone":return this.updateQty;case"orderNo":return this.updateOrderNo;case"analyzers":return this.updateAnalyzers;case"category":case"mrp":case"nc12":case"productName":case"divisions":case"lines":case"assessment":case"mainAnalyzer":case"subdivisionType":case"componentCode":case"componentName":return this.updateProp.bind(this,e)}},updateAuth:function(){var e=this;if(e.isRendered()){var t=e.model.serializeDetails();Object.keys(t.auth).forEach(function(a){var i=e.$('.fap-prop[data-prop="'+a+'"]');i.length&&(i.toggleClass("fap-is-editable",t.auth[a]),i.find(".fap-editable-toggle").length||i.find(".fap-prop-name").append('<i class="fa fa-edit fap-editable-toggle"></i>'))})}},updateUnseen:function(){var e=this,t=e.model.serializeDetails().observer.changes;e.$el.removeClass("fap-is-unseen").find(".fap-is-unseen").removeClass("fap-is-unseen"),t.any&&Object.keys(t).forEach(function(a){switch(a){case"any":break;case"all":e.$el.toggleClass("fap-is-unseen",t[a]);break;case"observers":case"subscribers":case"subscribers$added":case"subscribers$removed":e.$(".fap-observers").addClass("fap-is-unseen");break;case"attachments":e.$(".fap-attachments").addClass("fap-is-unseen");break;case"comment":e.$(".fap-chat").addClass("fap-is-unseen");break;case"status":e.$id("message").addClass("fap-is-unseen");break;default:e.$('.fap-prop[data-prop="'+a+'"]').addClass("fap-is-unseen")}})},updateText:function(e,a){for(var i=e instanceof t?e.find(".fap-prop-value")[0]:e;i.childNodes.length&&(!i.childNodes[0].classList||!i.childNodes[0].classList.contains("fap-editor"));)i.removeChild(i.childNodes[0]);this.$(i).closest(".fap-prop-value").prepend(a)},updateProp:function(e){var t=this.$('.fap-prop[data-prop="'+e+'"]');t.length&&this.updateText(t,this.model.serializeDetails()[e])},updateQty:function(){var e=this.$('.fap-prop[data-prop="qty"]'),t=this.model.serializeDetails();this.updateText(e.find('[data-prop="qtyDone"]')[0],t.qtyDone),this.updateText(e.find('[data-prop="qtyTodo"]')[0],t.qtyTodo)},updateOrderNo:function(){for(var e,t=this.$('.fap-prop[data-prop="orderNo"]').find(".fap-prop-value"),a=this.model.serializeDetails();t[0].firstChild&&"div"!==t[0].firstChild.nodeName;)t[0].removeChild(t[0].firstChild);e="-"===a.orderNo?"-":'<a href="javascript:void(0)" class="fap-autolink" data-type="order" data-id="'+a.orderNo+'">'+a.orderNo+"</a>",t.prepend(e)},updateAnalyzers:function(){this.updateProp("mainAnalyzer"),this.updateProp("analyzers")},updateMessage:function(){var e=this.model.serializeDetails();this.$id("message").attr("class","message message-inline message-"+e.message.type).text(e.message.text)},updateMultiline:function(e){var t=this.model.serializeDetails(),a=this.$('.fap-prop[data-prop="'+e+'"]');a.toggleClass("fap-is-multiline",t.multiline[e]).toggleClass("fap-is-success",!1===t.empty[e]),this.updateText(a,t[e])},updateSolver:function(){var e=this.model.serializeDetails();this.$('.fap-prop[data-prop="solution"]').find(".fa-user").attr("title",e.solver)},updateWhy5:function(){var e=this,t=e.model.get("why5");e.$(".fap-analysis-why-value").each(function(a){e.updateText(this,t[a]||"")})},updateAnalysis:function(){this.updateProp("analysisNeed"),this.updateProp("analysisDone"),this.updateMessage()},showEditor:function(e,t){this.hideEditor(),this.editors[t]&&(e.addClass("fap-is-editing"),this.editors[t].call(this,e,t))},hideEditor:function(){var e=this,t=e.$(".fap-editor");t.find(".select2-container").each(function(){e.$(this.nextElementSibling).select2("destroy")}),t.remove(),e.$(".fap-is-editing").removeClass("fap-is-editing")},showAutolinkMenu:function(e){if(h.appNavbarView){for(var t=h.appNavbarView.renderSearchResults(h.appNavbarView.parseSearchPhrase(e.currentTarget.dataset.id));t.length;){var a=t.children().last();if(!a.hasClass("dropdown-header")&&!a.hasClass("divider"))break;a.remove()}var i=[],n=0;t.children().each(function(){n>1||(this.classList.contains("navbar-search-result")?i.push({label:this.textContent,href:this.querySelector("a").href,handler:function(){window.open(this.href)}}):(n+=1)>1||(this.classList.contains("dropdown-header")?i.push(this.textContent):this.classList.contains("divider")&&i.push("-")))}),d.show(this,e.pageY,e.pageX,i)}},onKeyDown:function(e){"Escape"===e.originalEvent.key&&this.hideEditor()},editors:{textArea:function(e,a,i){var n=this,s=e[0].dataset.prop,o=n.model.get(s),r=t('<form class="fap-editor"></form>'),d=t('<textarea class="form-control"></textarea>').val(o).prop("required",a),l=t('<button class="btn btn-primary btn-lg"><i class="fa fa-check"></i></button>');d.on("keydown",function(e){if("Enter"===e.key&&e.shiftKey)return l.click(),!1}),r.on("submit",function(){var t=d.val().trim();return t!==o&&(i?n.model.multiChange(i(t,o,s,e)):n.model.change(s,t)),n.hideEditor(),!1}),r.append(d).append(l).appendTo(e.find(".fap-prop-value")),d.focus(),l[0].scrollIntoViewIfNeeded?l[0].scrollIntoViewIfNeeded():l[0].scrollIntoView()},select:function(a,i){var n=this,s=a[0].dataset.prop,o=n.model.get(s),r=t('<form class="fap-editor"></form>'),d=t('<select class="form-control"></select>'),l=t('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');r.on("submit",function(){var e=d.val();return e!==o&&n.model.change(s,e),n.hideEditor(),!1}),d.html(i.map(function(t){return'<option value="'+t.id+'">'+e.escape(t.text)+"</option>"}).join("")),d.val(o),r.append(d).append(l).appendTo(a.find(".fap-prop-value")),d.focus()},problem:function(e){this.editors.textArea.call(this,e,!0)},solution:function(e){this.editors.textArea.call(this,e,!1,function(e){return{solution:e,solver:e.trim().length?a.getInfo():null}})},solutionSteps:function(e){this.editors.textArea.call(this,e,!1)},category:function(e){var t=this.model.get("category"),a=l.categories.filter(function(e){return e.id===t||e.get("active")}).map(function(e){return{id:e.id,text:e.getLabel()}});this.editors.select.call(this,e,a)},subdivisionType:function(e){var t=this,a=p.SUBDIVISION_TYPES.map(function(e){return{id:e,text:t.t("subdivisionType:"+e)}});t.editors.select.call(t,e,a)},lines:function(e){var a=this,i={divisions:[].concat(a.model.get("divisions")).sort(l),lines:[].concat(a.model.get("lines")).sort(l)},n=t('<form class="fap-editor"></form>'),r=t("<input>"),d=t('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');function l(e,t){return e.localeCompare(t,void 0,{numeric:!0,ignorePunctuation:!0})}n.on("submit",function(){var e={divisions:[],lines:r.val().split(",").sort(l)};return e.lines.forEach(function(t){var a=o.getAllForProdLine(t).division;a&&-1===e.divisions.indexOf(a)&&e.divisions.push(a)}),e.divisions.sort(l),e.lines.length>0&&JSON.stringify(e)!==JSON.stringify(i)&&a.model.multiChange(e),a.hideEditor(),!1}),r.val(i.lines.join(",")),n.append(r).append(d).appendTo(e.find(".fap-prop-value")),r.select2({dropdownCssClass:"fap-editor-select2",width:"100%",multiple:!0,allowClear:!0,placeholder:" ",data:o.getActiveByType("prodLine").map(s)}),r.focus()},why5:function(e){var a=this,i=[].concat(a.model.get("why5"));e.find(".fap-analysis-why").each(function(n){var s=a.$(this),o=t('<form class="fap-editor"></form>'),r=t('<input class="form-control">').val(i[n]||""),d=t('<button class="btn btn-primary" tabindex="-1"><i class="fa fa-check"></i></button>');o.on("submit",function(){return function(){var t=e.find(".form-control").map(function(){return this.value.trim()}).get(),n=a.model.get("why5"),s=[],o=!1;t.forEach(function(e,t){e===(i[t]||"")?s.push(n[t]||""):(s.push(e),o=!0)}),o&&a.model.change("why5",s);a.hideEditor()}(),!1}),o.append(r).append(d).appendTo(s.find(".fap-analysis-why-value"))}),e.find(".form-control").first().focus()},assessment:function(e){var a=this,i=this.model.get("assessment"),n=t('<form class="fap-editor"></form>');["unspecified","effective","ineffective","repeatable"].forEach(function(e){t('<button type="button" class="btn btn-lg btn-default"></button>').toggleClass("active",i===e).val(e).text(a.t("assessment:"+e)).appendTo(n)}),n.on("click",".btn",function(e){var t=e.currentTarget.value;t!==i&&a.model.change("assessment",t),a.hideEditor()}),n.appendTo(e.find(".fap-prop-value"))},yesNo:function(e,a){var i=this,n=e[0].dataset.prop,s=this.model.get(n),o=t('<form class="fap-editor fap-editor-yesNo"></form>');["true","false"].forEach(function(e){t('<button type="button" class="btn btn-lg btn-default"></button>').toggleClass("active",String(s)===e).val(e).text(i.t("core","BOOL:"+e)).appendTo(o)}),o.on("click",".btn",function(t){var o="true"===t.currentTarget.value;o!==s&&(a?i.model.multiChange(a(o,s,n,e)):i.model.change(n,o)),i.hideEditor()}),o.appendTo(e.find(".fap-prop-value"))},analysisNeed:function(e){this.editors.yesNo.call(this,e,function(e){return{analysisNeed:e,analysisDone:!1,analysisStartedAt:e?new Date:null,analysisFinishedAt:null}})},analysisDone:function(e){this.editors.yesNo.call(this,e,function(e){return{analysisDone:e,analysisFinishedAt:e?new Date:null}})},attachment:function(a){var i=this,n=a[0].dataset.attachmentId,s=e.findWhere(i.model.get("attachments"),{_id:n}),o=a[0].getBoundingClientRect(),r=t('<form class="fap-editor fap-attachments-editor"></form>').css({top:a.offset().top+"px",left:o.left+"px",width:o.width+"px"}),d=t('<input class="form-control" type="text">').prop("id",this.idPrefix+"-attachmentEditor").val(s.name),l=t('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');r.on("submit",function(){var e=JSON.parse(JSON.stringify(s));e.name=d.val().trim();var t=s.name.split(".").pop();return new RegExp("\\."+t+"$","i").test(e.name)||(e.name+="."+t),e.name!==s.name&&i.model.change("attachments",[e],[s]),i.hideEditor(),!1}),r.append(d).append(l).appendTo(this.el),d.focus()},orderNo:function(e){var a=this,n=a.model.get("orderNo"),s=t('<form class="fap-editor"></form>'),r=t('<input class="form-control" type="text" pattern="^[0-9]{9}$" maxlength="9">'),d=t('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');r.on("input",function(){r[0].setCustomValidity("")}),s.on("submit",function(){var e=r.val();if(e===n)return a.hideEditor(),!1;if(""===e)return a.model.multiChange({orderNo:"",mrp:"",nc12:"",productName:"",qtyTodo:0,qtyDone:0,divisions:[],lines:[]}),a.hideEditor(),!1;r.prop("disabled",!0),d.prop("disabled",!0);var t=a.ajax({method:"POST",url:"/fap/entries;validate-order?order="+e});return t.fail(function(){"abort"!==t.statusText&&(r.prop("disabled",!1),d.prop("disabled",!1),404===t.status?(r[0].setCustomValidity(a.t("orderNo:404")),d.click()):i.msg.show({type:"error",time:2500,text:a.t("orderNo:failure")}))}),t.done(function(e){e.divisions=[],e.lines.forEach(function(t){var a=o.getAllForProdLine(t).division;a&&-1===e.divisions.indexOf(a)&&e.divisions.push(a)}),e.divisions.sort(function(e,t){return e.localeCompare(t,void 0,{numeric:!0,ignorePunctuation:!0})}),a.model.multiChange(e),a.hideEditor()}),!1}),r.val(n),s.append(r).append(d).appendTo(e.find(".fap-prop-value")),r.focus()},analyzers:function(e){var a,i,n=this,s=n.$('.fap-prop[data-prop="mainAnalyzer"]'),o=n.$('.fap-prop[data-prop="analyzers"]'),d=[].concat(n.model.get("analyzers")),l=t('<form class="fap-editor"></form>').append("<input>").append('<button class="btn btn-primary"><i class="fa fa-check"></i></button>'),p=l.clone();function c(){if(i){var e=a?a.val():d;i.select2("enable",0!==e.length)}}function u(){s.removeClass("fap-is-editing"),o.removeClass("fap-is-editing");var e=[],t={},r=!0;if(a){var l=a.select2("data");l&&e.push({id:l.id,label:l.text})}else d.length?e.push(d[0]):r=!1;return e.length&&(t[e[0].id]=!0,i&&i.select2("data").forEach(function(a){t[a.id]||(e.push({id:a.id,label:a.text}),t[a.id]=!0)})),r&&function(e){var t=n.model.get("analyzers"),a=t.length?t[0].id:null,i=t.slice(1).map(function(e){return e.id}).sort().join(","),s=e.length?e[0].id:null,o=e.slice(1).map(function(e){return e.id}).sort().join(",");return s!==a||o!==i}(e)&&n.model.change("analyzers",e),n.hideEditor(),!1}s.hasClass("fap-is-editable")&&(s.addClass("fap-is-editing"),a=l.on("submit",u).appendTo(s.find(".fap-prop-value")).find("input").val(d.length?d[0].id:"").on("change",c),r(a,{view:n,dropdownCssClass:"fap-editor-select2",width:"100%",noPersonnelId:!0})),o.hasClass("fap-is-editable")&&(o.addClass("fap-is-editing"),i=p.on("submit",u).appendTo(o.find(".fap-prop-value")).find("input").val(d.length>1?d.slice(1).map(function(e){return e.id}).join(","):""),r(i,{view:n,dropdownCssClass:"fap-editor-select2",width:"100%",multiple:!0,noPersonnelId:!0})),c(),e.find(".select2-container").next().select2("focus")},mainAnalyzer:function(){this.editors.analyzers.apply(this,arguments)},componentCode:function(e){var a=this,n=a.model.get("componentCode"),s=t('<form class="fap-editor"></form>'),o=t('<input class="form-control" type="text" pattern="^[0-9]{1,12}$" maxlength="12">'),r=t('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');o.on("input",function(){o[0].setCustomValidity("")}),s.on("submit",function(){var e=o.val();if(e===n)return a.hideEditor(),!1;if(""===e)return a.model.multiChange({componentCode:"",componentName:""}),a.hideEditor(),!1;o.prop("disabled",!0),r.prop("disabled",!0);var t=a.ajax({method:"POST",url:"/fap/entries;validate-component?nc12="+e});return t.fail(function(){"abort"!==t.statusText&&(o.prop("disabled",!1),r.prop("disabled",!1),404===t.status?(o[0].setCustomValidity(a.t("componentCode:404")),r.click()):i.msg.show({type:"error",time:2500,text:a.t("componentCode:failure")}))}),t.done(function(e){a.model.multiChange({componentCode:e._id,componentName:e.name}),a.hideEditor()}),!1}),o.val(n),s.append(o).append(r).appendTo(e.find(".fap-prop-value")),o.focus()}}})});