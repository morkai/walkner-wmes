// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/buttonGroup","app/core/util/idAndLabel","app/core/views/FormView","app/users/util/setUpUserSelect2","app/d8Entries/dictionaries","../D8Entry","app/d8Entries/templates/form","app/d8Entries/templates/formStripRow"],function(e,t,i,s,a,r,d,n,o,l,p,u,c){"use strict";function m(e,t){return t}return n.extend({template:u,stripIndex:0,events:e.extend({"click #-addStrip":function(){this.addStrip({})},'click [data-action="removeStrip"]':function(e){this.$(e.target).closest("tr").remove()},'change [name="status"]':function(){this.toggleRequiredFlags()},'change [name="area"]':function(){var e=l.areas.get(this.$id("area").val());if(e){var t=e.get("manager");t&&this.$id("manager").select2("data",{id:t.id,text:t.label})}},'input [name="rid"]':function(e){e.target.setCustomValidity("")},'blur [name="rid"]':function(e){e.target.setCustomValidity("")},'change [type="date"]':function(e){var a=s.getMoment(e.target.value,"YYYY-MM-DD"),r=a.isValid()?a.diff(new Date,"days"):0,d=Math.abs(r),n=this.$(e.target),o="TD"===n.parent()[0].tagName?n.parent():n.closest(".form-group"),l=o.find(".help-block");return"crsRegisterDate"===e.target.name&&this.$id("d5PlannedCloseDate").val(a.add(28,"days").format("YYYY-MM-DD")),7>=d?(e.target.setCustomValidity(""),void l.remove()):(l.length||(l=t('<p class="help-block"></p>')),void l.text(i("d8Entries","FORM:help:date:diff",{dir:r>0?"future":"past",days:d})).appendTo(o))},"click #-d5CloseDateOk":function(){this.toggleD5CloseDateOk(!this.$id("d5CloseDateOk").hasClass("btn-success"))},"change #-d5CloseDate":function(e){var t=this.model.getUserRoles();if(!t.admin&&!t.manager){var i=s.getMoment(this.model.get("d5CloseDate")).format("YYYY-MM-DD"),a=e.target.value,r=!!this.model.get("d5CloseDateOk");this.toggleD5CloseDateOk(a===i?r:!1)}}},n.prototype.events),serialize:function(){return e.extend(n.prototype.serialize.call(this),{nextYear:s.getMoment().add(1,"year").format("YYYY-MM-DD"),statuses:l.statuses,userRoles:this.model.getUserRoles()})},checkValidity:function(){return!0},submitRequest:function(e,t){var s=this,a=new FormData,r=s.$('input[type="file"]')[0];if(!r.files.length)return n.prototype.submitRequest.call(s,e,t);a.append("attachment",r.files[0]),this.$el.addClass("is-uploading");var d=s.ajax({type:"POST",url:"/d8/entries;upload",data:a,processData:!1,contentType:!1});d.done(function(i){t.attachment=i,n.prototype.submitRequest.call(s,e,t)}),d.fail(function(){s.showErrorMessage(i("d8Entries","FORM:ERROR:upload")),e.attr("disabled",!1)}),d.always(function(){s.$el.removeClass("is-uploading")})},serializeToForm:function(){var t=this.model.toJSON();return p.DATE_PROPERTIES.forEach(function(e){t[e]&&(t[e]=s.format(t[e],"YYYY-MM-DD"))}),t.strips=e.map(t.strips,function(e){return{no:e.no,family:e.family}}),t.subscribers="",t},serializeForm:function(t){var i=this.$id("owner");if(i.length){var a=i.select2("data");t.owner=a?{id:a.id,label:a.text}:null;var r=this.$id("manager").select2("data");t.manager=r?{id:r.id,label:r.text}:null,t.members=this.$id("members").select2("data").map(function(e){return{id:e.id,label:e.text}}).filter(function(e){return!!e.id})}return t.subscribers=this.$id("subscribers").select2("data").map(function(e){return{id:e.id,label:e.text}}),t.strips=e.map(t.strips,function(e){return{no:e.no||"",family:e.family||""}}),t.d5CloseDateOk=this.$id("d5CloseDateOk").hasClass("btn-success"),p.DATE_PROPERTIES.forEach(function(e){var i=s.getMoment(t[e],"YYYY-MM-DD");t[e]=i.isValid()?i.toISOString():null}),delete t.attachment,t},afterRender:function(){n.prototype.afterRender.call(this),this.$id("area").select2({data:l.areas.map(d)}),this.$id("entrySource").select2({data:l.entrySources.map(d)}),this.$id("problemSource").select2({data:l.problemSources.map(d)}),r.toggle(this.$id("status")),o(this.$id("subscribers"),{multiple:!0,textFormatter:m}),this.setUpOwnerSelect2(),this.setUpManagerSelect2(),this.setUpMembersSelect2(),this.setUpStrips(),this.toggleD5CloseDateOk(!!this.model.get("d5CloseDateOk")),this.options.editMode?this.disableFields():(this.$id("crsRegisterDate").val(s.getMoment().format("YYYY-MM-DD")),this.$id("d5PlannedCloseDate").val(s.getMoment().add(28,"days").format("YYYY-MM-DD")))},toggleD5CloseDateOk:function(e){var t=this.$id("d5CloseDateOk").removeClass("btn-success btn-danger"),i=t.find(".fa").removeClass("fa-thumbs-up fa-thumbs-down");t.addClass(e?"btn-success":"btn-danger"),i.addClass(e?"fa-thumbs-up":"fa-thumbs-down")},disableFields:function(){var e=this.model.getUserRoles();e.admin||(this.$id("rid").prop("readonly",!0),this.$id("status").find(".btn").addClass("disabled"),this.$id("subject").prop("readonly",!0),this.$id("area").select2("disable",!0),this.$id("manager").select2("disable",!0),this.$id("entrySource").select2("disable",!0),e.manager||(this.$id("owner").select2("disable",!0),this.$id("d5CloseDateOk").addClass("disabled")),e.manager||e.owner||this.$id("members").select2("disable",!0),e.owner||(this.$id("d5CloseDate").prop("readonly",!0),this.$id("d8CloseDate").prop("readonly",!0)),this.$id("strips").find("input").prop("disabled",!0),this.$id("strips").parent().find(".actions").remove(),this.$id("addStrip").remove(),this.$id("problemSource").select2("disable",!0),this.$id("d5PlannedCloseDate").prop("readonly",!0),this.$id("crsRegisterDate").prop("readonly",!0),this.$id("problemDescription").prop("readonly",!0))},setUpOwnerSelect2:function(){var e=this.model.get("owner"),t=o(this.$id("owner"),{textFormatter:m});e&&t.select2("data",{id:e.id,text:e.label})},setUpManagerSelect2:function(){var e=this.model.get("manager"),t=o(this.$id("manager"),{textFormatter:m});e&&t.select2("data",{id:e.id,text:e.label})},setUpMembersSelect2:function(){var e=this.options.editMode,t=this.model,i=[];if(e){var s=t.get("members");Array.isArray(s)&&s.length&&(i=s.map(function(e){return{id:e.id,text:e.label}}))}o(this.$id("members"),{multiple:!0,textFormatter:m}).select2("data",i)},setUpStrips:function(){this.options.editMode?e.forEach(this.model.get("strips"),this.addStrip,this):this.addStrip({})},toggleRequiredFlags:function(){var e="closed"===r.getValue(this.$id("status"));this.$id("d8CloseDate").prop("required",e).closest(".form-group").find(".control-label").toggleClass("is-required",e)},addStrip:function(e){this.$id("strips").append(c({i:this.stripIndex++,strip:{no:e.no||"",family:e.family||""}}))},handleFailure:function(e){var t=(e.responseJSON||{}).error||{code:0};if(11e3===t.code){var s=this;return s.$id("rid")[0].setCustomValidity(i("d8Entries","FORM:ERROR:duplicateId")),void setTimeout(function(){s.$id("submit").click()},1)}return n.prototype.handleFailure.apply(this,arguments)}})});