// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/DetailsView","./decorateProdFlow","app/prodFlows/templates/details"],function(e,r,s){"use strict";return e.extend({template:s,localTopics:{"divisions.synced":"render","subdivisions.synced":"render","mrpControllers.synced":"render"},serialize:function(){return r(this.model)}})});