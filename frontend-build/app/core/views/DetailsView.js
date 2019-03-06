define(["app/i18n","../View","../util/onModelDeleted"],function(e,i,t){"use strict";return i.extend({remoteTopics:function(){var e={},i=this.model.getTopicPrefix();return e[i+".edited"]="onModelEdited",e[i+".deleted"]="onModelDeleted",e},getTemplateData:function(){var i=this.model.getNlsDomain();return{panelTitle:e(e.has(i,"PANEL:TITLE:details")?i:"core","PANEL:TITLE:details"),model:this.serializeDetails(this.model)}},serializeDetails:function(e){return"function"==typeof e.serializeDetails?e.serializeDetails():"function"==typeof e.serialize?e.serialize():e.toJSON()},beforeRender:function(){this.stopListening(this.model,"change",this.render)},afterRender:function(){this.listenToOnce(this.model,"change",this.render)},onModelEdited:function(e){var i=e.model;i&&i._id===this.model.id&&this.model.set(i)},onModelDeleted:function(e){t(this.broker,this.model,e)}})});