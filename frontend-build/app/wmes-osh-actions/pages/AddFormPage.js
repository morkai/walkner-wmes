define(["app/wmes-osh-common/ResolutionCollection","app/wmes-osh-common/pages/AddFormPage","../views/FormView"],function(e,o,t){"use strict";return o.extend({FormView:t,getFormViewOptions:function(){return Object.assign(o.prototype.getFormViewOptions.apply(this,arguments),{resolutions:new e(null,{parent:this.model})})}})});