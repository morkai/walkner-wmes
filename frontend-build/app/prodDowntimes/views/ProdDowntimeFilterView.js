define(["underscore","moment","js2form","reltime","app/i18n","app/user","app/data/aors","app/data/orgUnits","app/core/View","app/core/util/fixTimeRange","app/data/downtimeReasons","app/prodDowntimes/templates/filter","i18n!app/nls/prodDowntimes","select2"],function(e,t,n,r,i,o,a,s,l,u,d,c){return l.extend({template:c,events:{"submit .filter-form":function(e){e.preventDefault(),this.changeFilter()}},initialize:function(){this.idPrefix=e.uniqueId("prodDowntimeFilter")},serialize:function(){return{idPrefix:this.idPrefix}},afterRender:function(){var e=this.serializeRqlQuery();n(this.el.querySelector(".filter-form"),e),this.toggleStatus(e.status),this.$id("orgUnit").select2({width:"275px",allowClear:!o.getDivision(),data:this.getApplicableOrgUnits(),formatSelection:function(e){return"subdivision"===e.type?e.model.get("division")+" \\ "+e.text:e.text}}),this.$id("aor").select2({width:"275px",allowClear:!0,data:this.getApplicableAors()}),this.$id("reason").select2({width:"275px",allowClear:!0,data:d.map(function(e){return{id:e.id,text:e.id+" - "+(e.get("label")||"?")}}).sort(function(e,t){return e.id.localeCompare(t.id)})})},getApplicableOrgUnits:function(){var e=[],t=o.getDivision(),n=o.getSubdivision();t&&e.push({disabled:!!n,id:t.id,text:t.getLabel(),type:"division",model:t,css:"prodDowntime-filter-division"});var r=this;return n?this.pushApplicableOrgUnitsForSubdivision(e,n):t?s.getSubdivisionsForDivision(t).forEach(function(t){r.pushApplicableOrgUnitsForSubdivision(e,t)}):s.getAllDivisions().forEach(function(t){e.push({id:t.id,text:t.getLabel(),type:"division",model:t,css:"prodDowntime-filter-division"}),s.getSubdivisionsForDivision(t).forEach(function(t){r.pushApplicableOrgUnitsForSubdivision(e,t)})}),e},pushApplicableOrgUnitsForSubdivision:function(e,t){e.push({id:t.id,text:t.getLabel(),type:"subdivision",model:t,css:"prodDowntime-filter-subdivision"}),s.getProdFlowsForSubdivision(t).forEach(function(t){e.push({id:t.id,text:t.getLabel(),type:"prodFlow",model:t,css:"prodDowntime-filter-prodFlow"})})},getApplicableAors:function(){var e=o.data.aors||[],t=[];return e.length?e.forEach(function(e){var n=a.get(e);n&&t.push({id:e,text:n.getLabel()})}):a.each(function(e){t.push({id:e.id,text:e.getLabel()})}),t},serializeRqlQuery:function(){var e=this.model.rqlQuery,n={startedAt:"",aor:null,reason:null,status:[],orgUnit:null,limit:e.limit<5?5:e.limit>100?100:e.limit};return e.selector.args.forEach(function(e){var r=e.args[0];switch(r){case"startedAt":n["ge"===e.name?"from":"to"]=t(e.args[1]).format("YYYY-MM-DD HH:mm:ss");break;case"aor":case"reason":"eq"===e.name&&(n[r]=e.args[1]);break;case"status":n.status=[].concat(e.args[1]);break;case"division":case"subdivision":case"prodFlow":n.orgUnit=e.args[1]}}),n},changeFilter:function(){var e=this.model.rqlQuery,t=u(this.$id("from"),this.$id("to"),"YYYY-MM-DD HH:mm:ss"),n=[],r=this.$id("orgUnit").select2("data"),i=this.$id("aor").val(),o=this.$id("reason").val(),a=this.fixStatus();i&&i.length&&n.push({name:"eq",args:["aor",i]}),o&&o.length&&n.push({name:"eq",args:["reason",o]}),1===a.length?n.push({name:"eq",args:["status",a[0]]}):a.length>1&&n.push({name:"in",args:["status",a]}),r&&n.push({name:"eq",args:[r.type,r.id]}),-1!==t.from&&n.push({name:"ge",args:["startedAt",t.from]}),-1!==t.to&&n.push({name:"le",args:["startedAt",t.to]}),e.selector={name:"and",args:n},e.limit=parseInt(this.$id("limit").val(),10)||15,e.skip=0,this.trigger("filterChanged",e)},fixStatus:function(){var e=this.$(".filter-btn-group > .btn"),t=e.filter(".active");0===t.length&&e.addClass("active");var n=t.map(function(){return this.value}).get();return n.length===e.length?[]:n},toggleStatus:function(e){var t=this.$(".filter-btn-group > .btn");0===e.length?t.addClass("active"):e.forEach(function(e){t.filter('[value="'+e+'"]').addClass("active")})}})});