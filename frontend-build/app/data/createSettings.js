// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../pubsub"],function(u){"use strict";return function(n){function l(){r=null,null!==t&&(e.destroy(),e=null,t=null)}var e=null,t=null,r=null;return{acquire:function(){return null!==r&&(clearTimeout(r),r=null),null===t&&(e=u.sandbox(),t=new n(null,{pubsub:e})),t},release:function(){null!==r&&clearTimeout(r),r=setTimeout(l,3e4)}}}});