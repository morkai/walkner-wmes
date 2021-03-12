define(["underscore","app/user","app/time","app/viewport","app/wmes-osh-common/dictionaries","app/wmes-osh-common/views/FormView","../Accident","app/wmes-osh-accidents/templates/form"],function(t,e,i,a,o,s,n,l){"use strict";return s.extend({template:l,dialogClassName:"osh-entries-form-dialog",events:Object.assign({"change #-workplace":function(){this.$id("department").val(""),this.$id("building").val(""),this.$id("location").val(""),this.$id("station").val(""),this.setUpDepartmentSelect2(),this.setUpBuildingSelect2(),this.setUpLocationSelect2(),this.setUpStationSelect2()},"change #-department":function(){this.$id("building").val(""),this.$id("location").val(""),this.$id("station").val(""),this.setUpBuildingSelect2(),this.setUpLocationSelect2(),this.setUpStationSelect2()},"change #-building":function(){this.$id("location").val(""),this.$id("station").val(""),this.setUpLocationSelect2(),this.setUpStationSelect2()},"change #-location":function(){this.$id("station").val(""),this.setUpStationSelect2()},'change input[type="file"][data-max]':function(t){const e=t.currentTarget,i=+e.dataset.max;e.setCustomValidity(e.files.length>i?this.t("wmes-osh-common","FORM:ERROR:tooManyFiles",{max:i}):"")}},s.prototype.events),getTemplateData:function(){return{today:i.getMoment().format("YYYY-MM-DD")}},serializeToForm:function(){const t=this.model.toJSON();if(t.eventDate){const e=i.utc.getMoment(t.eventDate);t.eventDate=e.format("YYYY-MM-DD"),t.eventTime=e.format("HH:mm")}else{const e=i.getMoment();t.eventDate=e.format("YYYY-MM-DD"),t.eventTime=e.format("HH:mm")}return delete t.coordinators,delete t.attachments,delete t.users,delete t.changes,t},serializeForm:function(t){const e=this.$id("workplace").select2("data");return t.division=e.model.get("division"),t.workplace=e.id,t.department=this.$id("department").select2("data").id,t.building=parseInt(this.$id("building").val(),10)||0,t.location=parseInt(this.$id("location").val(),10)||0,t.station=parseInt(this.$id("station").val(),10)||0,t.eventDate=i.utc.getMoment(`${t.eventDate} ${t.eventTime||"00:00"}:00`,"YYYY-MM-DD HH:mm:ss").toISOString(),delete t.eventTime,t},afterRender:function(){s.prototype.afterRender.apply(this,arguments),this.setUpWorkplaceSelect2(),this.setUpDepartmentSelect2(),this.setUpBuildingSelect2(),this.setUpLocationSelect2(),this.setUpStationSelect2()},setUpWorkplaceSelect2:function(){const t=this.$id("workplace");let e=o.workplaces.get(+t.val());e&&(e={id:e.id,text:e.getLabel({long:!0}),model:e});const i={};o.workplaces.forEach(t=>{t.get("active")&&(i[t.id]={id:t.id,text:t.getLabel({long:!0}),model:t})}),e&&!i[e.id]&&(i[e.id]=e),t.select2({width:"100%",data:Object.values(i).sort((t,e)=>t.text.localeCompare(e.text))}),t.select2("enable")},setUpDepartmentSelect2:function(){const t=this.$id("department");let e=o.departments.get(+t.val());e&&(e={id:e.id,text:e.getLabel({long:!0}),model:e});const i=+this.$id("workplace").val(),a={};o.departments.forEach(t=>{t.get("active")&&t.hasWorkplace(i)&&(a[t.id]={id:t.id,text:t.getLabel({long:!0}),model:t})}),e&&!a[e.id]&&(a[e.id]=e);const s=Object.values(a).sort((t,e)=>t.text.localeCompare(e.text));t.select2({width:"100%",placeholder:i?" ":this.t("FORM:placeholder:noWorkplace"),data:s}),1===s.length?t.select2("data",s[0]):a[t.val()]||t.val("").select2("data",null),t.select2("enable",!!i)},setUpBuildingSelect2:function(){const t=this.$id("building"),e=+this.$id("department").val(),i={};o.buildings.forEach(t=>{t.get("active")&&t.hasDepartment(e)&&(i[t.id]={id:t.id,text:t.getLabel({long:!0}),model:t})});const a=Object.values(i).sort((t,e)=>t.text.localeCompare(e.text));t.select2({width:"100%",placeholder:e?" ":this.t("FORM:placeholder:noDepartment"),allowClear:!0,data:a}),this.options.editMode||1!==a.length||t.select2("data",a[0]),t.select2("enable",a.length>0&&!!e)},setUpLocationSelect2:function(){const t=this.$id("location"),e=+this.$id("building").val(),i={};o.locations.forEach(t=>{t.get("active")&&t.hasBuilding(e)&&(i[t.id]={id:t.id,text:t.getLabel({long:!0}),model:t})});const a=Object.values(i).sort((t,e)=>t.text.localeCompare(e.text));t.select2({width:"100%",placeholder:e?" ":this.t("FORM:placeholder:noBuilding"),allowClear:!0,data:a}),this.options.editMode||1!==a.length||t.select2("data",a[0]),t.select2("enable",a.length>0&&!!e)},setUpStationSelect2:function(){const t=this.$id("station"),e=+this.$id("location").val(),i={};o.stations.forEach(t=>{t.get("active")&&t.hasLocation(e)&&(i[t.id]={id:t.id,text:t.getLabel({long:!0}),model:t})});const a=Object.values(i).sort((t,e)=>t.text.localeCompare(e.text));t.select2({width:"100%",placeholder:e?" ":this.t("FORM:placeholder:noLocation"),allowClear:!0,data:a}),this.options.editMode||1!==a.length||t.select2("data",a[0]),t.select2("enable",a.length>0&&!!e)},getSaveOptions:function(){return{wait:!0,patch:!0}},request:function(){a.msg.saving();const t=s.prototype.request.apply(this,arguments);return t.always(()=>{a.msg.saved()}),t},submitRequest:function(t,e){const i=this,o=new FormData;let n=0;if(i.$('input[type="file"]').each(function(){const t=this.name.replace("attachments.","");for(let e=0;e<this.files.length;++e)o.append(t,this.files[e]),n+=1}),0===n)return s.prototype.submitRequest.call(i,t,e);a.msg.saving();const l=i.ajax({type:"POST",url:"/osh/attachments",data:o,processData:!1,contentType:!1});l.done(o=>{e.attachments={added:o},s.prototype.submitRequest.call(i,t,e),a.msg.saved()}),l.fail(()=>{a.msg.saved(),i.showErrorMessage(i.t("wmes-osh-common","FORM:ERROR:upload")),t.attr("disabled",!1)})},onDialogShown:function(){this.$id("subject").focus()}})});