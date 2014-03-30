define(["app/viewport","app/i18n","../View"],function(e,i,t){return t.extend({remoteTopics:function(){var e={},i=this.model.getTopicPrefix();return e[i+".edited"]="onModelEdited",e[i+".deleted"]="onModelDeleted",e},serialize:function(){return{model:this.serializeDetails(this.model)}},serializeDetails:function(e){return e.toJSON()},beforeRender:function(){this.stopListening(this.collection,"change",this.render)},afterRender:function(){this.listenToOnce(this.model,"change",this.render)},onModelEdited:function(e){var i=e.model;i&&i._id===this.model.id&&this.model.set(i)},onModelDeleted:function(t){var n=t.model;if(n&&n._id===this.model.id){var o=this.model;this.broker.subscribe("router.executing").setLimit(1).on("message",function(){e.msg.show({type:"warning",time:5e3,text:i(o.getNlsDomain()||"core","MSG:DELETED",{label:o.getLabel()})})}),this.broker.publish("router.navigate",{url:o.genClientUrl("base"),trigger:!0})}}})});