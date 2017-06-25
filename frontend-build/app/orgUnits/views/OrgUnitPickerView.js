// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/viewport","app/core/View","app/core/util/idAndLabel","app/data/orgUnits","./OrgUnitPickerDialogView","app/orgUnits/templates/pickerButton","i18n!app/nls/orgUnits"],function(i,e,t,n,r,o,s,l,p){"use strict";var a={division:"division",subdivision:"subdivision",mrpControllers:"mrpControllers",prodFlow:"prodFlow",workCenter:"workCenter",prodLine:"prodLine"};return r.extend({template:p,events:{"click #-showDialog":function(){var e=new l({model:{orgUnitTypes:this.options.orgUnitTypes,orgUnitType:this.model.type,orgUnitIds:i.pluck(this.model.units,"id")}});this.listenTo(e,"picked",function(i,e){n.closeDialog(),0===e.length?(this.model.type=null,this.model.units=[]):(this.model.type=i,this.model.units=e.map(function(e){return s.getByTypeAndId(i,e)})),this.render()}),n.showDialog(e,t("orgUnits","picker:dialog:title"))},"click #-clear":function(){this.model={type:null,units:[],labels:[]},this.render()}},initialize:function(){this.model=this.getOrgUnitsFromRql(),this.listenTo(this.filterView,"filtering",this.onFiltering),this.listenTo(this.filterView,"filterChanged",this.onFilterChanged)},serialize:function(){var i=this.model;return{idPrefix:this.idPrefix,active:!!i.type,label:i.type?t("core","ORG_UNIT:"+i.type):t("orgUnits","picker:label"),button:i.type?i.units.map(function(e){var t=e.getLabel();return"subdivision"===i.type&&(t=e.get("division")+" > "+t),t}).join("; "):t("orgUnits","picker:any")}},getOrgUnitsFromRql:function(){var i=null,e=[];return this.filterView.model.rqlQuery.selector.args.forEach(function(t){i||"eq"!==t.name&&"in"!==t.name||(i=a[t.args[0]],e=(Array.isArray(t.args[1])?t.args[1]:[t.args[1]]).map(function(e){return s.getByTypeAndId(i,e)}).filter(function(i){return!!i}))}),{type:e.length?i:null,units:e}},onFiltering:function(e){if(this.model.type&&this.model.units.length){var t=i.pluck(this.model.units,"id");e.push({name:1===t.length?"eq":"in",args:[this.model.type,1===t.length?t[0]:t]})}}})});