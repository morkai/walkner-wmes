define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/buttonGroup","app/core/util/idAndLabel","app/core/views/FormView","app/core/templates/userInfo","app/users/util/setUpUserSelect2","app/kaizenOrders/dictionaries","../Suggestion","app/suggestions/templates/form","app/suggestions/templates/formCoordSectionRow"],function(e,t,i,s,o,n,a,r,d,l,c,u,h,g){"use strict";function p(e){return{id:e.id,text:e.getLabel(),description:e.get("description")}}function m(t){if(e.isEmpty(t.description))return e.escape(t.text);var i='<div class="suggestions-select2">';return i+="<h3>"+e.escape(t.text)+"</h3>",i+="<p>"+e.escape(t.description)+"</p>",i+="</div>"}return r.extend({template:h,events:e.assign({'keydown [role="togglePanel"]':function(e){13===e.keyCode&&(e.preventDefault(),e.stopPropagation(),e.currentTarget.click())},'click [role="togglePanel"]':function(e){var t=this.$(e.currentTarget).closest(".panel"),i=t.attr("data-type");t.hasClass("is-collapsed")?this.expandPanel(i):this.collapsePanel(i)},'change [name="status"]':function(){this.togglePanels(),this.toggleRequiredToFinishFlags(),this.setUpCoordSectionSelect2(),this.checkOwnerValidity()},'change [name="section"]':function(){this.setUpConfirmerSelect2(),this.checkSectionValidity()},'change [name="categories"]':function(){this.toggleProductFamily()},'change [name="productFamily"]':function(){this.updateProductFamilySubscribers(),"OTHER"===this.$id("productFamily").val()&&(this.setUpProductFamily(),this.$id("kaizenEvent").focus())},'change [type="date"]':function(e){var i=s.getMoment(e.target.value,"YYYY-MM-DD"),n=i.isValid()?i.diff(new Date,"days"):0,a=Math.abs(n),r=this.$(e.target).closest(".form-group"),d=r.find(".help-block");e.target.setCustomValidity(""),a<=7?d.remove():(!o.isAllowedTo("SUGGESTIONS:MANAGE")&&a>60&&e.target.setCustomValidity(this.t("FORM:ERROR:date",{days:60})),d.length||(d=t('<p class="help-block"></p>')),d.text(this.t("FORM:help:date:diff",{dir:n>0?"future":"past",days:a})).appendTo(r))},"click #-productFamily-other":function(){var e=this.$id("productFamily"),t=this.$id("kaizenEvent"),i="OTHER"===e.val();e.select2("destroy").val(i?"":"OTHER"),t.val(""),this.setUpProductFamily(),i?e.select2("open"):t.focus()},"click #-confirmer-other":function(){this.otherConfirmer=!this.otherConfirmer,this.setUpConfirmerSelect2(),this.$id("confirmer").select2("focus")},"change #-confirmer":"checkOwnerValidity","change #-suggestionOwners":function(){this.$id("suggestedKaizenOwners").select2("data",this.$id("suggestionOwners").select2("data")),this.checkOwnerValidity()},"change #-kaizenOwners":"checkOwnerValidity","change #-suggestedKaizenOwners":"checkOwnerValidity","change #-coordSection":function(e){e.added&&(this.addCoordSection({_id:e.added.id}),e.target.value=""),this.setUpCoordSectionSelect2()},"change #-coordSections":function(){this.checkSectionValidity()},'click .btn[data-value="removeCoordSection"]':function(e){this.$(e.currentTarget).closest("tr").remove(),this.setUpCoordSectionSelect2()}},r.prototype.events),initialize:function(){r.prototype.initialize.apply(this,arguments),this.productFamilyObservers={},this.otherConfirmer=!1,this.listenTo(c.sections,"add remove change",this.onSectionUpdated)},getTemplateData:function(){var e={};return this.options.editMode&&this.model.get("attachments").forEach(function(t){e[t.description]=t}),{today:s.format(new Date,"YYYY-MM-DD"),statuses:c.kzStatuses,attachments:e,backTo:this.serializeBackTo()}},serializeBackTo:function(){if(void 0!==this.backTo)return this.backTo;var t,i,s={KO_LAST:"kaizenOrders",BOC_LAST:"behaviorObsCards",MFS_LAST:"minutesForSafetyCards"};return e.forEach(s,function(e,s){t||(i=JSON.parse(sessionStorage.getItem(s)||"null"))&&(t=e)}),t?this.backTo={type:t,data:i,submitLabel:this.t("FORM:backTo:"+t+":"+(i._id?"edit":"add")),cancelLabel:this.t("FORM:backTo:"+t+":cancel"),cancelUrl:"#"+t+(i._id?"/"+i._id+";edit":";add")}:(e.forEach(s,function(e){sessionStorage.removeItem(e)}),this.backTo=null)},checkValidity:function(){return!0},checkOwnerValidity:function(){var t=this,i=t.$id("confirmer").select2("data"),s={},o=[t.$id("suggestionOwners")];t.$id("panel-kaizen").hasClass("hidden")?o.push(t.$id("suggestedKaizenOwners")):o.push(t.$id("kaizenOwners")),o.forEach(function(o){if(o.length){var n=o.select2("data"),a="",r={};i&&e.some(n,function(e){return e.id===i.id})&&(a="FORM:ERROR:ownerConfirmer",r.prop=o[0].name),!a&&n.length>2&&(a="FORM:ERROR:tooManyOwners",r.max=2),a||n.forEach(function(e){s[e.id]=1}),o[0].setCustomValidity(a?t.t(a,r):"")}}),Object.keys(s).length>3&&t.$id("suggestionOwners")[0].setCustomValidity(t.t("FORM:ERROR:tooManyTotalOwners",{max:3}))},checkSectionValidity:function(){var t=this.$id("section"),i=this.$id("coordSections"),s=t.val(),o=!1;s&&(o=this.options.editMode?0!==i.find('tr[data-id="'+s+'"]').length:e.some(i.select2("data"),function(e){return e.id===s})),t[0].setCustomValidity(o?this.t("FORM:ERROR:sectionCoord"):"")},submitRequest:function(e,t){var s=this,o=new FormData,n=0;if(this.$('input[type="file"]').each(function(){this.files.length&&(o.append(this.dataset.name,this.files[0]),++n)}),0===n)return r.prototype.submitRequest.call(s,e,t);this.$el.addClass("is-uploading");var a=this.ajax({type:"POST",url:"/suggestions;upload",data:o,processData:!1,contentType:!1});a.done(function(i){t.attachments=i,r.prototype.submitRequest.call(s,e,t)}),a.fail(function(){s.showErrorMessage(i("suggestions","FORM:ERROR:upload")),e.attr("disabled",!1)}),a.always(function(){s.$el.removeClass("is-uploading")})},handleSuccess:function(){!this.options.editMode&&this.backTo?this.broker.publish("router.navigate",{url:"/"+this.backTo.type+(this.backTo.data._id?"/"+this.backTo.data._id+";edit":";add")+"?suggestion="+this.model.get("rid"),trigger:!0}):this.broker.publish("router.navigate",{url:this.model.genClientUrl()+"?"+(this.options.editMode?"":"&thank=you")+(this.options.standalone?"&standalone=1":""),trigger:!0})},serializeToForm:function(){var t=this.model.toJSON();return u.DATE_PROPERTIES.forEach(function(e){t[e]&&(t[e]=s.format(t[e],"YYYY-MM-DD"))}),t.suggestedKaizenOwners=t.kaizenOwners,t.categories=e.isEmpty(t.categories)?"":t.categories.join(","),t.subscribers="",t.kom&&(t.status="kom"),t},serializeForm:function(t){if(t.categories=t.categories.split(","),t.confirmer=l.getUserInfo(this.$id("confirmer")),t.superior=l.getUserInfo(this.$id("superior")),t.suggestionOwners=this.serializeOwners("suggestion"),t.kaizenOwners="new"===t.status||"accepted"===t.status?this.serializeOwners("suggestedKaizen"):this.serializeOwners("kaizen"),t.subscribers=this.$id("subscribers").select2("data").map(function(e){return{id:e.id,label:e.text}}),u.DATE_PROPERTIES.forEach(function(e){var i=s.getMoment(t[e],"YYYY-MM-DD");t[e]=i.isValid()?i.toISOString():null}),this.options.editMode){var i={},o={};this.model.get("coordSections").forEach(function(e){i[e._id]=e}),this.$id("coordSections").find("tr").each(function(){var e=this.dataset.id,t=c.sections.get(e);o[e]=i[e]||{_id:e,name:t?t.getLabel():e,status:"pending",user:null,time:null,comment:""}}),t.coordSections=e.values(o)}else t.coordSections=this.$id("coordSections").select2("data").map(function(e){return{_id:e.id,name:e.text,status:"pending",user:null,time:null,comment:""}});return"kom"===t.status?(t.status="finished",t.kom=!0):t.kom=!1,delete t.attachments,t},serializeOwners:function(e){return this.$id(e+"Owners").select2("data").map(function(e){return{id:e.id,label:e.text}}).filter(function(e){return!!e.id})},afterRender:function(){r.prototype.afterRender.call(this),n.toggle(this.$id("status")),l(this.$id("subscribers"),{multiple:!0,noPersonnelId:!0,activeOnly:!this.options.editMode}),this.setUpSectionSelect2(),this.setUpCategorySelect2(),this.setUpProductFamily(),this.setUpConfirmerSelect2(),this.setUpSuperiorSelect2(),this.setUpOwnerSelect2(),this.options.editMode?(this.renderCoordSections(),this.setUpCoordSectionSelect2()):this.setUpCoordSectionsSelect2(),this.toggleStatuses(),this.toggleRequiredToFinishFlags(),this.togglePanels(),this.toggleFields(),this.$("input[autofocus]").focus()},setUpSectionSelect2:function(){var t=this.model.get("section"),i=c.sections.get(t),s={};c.sections.forEach(function(e){e.get("active")&&e.get("confirmers").length&&(s[e.id]=a(e))}),t&&(s[t]=i?a(i):{id:t,text:t}),this.$id("section").select2({data:e.values(s)})},setUpCategorySelect2:function(){var t=this.model.get("category"),i=c.categories.get(t),s={};c.categories.forEach(function(e){e.get("active")&&e.get("inSuggestion")&&(s[e.id]=p(e))}),t&&(s[t]=i?p(i):{id:t,text:t}),this.$id("categories").select2({allowClear:!0,placeholder:" ",dropdownCssClass:"is-bigdrop",multiple:!0,data:e.values(s),formatResult:m})},setUpProductFamily:function(){var e=this.$id("productFamily"),t=this.$id("kaizenEvent"),i=this.$id("productFamily-other");if("OTHER"===e.val())i.text(this.t("FORM:productFamily:list")),e.select2("destroy").addClass("hidden"),t.removeClass("hidden");else{var s=this.model.get("productFamily");i.text(this.t("FORM:productFamily:other")),t.addClass("hidden"),e.removeClass("hidden").select2({allowClear:!0,placeholder:" ",data:c.productFamilies.filter(function(e){return e.id===s||e.get("active")}).map(a)})}this.toggleProductFamily(!0)},setUpConfirmerSelect2:function(){var t=c.sections.get(this.$id("section").val()),i=t?t.get("confirmers"):[],s={},n=this.model.get("confirmer"),a=this.$id("confirmer"),r=this.$id("confirmer-other");if(i.forEach(function(e){s[e.id]={id:e.id,text:e.label}}),a.val(""),!t)return a.select2("destroy").addClass("form-control").prop("disabled",!0).attr("placeholder",this.t("FORM:confirmer:section")),void r.addClass("hidden");if(a.removeClass("form-control").prop("disabled",!1).attr("placeholder",null),i.length&&(o.isAllowedTo("SUGGESTIONS:MANAGE")||this.model.isConfirmer())?r.text(this.t("FORM:confirmer:"+(this.otherConfirmer?"list":"other"))).removeClass("hidden"):r.addClass("hidden"),this.otherConfirmer||!i.length)l(a,{placeholder:this.t("FORM:confirmer:search"),noPersonnelId:!0,activeOnly:!this.options.editMode});else{n&&(s[n.id]={id:n.id,text:n.label});var d=e.values(s);d.sort(function(e,t){return e.text.localeCompare(t.text)}),a.select2({width:"100%",allowClear:!1,placeholder:this.t("FORM:confirmer:select"),data:d}),1===d.length&&(n={id:d[0].id,label:d[0].text})}a.select2("container").attr("title",""),n&&a.select2("data",{id:n.id,text:n.label})},setUpSuperiorSelect2:function(){var e=this.$id("superior");l(e,{width:"100%",allowClear:!1,activeOnly:!0,noPersonnelId:!0,rqlQueryDecorator:function(e){var t=c.settings.getValue("superiorFuncs");Array.isArray(t)&&t.length&&e.selector.args.push({name:"in",args:["prodFunction",t]})}});var t=this.model.get("superior");t&&e.select2("data",{id:t.id,text:t.label,user:t})},setUpOwnerSelect2:function(){var e=this.options.editMode,t=!e,i=this.model,s=null;function n(t){if(!e)return s?[s]:[];var o=i.get(t+"Owners");return Array.isArray(o)&&o.length?o.map(function(e){return{id:e.id,text:e.label}}):[]}this.options.operator?s=this.options.operator:o.isLoggedIn()&&(s={id:o.data._id,text:o.getLabel()}),l(this.$id("suggestionOwners"),{multiple:!0,noPersonnelId:!0,activeOnly:t,maximumSelectionSize:2}).select2("data",n("suggestion")),l(this.$id("suggestedKaizenOwners"),{multiple:!0,noPersonnelId:!0,activeOnly:t,maximumSelectionSize:2}).select2("data",n("kaizen")),l(this.$id("kaizenOwners"),{multiple:!0,noPersonnelId:!0,activeOnly:t,maximumSelectionSize:2}).select2("data",n("kaizen"))},setUpCoordSectionsSelect2:function(){var e=this.$id("coordSections"),t=c.sections.filter(function(e){return e.get("coordinators").length>0}).map(a);e.select2({width:"100%",multiple:!0,allowClear:!0,placeholder:this.t("coordSections:add:placeholder"),data:t})},renderCoordSections:function(){this.$id("coordSections").html(""),this.model.get("coordSections").forEach(this.addCoordSection,this)},setUpCoordSectionSelect2:function(){var e=this.$id("coordSections").find("tr"),t=this.$id("coordSection"),i=c.sections.filter(function(t){return t.get("coordinators").length>0&&0===e.filter('tr[data-id="'+t.id+'"]').length}).map(a);t.select2({width:"300px",placeholder:this.t("coordSections:edit:placeholder"),data:i}),t.select2(0!==i.length&&this.canManageCoordinators()?"enable":"disable"),this.checkSectionValidity()},addCoordSection:function(t){t.status||(t=e.find(this.model.get("coordSections"),function(e){return e._id===t._id})||t);var i=c.sections.get(t._id),o=this.renderPartial(g,{section:{_id:t._id,name:i?i.get("name"):t.name,status:this.t("coordSections:status:"+(t.status||"pending")),user:t.user?d({userInfo:t.user}):"",time:t.time?s.format(t.time,"L, LT"):"",comment:t.comment||""},canManage:this.canManageCoordinators()});this.$id("coordSections").append(o)},canManageCoordinators:function(){if(this.model.canManage())return!0;var e=n.getValue(this.$id("status"));return!("accepted"!==e||!this.model.isConfirmer())||!("new"!==e||!(this.model.isConfirmer()||this.model.isCreator()||this.model.isSuggestionOwner()))},toggleRequiredFlags:function(){this.$(".suggestions-form-typePanel").each(function(){var e=t(this),i=!e.hasClass("hidden");e.find(".is-required").each(function(){e.find("#"+this.htmlFor).prop("required",i)})})},toggleRequiredToFinishFlags:function(){var e=this.$('input[name="status"]:checked').val(),t="finished"===e||"kom"===e,i=this;this.$(".is-requiredToFinish").toggleClass("is-required",t).each(function(){if(this.dataset.required)return i.handleRequiredToFinishFlags(this.dataset.required,t);this.nextElementSibling.classList.contains("select2-container")&&this.parentNode.classList.toggle("has-required-select2",t),t||i.$("#"+this.htmlFor).prop("required",!1)}),t&&this.toggleRequiredFlags()},handleRequiredToFinishFlags:function(e){},toggleStatuses:function(){if(this.options.editMode){if(!this.model.canManage()&&!this.model.isConfirmer()){var e={},t=this.model.get("status"),i=this.$id("status");e[t]=!0,("new"===t&&(this.model.isCreator()||this.model.isSuggestionOwner())||"inProgress"===t&&this.model.isKaizenOwner())&&(e.cancelled=!0),i.find("input").each(function(){this.parentNode.classList.toggle("disabled",!this.checked&&!e[this.value])}),this.$id("statusGroup").removeClass("hidden")}}else this.$id("statusGroup").addClass("hidden")},toggleFields:function(){var e=this;"inProgress"!==e.model.get("status")||e.model.isConfirmer()||e.model.canManage()||(e.$id("section").select2("readonly",!0),e.$id("confirmer").select2("readonly",!0),e.$id("productFamily-other").addClass("hidden"),e.$id("suggestionPanelBody").find(".form-group").each(function(){var t=e.$(this).find("> input, > textarea")[0];-1===t.tabIndex?e.$(t).select2("readonly",!0):t.readOnly=!0}))},isKaizenAvailable:function(){var e=n.getValue(this.$id("status"));return"new"!==e&&"accepted"!==e},togglePanels:function(){var e=this.isKaizenAvailable();this.$id("panel-kaizen").toggleClass("hidden",!e),e?(this.$id("suggestionOwners").closest(".form-group").removeClass("col-lg-6").addClass("col-lg-12"),this.$id("suggestedKaizenOwners").closest(".form-group").addClass("hidden")):(this.$id("suggestionOwners").closest(".form-group").removeClass("col-lg-12").addClass("col-lg-6"),this.$id("suggestedKaizenOwners").closest(".form-group").removeClass("hidden"))},toggleProductFamily:function(t){var i=e.includes(this.$id("categories").val().split(","),"KON"),s=this.$id("productFamily"),o=s.closest(".form-group"),n=o.find(".control-label");s.prop("required",i),i||(t||s.select2("data",null),this.updateProductFamilySubscribers()),n.toggleClass("is-required",i),o.toggleClass("has-required-select2",i)},updateProductFamilySubscribers:function(){var t=this,i=c.productFamilies.get(this.$id("productFamily").val()),s=i&&i.get("owners")||[],o={},n=[];this.$id("subscribers").select2("data").forEach(function(e){t.productFamilyObservers[e.id]||(o[e.id]=!0,n.push(e))}),t.productFamilyObservers={},e.forEach(s,function(e){o[e.id]||(n.push({id:e.id,text:e.label}),t.productFamilyObservers[e.id]=!0)}),this.$id("subscribers").select2("data",n)},onSectionUpdated:function(){this.setUpSectionSelect2(),this.setUpConfirmerSelect2(),this.options.editMode?this.setUpCoordSectionSelect2():this.setUpCoordSectionsSelect2()}})});