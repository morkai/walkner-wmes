// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n"],function(e,n){"use strict";function t(e){var n=e._id;return e.name&&(n+=": "+e.name),{id:e._id,text:n}}return function(r,i){return r.select2(e.extend({width:"100%",allowClear:!0,minimumInputLength:3,placeholder:n("vendors","select2:placeholder"),ajax:{cache:!0,quietMillis:300,url:function(e){e=e.trim();var n=/^[0-9]+$/.test(e)?"_id":"name";return e=encodeURIComponent(e),"/vendors?sort("+n+")&limit(50)&regex("+n+",string:"+e+",i)"},results:function(e){return{results:(e.collection||[]).map(t)}}}},i)),r.prepareData=t,r}});