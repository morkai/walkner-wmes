// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/idAndLabel","app/core/util/buttonGroup","app/core/views/FormView","app/users/util/setUpUserSelect2","app/data/prodLines","app/kaizenOrders/dictionaries","../MinutesForSafetyCard","app/minutesForSafetyCards/templates/form","app/minutesForSafetyCards/templates/_formObservation","app/minutesForSafetyCards/templates/_formProposition","app/minutesForSafetyCards/templates/_formRidEditor"],function(t,e,i,o,n,r,s,a,p,d,l,c,u,h,f,m){"use strict";return a.extend({template:u,events:t.extend({"click #-addObservation":function(){this.$id("observations").append(h({observation:{what:"",why:""},i:++this.rowIndex}))},"click #-addOrgProposition":function(){var t=e(this.createProposition("orgPropositions",{what:"",who:"",when:""}));this.$id("orgPropositions").append(t),this.setUpWhoSelect2(t)},"click #-addTechProposition":function(){var t=e(this.createProposition("techPropositions",{what:"",who:"",when:""}));this.$id("techPropositions").append(t),this.setUpWhoSelect2(t)},"click .btn[data-remove]":function(t){this.$(t.target).closest("tr").fadeOut("fast",function(){e(this).remove()})},"click .minutesForSafetyCards-form-rid-message > a":function(){localStorage.setItem("MFS_LAST",JSON.stringify(t.assign(this.model.toJSON(),this.getFormData())))},"click a[role=rid]":function(t){return this.showRidEditor(t.currentTarget.dataset.kind,t.currentTarget),!1}},a.prototype.events),initialize:function(){a.prototype.initialize.apply(this,arguments),this.rowIndex=0},getTemplateData:function(){return{statuses:l.statuses}},checkValidity:function(t){return(t.observations||[]).length||(t.risks||[]).length||(t.difficulties||[]).length},handleInvalidity:function(){this.$id("addObservation").focus()},serializeToForm:function(){var t=this.model.toJSON();return t.date=o.format(t.date,"YYYY-MM-DD"),t},serializeForm:function(t){var i=this.$id("owner").select2("data"),n=o.getMoment(t.date,"YYYY-MM-DD"),r=this.$id("orgPropositions").find('input[name$="who"]'),s=this.$id("techPropositions").find('input[name$="who"]'),a=function(t){return t&&t.length?(t.select2("data")||[]).map(function(t){return{id:t.id,label:t.text}}):[]};return t.owner={id:i.id,label:i.text},t.date=n.isValid()?n.toISOString():null,t.observations=(t.observations||[]).filter(this.filterObservation),t.orgPropositions=(t.orgPropositions||[]).map(function(t,i){return t.who=a(e(r[i])),t}).filter(this.filterProposition),t.techPropositions=(t.techPropositions||[]).map(function(t,i){return t.who=a(e(s[i])),t}).filter(this.filterProposition),t.participants=a(this.$id("participants")),t},filterObservation:function(t){return t.what=(t.what||"").trim(),t.why=(t.why||"").trim(),t.what.length>0&&t.why.length>0},filterProposition:function(t){return t.what=(t.what||"").trim(),t.when=(t.when||"").trim()||null,t.what.length>0},afterRender:function(){a.prototype.afterRender.call(this),this.$id("section").select2({data:l.sections.map(r)}),s.toggle(this.$id("status")),this.setUpOwnerSelect2(),this.setUpParticipantsSelect2(),this.renderObservations(),this.renderPropositions("orgPropositions"),this.renderPropositions("techPropositions"),this.$("input[autofocus]").focus()},setUpOwnerSelect2:function(){var t=this.model.get("owner"),e=p(this.$id("owner"),{textFormatter:function(t,e){return e}});t&&e.select2("data",{id:t.id,text:t.label})},setUpParticipantsSelect2:function(){var t=this.model.get("participants"),e=p(this.$id("participants"),{multiple:!0,textFormatter:function(t,e){return e}});t&&t.length&&e.select2("data",t.map(function(t){return{id:t.id,text:t.label}}))},setUpWhoSelect2:function(t,e){var i=p(t.find('input[name$="who"]'),{multiple:!0,textFormatter:function(t,e){return e}});e&&e.length&&i.select2("data",e.map(function(t){return{id:t.id,text:t.label}}))},renderObservations:function(){var t=this;this.$id("observations").html((this.model.get("observations")||[]).map(function(e){return h({observation:e,i:++t.rowIndex})}).join(""))},renderPropositions:function(t){var i=this,n=this.model.get(t)||[];this.$id(t).html(n.map(function(e){return i.createProposition(t,{what:e.what,who:"",when:e.when?o.format(e.when,"YYYY-MM-DD"):""})}).join("")),this.$id(t).find("tr").each(function(t){i.setUpWhoSelect2(e(this),n[t].who)})},createProposition:function(t,e){return f({type:t,proposition:e,i:++this.rowIndex})},handleSuccess:function(){return localStorage.removeItem("MFS_LAST"),a.prototype.handleSuccess.apply(this,arguments)},showRidEditor:function(t,e){function o(e){r.popover("destroy").closest(".message").find(".minutesForSafetyCards-form-rid-message").html(n.t("FORM:MSG:"+t+":"+(e?"edit":"add"),{rid:e})),n.model.attributes[t]=e,n.$("input[name="+t+"]").val(e||"")}var n=this,r=n.$(e);if(r.next(".popover").length)return void r.popover("destroy");r.popover({placement:"auto top",html:!0,trigger:"manual",content:m({idPrefix:this.idPrefix,helpers:this.getTemplateHelpers(),property:t,rid:this.model.get(t)||""})}).popover("show");var s=r.next(".popover"),a=s.find(".form-control").select(),p=s.find(".btn-default"),d=s.find(".btn-link");d.on("click",function(){r.popover("destroy")}),a.on("keydown",function(t){if(13===t.keyCode)return!1}),a.on("keyup",function(t){if(13===t.keyCode)return p.click(),!1}),p.on("click",function(){a.prop("disabled",!0),p.prop("disabled",!0),d.prop("disabled",!0);var e=parseInt(a.val(),10)||0;if(e<=0)return o(null);var r=("nearMiss"===t?"/kaizen/orders":"/suggestions")+"/"+e,s=n.ajax({url:r});return s.fail(function(t){n.showErrorMessage(i("minutesForSafetyCards","FORM:ridEditor:"+(404===t.status?"notFound":"failure"))),a.prop("disabled",!1),p.prop("disabled",!1),d.prop("disabled",!1),(404===t.status?a:p).focus()}),s.done(function(){o(e)}),!1})}})});