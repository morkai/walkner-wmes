define(["app/i18n","app/data/orgUnits","app/core/View","app/reports/templates/report1Header"],function(e,t,n,r){return n.extend({template:r,initialize:function(){this.listenTo(this.model,"change",this.render)},serialize:function(){var n=this.model,r=[],i=t.getByTypeAndId(n.get("orgUnitType"),n.get("orgUnitId"));if(i)do{var o=t.getType(i);r.unshift({label:e("core","ORG_UNIT:"+o),value:[i.getLabel()],query:[r.length?n.serializeToString(o,i.id):null],lastI:0}),"prodFlow"===o&&(i=this.serializeMrpControllers(i,r)),i=t.getParent(i)}while(i);return{overallQuery:r.length?n.serializeToString(null,null):null,orgUnitPath:r}},serializeMrpControllers:function(n,r){var i=this.model,o={label:e("core","ORG_UNIT:mrpController"),value:[],query:[],lastI:-1};return n.get("mrpController").forEach(function(e){o.lastI+=1,o.value.push(e),o.query.push(i.serializeToString("mrpController",e))}),r.unshift(o),t.getParent(n)}})});