// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/orgUnits/util/renderOrgUnitPath","app/core/views/DetailsView","app/prodLines/templates/details"],function(e,r,i){"use strict";return r.extend({template:i,localTopics:{"divisions.synced":"render","subdivisions.synced":"render","mrpControllers.synced":"render","prodFlows.synced":"render"},serialize:function(){var i=r.prototype.serialize.call(this);return i.orgUnitPath=e(this.model,!0),i}})});