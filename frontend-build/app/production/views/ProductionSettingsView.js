define(["underscore","app/i18n","app/user","app/core/util/idAndLabel","app/core/util/formatResultWithDescription","app/data/downtimeReasons","app/data/orgUnits","app/settings/views/SettingsView","app/production/templates/lineAutoDowntimeRow","app/production/templates/settings"],function(t,e,i,o,n,s,a,u,l,r){"use strict";return u.extend({clientUrl:"#production;settings",template:r,events:t.assign({"change input[data-setting]":function(t){this.updateSetting(t.target.name,t.target.value)},"change #-lineAutoDowntimes-groups":function(t){t.added?this.selectAutoDowntimeGroup(t.added.id):this.clearAutoDowntimeGroup()},"change #-lineAutoDowntimes-group":"updateAutoDowntimeGroupName","input #-lineAutoDowntimes-group":"updateAutoDowntimeGroupName","change #-lineAutoDowntimes-lines":"updateAutoDowntimeLines","change #-lineAutoDowntimes-reasons":function(t){if(t.added){var e={reason:t.added.id,when:"always",after:"",time:[]};this.selectedAutoDowntimeGroup.downtimes.push(e),this.addAutoDowntimeRow(e),this.scheduleAutoDowntimeSave(),this.$id("lineAutoDowntimes-reasons").select2("val",null)}},'click .btn[data-auto-downtime-action="up"]':function(t){var e=this.$(t.target).closest("tr"),i=e.prev();i.length&&(e.insertBefore(i),this.updateAutoDowntimes())},'click .btn[data-auto-downtime-action="down"]':function(t){var e=this.$(t.target).closest("tr"),i=e.next();i.length&&(e.insertAfter(i),this.updateAutoDowntimes())},'click .btn[data-auto-downtime-action="remove"]':function(t){var e=this.$(t.target).closest("tr").fadeOut("fast",()=>{e.remove(),this.updateAutoDowntimes()})},'change [name$="when"]':function(t){this.toggleAutoDowntimeOptions(this.$(t.currentTarget).closest("tr")),this.updateAutoDowntimes()},'change [name$="after"]':function(t){this.toggleAutoDowntimeOptions(this.$(t.currentTarget).closest("tr")),this.updateAutoDowntimes()},'change [name$="time"]':function(t){for(var e,i=/(?:([0-9]+)\s*@\s*)?([0-9]{1,2}):([0-9]{1,2})/g,o=[];null!==(e=i.exec(t.target.value));){var n=+e[1]||0;n<0?n=0:n>480&&(n=480);var s=+e[2];if(!(s>=24)){var a=+e[3];a>=60||(s<10&&(s="0"+s),a<10&&(a="0"+a),o.push((n?n+"@":"")+s+":"+a))}}t.target.value=o.join(", "),this.updateAutoDowntimes()}},u.prototype.events),initialize:function(){u.prototype.initialize.apply(this,arguments),this.autoDowntimeI=0,this.selectedAutoDowntimeGroup=null},getTemplateData:function(){var t=!i.isAllowedTo("SUPER")&&i.isAllowedTo("PROD_DATA:MANAGE:SPIGOT_ONLY");return{subtabs:t?[{_id:"spigot"}]:[{_id:"taktTime"},{_id:"downtimes"},{_id:"spigot"},{_id:"bomChecker",redirect:"#orderBomMatchers"},{_id:"componentLabels",redirect:"#componentLabels"}],onlySpigot:t}},afterRender:function(){u.prototype.afterRender.apply(this,arguments);const t=s.map(o),e=a.getActiveByType("prodLine").map(o).sort((t,e)=>t.text.localeCompare(e.text,void 0,{numeric:!0,ignorePunctuation:!0}));this.$id("rearmDowntimeReason").select2({allowClear:!0,placeholder:" ",data:t}),this.$id("spigotLines").select2({allowClear:!0,placeholder:" ",multiple:!0,data:e}),this.$id("taktTime-ignoredLines").select2({allowClear:!0,placeholder:" ",multiple:!0,data:e}),this.$id("taktTime-ignoredDowntimes").select2({allowClear:!0,placeholder:" ",multiple:!0,data:t}),this.setUpAutoDowntimeGroups(),this.$id("lineAutoDowntimes-reasons").select2({width:"400px",placeholder:this.t("settings:lineAutoDowntimes:reasons:placeholder"),data:s.map(t=>({id:t.id,text:t.id+" - "+t.getLabel()}))}),this.$id("lineAutoDowntimes-lines").select2({placeholder:" ",multiple:!0,data:a.getActiveByType("prodLine").filter(t=>{const e=a.getSubdivisionFor(t);return e&&"assembly"===e.get("type")}).map(o).sort((t,e)=>t.text.localeCompare(e.text,void 0,{numeric:!0,ignorePunctuation:!0}))}),this.selectedAutoDowntimeGroup?this.selectAutoDowntimeGroup(this.selectedAutoDowntimeGroup.id):this.clearAutoDowntimeGroup(),this.resizeTaktTimeCoeffs()},resizeTaktTimeCoeffs:function(){const t=this.$id("taktTime-coeffs");t.prop("rows",(t.val()||"").split("\n").length+5)},setUpAutoDowntimeGroups:function(){this.$id("lineAutoDowntimes-groups").select2({allowClear:!0,placeholder:this.t("settings:lineAutoDowntimes:groups:placeholder"),data:(this.settings.getValue("lineAutoDowntimes")||[]).map(t=>{const e=t.lines.join(", ");return{id:t.id,text:t.name,lines:e,search:(t.name.toUpperCase()+" "+e.toUpperCase()).replace(/[^A-Z0-9]+/g,"")}}),formatResult:n.bind(null,"text","lines"),matcher:(t,e,i)=>i.search.includes(t.toUpperCase().replace(/[^A-Z0-9]+/g,""))}),this.selectedAutoDowntimeGroup&&this.$id("lineAutoDowntimes-groups").select2("val",this.selectedAutoDowntimeGroup.id)},selectAutoDowntimeGroup:function(e){const i=t.find(this.settings.getValue("lineAutoDowntimes"),t=>t.id===e);i&&(this.$id("lineAutoDowntimes-groups").select2("val",i.id),this.$id("lineAutoDowntimes-group").val(i.name),this.$id("lineAutoDowntimes-lines").select2("val",i.lines),this.$id("lineAutoDowntimes-body").html(""),i.downtimes.forEach(this.addAutoDowntimeRow,this),this.selectedAutoDowntimeGroup=t.clone(i))},addAutoDowntimeRow:function(t){const e=this.renderPartial(l,{autoDowntime:{i:++this.autoDowntimeI,reason:o(s.get(t.reason)),when:t.when,after:t.after||"",time:t.time.map(t=>(t.d>0?`${t.d}@`:"")+t.h.toString().padStart(2,"0")+":"+t.m.toString().padStart(2,"0")).join(", ")}});this.$id("lineAutoDowntimes-body").append(e),e.find('input[name$="after"]').select2({width:"400px",placeholder:this.t("settings:lineAutoDowntimes:when:after:placeholder"),data:s.filter(e=>e.id!==t.reason).map(o)}),this.toggleAutoDowntimeOptions(e)},toggleAutoDowntimeOptions:function(t){const e=t.find('select[name$="when"]').val(),i=t.find('input[name$="after"]'),o=t.find('input[name$="time"]');i.select2("container").toggleClass("hidden","after"!==e),o.toggleClass("hidden","time"!==e)},clearAutoDowntimeGroup:function(){this.$id("lineAutoDowntimes-groups").select2("val",null),this.$id("lineAutoDowntimes-group").val(""),this.$id("lineAutoDowntimes-lines").select2("val",[]),this.$id("lineAutoDowntimes-body").html(""),this.selectedAutoDowntimeGroup={id:Date.now().toString(36).toUpperCase()+Math.round(1e6+8999998*Math.random()).toString(36).toUpperCase(),name:"",lines:[],downtimes:[]}},updateAutoDowntimeGroupName:function(){this.selectedAutoDowntimeGroup.name=this.$id("lineAutoDowntimes-group").val(),this.scheduleAutoDowntimeSave()},updateAutoDowntimeLines:function(){var t=this.$id("lineAutoDowntimes-lines").val();this.selectedAutoDowntimeGroup.lines=t.length?t.split(","):[],this.scheduleAutoDowntimeSave()},updateAutoDowntimes:function(){const t=[];this.$id("lineAutoDowntimes-body").find("tr").each(function(){const e={reason:this.querySelector('[name$="reason"]').value,when:this.querySelector('[name$="when"]').value,after:this.querySelector('[name$="after"]').value,time:this.querySelector('[name$="time"]').value.split(",").map(t=>{var e=t.match(/(?:([0-9]+)@)?([0-9]{1,2}):([0-9]{1,2})/);return e?{h:+e[2],m:+e[3],d:+e[1]||0}:null}).filter(t=>!!t)};"after"!==e.when&&(e.after=""),"time"!==e.when&&(e.time=[]),t.push(e)}),this.selectedAutoDowntimeGroup.downtimes=t,this.scheduleAutoDowntimeSave()},scheduleAutoDowntimeSave:function(){this.saveAutoDowntimesTimer&&clearTimeout(this.saveAutoDowntimesTimer),this.saveAutoDowntimesTimer=setTimeout(this.saveAutoDowntimes.bind(this),1e3)},saveAutoDowntimes:function(){this.saveAutoDowntimesTimer=null;let e=[].concat(this.settings.getValue("lineAutoDowntimes")||[]);const i=this.selectedAutoDowntimeGroup,o=t.findIndex(e,t=>t.id===i.id),n=e[o];n?e[o]=i:(e.push(i),e.sort((t,e)=>t.name.localeCompare(e.name))),e=e.filter(t=>t.name.length>0&&t.lines.length>0&&t.downtimes.length>0),n||(this.setUpAutoDowntimeGroups(),this.$id("lineAutoDowntimes-groups").select2("val",i.id)),this.updateSetting("production.lineAutoDowntimes",e)},updateSetting:function(t){/^lineAutoDowntime/.test(t)||u.prototype.updateSetting.apply(this,arguments)},updateSettingField:function(t){"production.lineAutoDowntimes"===t.id&&this.updateLineAutoDowntimesFields()},updateLineAutoDowntimesFields:function(){this.setUpAutoDowntimeGroups();const e=this.selectedAutoDowntimeGroup,i=t.find(this.settings.getValue("lineAutoDowntimes"),t=>t.id===e.id);i&&(t.isEqual(e,i)||this.selectAutoDowntimeGroup(i.id))}})});