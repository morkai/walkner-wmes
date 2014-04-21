// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/data/orgUnits","app/core/View","app/reports/templates/report2Header"],function(e,r,t,l){return t.extend({template:l,initialize:function(){this.listenTo(this.model,"change",this.render)},serialize:function(){var t=this.model,l=[],i=r.getByTypeAndId(t.get("orgUnitType"),t.get("orgUnitId"));if(i)do{var n=r.getType(i);l.unshift({label:e("core","ORG_UNIT:"+n),value:[i.getLabel()],query:[l.length?t.serializeToString(n,i.id):null],lastI:0}),"prodFlow"===n&&(i=this.serializeMrpControllers(i,l)),i=r.getParent(i)}while(i);return{overallQuery:l.length?t.serializeToString(null,null):null,orgUnitPath:l}},serializeMrpControllers:function(t,l){var i=this.model,n={label:e("core","ORG_UNIT:mrpController"),value:[],query:[],lastI:-1};return t.get("mrpController").forEach(function(e){n.lastI+=1,n.value.push(e),n.query.push(i.serializeToString("mrpController",e))}),l.unshift(n),r.getParent(t)}})});