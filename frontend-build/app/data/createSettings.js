// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["../pubsub"],function(u){"use strict";return function(n){function l(){r=null,null!==t&&(e.destroy(),e=null,t=null)}var e=null,t=null,r=null;return{acquire:function(){return null!==r&&(clearTimeout(r),r=null),null===t&&(e=u.sandbox(),t=new n(null,{pubsub:e})),t},release:function(){null!==r&&clearTimeout(r),r=setTimeout(l,3e4)}}}});