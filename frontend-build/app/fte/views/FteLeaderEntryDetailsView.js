// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/core/View","app/core/util/onModelDeleted","app/fte/templates/leaderEntry","../util/fractions"],function(e,t,n,d,o){return t.extend({template:d,remoteTopics:function(){var e={};return e["fte.leader.updated."+this.model.id]="onModelUpdated",e["fte.leader.deleted"]="onModelDeleted",e},serialize:function(){return e.extend(this.model.serializeWithTotals(),{editable:!1,round:o.round})},beforeRender:function(){this.stopListening(this.model,"change",this.render)},afterRender:function(){this.listenToOnce(this.model,"change",this.render)},onModelUpdated:function(e){this.model.handleUpdateMessage(e)},onModelDeleted:function(e){n(this.broker,this.model,e)}})});