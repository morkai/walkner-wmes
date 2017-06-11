define(["require","exports","module"],function(r,e,n){"use strict";function t(r,e){e instanceof t.Options||(e=new t.Options(e));var n={selector:a(e,r.selector)||{},fields:r.fields,sort:r.sort,limit:r.limit<1?0:r.limit,skip:r.skip};return e.compactAnd&&Array.isArray(n.selector.$and)&&1===Object.keys(n.selector).length&&(n.selector=y(n.selector.$and)),n}function a(r,e){if("object"!=typeof e||null===e||"string"!=typeof e.name||!Array.isArray(e.args))return null;switch(e.name){case"and":case"or":case"nor":return u(r,e.name,e.args);case"not":return f(r,e.args);case"eq":case"ne":case"gt":case"ge":case"lt":case"le":return c(r,e.name,e.args);case"in":case"nin":case"all":if(Array.isArray(e.args[1])&&e.args[1].length>0)return c(r,e.name,e.args);break;case"exists":if("boolean"==typeof e.args[1])return i(r,"exists",e.args[0],e.args[1]);break;case"type":if("number"==typeof e.args[1])return i(r,"type",e.args[0],e.args[1]);break;case"mod":return o(r,e.args);case"where":if(r.allowWhere&&"string"==typeof e.args[0])return{$where:e.args[0]};break;case"regex":return s(r,e.args);case"size":if("number"==typeof e.args[1])return i(r,"size",e.args[0],e.args[1]);break;case"elemMatch":return l(r,e.args)}return null}function i(r,e,n,t){if(Array.isArray(n)&&(n=n.join(".")),!r.isPropertyAllowed(n))return null;var a={};return a[n]={},a[n]["$"+e]=t,a}function o(r,e){return Array.isArray(e[1])&&2===e[1].length&&"number"==typeof e[1][0]&&"number"==typeof e[1][1]?i(r,"mod",e[0],e[1]):e.length>=3&&"number"==typeof e[1]&&"number"==typeof e[2]?i(r,"mod",e[0],[e[1],e[2]]):null}function s(r,e){if(e.length>=2&&("string"==typeof e[1]||e[1]instanceof RegExp)){var n=Array.isArray(e[0])?e[0].join("."):e[0];if(!r.isPropertyAllowed(n))return null;var t=i(r,"regex",n,e[1]);return e.length>=3&&"string"==typeof e[2]&&(t[n].$options=e[2]),t}return null}function l(r,e){if(e.length<2)return null;var n=Array.isArray(e[0])?e[0].join("."):e[0];if(!r.isPropertyAllowed(n))return null;e=[].concat(e),e.shift();var t=u(r,"and",e);if(null===t)return null;var a=y(t.$and);return i(r,"elemMatch",n,a)}function u(r,e,n){for(var t=[],i=0,o=n.length;i<o;++i){var s=a(r,n[i]);null!==s&&t.push(s)}if(0===t.length)return null;var l={};return l["$"+e]=t,l}function f(r,e){for(var n={},t=0,i=0,o=e.length;i<o;++i){var s=a(r,e[i]);null!==s&&Object.keys(s).forEach(function(r){if("$"!==r[0]){t+=1,n.hasOwnProperty(r)||(n[r]={});var e=s[r];if(!h(e,!1))return void(n[r].$ne=e);n[r].hasOwnProperty("$not")||(n[r].$not={}),Object.keys(e).forEach(function(t){"$"===t[0]&&(n[r].$not[t]=e[t])})}})}return 0===t?null:n}function c(r,e,n){if(n.length<2)return null;var t=Array.isArray(n[0])?n[0].join("."):n[0];if(!r.isPropertyAllowed(t))return null;var a=n[1],i={};return"eq"===e?(i[t]=a,i):("le"===e?e="lte":"ge"===e&&(e="gte"),i[t]={},i[t]["$"+e]=a,i)}function y(r){for(var e={},n=0,t=r.length;n<t;++n)p(e,r[n]);return e}function p(r,e){Object.keys(e).forEach(function(n){"undefined"==typeof r[n]&&(r[n]={}),g(r,n,e[n])})}function g(r,e,n){if(h(r[e],!0))if(h(n,!1))for(var t in n)n.hasOwnProperty(t)&&(r[e][t]=n[t]);else r[e]=n}function h(r,e){if("object"!=typeof r||null===r)return!1;var n=Object.keys(r);if(0===n.length)return e;for(var t=0,a=n.length;t<a;++t)if("$"===n[t][0])return!0;return!1}e.fromQuery=t,t.Options=function(r){"object"==typeof r&&null!==r||(r={}),this.compactAnd=!r.hasOwnProperty("compactAnd")||r.compactAnd===!0,this.allowWhere=r.allowWhere===!0,this.isPropertyAllowed="function"==typeof r.isPropertyAllowed?r.isPropertyAllowed:this.createPropertyFilter(r)},t.Options.prototype.createPropertyFilter=function(r){if(Array.isArray(r.whitelist)){var e=r.whitelist;return function(r){return e.indexOf(r)!==-1}}if(Array.isArray(r.blacklist)){var n=r.blacklist;return function(r){return n.indexOf(r)===-1}}return function(){return!0}}});