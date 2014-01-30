define(["underscore","moment","js2form","reltime","app/i18n","app/user","app/data/prodLines","app/core/View","app/core/util/fixTimeRange","app/prodShifts/templates/filter","select2"],function(e,t,n,r,i,o,a,s,l,u){return s.extend({template:u,events:{"submit .filter-form":function(e){e.preventDefault(),this.changeFilter()}},initialize:function(){this.idPrefix=e.uniqueId("prodShiftFilter")},serialize:function(){return{idPrefix:this.idPrefix}},afterRender:function(){var e=this.serializeRqlQuery();n(this.el.querySelector(".filter-form"),e),this.$id("prodLine").select2({width:"275px",allowClear:!o.getDivision(),data:this.getApplicableProdLines()})},getApplicableProdLines:function(){return a.getForCurrentUser().map(function(e){return{id:e.id,text:e.getLabel()}})},serializeRqlQuery:function(){var e=this.model.rqlQuery,n={createdAt:"",prodLine:null,type:null,shift:0,limit:e.limit<5?5:e.limit>100?100:e.limit};return e.selector.args.forEach(function(e){var r=e.args[0];switch(r){case"date":n["ge"===e.name?"from":"to"]=t(e.args[1]).format("YYYY-MM-DD");break;case"prodLine":case"shift":"eq"===e.name&&(n[r]=e.args[1])}}),n},changeFilter:function(){var e=this.model.rqlQuery,t=l(this.$id("from"),this.$id("to"),"YYYY-MM-DD"),n=[],r=this.$id("prodLine").val(),i=parseInt(this.$("input[name=shift]:checked").val(),10);r&&r.length&&n.push({name:"eq",args:["prodLine",r]}),i&&n.push({name:"eq",args:["shift",i]}),-1!==t.from&&n.push({name:"ge",args:["date",t.from]}),-1!==t.to&&n.push({name:"le",args:["date",t.to]}),e.selector={name:"and",args:n},e.limit=parseInt(this.$id("limit").val(),10)||15,e.skip=0,this.trigger("filterChanged",e)}})});