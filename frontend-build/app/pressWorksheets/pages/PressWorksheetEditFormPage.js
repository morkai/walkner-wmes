// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/pages/EditFormPage","app/lossReasons/LossReasonCollection","../views/PressWorksheetFormView"],function(e,s,o){return e.extend({FormView:o,load:function(e){return this.model.lossReasons=new s(null,{rqlQuery:"select(label)&sort(position)&position>=0"}),e(this.model.fetch(),this.model.lossReasons.fetch({reset:!0}))}})});