// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/core/views/DetailsView","app/orgUnits/util/renderOrgUnitPath","app/subdivisions/templates/details"],function(e,i,t){"use strict";return e.extend({template:t,localTopics:{"divisions.synced":"render"},serializeDetails:function(e){return e.serialize({renderOrgUnitPath:i})}})});