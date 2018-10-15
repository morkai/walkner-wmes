// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/core/views/FormView","app/delayReasons/templates/form"],function(e,r,t){"use strict";return r.extend({template:t,serializeForm:function(r){return r.drm=e.defaults({},r.drm,{man:"",machine:"",method:"",material:""}),r}})});