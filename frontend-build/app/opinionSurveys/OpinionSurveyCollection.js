// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","../core/Collection","./OpinionSurvey"],function(e,t,r){"use strict";return t.extend({model:r,rqlQuery:"select(startDate,endDate,label)&limit(15)&sort(-startDate)",buildCacheMaps:function(){for(var e=0;e<this.models.length;++e)this.models[e].buildCacheMaps()},getSuperiors:function(){var t={};return this.forEach(function(r){e.forEach(r.get("superiors"),function(e){t[e._id]||(t[e._id]=e)})}),e.values(t)}})});