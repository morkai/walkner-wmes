// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/data/views/renderOrgUnitPath","app/core/views/DetailsView","app/workCenters/templates/details"],function(e,r,i){return r.extend({template:i,localTopics:{"divisions.synced":"render","subdivisions.synced":"render","mrpControllers.synced":"render","prodFlows.synced":"render"},serialize:function(){var i=r.prototype.serialize.call(this);return i.orgUnitPath=e(this.model,!0),i}})});