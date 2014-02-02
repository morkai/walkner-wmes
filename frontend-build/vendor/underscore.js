//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

!function(){var e=this,t=e._,n={},r=Array.prototype,i=Object.prototype,o=Function.prototype,a=r.push,s=r.slice,l=r.concat,u=i.toString,c=i.hasOwnProperty,d=r.forEach,p=r.map,h=r.reduce,f=r.reduceRight,m=r.filter,g=r.every,v=r.some,y=r.indexOf,b=r.lastIndexOf,w=Array.isArray,E=Object.keys,T=o.bind,P=function(e){return e instanceof P?e:this instanceof P?(this._wrapped=e,void 0):new P(e)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=P),exports._=P):e._=P,P.VERSION="1.5.2";var x=P.each=P.forEach=function(e,t,r){if(null!=e)if(d&&e.forEach===d)e.forEach(t,r);else if(e.length===+e.length){for(var i=0,o=e.length;o>i;i++)if(t.call(r,e[i],i,e)===n)return}else for(var a=P.keys(e),i=0,o=a.length;o>i;i++)if(t.call(r,e[a[i]],a[i],e)===n)return};P.map=P.collect=function(e,t,n){var r=[];return null==e?r:p&&e.map===p?e.map(t,n):(x(e,function(e,i,o){r.push(t.call(n,e,i,o))}),r)};var k="Reduce of empty array with no initial value";P.reduce=P.foldl=P.inject=function(e,t,n,r){var i=arguments.length>2;if(null==e&&(e=[]),h&&e.reduce===h)return r&&(t=P.bind(t,r)),i?e.reduce(t,n):e.reduce(t);if(x(e,function(e,o,a){i?n=t.call(r,n,e,o,a):(n=e,i=!0)}),!i)throw new TypeError(k);return n},P.reduceRight=P.foldr=function(e,t,n,r){var i=arguments.length>2;if(null==e&&(e=[]),f&&e.reduceRight===f)return r&&(t=P.bind(t,r)),i?e.reduceRight(t,n):e.reduceRight(t);var o=e.length;if(o!==+o){var a=P.keys(e);o=a.length}if(x(e,function(s,l,u){l=a?a[--o]:--o,i?n=t.call(r,n,e[l],l,u):(n=e[l],i=!0)}),!i)throw new TypeError(k);return n},P.find=P.detect=function(e,t,n){var r;return R(e,function(e,i,o){return t.call(n,e,i,o)?(r=e,!0):void 0}),r},P.filter=P.select=function(e,t,n){var r=[];return null==e?r:m&&e.filter===m?e.filter(t,n):(x(e,function(e,i,o){t.call(n,e,i,o)&&r.push(e)}),r)},P.reject=function(e,t,n){return P.filter(e,function(e,r,i){return!t.call(n,e,r,i)},n)},P.every=P.all=function(e,t,r){t||(t=P.identity);var i=!0;return null==e?i:g&&e.every===g?e.every(t,r):(x(e,function(e,o,a){return(i=i&&t.call(r,e,o,a))?void 0:n}),!!i)};var R=P.some=P.any=function(e,t,r){t||(t=P.identity);var i=!1;return null==e?i:v&&e.some===v?e.some(t,r):(x(e,function(e,o,a){return i||(i=t.call(r,e,o,a))?n:void 0}),!!i)};P.contains=P.include=function(e,t){return null==e?!1:y&&e.indexOf===y?-1!=e.indexOf(t):R(e,function(e){return e===t})},P.invoke=function(e,t){var n=s.call(arguments,2),r=P.isFunction(t);return P.map(e,function(e){return(r?t:e[t]).apply(e,n)})},P.pluck=function(e,t){return P.map(e,function(e){return e[t]})},P.where=function(e,t,n){return P.isEmpty(t)?n?void 0:[]:P[n?"find":"filter"](e,function(e){for(var n in t)if(t[n]!==e[n])return!1;return!0})},P.findWhere=function(e,t){return P.where(e,t,!0)},P.max=function(e,t,n){if(!t&&P.isArray(e)&&e[0]===+e[0]&&e.length<65535)return Math.max.apply(Math,e);if(!t&&P.isEmpty(e))return-1/0;var r={computed:-1/0,value:-1/0};return x(e,function(e,i,o){var a=t?t.call(n,e,i,o):e;a>r.computed&&(r={value:e,computed:a})}),r.value},P.min=function(e,t,n){if(!t&&P.isArray(e)&&e[0]===+e[0]&&e.length<65535)return Math.min.apply(Math,e);if(!t&&P.isEmpty(e))return 1/0;var r={computed:1/0,value:1/0};return x(e,function(e,i,o){var a=t?t.call(n,e,i,o):e;a<r.computed&&(r={value:e,computed:a})}),r.value},P.shuffle=function(e){var t,n=0,r=[];return x(e,function(e){t=P.random(n++),r[n-1]=r[t],r[t]=e}),r},P.sample=function(e,t,n){return arguments.length<2||n?e[P.random(e.length-1)]:P.shuffle(e).slice(0,Math.max(0,t))};var A=function(e){return P.isFunction(e)?e:function(t){return t[e]}};P.sortBy=function(e,t,n){var r=A(t);return P.pluck(P.map(e,function(e,t,i){return{value:e,index:t,criteria:r.call(n,e,t,i)}}).sort(function(e,t){var n=e.criteria,r=t.criteria;if(n!==r){if(n>r||void 0===n)return 1;if(r>n||void 0===r)return-1}return e.index-t.index}),"value")};var C=function(e){return function(t,n,r){var i={},o=null==n?P.identity:A(n);return x(t,function(n,a){var s=o.call(r,n,a,t);e(i,s,n)}),i}};P.groupBy=C(function(e,t,n){(P.has(e,t)?e[t]:e[t]=[]).push(n)}),P.indexBy=C(function(e,t,n){e[t]=n}),P.countBy=C(function(e,t){P.has(e,t)?e[t]++:e[t]=1}),P.sortedIndex=function(e,t,n,r){n=null==n?P.identity:A(n);for(var i=n.call(r,t),o=0,a=e.length;a>o;){var s=o+a>>>1;n.call(r,e[s])<i?o=s+1:a=s}return o},P.toArray=function(e){return e?P.isArray(e)?s.call(e):e.length===+e.length?P.map(e,P.identity):P.values(e):[]},P.size=function(e){return null==e?0:e.length===+e.length?e.length:P.keys(e).length},P.first=P.head=P.take=function(e,t,n){return null==e?void 0:null==t||n?e[0]:s.call(e,0,t)},P.initial=function(e,t,n){return s.call(e,0,e.length-(null==t||n?1:t))},P.last=function(e,t,n){return null==e?void 0:null==t||n?e[e.length-1]:s.call(e,Math.max(e.length-t,0))},P.rest=P.tail=P.drop=function(e,t,n){return s.call(e,null==t||n?1:t)},P.compact=function(e){return P.filter(e,P.identity)};var O=function(e,t,n){return t&&P.every(e,P.isArray)?l.apply(n,e):(x(e,function(e){P.isArray(e)||P.isArguments(e)?t?a.apply(n,e):O(e,t,n):n.push(e)}),n)};P.flatten=function(e,t){return O(e,t,[])},P.without=function(e){return P.difference(e,s.call(arguments,1))},P.uniq=P.unique=function(e,t,n,r){P.isFunction(t)&&(r=n,n=t,t=!1);var i=n?P.map(e,n,r):e,o=[],a=[];return x(i,function(n,r){(t?r&&a[a.length-1]===n:P.contains(a,n))||(a.push(n),o.push(e[r]))}),o},P.union=function(){return P.uniq(P.flatten(arguments,!0))},P.intersection=function(e){var t=s.call(arguments,1);return P.filter(P.uniq(e),function(e){return P.every(t,function(t){return P.indexOf(t,e)>=0})})},P.difference=function(e){var t=l.apply(r,s.call(arguments,1));return P.filter(e,function(e){return!P.contains(t,e)})},P.zip=function(){for(var e=P.max(P.pluck(arguments,"length").concat(0)),t=new Array(e),n=0;e>n;n++)t[n]=P.pluck(arguments,""+n);return t},P.object=function(e,t){if(null==e)return{};for(var n={},r=0,i=e.length;i>r;r++)t?n[e[r]]=t[r]:n[e[r][0]]=e[r][1];return n},P.indexOf=function(e,t,n){if(null==e)return-1;var r=0,i=e.length;if(n){if("number"!=typeof n)return r=P.sortedIndex(e,t),e[r]===t?r:-1;r=0>n?Math.max(0,i+n):n}if(y&&e.indexOf===y)return e.indexOf(t,n);for(;i>r;r++)if(e[r]===t)return r;return-1},P.lastIndexOf=function(e,t,n){if(null==e)return-1;var r=null!=n;if(b&&e.lastIndexOf===b)return r?e.lastIndexOf(t,n):e.lastIndexOf(t);for(var i=r?n:e.length;i--;)if(e[i]===t)return i;return-1},P.range=function(e,t,n){arguments.length<=1&&(t=e||0,e=0),n=arguments[2]||1;for(var r=Math.max(Math.ceil((t-e)/n),0),i=0,o=new Array(r);r>i;)o[i++]=e,e+=n;return o};var S=function(){};P.bind=function(e,t){var n,r;if(T&&e.bind===T)return T.apply(e,s.call(arguments,1));if(!P.isFunction(e))throw new TypeError;return n=s.call(arguments,2),r=function(){if(!(this instanceof r))return e.apply(t,n.concat(s.call(arguments)));S.prototype=e.prototype;var i=new S;S.prototype=null;var o=e.apply(i,n.concat(s.call(arguments)));return Object(o)===o?o:i}},P.partial=function(e){var t=s.call(arguments,1);return function(){return e.apply(this,t.concat(s.call(arguments)))}},P.bindAll=function(e){var t=s.call(arguments,1);if(0===t.length)throw new Error("bindAll must be passed function names");return x(t,function(t){e[t]=P.bind(e[t],e)}),e},P.memoize=function(e,t){var n={};return t||(t=P.identity),function(){var r=t.apply(this,arguments);return P.has(n,r)?n[r]:n[r]=e.apply(this,arguments)}},P.delay=function(e,t){var n=s.call(arguments,2);return setTimeout(function(){return e.apply(null,n)},t)},P.defer=function(e){return P.delay.apply(P,[e,1].concat(s.call(arguments,1)))},P.throttle=function(e,t,n){var r,i,o,a=null,s=0;n||(n={});var l=function(){s=n.leading===!1?0:new Date,a=null,o=e.apply(r,i)};return function(){var u=new Date;s||n.leading!==!1||(s=u);var c=t-(u-s);return r=this,i=arguments,0>=c?(clearTimeout(a),a=null,s=u,o=e.apply(r,i)):a||n.trailing===!1||(a=setTimeout(l,c)),o}},P.debounce=function(e,t,n){var r,i,o,a,s;return function(){o=this,i=arguments,a=new Date;var l=function(){var u=new Date-a;t>u?r=setTimeout(l,t-u):(r=null,n||(s=e.apply(o,i)))},u=n&&!r;return r||(r=setTimeout(l,t)),u&&(s=e.apply(o,i)),s}},P.once=function(e){var t,n=!1;return function(){return n?t:(n=!0,t=e.apply(this,arguments),e=null,t)}},P.wrap=function(e,t){return function(){var n=[e];return a.apply(n,arguments),t.apply(this,n)}},P.compose=function(){var e=arguments;return function(){for(var t=arguments,n=e.length-1;n>=0;n--)t=[e[n].apply(this,t)];return t[0]}},P.after=function(e,t){return function(){return--e<1?t.apply(this,arguments):void 0}},P.keys=E||function(e){if(e!==Object(e))throw new TypeError("Invalid object");var t=[];for(var n in e)P.has(e,n)&&t.push(n);return t},P.values=function(e){for(var t=P.keys(e),n=t.length,r=new Array(n),i=0;n>i;i++)r[i]=e[t[i]];return r},P.pairs=function(e){for(var t=P.keys(e),n=t.length,r=new Array(n),i=0;n>i;i++)r[i]=[t[i],e[t[i]]];return r},P.invert=function(e){for(var t={},n=P.keys(e),r=0,i=n.length;i>r;r++)t[e[n[r]]]=n[r];return t},P.functions=P.methods=function(e){var t=[];for(var n in e)P.isFunction(e[n])&&t.push(n);return t.sort()},P.extend=function(e){return x(s.call(arguments,1),function(t){if(t)for(var n in t)e[n]=t[n]}),e},P.pick=function(e){var t={},n=l.apply(r,s.call(arguments,1));return x(n,function(n){n in e&&(t[n]=e[n])}),t},P.omit=function(e){var t={},n=l.apply(r,s.call(arguments,1));for(var i in e)P.contains(n,i)||(t[i]=e[i]);return t},P.defaults=function(e){return x(s.call(arguments,1),function(t){if(t)for(var n in t)void 0===e[n]&&(e[n]=t[n])}),e},P.clone=function(e){return P.isObject(e)?P.isArray(e)?e.slice():P.extend({},e):e},P.tap=function(e,t){return t(e),e};var D=function(e,t,n,r){if(e===t)return 0!==e||1/e==1/t;if(null==e||null==t)return e===t;e instanceof P&&(e=e._wrapped),t instanceof P&&(t=t._wrapped);var i=u.call(e);if(i!=u.call(t))return!1;switch(i){case"[object String]":return e==String(t);case"[object Number]":return e!=+e?t!=+t:0==e?1/e==1/t:e==+t;case"[object Date]":case"[object Boolean]":return+e==+t;case"[object RegExp]":return e.source==t.source&&e.global==t.global&&e.multiline==t.multiline&&e.ignoreCase==t.ignoreCase}if("object"!=typeof e||"object"!=typeof t)return!1;for(var o=n.length;o--;)if(n[o]==e)return r[o]==t;var a=e.constructor,s=t.constructor;if(a!==s&&!(P.isFunction(a)&&a instanceof a&&P.isFunction(s)&&s instanceof s))return!1;n.push(e),r.push(t);var l=0,c=!0;if("[object Array]"==i){if(l=e.length,c=l==t.length)for(;l--&&(c=D(e[l],t[l],n,r)););}else{for(var d in e)if(P.has(e,d)&&(l++,!(c=P.has(t,d)&&D(e[d],t[d],n,r))))break;if(c){for(d in t)if(P.has(t,d)&&!l--)break;c=!l}}return n.pop(),r.pop(),c};P.isEqual=function(e,t){return D(e,t,[],[])},P.isEmpty=function(e){if(null==e)return!0;if(P.isArray(e)||P.isString(e))return 0===e.length;for(var t in e)if(P.has(e,t))return!1;return!0},P.isElement=function(e){return!(!e||1!==e.nodeType)},P.isArray=w||function(e){return"[object Array]"==u.call(e)},P.isObject=function(e){return e===Object(e)},x(["Arguments","Function","String","Number","Date","RegExp"],function(e){P["is"+e]=function(t){return u.call(t)=="[object "+e+"]"}}),P.isArguments(arguments)||(P.isArguments=function(e){return!(!e||!P.has(e,"callee"))}),"function"!=typeof/./&&(P.isFunction=function(e){return"function"==typeof e}),P.isFinite=function(e){return isFinite(e)&&!isNaN(parseFloat(e))},P.isNaN=function(e){return P.isNumber(e)&&e!=+e},P.isBoolean=function(e){return e===!0||e===!1||"[object Boolean]"==u.call(e)},P.isNull=function(e){return null===e},P.isUndefined=function(e){return void 0===e},P.has=function(e,t){return c.call(e,t)},P.noConflict=function(){return e._=t,this},P.identity=function(e){return e},P.times=function(e,t,n){for(var r=Array(Math.max(0,e)),i=0;e>i;i++)r[i]=t.call(n,i);return r},P.random=function(e,t){return null==t&&(t=e,e=0),e+Math.floor(Math.random()*(t-e+1))};var M={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;"}};M.unescape=P.invert(M.escape);var L={escape:new RegExp("["+P.keys(M.escape).join("")+"]","g"),unescape:new RegExp("("+P.keys(M.unescape).join("|")+")","g")};P.each(["escape","unescape"],function(e){P[e]=function(t){return null==t?"":(""+t).replace(L[e],function(t){return M[e][t]})}}),P.result=function(e,t){if(null==e)return void 0;var n=e[t];return P.isFunction(n)?n.call(e):n},P.mixin=function(e){x(P.functions(e),function(t){var n=P[t]=e[t];P.prototype[t]=function(){var e=[this._wrapped];return a.apply(e,arguments),F.call(this,n.apply(P,e))}})};var I=0;P.uniqueId=function(e){var t=++I+"";return e?e+t:t},P.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var N=/(.)^/,z={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},_=/\\|'|\r|\n|\t|\u2028|\u2029/g;P.template=function(e,t,n){var r;n=P.defaults({},n,P.templateSettings);var i=new RegExp([(n.escape||N).source,(n.interpolate||N).source,(n.evaluate||N).source].join("|")+"|$","g"),o=0,a="__p+='";e.replace(i,function(t,n,r,i,s){return a+=e.slice(o,s).replace(_,function(e){return"\\"+z[e]}),n&&(a+="'+\n((__t=("+n+"))==null?'':_.escape(__t))+\n'"),r&&(a+="'+\n((__t=("+r+"))==null?'':__t)+\n'"),i&&(a+="';\n"+i+"\n__p+='"),o=s+t.length,t}),a+="';\n",n.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{r=new Function(n.variable||"obj","_",a)}catch(s){throw s.source=a,s}if(t)return r(t,P);var l=function(e){return r.call(this,e,P)};return l.source="function("+(n.variable||"obj")+"){\n"+a+"}",l},P.chain=function(e){return P(e).chain()};var F=function(e){return this._chain?P(e).chain():e};P.mixin(P),x(["pop","push","reverse","shift","sort","splice","unshift"],function(e){var t=r[e];P.prototype[e]=function(){var n=this._wrapped;return t.apply(n,arguments),"shift"!=e&&"splice"!=e||0!==n.length||delete n[0],F.call(this,n)}}),x(["concat","join","slice"],function(e){var t=r[e];P.prototype[e]=function(){return F.call(this,t.apply(this._wrapped,arguments))}}),P.extend(P.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}.call(this);