define(["app/core/views/ListView"],function(i){"use strict";return i.extend({className:"",remoteTopics:{"ct.pces.saved":"refreshCollection"},serializeColumns:function(){return[{id:"startedAt",className:"is-min"},{id:"duration",className:"is-min"},{id:"order",className:"is-min"},{id:"pce",className:"is-min"},{id:"line",className:"is-min"},{id:"station",className:"is-min",label:this.t("PROPERTY:station:short")},"-"]},serializeActions:function(){return null}})});