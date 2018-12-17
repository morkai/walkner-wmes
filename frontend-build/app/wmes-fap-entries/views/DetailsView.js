define(["underscore","jquery","app/core/View","app/core/util/idAndLabel","app/data/orgUnits","../dictionaries","../Entry","./ChatView","./ObserversView","./AttachmentsView","app/wmes-fap-entries/templates/details"],function(e,t,i,a,n,s,o,r,d,l,c){"use strict";return i.extend({template:c,events:{"click .fap-editable-toggle":function(e){var t=this.$(e.target).closest(".fap-prop");this.showEditor(t,t[0].dataset.prop)}},initialize:function(){var e=this.model;this.setView("#-chat",new r({model:e})),this.insertView("#-observersAndAttachments",new d({model:e})),this.insertView("#-observersAndAttachments",new l({model:e})),this.listenTo(e,"change",this.update),this.listenTo(e,"editor:show",this.showEditor),this.listenTo(e,"editor:hide",this.hideEditor),t(window).on("keydown."+this.idPrefix,this.onKeyDown.bind(this))},destroy:function(){t(window).off("."+this.idPrefix)},getTemplateData:function(){return{model:this.model.serializeDetails()}},update:function(){var e=this;e.isRendered()&&Object.keys(e.model.changed).forEach(function(t){o.AUTH_PROPS[t]&&(cancelAnimationFrame(e.timers.auth),e.timers.auth=requestAnimationFrame(e.updateAuth.bind(e)));var i=e.resolveUpdater(t);i&&(cancelAnimationFrame(e.timers[t]),e.timers[t]=requestAnimationFrame(i.bind(e)))})},resolveUpdater:function(e){switch(e){case"status":return this.updateMessage;case"why5":return this.updateWhy5;case"analysisNeed":case"analysisDone":return this.updateAnalysis;case"problem":case"solution":return this.updateMultiline.bind(this,e);case"category":case"divisions":case"lines":case"assessment":return this.updateProp.bind(this,e)}},updateAuth:function(){var e=this;if(e.isRendered()){var t=e.model.serializeDetails();Object.keys(t.auth).forEach(function(i){var a=e.$('.fap-prop[data-prop="'+i+'"]');a.length&&(a.toggleClass("fap-is-editable",t.auth[i]),a.find(".fap-editable-toggle").length||a.find(".fap-prop-name").append('<i class="fa fa-edit fap-editable-toggle"></i>'))})}},updateText:function(e,i){var a=e instanceof t?e.find(".fap-prop-value")[0]:e;a.hasChildNodes()&&(a=a.childNodes[0].nodeType===Node.TEXT_NODE?a.childNodes[0]:a.insertBefore(document.createTextNode(i),a)),a.textContent=i},updateProp:function(e){this.updateText(this.$('.fap-prop[data-prop="'+e+'"]'),this.model.serializeDetails()[e])},updateMessage:function(){var e=this.model.serializeDetails();this.$id("message").attr("class","message message-inline message-"+e.message.type).text(e.message.text)},updateMultiline:function(e){var t=this.model.serializeDetails(),i=this.$('.fap-prop[data-prop="'+e+'"]');i.toggleClass("fap-is-multiline",t[e+"Multiline"]),this.updateText(i,t[e])},updateWhy5:function(){var e=this,t=e.model.get("why5");e.$(".fap-analysis-why-value").each(function(i){e.updateText(this,t[i]||"")})},updateAnalysis:function(){this.updateProp("analysisNeed"),this.updateProp("analysisDone"),this.updateMessage()},showEditor:function(e,t){this.hideEditor(),this.editors[t]&&(e.addClass("fap-is-editing"),this.editors[t].call(this,e,t))},hideEditor:function(){var e=this,t=e.$(".fap-editor");t.find(".select2-container").each(function(){e.$(this.nextElementSibling).select2("destroy")}),t.remove(),e.$(".fap-is-editing").removeClass("fap-is-editing")},onKeyDown:function(e){"Escape"===e.originalEvent.key&&this.hideEditor()},editors:{textArea:function(e,i){var a=this,n=e[0].dataset.prop,s=a.model.get(n),o=t('<form class="fap-editor"></form>'),r=t('<textarea class="form-control"></textarea>').val(s).prop("required",i),d=t('<button class="btn btn-primary btn-lg"><i class="fa fa-check"></i></button>');o.on("submit",function(){var e=r.val().trim();return e!==s&&a.model.change(n,e),a.hideEditor(),!1}),o.append(r).append(d).appendTo(e.find(".fap-prop-value")),r.focus(),d[0].scrollIntoViewIfNeeded?d[0].scrollIntoViewIfNeeded():d[0].scrollIntoView()},problem:function(e){this.editors.textArea.call(this,e,!0)},solution:function(e){this.editors.textArea.call(this,e,!1)},category:function(i){var a=this,n=a.model.get("category"),o=t('<form class="fap-editor"></form>'),r=t('<select class="form-control"></select>'),d=t('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');o.on("submit",function(){var e=r.val();return e!==n&&a.model.change("category",e),a.hideEditor(),!1});var l=s.categories.filter(function(e){return e.id===n||e.get("active")}).map(function(t){return'<option value="'+t.id+'">'+e.escape(t.getLabel())+"</option>"});r.html(l.join("")),r.val(n),o.append(r).append(d).appendTo(i.find(".fap-prop-value")),r.focus()},lines:function(e){var i=this,s={divisions:[].concat(i.model.get("divisions")).sort(l),lines:[].concat(i.model.get("lines")).sort(l)},o=t('<form class="fap-editor"></form>'),r=t("<input>"),d=t('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');function l(e,t){return e.localeCompare(t,void 0,{numeric:!0,ignorePunctuation:!0})}o.on("submit",function(){var e={divisions:[],lines:r.val().split(",").sort(l)};return e.lines.forEach(function(t){var i=n.getAllForProdLine(t).division;i&&-1===e.divisions.indexOf(i)&&e.divisions.push(i)}),e.divisions.sort(l),e.lines.length>0&&JSON.stringify(e)!==JSON.stringify(s)&&i.model.multiChange(e),i.hideEditor(),!1}),r.val(s.lines.join(",")),o.append(r).append(d).appendTo(e.find(".fap-prop-value")),r.select2({width:"100%",multiple:!0,allowClear:!0,placeholder:" ",data:n.getActiveByType("prodLine").map(a)}),r.focus()},why5:function(e){var i=this,a=[].concat(i.model.get("why5"));e.find(".fap-analysis-why").each(function(n){var s=i.$(this),o=t('<form class="fap-editor"></form>'),r=t('<input class="form-control">').val(a[n]||""),d=t('<button class="btn btn-primary" tabindex="-1"><i class="fa fa-check"></i></button>');o.on("submit",function(){return function(){var t=e.find(".form-control").map(function(){return this.value.trim()}).get(),n=i.model.get("why5"),s=[],o=!1;t.forEach(function(e,t){e===(a[t]||"")?s.push(n[t]||""):(s.push(e),o=!0)}),o&&i.model.change("why5",s);i.hideEditor()}(),!1}),o.append(r).append(d).appendTo(s.find(".fap-analysis-why-value"))}),e.find(".form-control").first().focus()},assessment:function(e){var i=this,a=this.model.get("assessment"),n=t('<form class="fap-editor"></form>');["unspecified","effective","ineffective","repeatable"].forEach(function(e){t('<button type="button" class="btn btn-lg btn-default"></button>').toggleClass("active",a===e).val(e).text(i.t("assessment:"+e)).appendTo(n)}),n.on("click",".btn",function(e){var t=e.currentTarget.value;t!==a&&i.model.change("assessment",t),i.hideEditor()}),n.appendTo(e.find(".fap-prop-value"))},yesNo:function(e,i){var a=this,n=e[0].dataset.prop,s=this.model.get(n),o=t('<form class="fap-editor fap-editor-yesNo"></form>');["true","false"].forEach(function(e){t('<button type="button" class="btn btn-lg btn-default"></button>').toggleClass("active",String(s)===e).val(e).text(a.t("core","BOOL:"+e)).appendTo(o)}),o.on("click",".btn",function(t){var o="true"===t.currentTarget.value;o!==s&&(i?a.model.multiChange(i(o,s,n,e)):a.model.change(n,o)),a.hideEditor()}),o.appendTo(e.find(".fap-prop-value"))},analysisNeed:function(e){this.editors.yesNo.call(this,e,function(e){return{analysisNeed:e,analysisDone:!1}})},analysisDone:function(e){this.editors.yesNo.call(this,e)},attachment:function(i){var a=this,n=i[0].dataset.attachmentId,s=e.findWhere(a.model.get("attachments"),{_id:n}),o=i[0].getBoundingClientRect(),r=t('<form class="fap-editor fap-attachments-editor"></form>').css({top:i.offset().top+"px",left:o.left+"px",width:o.width+"px"}),d=t('<input class="form-control" type="text">').prop("id",this.idPrefix+"-attachmentEditor").val(s.name),l=t('<button class="btn btn-primary"><i class="fa fa-check"></i></button>');r.on("submit",function(){var e=JSON.parse(JSON.stringify(s));e.name=d.val().trim();var t=s.name.split(".").pop();return new RegExp("\\."+t+"$","i").test(e.name)||(e.name+="."+t),e.name!==s.name&&a.model.change("attachments",[e],[s]),a.hideEditor(),!1}),r.append(d).append(l).appendTo(this.el),d.focus()}}})});