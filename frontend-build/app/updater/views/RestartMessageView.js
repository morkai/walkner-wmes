// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/View"],function(e){"use strict";return e.extend({destroy:function(){this.el.ownerDocument.body.style.marginBottom=""},afterRender:function(){this.el.ownerDocument.body.style.marginBottom=this.$el.outerHeight()+15+"px"}})});