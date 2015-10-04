// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/core/views/DetailsView","../util/getRegionLabel","app/opinionSurveyScanTemplates/templates/details","app/opinionSurveyScanTemplates/templates/region"],function(e,t,i,n,r){"use strict";return t.extend({template:n,serialize:function(){var n=this.model.get("survey");return e.extend(t.prototype.serialize.call(this),{regions:this.model.get("regions").map(function(e){return{label:i(n,e.question),region:e}}),renderRegion:r})}})});