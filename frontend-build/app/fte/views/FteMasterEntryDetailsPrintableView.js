define(["underscore","app/core/views/PrintableListView","app/fte/templates/printableMasterEntryList","./fractionsUtil"],function(e,t,n,i){return t.extend({template:n,serialize:function(){return e.extend(this.model.serializeWithTotals(),{round:i.round})},afterRender:function(){}})});