define(["underscore","app/i18n","app/core/View","./decorateProdDowntime","app/prodDowntimes/templates/details","i18n!app/nls/prodDowntimes"],function(e,i,t,n,o){return t.extend({template:o,remoteTopics:{"prodDowntimes.finished.*":function(e){this.model.id===e._id&&this.model.set("finishedAt",new Date(e.finishedAt))},"prodDowntimes.corroborated.*":function(e){this.model.id===e._id&&this.model.set(e)}},initialize:function(){this.listenTo(this.model,"change",e.after(2,this.render.bind(this)))},serialize:function(){return{model:n(this.model)}}})});