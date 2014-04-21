// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/views/DetailsView","./decorateUser","app/users/templates/details"],function(e,r,a,i){return r.extend({template:i,localTopics:{"companies.synced":"render","aors.synced":"render"},serialize:function(){var e=r.prototype.serialize.call(this);return a(e.model),e}})});