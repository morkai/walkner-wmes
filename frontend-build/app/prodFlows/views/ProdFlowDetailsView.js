define(["underscore","app/core/views/DetailsView","./decorateProdFlow","app/prodFlows/templates/details"],function(e,r,s,i){"use strict";return r.extend({template:i,localTopics:{"divisions.synced":"render","subdivisions.synced":"render","mrpControllers.synced":"render"},serializeDetails:function(){return s(this.model)}})});