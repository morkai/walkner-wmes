// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/idAndLabel","app/core/views/FormView","app/users/util/setUpUserSelect2","app/data/prodLines","app/kaizenOrders/dictionaries","../MinutesForSafetyCard","app/minutesForSafetyCards/templates/form","app/minutesForSafetyCards/templates/_formObservation","app/minutesForSafetyCards/templates/_formProposition"],function(t,i,e,o,n,r,s,a,p,h,c,d,l,u){"use strict";return s.extend({template:d,events:t.extend({"click #-addObservation":function(){this.$id("observations").append(l({observation:{what:"",why:""},i:++this.rowIndex}))},"click #-addOrgProposition":function(){var t=i(this.createProposition("orgPropositions",{what:"",who:"",when:""}));this.$id("orgPropositions").append(t),this.setUpWhoSelect2(t)},"click #-addTechProposition":function(){var t=i(this.createProposition("techPropositions",{what:"",who:"",when:""}));this.$id("techPropositions").append(t),this.setUpWhoSelect2(t)},"click .btn[data-remove]":function(t){this.$(t.target).closest("tr").fadeOut("fast",function(){i(this).remove()})}},s.prototype.events),initialize:function(){s.prototype.initialize.apply(this,arguments),this.rowIndex=0},serialize:function(){return t.extend(s.prototype.serialize.call(this),{})},checkValidity:function(t){return(t.observations||[]).length||(t.risks||[]).length||(t.difficulties||[]).length},handleInvalidity:function(){this.$id("addObservation").focus()},serializeToForm:function(){var t=this.model.toJSON();return t.date=o.format(t.date,"YYYY-MM-DD"),t},serializeForm:function(t){var e=this.$id("owner").select2("data"),n=o.getMoment(t.date,"YYYY-MM-DD"),r=this.$id("orgPropositions").find('input[name$="who"]'),s=this.$id("techPropositions").find('input[name$="who"]'),a=function(t){return(t.select2("data")||[]).map(function(t){return{id:t.id,label:t.text}})};return t.owner={id:e.id,label:e.text},t.date=n.isValid()?n.toISOString():null,t.observations=(t.observations||[]).filter(this.filterObservation),t.orgPropositions=(t.orgPropositions||[]).map(function(t,e){return t.who=a(i(r[e])),t}).filter(this.filterProposition),t.techPropositions=(t.techPropositions||[]).map(function(t,e){return t.who=a(i(s[e])),t}).filter(this.filterProposition),t.participants=a(this.$id("participants")),t},filterObservation:function(t){return t.what=(t.what||"").trim(),t.why=(t.why||"").trim(),t.what.length>0&&t.why.length>0},filterProposition:function(t){return t.what=(t.what||"").trim(),t.when=(t.when||"").trim()||null,t.what.length>0},afterRender:function(){s.prototype.afterRender.call(this),this.$id("section").select2({data:h.sections.map(r)}),this.setUpOwnerSelect2(),this.setUpParticipantsSelect2(),this.renderObservations(),this.renderPropositions("orgPropositions"),this.renderPropositions("techPropositions"),this.$("input[autofocus]").focus()},setUpOwnerSelect2:function(){var t=this.model.get("owner"),i=a(this.$id("owner"),{textFormatter:function(t,i){return i}});t&&i.select2("data",{id:t.id,text:t.label})},setUpParticipantsSelect2:function(){var t=this.model.get("participants"),i=a(this.$id("participants"),{multiple:!0,textFormatter:function(t,i){return i}});t&&t.length&&i.select2("data",t.map(function(t){return{id:t.id,text:t.label}}))},setUpWhoSelect2:function(t,i){var e=a(t.find('input[name$="who"]'),{multiple:!0,textFormatter:function(t,i){return i}});i&&i.length&&e.select2("data",i.map(function(t){return{id:t.id,text:t.label}}))},renderObservations:function(){var t=this;this.$id("observations").html((this.model.get("observations")||[]).map(function(i){return l({observation:i,i:++t.rowIndex})}).join(""))},renderPropositions:function(t){var e=this,n=this.model.get(t)||[];this.$id(t).html(n.map(function(i){return e.createProposition(t,{what:i.what,who:"",when:i.when?o.format(i.when,"YYYY-MM-DD"):""})}).join("")),this.$id(t).find("tr").each(function(t){e.setUpWhoSelect2(i(this),n[t].who)})},createProposition:function(t,i){return u({type:t,proposition:i,i:++this.rowIndex})}})});