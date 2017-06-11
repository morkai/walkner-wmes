// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/buttonGroup","app/core/util/idAndLabel","app/core/views/FormView","app/users/util/setUpUserSelect2","app/kaizenOrders/dictionaries","../Suggestion","app/suggestions/templates/form"],function(e,t,i,s,a,r,o,n,l,d,u,c){"use strict";function p(e){return{id:e.id,text:e.getLabel(),description:e.get("description")}}function h(t){if(e.isEmpty(t.description))return e.escape(t.text);var i='<div class="suggestions-select2">';return i+="<h3>"+e.escape(t.text)+"</h3>",i+="<p>"+e.escape(t.description)+"</p>",i+="</div>"}function g(e,t){return t}return n.extend({template:c,events:e.extend({'keydown [role="togglePanel"]':function(e){13===e.keyCode&&(e.preventDefault(),e.stopPropagation(),e.currentTarget.click())},'click [role="togglePanel"]':function(e){var t=this.$(e.currentTarget).closest(".panel"),i=t.attr("data-type");t.hasClass("is-collapsed")?this.expandPanel(i):this.collapsePanel(i)},'change [name="status"]':function(){this.togglePanels(),this.toggleRequiredFlags()},'change [name="categories"]':function(){this.toggleProductFamily()},'change [name="productFamily"]':function(){this.updateProductFamilySubscribers()},'change [type="date"]':function(e){var r=s.getMoment(e.target.value,"YYYY-MM-DD"),o=r.isValid()?r.diff(new Date,"days"):0,n=Math.abs(o),l=this.$(e.target).closest(".form-group"),d=l.find(".help-block");return n<=7?(e.target.setCustomValidity(""),void d.remove()):(!a.isAllowedTo("SUGGESTIONS:MANAGE")&&n>60&&e.target.setCustomValidity(i("suggestions","FORM:ERROR:date",{days:60})),d.length||(d=t('<p class="help-block"></p>')),void d.text(i("suggestions","FORM:help:date:diff",{dir:o>0?"future":"past",days:n})).appendTo(l))}},n.prototype.events),initialize:function(){n.prototype.initialize.apply(this,arguments),this.productFamilyObservers={}},serialize:function(){var t={};return this.options.editMode&&this.model.get("attachments").forEach(function(e){t[e.description]=e}),e.extend(n.prototype.serialize.call(this),{today:s.format(new Date,"YYYY-MM-DD"),statuses:d.statuses,attachments:t})},checkValidity:function(){return!0},submitRequest:function(e,t){var s=this,a=new FormData,r=0;if(this.$('input[type="file"]').each(function(){this.files.length&&(a.append(this.dataset.name,this.files[0]),++r)}),0===r)return n.prototype.submitRequest.call(s,e,t);this.$el.addClass("is-uploading");var o=this.ajax({type:"POST",url:"/suggestions;upload",data:a,processData:!1,contentType:!1});o.done(function(i){t.attachments=i,n.prototype.submitRequest.call(s,e,t)}),o.fail(function(){s.showErrorMessage(i("suggestions","FORM:ERROR:upload")),e.attr("disabled",!1)}),o.always(function(){s.$el.removeClass("is-uploading")})},handleSuccess:function(){this.broker.publish("router.navigate",{url:this.model.genClientUrl()+"?"+(this.options.editMode?"":"&thank=you")+(this.options.standalone?"&standalone=1":""),trigger:!0})},serializeToForm:function(){var t=this.model.toJSON();return u.DATE_PROPERTIES.forEach(function(e){t[e]&&(t[e]=s.format(t[e],"YYYY-MM-DD"))}),t.categories=e.isEmpty(t.categories)?"":t.categories.join(","),t.subscribers="",t},serializeForm:function(e){var t=this.$id("confirmer").select2("data");return e.categories=e.categories.split(","),e.confirmer=t?{id:t.id,label:t.text}:null,e.suggestionOwners=this.serializeOwners("suggestion"),e.kaizenOwners=this.serializeOwners("kaizen"),e.subscribers=this.$id("subscribers").select2("data").map(function(e){return{id:e.id,label:e.text}}),u.DATE_PROPERTIES.forEach(function(t){var i=s.getMoment(e[t],"YYYY-MM-DD");e[t]=i.isValid()?i.toISOString():null}),delete e.attachments,e},serializeOwners:function(e){return this.$id(e+"Owners").select2("data").map(function(e){return{id:e.id,label:e.text}}).filter(function(e){return!!e.id})},afterRender:function(){n.prototype.afterRender.call(this),this.$id("section").select2({data:d.sections.map(o)}),this.$id("categories").select2({allowClear:!0,placeholder:" ",dropdownCssClass:"is-bigdrop",multiple:!0,data:d.categories.where({inSuggestion:!0}).map(p),formatResult:h}),this.$id("productFamily").select2({allowClear:!0,placeholder:" ",data:d.productFamilies.map(o)}),r.toggle(this.$id("status")),l(this.$id("subscribers"),{multiple:!0,textFormatter:g}),this.setUpConfirmerSelect2(),this.setUpOwnerSelect2(),this.toggleStatuses(),this.togglePanels(),this.toggleProductFamily(),this.$("input[autofocus]").focus()},setUpConfirmerSelect2:function(){var e=this.model.get("confirmer"),t=l(this.$id("confirmer"),{textFormatter:g});e&&t.select2("data",{id:e.id,text:e.label})},setUpOwnerSelect2:function(){function e(e){if(!t)return s;var a=i.get(e+"Owners");return Array.isArray(a)&&a.length?a.map(function(e){return{id:e.id,text:e.label}}):[]}var t=this.options.editMode,i=this.model,s=null;this.options.operator?s=this.options.operator:a.isLoggedIn()&&(s={id:a.data._id,text:a.getLabel(!0)}),l(this.$id("suggestionOwners"),{multiple:!0,textFormatter:g}).select2("data",e("suggestion")),l(this.$id("kaizenOwners"),{multiple:!0,textFormatter:g}).select2("data",e("kaizen"))},toggleRequiredFlags:function(){this.$(".suggestions-form-typePanel").each(function(){var e=t(this),i=!e.hasClass("hidden");e.find(".is-required").each(function(){e.find("#"+this.htmlFor).prop("required",i)})})},toggleStatuses:function(){if(this.options.editMode){if(a.isAllowedTo("SUGGESTIONS:MANAGE"))return;var e=["new"],t=!this.model.isConfirmer();t&&e.push("accepted","finished"),this.model.isCreator()&&"new"===this.model.get("status")||!t||e.push("cancelled");var i=this.el;e.forEach(function(e){var t=i.querySelector('input[name="status"][value="'+e+'"]');t.parentNode.classList.toggle("disabled",!t.checked)}),this.$id("statusGroup").removeClass("hidden")}else this.$id("statusGroup").toggleClass("hidden",!a.isAllowedTo("SUGGESTIONS:MANAGE"))},togglePanels:function(){var e=r.getValue(this.$id("status"));this.$id("panel-kaizen").toggleClass("hidden","new"===e||"cancelled"===e)},toggleProductFamily:function(){var t=e.includes(this.$id("categories").val().split(","),"KON"),i=this.$id("productFamily"),s=i.closest(".form-group"),a=s.find(".control-label");i.prop("required",t),t||(i.select2("data",null),this.updateProductFamilySubscribers()),a.toggleClass("is-required",t),s.toggleClass("has-required-select2",t)},updateProductFamilySubscribers:function(){var t=this,i=d.productFamilies.get(this.$id("productFamily").val()),s=i?i.get("owners")||[]:[],a={},r=[];this.$id("subscribers").select2("data").forEach(function(e){t.productFamilyObservers[e.id]||(a[e.id]=!0,r.push(e))}),t.productFamilyObservers={},e.forEach(s,function(e){a[e.id]||(r.push({id:e.id,text:e.label}),t.productFamilyObservers[e.id]=!0)}),this.$id("subscribers").select2("data",r)}})});