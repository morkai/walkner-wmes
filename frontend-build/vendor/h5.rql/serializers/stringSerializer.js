define(["require","exports","module","../specialTerms","../autoConvertedMap"],function(e,t){function n(e,t){var n=[],s=t&&t.doubleEncode?f:p;return r(n,e.fields),i(n,e.sort),o(n,e.limit,e.skip),a(n,s,e.selector),n.join("").substr(1)}function r(e,t){var n=Object.keys(t);0!==n.length&&e.push(t[n[0]]?"&select(":"&exclude(",n.join(","),")")}function i(e,t){var n=Object.keys(t),r=n.length;if(0!==r){e.push("&sort(");for(var i=0;r>i;++i){var o=n[i];-1===t[o]&&e.push("-"),e.push(o),r-1>i&&e.push(",")}e.push(")")}}function o(e,t,n){-1!==t&&(e.push("&limit(",t),0!==n&&e.push(",",n),e.push(")"))}function a(e,t,n){var r=n.args.length;if(0!==r)if("and"===n.name)for(var i=0;r>i;++i){var o=n.args[i];h.hasOwnProperty(o.name)||(e.push("&"),s(e,t,o,r))}else e.push("&"),s(e,t,n,r,!0)}function s(e,t,n,r,i){if(Array.isArray(n))return u(e,t,n),void 0;if(null===n||"object"!=typeof n||"string"!=typeof n.name||!Array.isArray(n.args))return c(e,t,n),void 0;if(v.hasOwnProperty(n.name)&&n.args.length>1)return s(e,t,n.args[0],0),e.push(v[n.name]),s(e,t,n.args[1],0),void 0;var o=",";"and"===n.name?o="&":"or"===n.name&&i!==!0&&(o="|"),l(e,t,o,n,r)}function l(e,t,n,r,i){var o=r.args.length;","===n?e.push(r.name,"("):1!==i&&e.push("(");for(var a=0;o>a;++a)s(e,t,r.args[a],o),o-1>a&&e.push(n);(","===n||-1!==i)&&e.push(")")}function u(e,t,n){e.push("(");for(var r=0,i=n.length;i>r;++r)s(e,t,n[r],i),i-1>r&&e.push(",");e.push(")")}function c(e,t,n){switch(typeof n){case"undefined":e.push("undefined");break;case"boolean":e.push(n?"true":"false");break;case"number":e.push(n.toString(10));break;case"object":d(e,t,n);break;default:0===n.length?e.push("string:"):isNaN(+n)?m.hasOwnProperty(n)?e.push("string:",n):e.push(t(n)):e.push("string:",n.toString())}}function d(e,t,n){if(null===n)e.push("null");else if(n instanceof Date)e.push("epoch:",n.getTime().toString());else if(n instanceof RegExp){var r=n.toString(),i=r.lastIndexOf("/");""===r.substr(i+1)&&(r=r.substr(1,i-1)),e.push("re:",t(r))}else"function"==typeof n.convertToRqlValue?e.push(n.convertToRqlValue(t)):e.push(t(n.toString()))}function p(e){return e=encodeURIComponent(e),/[\(\)]/.test(e)&&(e=e.replace(/\(/g,"%28").replace(/\)/g,"%29")),e}function f(e){return p(p(e))}var h=e("../specialTerms"),m=e("../autoConvertedMap");t.fromQuery=n;var v={eq:"=",ne:"!=",le:"<=",ge:">=",lt:"<",gt:">","in":"=in=",nin:"=nin="}});