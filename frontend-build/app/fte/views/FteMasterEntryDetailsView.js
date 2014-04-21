// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/core/View","app/core/util/onModelDeleted","app/fte/templates/masterEntry","app/fte/templates/absentUserRow","./fractionsUtil"],function(e,t,n,r,i,d){return t.extend({template:r,idPrefix:"masterEntryDetails",remoteTopics:function(){var e={};return e["fte.master.updated."+this.model.id]="onModelUpdated",e["fte.master.deleted"]="onModelDeleted",e},serialize:function(){return e.extend(this.model.serializeWithTotals(),{editable:!1,renderAbsentUserRow:i,round:d.round})},beforeRender:function(){this.stopListening(this.model,"change",this.render)},afterRender:function(){this.listenToOnce(this.model,"change",this.render);var e=this.$(".fte-masterEntry-absence-entries"),t=this.$(".fte-masterEntry-absence-noEntries");e.children().length?t.hide():e.hide()},onModelUpdated:function(e){this.model.handleUpdateMessage(e)},onModelDeleted:function(e){n(this.broker,this.model,e)}})});