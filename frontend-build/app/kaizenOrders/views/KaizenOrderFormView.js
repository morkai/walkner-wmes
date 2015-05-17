// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/buttonGroup","app/core/util/idAndLabel","app/core/views/FormView","app/users/util/setUpUserSelect2","../dictionaries","../KaizenOrder","app/kaizenOrders/templates/form"],function(e,t,s,i,a,r,n,o,d,l,c,p){"use strict";function u(e){return{id:e.id,text:e.getLabel(),description:e.get("description")}}function h(t){if(e.isEmpty(t.description))return e.escape(t.text);var s='<div class="kaizenOrders-select2">';return s+="<h3>"+e.escape(t.text)+"</h3>",s+="<p>"+e.escape(t.description)+"</p>",s+="</div>"}return o.extend({template:p,events:e.extend({'keydown [role="togglePanel"]':function(e){13===e.keyCode&&(e.preventDefault(),e.stopPropagation(),e.currentTarget.click())},'click [role="togglePanel"]':function(e){var t=this.$(e.currentTarget).closest(".panel"),s=t.attr("data-type");t.hasClass("is-collapsed")?this.expandPanel(s):this.collapsePanel(s)}},o.prototype.events),serialize:function(){return e.extend(o.prototype.serialize.call(this),{today:i.format(new Date,"YYYY-MM-DD"),statuses:l.statuses,types:l.types})},checkValidity:function(t){return 1===t.types.length&&e.contains(t.types,"kaizen")?this.showErrorMessage(s("kaizenOrders","FORM:ERROR:onlyKaizen")):!0},serializeToForm:function(){var e=this.model.toJSON();return c.DATE_PROPERTIES.forEach(function(t){e[t]&&(e[t]=i.format(e[t],"YYYY-MM-DD"))}),e},serializeForm:function(t){function s(e){var t=a.$id(e+"Owners").select2("data");return t.map(function(e){return{id:e.id,label:e.text}})}var a=this;return t.types=e.values(l.types).filter(function(e){return this.isPanelExpanded(e)},this),t.nearMissOwners=s("nearMiss"),t.suggestionOwners=s("suggestion"),t.kaizenOwners=s("kaizen"),c.DATE_PROPERTIES.forEach(function(e){var s=i.getMoment(t[e],"YYYY-MM-DD");t[e]=s.isValid()?s.toISOString():null}),t},afterRender:function(){o.prototype.afterRender.call(this),this.$id("area").select2({allowClear:!0,placeholder:" ",data:l.areas.map(n)}),this.$id("cause").select2({allowClear:!0,placeholder:" ",dropdownCssClass:"is-bigdrop",data:l.causes.map(u),formatResult:h}),this.$id("nearMissCategory").select2({allowClear:!0,placeholder:" ",dropdownCssClass:"is-bigdrop",data:l.categories.where({inNearMiss:!0}).map(u),formatResult:h}),this.$id("suggestionCategory").select2({allowClear:!0,placeholder:" ",dropdownCssClass:"is-bigdrop",data:l.categories.where({inSuggestion:!0}).map(u),formatResult:h}),this.$id("risk").select2({allowClear:!0,placeholder:" ",dropdownCssClass:"is-bigdrop",data:l.risks.map(u),formatResult:h}),r.toggle(this.$id("status")),this.setUpOwnerSelect2(),this.toggleStatuses(),this.toggleSubmit(),this.togglePanels(),this.$("input[autofocus]").focus()},setUpOwnerSelect2:function(){function e(e){if(!t)return i;var a=s.get(e+"Owners");return Array.isArray(a)&&a.length?a.map(function(e){return{id:e.id,text:e.label}}):[]}var t=this.options.editMode,s=this.model,i={id:a.data._id,text:a.getLabel()};d(this.$id("nearMissOwners"),{multiple:!0}).select2("data",e("nearMiss")),d(this.$id("suggestionOwners"),{multiple:!0}).select2("data",e("suggestion")),d(this.$id("kaizenOwners"),{multiple:!0}).select2("data",e("kaizen"))},isPanelExpanded:function(e){return this.$id("panel-"+e).hasClass("is-expanded")},collapsePanel:function(e){var t=this.$id("panel-"+e);return t.removeClass("is-expanded "+t.attr("data-expanded-class")).addClass("panel-default is-collapsed"),this.toggleSubmit(),("nearMiss"===e||"suggestion"===e)&&this.moveFields(),this.toggleRequiredFlags(),t.find(".panel-body").stop(!1,!1).slideUp("fast"),t},expandPanel:function(e,t){var s=this.$id("panel-"+e);s.removeClass("is-collapsed panel-default").addClass("is-expanded "+s.attr("data-expanded-class")),this.toggleSubmit(),("nearMiss"===e||"suggestion"===e)&&this.moveFields(),this.toggleRequiredFlags();var i=s.find(".panel-body").stop(!1,!1);return t===!1?i.css("display","block"):i.slideDown("fast",function(){s.find("input, textarea").first().focus()}),s},toggleRequiredFlags:function(){this.$(".kaizenOrders-form-typePanel").each(function(){var e=t(this),s=e.hasClass("is-expanded");e.find(".is-required").each(function(){this.control.required=s})})},toggleStatuses:function(){this.options.editMode||this.$id("status").find(".btn").each(function(){this.classList.toggle("disabled","new"!==this.querySelector("input").value)})},toggleSubmit:function(){this.$id("submit").prop("disabled",0===this.$(".panel.is-expanded").length)},togglePanels:function(){(this.model.get("types")||[]).forEach(function(e){this.expandPanel(e,!1)},this)},moveFields:function(){var e=this.isPanelExpanded("nearMiss"),t=this.isPanelExpanded("suggestion"),s=this.$id("nearMissOwnersFormGroup"),i=this.$id("suggestionOwnersFormGroup"),a=this.$id("eventDateAreaRow"),r=this.$id("descriptionFormGroup"),n=this.$id("nearMissOptional"),o=this.$id("causeTextFormGroup"),d=this.$id("causeCategoryRiskRow"),l=this.$id("correctiveMeasuresFormGroup"),c=this.$id("suggestionCategoryFormGroup"),p=this.$id("suggestionFormGroup"),u=this.$id("suggestionPanelBody"),h=this.$id("suggestionOptional"),g="nearMiss"===a.closest(".panel").attr("data-type");if(e){if(g)return;a.detach(),r.detach(),o.detach(),d.detach(),l.detach(),p.detach(),c.detach(),c.removeClass("col-md-3").appendTo(u),p.removeClass("col-md-4").insertAfter(i),a.insertAfter(s),r.insertAfter(a),o.insertAfter(n),d.insertAfter(o).find(".col-md-3").removeClass("col-md-3").addClass("col-md-4"),l.insertAfter(d)}else if(t){if(!g)return;a.detach(),r.detach(),o.detach(),d.detach(),l.detach(),p.detach(),c.detach(),a.insertAfter(i),r.insertAfter(a),p.insertAfter(r),o.insertAfter(h),d.insertAfter(o).find(".col-md-4").removeClass("col-md-4").addClass("col-md-3"),c.addClass("col-md-3").appendTo(d),l.insertAfter(d)}}})});