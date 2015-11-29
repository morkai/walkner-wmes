// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/data/loadedModules","app/core/views/DetailsView","app/users/templates/details"],function(e,t,r,a){"use strict";return r.extend({template:a,localTopics:{"companies.synced":"render","aors.synced":"render"},serialize:function(){return e.extend(r.prototype.serialize.call(this),{loadedModules:t})},afterRender:function(){r.prototype.afterRender.call(this)}})});