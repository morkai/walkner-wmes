define(["underscore","app/core/View","app/core/util/onModelDeleted","app/fte/templates/leaderEntry","./fractionsUtil"],function(e,t,n,d,i){return t.extend({template:d,idPrefix:"leaderEntryDetails",remoteTopics:function(){var e={};return e["fte.leader.updated."+this.model.id]="onModelUpdated",e["fte.leader.deleted"]="onModelDeleted",e},serialize:function(){return e.extend(this.model.serializeWithTotals(),{editable:!1,round:i.round})},beforeRender:function(){this.stopListening(this.model,"change",this.render)},afterRender:function(){this.listenToOnce(this.model,"change",this.render)},onModelUpdated:function(e){this.model.handleUpdateMessage(e)},onModelDeleted:function(e){n(this.broker,this.model,e)}})});