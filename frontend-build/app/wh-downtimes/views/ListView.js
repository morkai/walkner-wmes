define(["app/core/views/ListView"],function(e){"use strict";return e.extend({className:"",remoteTopics:function(){var e={};return e[this.collection.getTopicPrefix()+".updated"]="refreshCollection",e},columns:[{id:"startedAt",className:"is-min"},{id:"duration",className:"is-min"},{id:"user",className:"is-min"},{id:"reason",className:"is-min"},{id:"comment"}],actions:[]})});