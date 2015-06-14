// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/user","app/core/util/idAndLabel","app/data/orgUnits","app/data/aors","app/settings/views/SettingsView","app/reports/templates/settings"],function(e,t,i,n,s,r,a){"use strict";return r.extend({clientUrl:"#reports;settings",defaultTab:"efficiency",template:a,localTopics:{"divisions.synced":"render","subdivisions.synced":"render","aors.synced":"render"},events:e.extend({'change [name$="prodTask"]':"updateSettingOnInputChange",'change [name$="id"]':"updateSettingOnInputChange",'change [name$="aors"]':"updateSettingOnInputChange","change #-downtimesInAors-specificAor":"updateSettingOnInputChange",'change [name="downtimesInAorsType"]':function(e){var t="own"===e.target.value?"own":"";this.updateSetting("reports.downtimesInAors.aors",t),this.toggleDowntimesInAors(t)}},r.prototype.events),initialize:function(){r.prototype.initialize.apply(this,arguments),this.userPrivileges={}},serialize:function(){return e.extend(r.prototype.serialize.call(this),{divisions:this.serializeProdDivisions(),colors:this.serializeColors()})},serializeProdDivisions:function(){return n.getAllDivisions().filter(function(e){return"prod"===e.get("type")}).map(function(e){return{_id:e.id,label:e.getLabel(),subdivisions:n.getChildren(e).map(function(e){return{_id:e.id,label:e.getLabel()}}).sort(function(e,t){return e.label.localeCompare(t.label)})}}).sort(function(e,t){return e.label.localeCompare(t.label)})},serializeStorageSubdivisions:function(){return n.getAllByType("subdivision").filter(function(e){return"storage"===e.get("type")}).map(function(e){return{id:e.id,text:e.get("division")+" \\ "+e.get("name")}}).sort(function(e,t){return e.text.localeCompare(t.text)})},serializeColors:function(){var e={};return["quantityDone","efficiency","productivity","productivityNoWh","scheduledDowntime","unscheduledDowntime","clipOrderCount","clipProduction","clipEndToEnd","direct","directRef","indirect","indirectRef","warehouse","warehouseRef","absence","absenceRef","dirIndir","dirIndirRef","eff","ineff","hrTotal"].forEach(function(t){e[t]=this.settings.getColor(t)},this),e},afterRender:function(){r.prototype.afterRender.call(this);var e=this.serializeStorageSubdivisions();this.$id("wh-comp-id").select2({width:"374px",allowClear:!0,placeholder:" ",data:e}),this.$id("wh-finGoods-id").select2({width:"374px",allowClear:!0,placeholder:" ",data:e}),this.$('input[name$="prodTask"]').select2({width:"374px",allowClear:!0,placeholder:" ",data:this.prodTasks.serializeToSelect2()});var t=s.map(i);this.$('input[name$="aors"]').select2({allowClear:!0,multiple:!0,placeholder:" ",data:t}),this.$id("downtimesInAors-specificAor").select2({allowClear:!0,placeholder:" ",data:t}),this.onSettingsChange(this.settings.get("reports.downtimesInAors.statuses")),this.toggleDowntimesInAors(this.settings.getValue("downtimesInAors.aors"))},updateSettingField:function(e){var t=this.$('input[name="'+e.id+'"]');return t.hasClass("select2-offscreen")?t.select2("val",e.getValue()):void 0},toggleDowntimesInAors:function(e){null===e||"own"===e?(this.$('input[name="downtimesInAorsType"][value="own"]').prop("checked",!0),this.$id("downtimesInAors-aors").select2("enable",!1).select2("data",null)):(this.$('input[name="downtimesInAorsType"][value="specific"]').prop("checked",!0),this.$id("downtimesInAors-aors").select2("enable",!0))},toggleTabPrivileges:function(){var e=this.userPrivileges={all:!1};return t.isAllowedTo("REPORTS:VIEW")?void(e.all=!0):void this.$(".list-group-item[data-privileges]").each(function(){for(var i=this.dataset.privileges.split(","),n=0;n<i.length;++n){var s="REPORTS:"+i[n]+":VIEW";void 0===e[s]&&(e[s]=t.isAllowedTo(s)),e[s]||this.classList.add("disabled")}})},updateSettingOnInputChange:function(e){this.updateSetting(e.target.name,e.target.value)}})});