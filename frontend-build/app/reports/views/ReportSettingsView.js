define(["underscore","app/user","app/core/util/idAndLabel","app/data/orgUnits","app/data/aors","app/data/downtimeReasons","app/data/delayReasons","app/data/orderStatuses","app/settings/views/SettingsView","app/reports/templates/settings"],function(e,t,i,n,a,s,o,r,l,d){"use strict";return l.extend({clientUrl:"#reports;settings",defaultTab:"efficiency",template:d,localTopics:{"divisions.synced":"render","subdivisions.synced":"render","aors.synced":"render","downtimeReasons.synced":"render"},events:e.assign({'change [name$="prodTask"]':"updateSettingOnInputChange",'change [name$="id"]':"updateSettingOnInputChange",'change [name$="aors"]':"updateSettingOnInputChange","change #-downtimesInAors-specificAor":"updateSettingOnInputChange",'change [name$="Subdivision"]':"updateSettingOnInputChange",'change [name$="DowntimeReasons"]':"updateSettingOnInputChange",'change [name$="ProdTasks"]':"updateSettingOnInputChange",'change [name$="ProdFlows"]':"updateSettingOnInputChange","change [data-select2-setting]":"updateSettingOnInputChange",'change [name="downtimesInAorsType"]':function(e){var t="own"===e.target.value?"own":"";this.updateSetting("reports.downtimesInAors.aors",t),this.toggleDowntimesInAors(t)}},l.prototype.events),initialize:function(){l.prototype.initialize.apply(this,arguments),this.userPrivileges={}},serialize:function(){return e.assign(l.prototype.serialize.call(this),{divisions:this.serializeProdDivisions(),colors:this.serializeColors()})},serializeProdDivisions:function(){return n.getAllDivisions().filter(function(e){return"prod"===e.get("type")}).map(function(e){return{_id:e.id,label:e.getLabel(),subdivisions:n.getChildren(e).map(function(e){return{_id:e.id,label:e.getLabel()}}).sort(function(e,t){return e.label.localeCompare(t.label,void 0,{numeric:!0,ignorePunctuation:!0})})}}).sort(function(e,t){return e.label.localeCompare(t.label,void 0,{numeric:!0,ignorePunctuation:!0})})},serializeStorageSubdivisions:function(){return n.getAllByType("subdivision").filter(function(e){return"storage"===e.get("type")}).map(function(e){return{id:e.id,text:e.get("division")+" \\ "+e.get("name")}}).sort(function(e,t){return e.text.localeCompare(t.text,void 0,{numeric:!0,ignorePunctuation:!0})})},serializeColors:function(){var e={};return["quantityDone","lmh","mmh","efficiency","productivity","productivityNoWh","scheduledDowntime","unscheduledDowntime","clipOrderCount","clipProduction","clipEndToEnd","direct","directRef","indirect","indirectRef","warehouse","warehouseRef","absence","absenceRef","dirIndir","dirIndirRef","eff","ineff","hrTotal"].forEach(function(t){e[t]=this.settings.getColor(t)},this),e},afterRender:function(){l.prototype.afterRender.call(this);var e=this.serializeStorageSubdivisions();this.$id("wh-comp-id").select2({width:"374px",allowClear:!0,placeholder:" ",data:e}),this.$id("wh-finGoods-id").select2({width:"374px",allowClear:!0,placeholder:" ",data:e}),this.$('input[name$="prodTask"]').select2({width:"374px",allowClear:!0,placeholder:" ",data:this.prodTasks.serializeToSelect2()});var t=a.map(i);this.$('input[name$="aors"]').select2({allowClear:!0,multiple:!0,placeholder:" ",data:t}),this.$id("downtimesInAors-specificAor").select2({allowClear:!0,placeholder:" ",data:t}),this.setUpLeanSettings(),this.setUpClipSettings(),this.onSettingsChange(this.settings.get("reports.downtimesInAors.statuses")),this.onSettingsChange(this.settings.get("reports.clip.ignoredMrps")),this.toggleDowntimesInAors(this.settings.getValue("downtimesInAors.aors"))},shouldAutoUpdateSettingField:function(e){return"reports.clip.ignoredMrps"!==e.id},updateSettingField:function(e){var t=this.$('input[name="'+e.id+'"]');return"reports.clip.ignoredMrps"===e.id?t.select2("data",e.getValue().map(function(e){return{id:e,text:e}})):t.hasClass("select2-offscreen")?t.select2("val",e.getValue()):void 0},toggleDowntimesInAors:function(e){null===e||"own"===e?(this.$('input[name="downtimesInAorsType"][value="own"]').prop("checked",!0),this.$id("downtimesInAors-aors").select2("enable",!1).select2("data",null)):(this.$('input[name="downtimesInAorsType"][value="specific"]').prop("checked",!0),this.$id("downtimesInAors-aors").select2("enable",!0))},toggleTabPrivileges:function(){var e=this.userPrivileges={all:!1};t.isAllowedTo("REPORTS:VIEW")?e.all=!0:this.$(".list-group-item[data-privileges]").each(function(){for(var i=this.dataset.privileges.split(","),n=0;n<i.length;++n){var a="REPORTS:"+i[n]+":VIEW";void 0===e[a]&&(e[a]=t.isAllowedTo(a)),e[a]||this.classList.add("disabled")}})},updateSettingOnInputChange:function(e){this.updateSetting(e.target.name,e.target.value)},setUpLeanSettings:function(){var e=this,t=n.getAllByType("subdivision").map(function(e){return{id:e.id,text:e.get("division")+" \\ "+e.getLabel()}}),a=s.map(i),o=this.prodTasks.serializeToSelect2(),r=this.serializeLeanProdFlows();this.$('input[name$="Subdivision"]').each(function(){e.$(this).select2({width:374,allowClear:!0,placeholder:" ",data:t})}),this.$('input[name$="DowntimeReasons"]').each(function(){e.$(this).select2({width:"100%",multiple:!0,allowClear:!0,placeholder:" ",data:a})}),this.$('input[name$="ProdTasks"]').each(function(){e.$(this).select2({width:"100%",multiple:!0,allowClear:!0,placeholder:" ",data:o})}),this.$('input[name$="ProdFlows"]').each(function(){e.$(this).select2({width:"100%",multiple:!0,allowClear:!0,placeholder:" ",data:r,formatResult:function(e,t,i,n){return e.deactivated?'<span style="text-decoration: line-through">'+n(e.text)+"</span>":n(e.text)},formatSelection:function(e,t,i){var n=e.deactivated?'<span style="text-decoration: line-through">'+i(e.text)+"</span>":i(e.text);return e.divisionId+": "+n}})})},setUpClipSettings:function(){var e=this;e.$id("clip-ignoredMrps").select2({width:"100%",allowClear:!0,placeholder:" ",multiple:!0,minimumResultsForSearch:-1,dropdownCssClass:"hidden",data:[],tokenizer:function(e,t,i){var n=e,a={};return t.forEach(function(e){a[e.id]=!0}),(e.match(/[A-Z0-9]{3,}[^A-Z0-9]/gi)||[]).forEach(function(e){n=n.replace(e,""),e=e.toUpperCase().replace(/[^A-Z0-9]+/g,""),a[e]||(i({id:e,text:e}),a[e]=!0)}),e===n?null:n.replace(/\s+/," ").trim()}}),e.$id("clip-ignoredDelayReasons").select2({width:"100%",allowClear:!0,placeholder:" ",multiple:!0,data:this.delayReasons.map(i)});var t=r.map(i);["ignoredStatuses","requiredStatuses","productionStatuses","endToEndStatuses","orderFilterStatuses"].forEach(function(i){e.$id("clip-"+i).select2({width:"100%",allowClear:!0,placeholder:" ",multiple:!0,data:t})})},serializeLeanProdFlows:function(){var t={};e.forEach(n.getAllByType("prodFlow"),function(e){var i=e.getSubdivision();i&&(t[i.id]||(t[i.id]=[]),t[i.id].push({id:e.id,text:e.getLabel(),divisionId:i.get("division"),deactivated:!!e.get("deactivatedAt")}))});var i=[];return n.getAllByType("division").filter(function(e){return"prod"===e.get("type")}).forEach(function(e){n.getChildren(e).forEach(function(n){"assembly"===n.get("type")&&i.push({text:e.id,children:t[n.id]||[]})})}),i}})});