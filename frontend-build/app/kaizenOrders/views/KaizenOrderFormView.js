// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/buttonGroup","app/core/util/idAndLabel","app/core/views/FormView","app/users/util/setUpUserSelect2","../dictionaries","../KaizenOrder","app/kaizenOrders/templates/form"],function(e,t,s,i,a,n,r,o,l,d,u,c){"use strict";function p(e){return{id:e.id,text:e.getLabel(),description:e.get("description")}}function h(t){if(e.isEmpty(t.description))return e.escape(t.text);var s='<div class="kaizenOrders-select2">';return s+="<h3>"+e.escape(t.text)+"</h3>",s+="<p>"+e.escape(t.description)+"</p>",s+="</div>"}function g(e,t){return t}return o.extend({template:c,events:e.extend({'keydown [role="togglePanel"]':function(e){window.KAIZEN_MULTI&&13===e.keyCode&&(e.preventDefault(),e.stopPropagation(),e.currentTarget.click())},'click [role="togglePanel"]':function(e){if(window.KAIZEN_MULTI){var t=this.$(e.currentTarget).closest(".panel"),s=t.attr("data-type");t.hasClass("is-collapsed")?this.expandPanel(s):this.collapsePanel(s)}},'change [name="status"]':"toggleRequiredToFinishFlags",'change [type="date"]':function(e){var n=i.getMoment(e.target.value,"YYYY-MM-DD"),r=n.isValid()?n.diff(new Date,"days"):0,o=Math.abs(r),l=this.$(e.target).closest(".form-group"),d=l.find(".help-block");return 7>=o?(e.target.setCustomValidity(""),void d.remove()):(!a.isAllowedTo("KAIZEN:MANAGE")&&o>60&&e.target.setCustomValidity(s("kaizenOrders","FORM:ERROR:date",{days:60})),d.length||(d=t('<p class="help-block"></p>')),void d.text(s("kaizenOrders","FORM:help:date:diff",{dir:r>0?"future":"past",days:o})).appendTo(l))}},o.prototype.events),serialize:function(){var t={};return this.options.editMode&&this.model.get("attachments").forEach(function(e){t[e.description]=e}),e.extend(o.prototype.serialize.call(this),{multi:!!window.KAIZEN_MULTI||this.model.isMulti(),today:i.format(new Date,"YYYY-MM-DD"),statuses:d.statuses,types:d.types,attachments:t})},checkValidity:function(){return!0},submitRequest:function(e,t){var i=this,a=new FormData,n=0;if(this.$('input[type="file"]').each(function(){this.files.length&&(a.append(this.dataset.name,this.files[0]),++n)}),0===n)return o.prototype.submitRequest.call(i,e,t);this.$el.addClass("is-uploading");var r=this.ajax({type:"POST",url:"/kaizen/orders;upload",data:a,processData:!1,contentType:!1});r.done(function(s){t.attachments=s,o.prototype.submitRequest.call(i,e,t)}),r.fail(function(){i.showErrorMessage(s("kaizenOrders","FORM:ERROR:upload")),e.attr("disabled",!1)}),r.always(function(){i.$el.removeClass("is-uploading")})},handleSuccess:function(){this.broker.publish("router.navigate",{url:this.model.genClientUrl()+(this.options.editMode?"":"?thank=you"),trigger:!0})},serializeToForm:function(){var e=this.model.toJSON(),t=e.eventDate?i.getMoment(e.eventDate):null;return t?(e.eventDate=t.format("YYYY-MM-DD"),e.eventTime=t.format("H")):(e.eventDate="",e.eventTime=""),u.DATE_PROPERTIES.forEach(function(t){e[t]&&(e[t]=i.format(e[t],"YYYY-MM-DD"))}),e.subscribers="",e},serializeForm:function(t){function s(e){var t=a.$id(e+"Owners").select2("data");return t.map(function(e){return{id:e.id,label:e.text}}).filter(function(e){return!!e.id})}var a=this,n=this.$id("confirmer").select2("data");delete t.attachments,t.confirmer=n?{id:n.id,label:n.text}:null,t.types=e.values(d.types).filter(function(e){return this.isPanelExpanded(e)},this),t.nearMissOwners=s("nearMiss"),t.suggestionOwners=d.multiType?s("suggestion"):[],t.kaizenOwners=d.multiType?s("kaizen"):[],t.subscribers=this.$id("subscribers").select2("data").map(function(e){return{id:e.id,label:e.text}}),u.DATE_PROPERTIES.forEach(function(e){var s=i.getMoment(t[e],"YYYY-MM-DD");t[e]=s.isValid()?s.toISOString():null});var r=(t.eventTime||"").match(/([0-9]{1,2})[^0-9]*([0-9]{1,2})?/),o="00:00";if(delete t.eventTime,r){var l=r[1],c=r[2];o=(1===l.length?"0":"")+l+":",o+=c?(1===c.length?"0":"")+c:"00"}var p=i.getMoment(t.eventDate+" "+o,"YYYY-MM-DD HH:mm");return p.isValid()||(p=i.getMoment(t.eventDate,"YYYY-MM-DD")),t.eventDate=p.isValid()?p.toISOString():null,t},afterRender:function(){o.prototype.afterRender.call(this),this.$id("section").select2({data:d.sections.map(r)}),this.$id("area").select2({allowClear:!0,placeholder:" ",data:d.areas.map(r)}),this.$id("cause").select2({allowClear:!0,placeholder:" ",dropdownCssClass:"is-bigdrop",data:d.causes.map(p),formatResult:h}),this.$id("nearMissCategory").select2({allowClear:!0,placeholder:" ",dropdownCssClass:"is-bigdrop",data:d.categories.where({inNearMiss:!0}).map(p),formatResult:h}),this.$id("suggestionCategory").select2({allowClear:!0,placeholder:" ",dropdownCssClass:"is-bigdrop",data:d.categories.where({inSuggestion:!0}).map(p),formatResult:h}),this.$id("risk").select2({allowClear:!0,placeholder:" ",dropdownCssClass:"is-bigdrop",data:d.risks.map(p),formatResult:h}),n.toggle(this.$id("status")),l(this.$id("subscribers"),{multiple:!0,textFormatter:g}),this.setUpConfirmerSelect2(),this.setUpOwnerSelect2(),this.toggleStatuses(),this.toggleSubmit(),this.toggleRequiredToFinishFlags(),this.togglePanels(),this.$("input[autofocus]").focus()},setUpConfirmerSelect2:function(){var e=this.model.get("confirmer"),t=l(this.$id("confirmer"),{textFormatter:g});e&&t.select2("data",{id:e.id,text:e.label})},setUpOwnerSelect2:function(){function e(e){if(!t)return i;var a=s.get(e+"Owners");return Array.isArray(a)&&a.length?a.map(function(e){return{id:e.id,text:e.label}}):[]}var t=this.options.editMode,s=this.model,i={id:a.data._id,text:a.getLabel(!0)};l(this.$id("nearMissOwners"),{multiple:!0,textFormatter:g}).select2("data",e("nearMiss")),l(this.$id("suggestionOwners"),{multiple:!0,textFormatter:g}).select2("data",e("suggestion")),l(this.$id("kaizenOwners"),{multiple:!0,textFormatter:g}).select2("data",e("kaizen"))},isPanelExpanded:function(e){return this.$id("panel-"+e).hasClass("is-expanded")},collapsePanel:function(e){var t=this.$id("panel-"+e);return t.removeClass("is-expanded "+t.attr("data-expanded-class")).addClass("panel-default is-collapsed"),this.toggleSubmit(),this.moveFields(),this.toggleRequiredFlags(),this.toggleChooseTypesMsg(),t.find(".panel-body").stop(!1,!1).slideUp("fast"),t},expandPanel:function(e,t){var s=this.$id("panel-"+e);s.removeClass("is-collapsed panel-default").addClass("is-expanded "+s.attr("data-expanded-class")),this.toggleSubmit(),this.moveFields(),this.toggleRequiredFlags(),this.toggleChooseTypesMsg();var i=s.find(".panel-body").stop(!1,!1);return t===!1?i.css("display","block"):i.slideDown("fast",function(){s.find("input, textarea").first().focus()}),s},toggleRequiredToFinishFlags:function(){var e=this.$('input[name="status"]:checked').val(),t="finished"===e,s=this;this.$(".is-requiredToFinish").toggleClass("is-required",t).each(function(){this.nextElementSibling.classList.contains("select2-container")&&this.parentNode.classList.toggle("has-required-select2",t),t||s.$("#"+this.htmlFor).prop("required",!1)}),this.$(".kaizenOrders-form-msg-optional").toggleClass("hidden",t),t&&this.toggleRequiredFlags()},toggleRequiredFlags:function(){this.$(".kaizenOrders-form-typePanel").each(function(){var e=t(this),s=e.hasClass("is-expanded");e.find(".is-required").each(function(){e.find("#"+this.htmlFor).prop("required",s)})})},toggleChooseTypesMsg:function(){this.$id("chooseTypes").toggleClass("hidden",this.$(".kaizenOrders-form-typePanel.is-expanded").length>0)},toggleStatuses:function(){if(this.options.editMode){if(a.isAllowedTo("KAIZEN:MANAGE"))return;var e=["new"];this.model.isConfirmer()||e.push("accepted","finished"),this.model.isCreator()&&"new"===this.model.get("status")||this.isConfirmer()||e.push("cancelled");var t=this.el;e.forEach(function(e){var s=t.querySelector('input[name="status"][value="'+e+'"]');s.parentNode.classList.toggle("disabled",!s.checked)})}else this.$id("status").find(".btn").each(function(){this.classList.toggle("disabled","new"!==this.querySelector("input").value)})},toggleSubmit:function(){this.$id("submit").prop("disabled",0===this.$(".panel.is-expanded").length)},togglePanels:function(){(this.model.get("types")||[]).forEach(function(e){this.expandPanel(e,!1)},this)},moveFields:function(){var e=this.isPanelExpanded("nearMiss"),t=this.isPanelExpanded("suggestion"),s=this.isPanelExpanded("kaizen"),i=this.$id("nearMissOwnersFormGroup"),a=this.$id("suggestionOwnersFormGroup"),n=this.$id("kaizenOwnersFormGroup"),r=this.$id("eventDateAreaRow"),o=this.$id("descriptionFormGroup"),l=this.$id("nearMissOptional"),d=this.$id("causeTextFormGroup"),u=this.$id("causeCategoryRiskRow"),c=this.$id("correctiveMeasuresFormGroup"),p=this.$id("suggestionCategoryFormGroup"),h=this.$id("suggestionFormGroup"),g=this.$id("suggestionPanelBody"),f=this.$id("suggestionOptional"),m="nearMiss"===r.closest(".panel").attr("data-type");if(e){if(m)return void(!t&&s?h.insertAfter(n):h.insertAfter(a));r.detach(),o.detach(),d.detach(),u.detach(),c.detach(),h.detach(),p.detach(),p.removeClass("col-md-3").appendTo(g),h.removeClass("col-md-4").insertAfter(a),r.insertAfter(i),o.insertAfter(r),d.insertAfter(l),u.insertAfter(d).find(".col-md-3").removeClass("col-md-3").addClass("col-md-4"),c.insertAfter(u),!t&&s&&h.insertAfter(n)}else if(t){if(!m)return;r.detach(),o.detach(),d.detach(),u.detach(),c.detach(),h.detach(),p.detach(),r.insertAfter(a),o.insertAfter(r),h.insertAfter(o),d.insertAfter(f),u.insertAfter(d).find(".col-md-4").removeClass("col-md-4").addClass("col-md-3"),p.addClass("col-md-3").appendTo(u),c.insertAfter(u)}}})});