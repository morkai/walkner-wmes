// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/data/views/renderOrgUnitPath","app/core/views/DetailsView","app/mrpControllers/templates/details"],function(e,i,t,r){return t.extend({template:r,localTopics:{"divisions.synced":"render","subdivisions.synced":"render"},serialize:function(){var e=t.prototype.serialize.call(this);return e.orgUnitPath=i(this.model,!0),e}})});