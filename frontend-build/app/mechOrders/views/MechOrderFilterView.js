define(["underscore","js2form","app/i18n","app/core/View","app/mechOrders/templates/filter","i18n!app/nls/mechOrders"],function(e,i,r,t,n){return t.extend({template:n,events:{"submit .filter-form":function(e){e.preventDefault(),this.changeFilter()}},initialize:function(){this.idPrefix=e.uniqueId("mechOrderFilter")},serialize:function(){return{idPrefix:this.idPrefix}},afterRender:function(){var e=this.serializeRqlQuery();i(this.el.querySelector(".filter-form"),e)},serializeRqlQuery:function(){var i=this.model.rqlQuery,r={_id:"",limit:i.limit<5?5:i.limit>100?100:i.limit};return i.selector.args.forEach(function(i){var t=i.args[0];switch(t){case"_id":var n=i.args[1];r[t]=e.isString(n)?n.replace(/[^0-9a-zA-Z]/g,""):"-"}}),r},changeFilter:function(){var e=this.model.rqlQuery,i=[];this.serializeRegexTerm(i,"_id",12),e.selector={name:"and",args:i},e.limit=parseInt(this.$id("limit").val(),10)||15,e.skip=0,this.trigger("filterChanged",e)},serializeRegexTerm:function(e,i,r){var t=this.$id(i),n=t.val().trim();"-"!==n&&(n=n.replace(/[^0-9a-zA-Z]/g,"")),t.val(n),"-"===n&&(n=null),null===n||n.length===r?e.push({name:"eq",args:[i,n]}):n.length>0&&e.push({name:"regex",args:[i,n]})}})});