define(["underscore","jquery","app/user","app/viewport","app/core/View","app/core/util/idAndLabel","app/core/util/isElementInView","app/data/orgUnits","app/users/util/setUpUserSelect2","app/planning/util/contextMenu","../dictionaries","../Entry","./ChatView","./ObserversView","./AttachmentsView","./NavbarView","app/wmes-fap-entries/templates/details"],function(e,t,i,a,n,s,o,r,l,d,p,u,c,f,h,m,v){"use strict";return n.extend({template:v,events:{"click #-statusAction":function(e){e.currentTarget.classList.contains("btn-info")?this.start():e.currentTarget.classList.contains("btn-success")&&this.finish()},"click .fap-levelIndicator-inner":function(e){var t=this.model.serializeDetails(),i=+e.currentTarget.dataset.level;i!==t.level&&(t.auth.manage||t.auth.level&&i===t.level+1)&&this.model.change("level",i)},"click .fap-editable-toggle":function(e){var t=this.$(e.target).closest(".fap-prop");this.showEditor(t,t[0].dataset.prop)},"mouseup .fap-autolink":function(e){var a=e.currentTarget.dataset.id;if(1===e.button)switch(e.currentTarget.dataset.type){case"order":window.open("/#orders/"+a);break;case"product":window.open("/r/nc12/"+a);break;case"document":i.isAllowedTo("DOCUMENTS:VIEW")?window.open("/#orderDocuments/tree?file="+a):window.open("/orderDocuments/"+a)}else m.appNavbarView?this.showAutolinkMenu(e):t(".navbar-search-phrase").first().val(a).focus();return!1}},initialize:function(){var e=this.model;this.setView("#-chat",new c({model:e})),this.insertView("#-observersAndAttachments",new f({model:e})),this.insertView("#-observersAndAttachments",new h({model:e})),this.listenTo(e,"change",this.update),this.listenTo(e,"editor:show",this.showEditor),this.listenTo(e,"editor:hide",this.hideEditor),this.listenTo(p.settings,"change reset",this.onSettingChange),t(window).on("keydown."+this.idPrefix,this.onKeyDown.bind(this))},destroy:function(){t(window).off("."+this.idPrefix)},getTemplateData:function(){return{statusAction:this.serializeStatusAction(),model:this.model.serializeDetails()}},serializeStatusAction:function(){var e=this.model.serializeDetails().auth,t=this.model.get("status");if("finished"===t){if(e.restart)return{type:"info",label:this.t("PAGE_ACTION:restart")}}else if(e.status)return"pending"===t?{type:"info",label:this.t("PAGE_ACTION:start")}:{type:"success",label:this.t("PAGE_ACTION:finish")};return null},afterRender:function(){this.updateAuth(),this.updateUnseen()},update:function(){var e=this;e.isRendered()&&(Object.keys(e.model.changed).forEach(function(t){u.AUTH_PROPS[t]&&(cancelAnimationFrame(e.timers.auth),e.timers.auth=requestAnimationFrame(e.updateAuth.bind(e)));var i=e.resolveUpdater(t);i&&(cancelAnimationFrame(e.timers[t]),e.timers[t]=requestAnimationFrame(i.bind(e)))}),cancelAnimationFrame(e.timers.unseen),e.timers.unseen=requestAnimationFrame(e.updateUnseen.bind(e)))},resolveUpdater:function(e){switch(e){case"status":return this.updateStatus;case"level":return this.updateLevel;case"why5":return this.updateWhy5;case"analysisNeed":case"analysisDone":return this.updateAnalysis;case"solver":return this.updateSolver;case"problem":case"solution":case"solutionSteps":return this.updateMultiline.bind(this,e);case"qtyTodo":case"qtyDone":return this.updateQty;case"orderNo":return this.updateOrderNo;case"analyzers":return this.updateAnalyzers;case"category":case"subCategory":case"mrp":case"nc12":case"productName":case"divisions":case"lines":case"assessment":case"mainAnalyzer":case"subdivisionType":case"componentCode":case"componentName":return this.updateProp.bind(this,e)}},updateAuth:function(){var e=this;if(e.isRendered()){var t=e.model.serializeDetails();Object.keys(t.auth).forEach(function(i){var a=e.$('.fap-prop[data-prop="'+i+'"]');a.length&&(a.toggleClass("fap-is-editable",t.auth[i]),a.find(".fap-editable-toggle").length||a.find(".fap-prop-name").append('<i class="fa fa-edit fap-editable-toggle"></i>'))})}},updateUnseen:function(){var e=this,t=e.model.serializeDetails().observer.changes;e.$el.removeClass("fap-is-unseen").find(".fap-is-unseen").removeClass("fap-is-unseen"),t.any&&Object.keys(t).forEach(function(i){switch(i){case"any":break;case"all":e.$el.toggleClass("fap-is-unseen",t[i]);break;case"observers":case"subscribers":case"subscribers$added":case"subscribers$removed":e.$(".fap-observers").addClass("fap-is-unseen");break;case"attachments":e.$(".fap-attachments").addClass("fap-is-unseen");break;case"comment":e.$(".fap-chat").addClass("fap-is-unseen");break;case"status":e.$id("message").addClass("fap-is-unseen");break;default:e.$('.fap-prop[data-prop="'+i+'"]').addClass("fap-is-unseen")}})},updateText:function(e,i,a){a||(a=".fap-prop-value");for(var n=e instanceof t?e.find(a)[0]:e;n.childNodes.length&&(!n.childNodes[0].classList||!n.childNodes[0].classList.contains("fap-editor"));)n.removeChild(n.childNodes[0]);this.$(n).closest(a).prepend(i)},updateProp:function(e){var t=this.$('.fap-prop[data-prop="'+e+'"]');t.length&&this.updateText(t,this.model.serializeDetails()[e])},updateQty:function(){var e=this.$('.fap-prop[data-prop="qty"]'),t=this.model.serializeDetails();this.updateText(e.find('[data-prop="qtyDone"]')[0],t.qtyDone,'[data-prop="qtyDone"]'),this.updateText(e.find('[data-prop="qtyTodo"]')[0],t.qtyTodo,'[data-prop="qtyTodo"]')},updateOrderNo:function(){for(var e,t=this.$('.fap-prop[data-prop="orderNo"]').find(".fap-prop-value"),i=this.model.serializeDetails();t[0].firstChild&&"div"!==t[0].firstChild.nodeName;)t[0].removeChild(t[0].firstChild);e="-"===i.orderNo?"-":'<a class="fap-autolink" data-type="order" data-id="'+i.orderNo+'">'+i.orderNo+"</a>",t.prepend(e)},updateAnalyzers:function(){this.updateProp("mainAnalyzer"),this.updateProp("analyzers")},updateStatus:function(){this.updateMessage();var e=this.serializeStatusAction();e&&this.$id("statusAction").removeClass("btn-info btn-success").addClass("btn-"+e.type).text(e.label)},updateLevel:function(){this.$id("levelIndicator").html(this.model.serializeDetails().levelIndicator),this.toggleWhy5()},updateMessage:function(){var e=this.model.serializeDetails();this.$id("message").attr("class","message message-inline message-"+e.message.type).text(e.message.text)},updateMultiline:function(e){var t=this.model.serializeDetails(),i=this.$('.fap-prop[data-prop="'+e+'"]');i.toggleClass("fap-is-multiline",t.multiline[e]).toggleClass("fap-is-success",!1===t.empty[e]),this.updateText(i,t[e])},updateSolver:function(){var e=this.model.serializeDetails();this.$('.fap-prop[data-prop="solution"]').find(".fa-user").attr("title",e.solver)},updateWhy5:function(){var e=this,t=e.model.get("why5");e.$(".fap-analysis-why-value").each(function(i){e.updateText(this,t[i]||"",".fap-analysis-why-value")})},toggleWhy5:function(){var e=4!==this.model.get("level");this.$('.fap-prop[data-prop="why5"]').parent().toggleClass("hidden",e).next().toggleClass("hidden",e)},updateAnalysis:function(){this.updateProp("analysisNeed"),this.updateProp("analysisDone"),this.updateMessage()},showEditor:function(e,t){this.hideEditor(),this.editors[t]&&(e.addClass("fap-is-editing"),this.editors[t].call(this,e),this.trigger("editor:shown",t))},hideEditor:function(){var e=this,t=e.$(".fap-editor");t.find(".select2-container").each(function(){e.$(this.nextElementSibling).select2("destroy")}),t.remove();var i=e.$(".fap-is-editing").removeClass("fap-is-editing").attr("data-prop");e.trigger("editor:hidden",i)},showAutolinkMenu:function(e){if(m.appNavbarView){for(var t=m.appNavbarView.renderSearchResults(m.appNavbarView.parseSearchPhrase(e.currentTarget.dataset.id));t.length;){var i=t.children().last();if(!i.hasClass("dropdown-header")&&!i.hasClass("divider"))break;i.remove()}var a=[],n=0;t.children().each(function(){n>1||(this.classList.contains("navbar-search-result")?a.push({label:this.textContent,href:this.querySelector("a").href,handler:function(){window.open(this.href)}}):(n+=1)>1||(this.classList.contains("dropdown-header")?a.push(this.textContent):this.classList.contains("divider")&&a.push("-")))}),d.show(this,e.pageY,e.pageX,a)}},finish:function(){""===this.model.get("solution").trim()?(this.showEditor(this.$('.fap-is-editable[data-prop="solution"]'),"solution"),this.once("editor:hidden",function(){""!==this.model.get("solution").trim()&&window.scrollTo({top:0,left:0,behavior:"smooth"})})):this.model.multiChange({status:"finished",finishedAt:new Date})},start:function(){this.model.multiChange({status:"started",startedAt:new Date,finishedAt:null})},onKeyDown:function(e){"Escape"===e.originalEvent.key&&this.hideEditor()},onSettingChange:function(){this.model.updateAuth(),this.updateAuth()},editors:{textArea:function(e,i,a){var n=this,s=e[0].dataset.prop,r=n.model.get(s),l=t('<form class="fap-editor"></form>'),d=t('<textarea class="form-control"></textarea>').val(r).prop("required",i),p=t('<button class="btn btn-primary btn-lg"><i class="fa fa-check"></i></button>');d.on("keydown",function(e){if("Enter"===e.key&&e.shiftKey)return p.click(),!1}),l.on("submit",function(){var t=d.val().trim();return t!==r&&(a?n.model.multiChange(a(t,r,s,e)):n.model.change(s,t)),n.hideEditor(),!1}),l.append(d).append(p).appendTo(e.find(".fap-prop-value"));var u=e[0].offsetTop,c=u-l.offset().top+l.outerHeight(!0);o(e,{fullyInView:!0,height:c})?d.focus():t("html, body").stop(!0,!1).animate({scrollTop:u},function(){d.focus()})},select:function(i,a,n){var s=this,o=i[0].dataset.prop,r=s.model.get(o),l=t('<form class="fap-editor"></form>'),d=t('<select class="form-control"></select>'),p=t('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');l.on("submit",function(){var e=d.val();return n?s.model.multiChange(n(e,r,o,i)):s.model.change(o,e),s.hideEditor(),!1}),d.html(a.map(function(t){return'<option value="'+t.id+'">'+e.escape(t.text)+"</option>"}).join("")),d.val(r),l.append(d).append(p).appendTo(i.find(".fap-prop-value")),d.focus()},problem:function(e){this.editors.textArea.call(this,e,!0)},solution:function(e){this.editors.textArea.call(this,e,!1,function(e){return{solution:e,solver:e.trim().length?i.getInfo():null}})},solutionSteps:function(e){this.editors.textArea.call(this,e,!1)},category:function(e){var t=this,i=t.model.get("category"),a=p.categories.filter(function(e){return e.id===i||e.get("active")}).map(function(e){return{id:e.id,text:e.getLabel()}}),n=t.$('.fap-prop[data-prop="subCategory"]').addClass("fap-is-editing");t.editors.subCategory.call(t,n,i),t.editors.select.call(t,e,a,function(e){var t=n.find(".form-control").val();return{category:e,subCategory:"null"===t?null:t}}),e.find(".form-control").on("change",function(){n.find(".fap-editor").remove(),t.editors.subCategory.call(t,n,this.value)})},subCategory:function(e,t){t||(t=this.model.get("category"));var i=this.model.get("subCategory"),a=p.subCategories.filter(function(e){return e.get("parent")===t&&(e.id===i||e.get("active"))}).map(function(e){return{id:e.id,text:e.getLabel()}});a.length||a.unshift({id:null,text:""}),this.editors.select.call(this,e,a,function(e){return{category:t,subCategory:"null"===e?null:e}})},subdivisionType:function(e){var t=this,i=p.subdivisionTypes.map(function(e){return{id:e,text:t.t("subdivisionType:"+e)}});t.editors.select.call(t,e,i)},lines:function(e){var i=this,a={divisions:[].concat(i.model.get("divisions")).sort(d),lines:[].concat(i.model.get("lines")).sort(d)},n=t('<form class="fap-editor"></form>'),o=t("<input>"),l=t('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');function d(e,t){return e.localeCompare(t,void 0,{numeric:!0,ignorePunctuation:!0})}n.on("submit",function(){var e={divisions:[],lines:o.val().split(",").sort(d)};return e.lines.forEach(function(t){var i=r.getAllForProdLine(t).division;i&&-1===e.divisions.indexOf(i)&&e.divisions.push(i)}),e.divisions.sort(d),e.lines.length>0&&JSON.stringify(e)!==JSON.stringify(a)&&i.model.multiChange(e),i.hideEditor(),!1}),o.val(a.lines.join(",")),n.append(o).append(l).appendTo(e.find(".fap-prop-value")),o.select2({dropdownCssClass:"fap-editor-select2",width:"100%",multiple:!0,allowClear:!0,placeholder:" ",data:r.getActiveByType("prodLine").map(s)}),o.focus()},why5:function(e){var i=this,a=[].concat(i.model.get("why5"));e.find(".fap-analysis-why").each(function(n){var s=i.$(this),o=t('<form class="fap-editor"></form>'),r=t('<input class="form-control">').val(a[n]||""),l=t('<button class="btn btn-primary" tabindex="-1"><i class="fa fa-check"></i></button>');o.on("submit",function(){return function(){var t=e.find(".form-control").map(function(){return this.value.trim()}).get(),n=i.model.get("why5"),s=[],o=!1;t.forEach(function(e,t){e===(a[t]||"")?s.push(n[t]||""):(s.push(e),o=!0)}),o&&i.model.change("why5",s);i.hideEditor()}(),!1}),o.append(r).append(l).appendTo(s.find(".fap-analysis-why-value"))}),e.find(".form-control").first().focus()},assessment:function(e){var i=this,a=this.model.get("assessment"),n=t('<form class="fap-editor"></form>');["unspecified","effective","ineffective","repeatable"].forEach(function(e){t('<button type="button" class="btn btn-lg btn-default"></button>').toggleClass("active",a===e).val(e).text(i.t("assessment:"+e)).appendTo(n)}),n.on("click",".btn",function(e){var t=e.currentTarget.value;t!==a&&i.model.change("assessment",t),i.hideEditor()}),n.appendTo(e.find(".fap-prop-value"))},yesNo:function(e,i){var a=this,n=e[0].dataset.prop,s=this.model.get(n),o=t('<form class="fap-editor fap-editor-yesNo"></form>');["true","false"].forEach(function(e){t('<button type="button" class="btn btn-lg btn-default"></button>').toggleClass("active",String(s)===e).val(e).text(a.t("core","BOOL:"+e)).appendTo(o)}),o.on("click",".btn",function(t){var o="true"===t.currentTarget.value;o!==s&&(i?a.model.multiChange(i(o,s,n,e)):a.model.change(n,o)),a.hideEditor()}),o.appendTo(e.find(".fap-prop-value"))},analysisNeed:function(e){this.editors.yesNo.call(this,e,function(e){return{analysisNeed:e,analysisDone:!1,analysisStartedAt:e?new Date:null,analysisFinishedAt:null}})},analysisDone:function(e){this.editors.yesNo.call(this,e,function(e){return{analysisDone:e,analysisFinishedAt:e?new Date:null}})},attachment:function(i){var a=this,n=i[0].dataset.attachmentId,s=e.findWhere(a.model.get("attachments"),{_id:n}),o=i[0].getBoundingClientRect(),r=t('<form class="fap-editor fap-attachments-editor"></form>').css({top:i.offset().top+"px",left:o.left+"px",width:o.width+"px"}),l=t('<input class="form-control" type="text">').prop("id",this.idPrefix+"-attachmentEditor").val(s.name),d=t('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');r.on("submit",function(){var e=JSON.parse(JSON.stringify(s));e.name=l.val().trim();var t=s.name.split(".").pop();return new RegExp("\\."+t+"$","i").test(e.name)||(e.name+="."+t),e.name!==s.name&&a.model.change("attachments",[e],[s]),a.hideEditor(),!1}),r.append(l).append(d).appendTo(this.el),l.focus()},orderNo:function(e){var i=this,n=i.model.get("orderNo"),s=t('<form class="fap-editor"></form>'),o=t('<input class="form-control" type="text" pattern="^[0-9]{9}$" maxlength="9">'),l=t('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');o.on("input",function(){o[0].setCustomValidity("")}),s.on("submit",function(){var e=o.val();if(e===n)return i.hideEditor(),!1;if(""===e)return i.model.multiChange({orderNo:"",mrp:"",nc12:"",productName:"",qtyTodo:0,qtyDone:0,divisions:[],lines:[]}),i.hideEditor(),!1;o.prop("disabled",!0),l.prop("disabled",!0);var t=i.ajax({method:"POST",url:"/fap/entries;validate-order?order="+e});return t.fail(function(){"abort"!==t.statusText&&(o.prop("disabled",!1),l.prop("disabled",!1),404===t.status?(o[0].setCustomValidity(i.t("orderNo:404")),l.click()):a.msg.show({type:"error",time:2500,text:i.t("orderNo:failure")}))}),t.done(function(e){e.divisions=[],e.lines.forEach(function(t){var i=r.getAllForProdLine(t).division;i&&-1===e.divisions.indexOf(i)&&e.divisions.push(i)}),e.divisions.sort(function(e,t){return e.localeCompare(t,void 0,{numeric:!0,ignorePunctuation:!0})}),i.model.multiChange(e),i.hideEditor()}),!1}),o.val(n),s.append(o).append(l).appendTo(e.find(".fap-prop-value")),o.focus()},analyzers:function(e){var i,a,n=this,s=n.$('.fap-prop[data-prop="mainAnalyzer"]'),o=n.$('.fap-prop[data-prop="analyzers"]'),r=[].concat(n.model.get("analyzers")),d=t('<form class="fap-editor"></form>').append("<input>").append('<button class="btn btn-primary"><i class="fa fa-check"></i></button>'),p=d.clone();function u(){if(a){var e=i?i.val():r;a.select2("enable",0!==e.length)}}function c(){s.removeClass("fap-is-editing"),o.removeClass("fap-is-editing");var e=[],t={},l=!0;if(i){var d=i.select2("data");d&&e.push({id:d.id,label:d.text})}else r.length?e.push(r[0]):l=!1;return e.length&&(t[e[0].id]=!0,a&&a.select2("data").forEach(function(i){t[i.id]||(e.push({id:i.id,label:i.text}),t[i.id]=!0)})),l&&function(e){var t=n.model.get("analyzers"),i=t.length?t[0].id:null,a=t.slice(1).map(function(e){return e.id}).sort().join(","),s=e.length?e[0].id:null,o=e.slice(1).map(function(e){return e.id}).sort().join(",");return s!==i||o!==a}(e)&&n.model.change("analyzers",e),n.hideEditor(),!1}s.hasClass("fap-is-editable")&&(s.addClass("fap-is-editing"),i=d.on("submit",c).appendTo(s.find(".fap-prop-value")).find("input").val(r.length?r[0].id:"").on("change",u),l(i,{view:n,dropdownCssClass:"fap-editor-select2",width:"100%",noPersonnelId:!0})),o.hasClass("fap-is-editable")&&(o.addClass("fap-is-editing"),a=p.on("submit",c).appendTo(o.find(".fap-prop-value")).find("input").val(r.length>1?r.slice(1).map(function(e){return e.id}).join(","):""),l(a,{view:n,dropdownCssClass:"fap-editor-select2",width:"100%",multiple:!0,noPersonnelId:!0})),u(),e.find(".select2-container").next().select2("focus")},mainAnalyzer:function(){this.editors.analyzers.apply(this,arguments)},componentCode:function(e){var i=this,n=i.model.get("componentCode"),s=t('<form class="fap-editor"></form>'),o=t('<input class="form-control" type="text" pattern="^[0-9]{12}$" maxlength="12">'),r=t('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');o.on("input",function(){o[0].setCustomValidity("")}),s.on("submit",function(){var e=o.val();if(e===n)return i.hideEditor(),!1;if(""===e)return i.model.multiChange({componentCode:"",componentName:""}),i.hideEditor(),!1;o.prop("disabled",!0),r.prop("disabled",!0);var t=i.ajax({method:"POST",url:"/fap/entries;validate-component?nc12="+e});return t.fail(function(){if("abort"!==t.statusText){if(404!==t.status)return o.prop("disabled",!1),r.prop("disabled",!1),void a.msg.show({type:"error",time:2500,text:i.t("componentCode:failure")});i.model.multiChange({componentCode:e,componentName:""}),i.hideEditor()}}),t.done(function(e){i.model.multiChange({componentCode:e._id,componentName:e.name}),i.hideEditor()}),!1}),o.val(n),s.append(o).append(r).appendTo(e.find(".fap-prop-value")),o.focus()}}})});