// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/DetailsView","app/prodShifts/templates/details"],function(e,t){"use strict";return e.extend({template:t,remoteTopics:{},initialize:function(){this.panelType=this.options.panelType||"primary"},serialize:function(){var e={planned:0,actual:0};return this.model.get("quantitiesDone").forEach(function(t){e.planned+=t.planned,e.actual+=t.actual}),{panelType:this.panelType,model:this.model.serialize({orgUnits:!0,personnel:!0}),totalQuantityDone:e}},setPanelType:function(e){this.$el.removeClass("panel-"+this.panelType).addClass("panel-"+e),this.panelType=e}})});