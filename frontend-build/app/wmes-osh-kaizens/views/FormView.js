define(["underscore","app/user","app/time","app/viewport","app/core/views/FormView","app/core/util/formatResultWithDescription","app/users/util/setUpUserSelect2","app/wmes-osh-common/dictionaries","../Kaizen","app/wmes-osh-kaizens/templates/form"],function(e,t,i,s,l,o,a,n,c,d){"use strict";return l.extend({template:d,dialogClassName:"osh-entries-form-dialog",events:Object.assign({"change #-userWorkplace":function(){this.$id("userDivision").val(""),this.setUpUserDivisionSelect2()},"change #-workplace":function(){this.$id("division").val(""),this.$id("building").val(""),this.$id("location").val(""),this.setUpDivisionSelect2(),this.setUpBuildingSelect2(),this.setUpLocationSelect2()},"change #-division":function(){this.$id("building").val(""),this.$id("location").val(""),this.setUpBuildingSelect2(),this.setUpLocationSelect2()},"change #-building":function(){this.$id("location").val(""),this.setUpLocationSelect2()},"change #-attachments":function(){const e=this.$id("attachments"),t=this.options.editMode?5:2;e[0].setCustomValidity(e[0].files.length>t?this.t("wmes-osh-common","FORM:ERROR:tooManyFiles",{max:t}):"")},"click #-inProgress":function(){this.newStatus="inProgress";const e=this.$id("comment");if("verification"===this.model.get("status")&&!e.val().trim().replace(/[^a-zA-Z]+/g,"").length){const t=()=>{e.prop("required",!1)};e.prop("required",!0),e.one("blur",t)}this.$id("save").click(),setTimeout(()=>this.newStatus=null)},"click #-verification":function(){this.newStatus="verification";const e=this.$id("solution");if(!e.val().trim().replace(/[^a-zA-Z]+/g,"").length){const t=()=>{e.prop("required",!1)};e.prop("required",!0),e.one("blur",t)}this.$id("save").click(),setTimeout(()=>this.newStatus=null,1)},"click #-finished":function(){this.newStatus="finished";const e=this.$id("solution");if(!e.val().trim().replace(/[^a-zA-Z]+/g,"").length){const t=()=>{e.prop("required",!1)};e.prop("required",!0),e.one("blur",t)}this.$id("save").click(),setTimeout(()=>this.newStatus=null,1)},"click #-paused":function(){this.newStatus="paused";const e=this.$id("comment");if(!e.val().trim().replace(/[^a-zA-Z]+/g,"").length){const t=()=>{e.prop("required",!1)};e.prop("required",!0),e.one("blur",t)}this.$id("save").click(),setTimeout(()=>this.newStatus=null,1)},"click #-cancelled":function(){this.newStatus="cancelled";const e=this.$id("comment");if(!e.val().trim().replace(/[^a-zA-Z]+/g,"").length){const t=()=>{e.prop("required",!1)};e.prop("required",!0),e.one("blur",t)}this.$id("save").click(),setTimeout(()=>this.newStatus=null,1)}},l.prototype.events),getTemplateData:function(){return{today:i.getMoment().format("YYYY-MM-DD"),kinds:n.kinds.map(e=>({value:e.id,label:e.getLabel({long:!0}),title:e.get("description")})).sort((e,t)=>e.label.localeCompare(t.label)),can:{inProgress:c.can.inProgress(this.model),verification:c.can.verification(this.model),finished:c.can.finished(this.model),paused:c.can.paused(this.model),cancelled:c.can.cancelled(this.model)}}},serializeToForm:function(){const e=this.model.toJSON();return e.plannedAt&&(e.plannedAt=i.utc.format(e.plannedAt,"YYYY-MM-DD")),e},serializeForm:function(e){return this.newStatus&&(e.status=this.newStatus),e.userWorkplace=this.$id("userWorkplace").select2("data").id,e.userDivision=this.$id("userDivision").select2("data").id,e.workplace=this.$id("workplace").select2("data").id,e.division=this.$id("division").select2("data").id,e.building=this.$id("building").select2("data").id,e.location=this.$id("location").select2("data").id,e.implementers=a.getUserInfo(this.$id("implementers")),e.plannedAt=i.utc.getMoment(e.plannedAt,"YYYY-MM-DD").toISOString(),e},checkValidity:function(e){return console.log(e),!0},afterRender:function(){l.prototype.afterRender.apply(this,arguments),this.setUpUserWorkplaceSelect2(),this.setUpUserDivisionSelect2(),this.setUpWorkplaceSelect2(),this.setUpDivisionSelect2(),this.setUpBuildingSelect2(),this.setUpLocationSelect2(),this.setUpImplementersSelect2(),this.toggleKind()},setUpUserWorkplaceSelect2:function(){const e=this.$id("userWorkplace");if(this.options.editMode){const t=n.workplaces.get(this.model.get("userWorkplace"));return e.val(t?t.id:"").select2({width:"100%",placeholder:" ",data:t?[{id:t.id,text:t.getLabel({long:!0}),model:t}]:[]}),void e.select2("enable",!1)}e.prop("required",!0).closest(".form-group").addClass("has-required-select2").find(".control-label").addClass("is-required");let i=n.workplaces.get(+e.val());i&&(i={id:i.id,text:i.getLabel({long:!0}),model:i});const s={};n.workplaces.forEach(e=>{e.get("active")&&(s[e.id]={id:e.id,text:e.getLabel({long:!0}),model:e})}),i&&!s[i.id]&&(s[i.id]=i),e.select2({width:"100%",data:Object.values(s).sort((e,t)=>e.text.localeCompare(t.text))});const l=n.workplaces.get(t.data.oshWorkplace);this.options.editMode&&i?e.select2("enable",!1).select2("data",i):l?e.select2("enable",!1).select2("data",{id:l.id,text:l.getLabel({long:!0}),model:l}):e.select2("enable",!0)},setUpUserDivisionSelect2:function(){const e=this.$id("userDivision");if(this.options.editMode){const t=n.divisions.get(this.model.get("userDivision"));return e.val(t?t.id:"").select2({width:"100%",placeholder:" ",data:t?[{id:t.id,text:t.getLabel({long:!0}),model:t}]:[]}),void e.select2("enable",!1)}const i=+this.$id("userWorkplace").val();let s=n.divisions.get(+e.val());s&&(s={id:s.id,text:s.getLabel({long:!0}),model:s});const l={};n.divisions.forEach(e=>{e.get("active")&&e.get("workplace")===i&&(l[e.id]={id:e.id,text:e.getLabel({long:!0}),model:e})}),s&&!l[s.id]&&s.model.get("workplace")===i&&(l[s.id]=s);const o=Object.values(l).sort((e,t)=>e.text.localeCompare(t.text));let a=" ",c=!0;i||0!==o.length||(a=this.t("FORM:placeholder:noUserWorkplace"),c=!1),e.select2({width:"100%",placeholder:a,data:o});const d=n.divisions.get(t.data.oshDivision);this.options.editMode&&s?e.select2("enable",!1).select2("data",s):d?e.select2("enable",!1).select2("data",{id:d.id,text:d.getLabel({long:!0}),model:d}):(e.select2("enable",c),1===o.length?e.select2("data",o[0]):l[e.val()]||e.select2("data",null).val(""))},setUpWorkplaceSelect2:function(){const e=this.$id("workplace");let t=n.workplaces.get(+e.val());t&&(t={id:t.id,text:t.getLabel({long:!0}),model:t});const i={};n.workplaces.forEach(e=>{e.get("active")&&(i[e.id]={id:e.id,text:e.getLabel({long:!0}),model:e})}),t&&!i[t.id]&&(i[t.id]=t),e.select2({width:"100%",data:Object.values(i).sort((e,t)=>e.text.localeCompare(t.text))})},setUpDivisionSelect2:function(){const e=this.$id("division"),t=+this.$id("workplace").val();let i=n.divisions.get(+e.val());i&&(i={id:i.id,text:i.getLabel({long:!0}),model:i});const s={};n.divisions.forEach(e=>{e.get("active")&&e.hasWorkplace(t)&&(s[e.id]={id:e.id,text:e.getLabel({long:!0}),model:e})}),i&&!s[i.id]&&(s[i.id]=i);const l=Object.values(s).sort((e,t)=>e.text.localeCompare(t.text));e.select2({width:"100%",placeholder:t?" ":this.t("FORM:placeholder:noWorkplace"),data:l}),1===l.length?e.select2("data",l[0]):s[e.val()]||e.val("").select2("data",null),e.select2("enable",!!t)},setUpBuildingSelect2:function(){const e=this.$id("building"),t=+this.$id("division").val(),i={};n.buildings.forEach(e=>{e.get("active")&&e.hasDivision(t)&&(i[e.id]={id:e.id,text:e.getLabel({long:!0}),model:e})});const s=Object.values(i).sort((e,t)=>e.text.localeCompare(t.text));e.select2({width:"100%",placeholder:t?" ":this.t("FORM:placeholder:noDivision"),data:s}),1===s.length&&e.select2("data",s[0]),e.select2("enable",!!t)},setUpLocationSelect2:function(){const e=this.$id("location"),t=+this.$id("building").val(),i={};n.locations.forEach(e=>{e.get("active")&&e.hasBuilding(t)&&(i[e.id]={id:e.id,text:e.getLabel({long:!0}),model:e})});const s=Object.values(i).sort((e,t)=>e.text.localeCompare(t.text));e.select2({width:"100%",placeholder:t?" ":this.t("FORM:placeholder:noBuilding"),data:s}),1===s.length&&e.select2("data",s[0]),e.select2("enable",!!t)},setUpImplementersSelect2:function(){const e=this.$id("implementers");a(e,{width:"100%",multiple:!0,maximumSelectionSize:2});const i=this.model.get("creator")||t.getInfo(),s=(this.model.get("implementers")||[]).find(e=>e.id!==i.id),l=[{id:i.id,text:i.label,locked:!0}];s&&l.push({id:s.id,text:s.label}),e.select2("data",l)},toggleKind:function(){const e=this.$('input[name="kind"]');e.length&&!e.filter(":checked").length&&e.first().click(),e.prop("disabled",!c.can.editKind(this.model,this.options.editMode))},request:function(){s.msg.saving();var e=l.prototype.request.apply(this,arguments);return e.always(function(){s.msg.saved()}),e},submitRequest:function(e,t){const i=this,o=new FormData;let a=0;if(i.$('input[type="file"]').each(function(){for(let e=0;e<this.files.length;++e)o.append("file",this.files[e]),a+=1}),0===a)return l.prototype.submitRequest.call(i,e,t);s.msg.saving();const n=i.ajax({type:"POST",url:"/osh/attachments",data:o,processData:!1,contentType:!1});n.done(o=>{t.attachments={added:o},l.prototype.submitRequest.call(i,e,t),s.msg.saved()}),n.fail(()=>{s.msg.saved(),i.showErrorMessage(i.t("wmes-osh-common","FORM:ERROR:upload")),e.attr("disabled",!1)})},onDialogShown:function(){this.$id("subject").focus()}})});