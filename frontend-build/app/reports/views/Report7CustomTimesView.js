// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["js2form","form2js","app/core/View","app/core/util/buttonGroup","app/reports/templates/report7CustomTimes"],function(t,e,r,i,s){"use strict";return r.extend({template:s,events:{submit:function(){return this.trigger("submit",e(this.el)),!1},"click #-reset":function(){return this.trigger("reset"),!1}},afterRender:function(){t(this.el,this.model.getCustomTimes()),i.toggle(this.$id("clipInterval")),i.toggle(this.$id("dtcInterval"))}})});