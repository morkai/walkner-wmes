// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/i18n","app/core/views/DetailsView","./decoratePressWorksheet","app/pressWorksheets/templates/details"],function(e,t,r,s){return t.extend({template:s,serialize:function(){var e=t.prototype.serialize.call(this);return r(e.model),e}})});