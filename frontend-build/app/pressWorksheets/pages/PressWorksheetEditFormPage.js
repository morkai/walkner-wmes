define(["app/core/pages/EditFormPage","app/lossReasons/LossReasonCollection","../views/PressWorksheetFormView"],function(e,s,o){"use strict";return e.extend({FormView:o,load:function(e){return this.model.lossReasons=new s(null,{rqlQuery:"select(label)&sort(position)&position>=0"}),e(this.model.fetch(),this.model.lossReasons.fetch({reset:!0}))}})});