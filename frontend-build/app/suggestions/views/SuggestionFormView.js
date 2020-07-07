define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/buttonGroup","app/core/util/idAndLabel","app/core/views/FormView","app/core/templates/userInfo","app/users/util/setUpUserSelect2","app/kaizenOrders/dictionaries","../Suggestion","app/suggestions/templates/form","app/suggestions/templates/formCoordSectionRow"],function(t,e,i,s,o,n,a,r,d,c,l,h,u,p){"use strict";function g(t){return{id:t.id,text:t.getLabel(),description:t.get("description")}}function f(e){if(t.isEmpty(e.description))return t.escape(e.text);var i='<div class="suggestions-select2">';return i+="<h3>"+t.escape(e.text)+"</h3>",i+="<p>"+t.escape(e.description)+"</p>",i+="</div>"}function m(t,e){return e}return r.extend({template:u,events:t.assign({'keydown [role="togglePanel"]':function(t){13===t.keyCode&&(t.preventDefault(),t.stopPropagation(),t.currentTarget.click())},'click [role="togglePanel"]':function(t){var e=this.$(t.currentTarget).closest(".panel"),i=e.attr("data-type");e.hasClass("is-collapsed")?this.expandPanel(i):this.collapsePanel(i)},'change [name="status"]':function(){this.togglePanels(),this.toggleRequiredFlags(),this.setUpCoordSectionSelect2()},'change [name="section"]':function(){this.setUpConfirmerSelect2(),this.checkSectionValidity()},'change [name="categories"]':function(){this.toggleProductFamily()},'change [name="productFamily"]':function(){this.updateProductFamilySubscribers(),"OTHER"===this.$id("productFamily").val()&&(this.setUpProductFamily(),this.$id("kaizenEvent").focus())},'change [type="date"]':function(t){var i=s.getMoment(t.target.value,"YYYY-MM-DD"),n=i.isValid()?i.diff(new Date,"days"):0,a=Math.abs(n),r=this.$(t.target).closest(".form-group"),d=r.find(".help-block");if(a<=7)return t.target.setCustomValidity(""),void d.remove();!o.isAllowedTo("SUGGESTIONS:MANAGE")&&a>60&&t.target.setCustomValidity(this.t("FORM:ERROR:date",{days:60})),d.length||(d=e('<p class="help-block"></p>')),d.text(this.t("FORM:help:date:diff",{dir:n>0?"future":"past",days:a})).appendTo(r)},"click #-productFamily-other":function(){var t=this.$id("productFamily"),e=this.$id("kaizenEvent"),i="OTHER"===t.val();t.select2("destroy").val(i?"":"OTHER"),e.val(""),this.setUpProductFamily(),i?t.select2("open"):e.focus()},"click #-confirmer-other":function(){this.otherConfirmer=!this.otherConfirmer,this.setUpConfirmerSelect2(),this.$id("confirmer").select2("focus")},"change #-confirmer":"checkOwnerValidity","change #-suggestionOwners":"checkOwnerValidity","change #-kaizenOwners":"checkOwnerValidity","change #-coordSection":function(t){t.added&&(this.addCoordSection({_id:t.added.id}),t.target.value=""),this.setUpCoordSectionSelect2()},"change #-coordSections":function(){this.checkSectionValidity()},'click .btn[data-value="removeCoordSection"]':function(t){this.$(t.currentTarget).closest("tr").remove(),this.setUpCoordSectionSelect2()}},r.prototype.events),initialize:function(){r.prototype.initialize.apply(this,arguments),this.productFamilyObservers={},this.otherConfirmer=!1,this.listenTo(l.sections,"add remove change",this.onSectionUpdated)},getTemplateData:function(){var t={};return this.options.editMode&&this.model.get("attachments").forEach(function(e){t[e.description]=e}),{today:s.format(new Date,"YYYY-MM-DD"),statuses:l.kzStatuses,attachments:t,backTo:this.serializeBackTo()}},serializeBackTo:function(){if(void 0!==this.backTo)return this.backTo;var e,i,s={KO_LAST:"kaizenOrders",BOC_LAST:"behaviorObsCards",MFS_LAST:"minutesForSafetyCards"};return t.forEach(s,function(t,s){e||(i=JSON.parse(sessionStorage.getItem(s)||"null"))&&(e=t)}),e?this.backTo={type:e,data:i,submitLabel:this.t("FORM:backTo:"+e+":"+(i._id?"edit":"add")),cancelLabel:this.t("FORM:backTo:"+e+":cancel"),cancelUrl:"#"+e+(i._id?"/"+i._id+";edit":";add")}:(t.forEach(s,function(t){sessionStorage.removeItem(t)}),this.backTo=null)},checkValidity:function(){return!0},checkOwnerValidity:function(){var e=this,i=e.$id("confirmer").select2("data");[e.$id("suggestionOwners"),e.$id("kaizenOwners")].forEach(function(s){if(s.length){var o=s.select2("data"),n="",a={};i&&t.some(o,function(t){return t.id===i.id})&&(n="FORM:ERROR:ownerConfirmer",a.prop=s[0].name),!n&&o.length>2&&(n="FORM:ERROR:tooManyOwners",a.max=2),s[0].setCustomValidity(n?e.t(n,a):"")}})},checkSectionValidity:function(){var e=this.$id("section"),i=this.$id("coordSections"),s=e.val(),o=!1;s&&(o=this.options.editMode?0!==i.find('tr[data-id="'+s+'"]').length:t.some(i.select2("data"),function(t){return t.id===s})),e[0].setCustomValidity(o?this.t("FORM:ERROR:sectionCoord"):"")},submitRequest:function(t,e){var s=this,o=new FormData,n=0;if(this.$('input[type="file"]').each(function(){this.files.length&&(o.append(this.dataset.name,this.files[0]),++n)}),0===n)return r.prototype.submitRequest.call(s,t,e);this.$el.addClass("is-uploading");var a=this.ajax({type:"POST",url:"/suggestions;upload",data:o,processData:!1,contentType:!1});a.done(function(i){e.attachments=i,r.prototype.submitRequest.call(s,t,e)}),a.fail(function(){s.showErrorMessage(i("suggestions","FORM:ERROR:upload")),t.attr("disabled",!1)}),a.always(function(){s.$el.removeClass("is-uploading")})},handleSuccess:function(){!this.options.editMode&&this.backTo?this.broker.publish("router.navigate",{url:"/"+this.backTo.type+(this.backTo.data._id?"/"+this.backTo.data._id+";edit":";add")+"?suggestion="+this.model.get("rid"),trigger:!0}):this.broker.publish("router.navigate",{url:this.model.genClientUrl()+"?"+(this.options.editMode?"":"&thank=you")+(this.options.standalone?"&standalone=1":""),trigger:!0})},serializeToForm:function(){var e=this.model.toJSON();return h.DATE_PROPERTIES.forEach(function(t){e[t]&&(e[t]=s.format(e[t],"YYYY-MM-DD"))}),e.categories=t.isEmpty(e.categories)?"":e.categories.join(","),e.subscribers="",e},serializeForm:function(e){var i=this.$id("confirmer").select2("data");if(e.categories=e.categories.split(","),e.confirmer=i?{id:i.id,label:i.text}:null,e.suggestionOwners=this.serializeOwners("suggestion"),e.kaizenOwners=this.serializeOwners("kaizen"),e.subscribers=this.$id("subscribers").select2("data").map(function(t){return{id:t.id,label:t.text}}),h.DATE_PROPERTIES.forEach(function(t){var i=s.getMoment(e[t],"YYYY-MM-DD");e[t]=i.isValid()?i.toISOString():null}),this.options.editMode){var o={},n={};this.model.get("coordSections").forEach(function(t){o[t._id]=t}),this.$id("coordSections").find("tr").each(function(){var t=this.dataset.id,e=l.sections.get(t);n[t]=o[t]||{_id:t,name:e?e.getLabel():t,status:"pending",user:null,time:null,comment:""}}),e.coordSections=t.values(n)}else e.coordSections=this.$id("coordSections").select2("data").map(function(t){return{_id:t.id,name:t.text,status:"pending",user:null,time:null,comment:""}});return delete e.attachments,e},serializeOwners:function(t){return this.$id(t+"Owners").select2("data").map(function(t){return{id:t.id,label:t.text}}).filter(function(t){return!!t.id})},afterRender:function(){r.prototype.afterRender.call(this),n.toggle(this.$id("status")),c(this.$id("subscribers"),{multiple:!0,textFormatter:m,activeOnly:!this.options.editMode}),this.setUpSectionSelect2(),this.setUpCategorySelect2(),this.setUpProductFamily(),this.setUpConfirmerSelect2(),this.setUpOwnerSelect2(),this.options.editMode?(this.renderCoordSections(),this.setUpCoordSectionSelect2()):this.setUpCoordSectionsSelect2(),this.toggleStatuses(),this.togglePanels(),this.$("input[autofocus]").focus()},setUpSectionSelect2:function(){var e=this.model.get("section"),i=l.sections.get(e),s={};l.sections.forEach(function(t){t.get("active")&&(s[t.id]=a(t))}),e&&(s[e]=i?a(i):{id:e,text:e}),this.$id("section").select2({data:t.values(s)})},setUpCategorySelect2:function(){var e=this.model.get("category"),i=l.categories.get(e),s={};l.categories.forEach(function(t){t.get("active")&&t.get("inSuggestion")&&(s[t.id]=g(t))}),e&&(s[e]=i?g(i):{id:e,text:e}),this.$id("categories").select2({allowClear:!0,placeholder:" ",dropdownCssClass:"is-bigdrop",multiple:!0,data:t.values(s),formatResult:f})},setUpProductFamily:function(){var t=this.$id("productFamily"),e=this.$id("kaizenEvent"),i=this.$id("productFamily-other");"OTHER"===t.val()?(i.text(this.t("FORM:productFamily:list")),t.select2("destroy").addClass("hidden"),e.removeClass("hidden")):(i.text(this.t("FORM:productFamily:other")),e.addClass("hidden"),t.removeClass("hidden").select2({allowClear:!0,placeholder:" ",data:l.productFamilies.map(a)})),this.toggleProductFamily(!0)},setUpConfirmerSelect2:function(){var e=l.sections.get(this.$id("section").val()),i=e?e.get("confirmers"):[],s={},o=this.model.get("confirmer"),n=this.$id("confirmer"),a=this.$id("confirmer-other");if(i.forEach(function(t){s[t.id]={id:t.id,text:t.label}}),n.val(""),!e)return n.select2("destroy").addClass("form-control").prop("disabled",!0).attr("placeholder",this.t("FORM:confirmer:section")),void a.addClass("hidden");if(n.removeClass("form-control").prop("disabled",!1).attr("placeholder",null),i.length?a.text(this.t("FORM:confirmer:"+(this.otherConfirmer?"list":"other"))).removeClass("hidden"):a.addClass("hidden"),this.otherConfirmer||!i.length)c(n,{placeholder:this.t("FORM:confirmer:search"),textFormatter:m,activeOnly:!this.options.editMode});else{o&&(s[o.id]={id:o.id,text:o.label});var r=t.values(s);r.sort(function(t,e){return t.text.localeCompare(e.text)}),n.select2({width:"100%",allowClear:!1,placeholder:this.t("FORM:confirmer:select"),data:r}),1===r.length&&(o={id:r[0].id,label:r[0].text})}n.select2("container").attr("title",""),o&&n.select2("data",{id:o.id,text:o.label})},setUpOwnerSelect2:function(){var t=this.options.editMode,e=!t,i=this.model,s=null;function n(e){if(!t)return s?[s]:[];var o=i.get(e+"Owners");return Array.isArray(o)&&o.length?o.map(function(t){return{id:t.id,text:t.label}}):[]}this.options.operator?s=this.options.operator:o.isLoggedIn()&&(s={id:o.data._id,text:o.getLabel()}),c(this.$id("suggestionOwners"),{multiple:!0,textFormatter:m,activeOnly:e}).select2("data",n("suggestion")),c(this.$id("kaizenOwners"),{multiple:!0,textFormatter:m,activeOnly:e}).select2("data",n("kaizen"))},setUpCoordSectionsSelect2:function(){var t=this.$id("coordSections"),e=l.sections.filter(function(t){return t.get("coordinators").length>0}).map(a);t.select2({width:"100%",multiple:!0,allowClear:!0,placeholder:this.t("coordSections:add:placeholder"),data:e})},renderCoordSections:function(){this.$id("coordSections").html(""),this.model.get("coordSections").forEach(this.addCoordSection,this)},setUpCoordSectionSelect2:function(){var t=this.$id("coordSections").find("tr"),e=this.$id("coordSection"),i=l.sections.filter(function(e){return e.get("coordinators").length>0&&0===t.filter('tr[data-id="'+e.id+'"]').length}).map(a);e.select2({width:"300px",placeholder:this.t("coordSections:edit:placeholder"),data:i}),e.select2(0!==i.length&&this.canManageCoordinators()?"enable":"disable"),this.checkSectionValidity()},addCoordSection:function(e){e.status||(e=t.find(this.model.get("coordSections"),function(t){return t._id===e._id})||e);var i=l.sections.get(e._id),o=this.renderPartial(p,{section:{_id:e._id,name:i?i.get("name"):e.name,status:this.t("coordSections:status:"+(e.status||"pending")),user:e.user?d({userInfo:e.user}):"",time:e.time?s.format(e.time,"L, LT"):"",comment:e.comment||""},canManage:this.canManageCoordinators()});this.$id("coordSections").append(o)},canManageCoordinators:function(){if(this.model.canManage())return!0;var t=n.getValue(this.$id("status"));return!("accepted"!==t||!this.model.isConfirmer())||!("new"!==t||!(this.model.isConfirmer()||this.model.isCreator()||this.model.isSuggestionOwner()))},toggleRequiredFlags:function(){this.$(".suggestions-form-typePanel").each(function(){var t=e(this),i=!t.hasClass("hidden");t.find(".is-required").each(function(){t.find("#"+this.htmlFor).prop("required",i)})})},toggleStatuses:function(){if(this.options.editMode){if(this.model.canManage()||this.model.isConfirmer())return;var t={},e=this.model.get("status"),i=this.$id("status");t[e]=!0,"new"===e&&(this.model.isCreator()||this.model.isSuggestionOwner())&&(t.cancelled=!0),i.find("input").each(function(){this.parentNode.classList.toggle("disabled",!this.checked&&!t[this.value])}),this.$id("statusGroup").removeClass("hidden")}else this.$id("statusGroup").addClass("hidden")},togglePanels:function(){var t=n.getValue(this.$id("status"));this.$id("panel-kaizen").toggleClass("hidden","new"===t||"cancelled"===t)},toggleProductFamily:function(e){var i=t.includes(this.$id("categories").val().split(","),"KON"),s=this.$id("productFamily"),o=s.closest(".form-group"),n=o.find(".control-label");s.prop("required",i),i||(e||s.select2("data",null),this.updateProductFamilySubscribers()),n.toggleClass("is-required",i),o.toggleClass("has-required-select2",i)},updateProductFamilySubscribers:function(){var e=this,i=l.productFamilies.get(this.$id("productFamily").val()),s=i&&i.get("owners")||[],o={},n=[];this.$id("subscribers").select2("data").forEach(function(t){e.productFamilyObservers[t.id]||(o[t.id]=!0,n.push(t))}),e.productFamilyObservers={},t.forEach(s,function(t){o[t.id]||(n.push({id:t.id,text:t.label}),e.productFamilyObservers[t.id]=!0)}),this.$id("subscribers").select2("data",n)},onSectionUpdated:function(){this.setUpSectionSelect2(),this.setUpConfirmerSelect2(),this.options.editMode?this.setUpCoordSectionSelect2():this.setUpCoordSectionsSelect2()}})});