define(["require","exports","module","../specialTerms","../specialOperators","../autoConvertedMap"],function(e,r,n){function s(e,r){var n=[],s={encode:r&&r.doubleEncode?g:l,useOperators:r&&r.useOperators};return t(n,e.fields),u(n,e.sort),a(n,e.limit,e.skip),o(n,s,e.selector),n.join("").substr(1)}function t(e,r){var n=Object.keys(r);0!==n.length&&e.push(r[n[0]]?"&select(":"&exclude(",n.join(","),")")}function u(e,r){var n=Object.keys(r),s=n.length;if(0!==s){e.push("&sort(");for(var t=0;s>t;++t){var u=n[t];-1===r[u]&&e.push("-"),e.push(u),s-1>t&&e.push(",")}e.push(")")}}function a(e,r,n){-1!==r&&(e.push("&limit(",r),0!==n&&e.push(",",n),e.push(")"))}function o(e,r,n){var s=n.args.length;if(0!==s)if("and"===n.name)for(var t=0;s>t;++t){var u=n.args[t];d.hasOwnProperty(u.name)||(e.push("&"),i(e,r,u,s))}else e.push("&"),i(e,r,n,s,!0)}function i(e,r,n,s,t){if(Array.isArray(n))return void c(e,r,n);if(null===n||"object"!=typeof n||"string"!=typeof n.name||!Array.isArray(n.args))return void h(e,r,n);if(v.hasOwnProperty(n.name)&&n.args.length>1)return i(e,r,n.args[0],0),e.push(v[n.name]),void i(e,r,n.args[1],0);var u=",";"and"===n.name?u="&":"or"===n.name&&t!==!0&&(u="|"),p(e,r,u,n,s)}function p(e,r,n,s,t){var u=s.args.length;","===n?e.push(s.name,"("):1!==t&&e.push("(");for(var a=0;u>a;++a)i(e,r,s.args[a],u),u-1>a&&e.push(n);(","===n||-1!==t)&&e.push(")")}function c(e,r,n){e.push("(");for(var s=0,t=n.length;t>s;++s)i(e,r,n[s],t),t-1>s&&e.push(",");e.push(")")}function h(e,r,n){switch(typeof n){case"undefined":e.push("undefined");break;case"boolean":e.push(n?"true":"false");break;case"number":e.push(n.toString(10));break;case"object":f(e,r,n);break;default:0===n.length?e.push("string:"):isNaN(+n)?m.hasOwnProperty(n)?e.push("string:",n):e.push(r.encode(n)):e.push("string:",n.toString())}}function f(e,r,n){if(null===n)e.push("null");else if(n instanceof Date)e.push("epoch:",n.getTime().toString());else if(n instanceof RegExp){var s=n.toString(),t=s.lastIndexOf("/");""===s.substr(t+1)&&(s=s.substr(1,t-1)),e.push("re:",r.encode(s))}else"function"==typeof n.convertToRqlValue?e.push(n.convertToRqlValue(r.encode)):e.push(r.encode(n.toString()))}function l(e){return e=encodeURIComponent(e),/[\(\)]/.test(e)&&(e=e.replace(/\(/g,"%28").replace(/\)/g,"%29")),e}function g(e){return l(l(e))}var d=e("../specialTerms"),v=e("../specialOperators"),m=e("../autoConvertedMap");r.fromQuery=s});