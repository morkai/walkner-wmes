// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/core/views/DetailsView","../util/getRegionLabel","app/opinionSurveyScanTemplates/templates/details","app/opinionSurveyScanTemplates/templates/region"],function(e,t,i,n,r){"use strict";return t.extend({template:n,serialize:function(){var n=this.model.get("survey");return e.extend(t.prototype.serialize.call(this),{regions:this.model.get("regions").map(function(e){return{label:i(n,e.question),region:e}}),renderRegion:r})}})});