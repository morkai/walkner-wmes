define(["underscore","js2form","app/i18n","app/core/View","app/mechOrders/templates/filter"],function(e,i,r,t,l){return t.extend({template:l,events:{"submit .filter-form":function(e){e.preventDefault(),this.changeFilter()}},initialize:function(){this.idPrefix=e.uniqueId("mechOrderFilter")},serialize:function(){return{idPrefix:this.idPrefix}},afterRender:function(){var e=this.serializeRqlQuery();i(this.el.querySelector(".filter-form"),e)},serializeRqlQuery:function(){var i=this.model.rqlQuery,r={_id:"",limit:i.limit<5?5:i.limit>100?100:i.limit};return i.selector.args.forEach(function(i){var t=i.args[0];switch(t){case"_id":var l=i.args[1];r[t]=e.isString(l)?l.replace(/[^0-9a-zA-Z]/g,""):""}}),r},changeFilter:function(){var e=this.model.rqlQuery,i=[];this.serializeRegexTerm(i,"_id",12),e.selector={name:"and",args:i},e.limit=parseInt(this.$id("limit").val(),10)||15,e.skip=0,this.trigger("filterChanged",e)},serializeRegexTerm:function(e,i,r){var t=this.$id(i),l=t.val().trim();"-"!==l&&(l=l.replace(/[^0-9a-zA-Z]/g,"")),t.val(l),"-"===l&&(l=null),null===l||l.length===r?e.push({name:"eq",args:[i,l]}):l.length>0&&e.push({name:"regex",args:[i,l]})}})});