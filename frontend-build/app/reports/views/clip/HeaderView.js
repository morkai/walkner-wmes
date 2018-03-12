// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/data/orgUnits","app/core/View","app/mrpControllers/MrpController","app/reports/templates/clip/header"],function(e,t,r,i,n){"use strict";return r.extend({template:n,initialize:function(){this.listenTo(this.model,"change",this.render),this.listenTo(this.displayOptions,"change",this.render)},serialize:function(){var r=this.model,n=[],l=r.get("orgUnitType"),o=r.get("orgUnitId"),a=t.getByTypeAndId(l,o);if(a||"mrpController"!==l||(a=new i({_id:o})),a)do{var s=t.getType(a);n.unshift({label:e("core","ORG_UNIT:"+s),value:[a.getLabel()],query:[n.length&&"division"!==s?r.serializeToString(s,a.id):null],lastI:0}),"prodFlow"===s&&(a=this.serializeMrpControllers(a,n)),a="mrpController"===s&&this.parentReport?t.getByTypeAndId("subdivision",this.parentReport.get("parent")):t.getParent(a)}while(a);return{overallQuery:n.length?r.serializeToString(null,null):null,orgUnitPath:n,fragment:this.displayOptions.serializeToString()}},serializeMrpControllers:function(r,i){var n=this.model,l={label:e("core","ORG_UNIT:mrpController"),value:[],query:[],lastI:-1};return r.get("mrpController").forEach(function(e){l.lastI+=1,l.value.push(e),l.query.push(n.serializeToString("mrpController",e))}),i.unshift(l),t.getParent(r)},update:function(e){this.parentReport=e,this.render()}})});