define(["require","exports","module","./Term","./valueConverters"],function(e,t,n){function r(e){this.options=e instanceof r.Options?e:new r.Options(e)}var i=e("./Term"),o=e("./valueConverters");n.exports=r;var a=/^[\w_\*\-\+\.\$:%]$/,s=/[\+\*\$\-:\w%\._]*\/[\+\*\$\-:\w%\._\/]*/g,l=new RegExp("(\\([\\+\\*\\$\\-:\\w%\\._,]+\\)|[\\+\\*\\$\\-:\\w%\\._]*|)([<>!]?=(?:[\\w]*=)?|>|<)(\\([\\+\\*\\$\\-:\\w%\\._,]+\\)|[\\+\\*\\$\\-:\\w%\\._]*|)","g"),u={"=":"eq","==":"eq",">":"gt",">=":"ge","<":"lt","<=":"le","!=":"ne"};r.Options=function(e){("object"!=typeof e||null===e)&&(e={}),this.jsonQueryCompatible=e.jsonQueryCompatible===!0,this.fiqlCompatible=!e.hasOwnProperty("fiqlCompatible")||e.fiqlCompatible===!0,this.allowSlashedArrays=e.allowSlashedArrays===!0,this.allowEmptyValues=e.allowEmptyValues===!0,this.defaultValueConverter="function"==typeof e.defaultValueConverter?e.defaultValueConverter:o.default,this.specialTerms=Array.isArray(e.specialTerms)?e.specialTerms:[],this.emptyValue=e.hasOwnProperty("emptyValue")?e.emptyValue:""},r.prototype.parse=function(e,t){var n="object"==typeof t&&null!==t,r=this.options.specialTerms,o=null,s=new i,l=[],u=!0;this.options.jsonQueryCompatible&&(e=this.makeJsonQueryCompatible(e)),this.options.allowSlashedArrays&&(e=this.convertSlashedArrays(e)),this.options.fiqlCompatible&&(e=this.convertFiql(e));for(var c=0,d=e.length;d>c;++c){var p=e[c];switch(p){case"(":l.push(s),s=new i(o),n&&null!==o&&-1!==r.indexOf(o)&&(delete t[o],t[o]=s.args),o=null,u=!0;break;case",":if(u===!1){if(!this.options.allowEmptyValues)throw new Error("Empty value at position "+c+" is not allowed.");o=this.options.emptyValue}null!==o&&(s.args.push(this.convertStringToValue(o)),o=null),u=!1;break;case")":null!==o&&(s.args.push(this.convertStringToValue(o)),o=null);var f=null===s.name?s.args:s;s=l.pop(),s.args.push(f),u=!0;break;case"&":case"|":var h="&"===p?"and":"or";if(null!==s.name&&s.name!==h)throw new Error("Can not mix conjunctions within a group at position "+c+", use parenthesises around each set of the same "+"conjunctions (& and |)");s.name="&"===p?"and":"or",null!==o&&(s.args.push(this.convertStringToValue(o)),o=null);break;default:if(!a.test(p))throw new Error("Invalid character at position "+c+": '"+p+"' ("+p.charCodeAt(0)+")");null===o?o=p:o+=p,u=!0}}return null!==o&&s.args.push(this.convertStringToValue(o)),null===s.name&&(s.name="and"),"and"===s.name&&1===s.args.length&&s.args[0]instanceof i&&"and"===s.args[0].name&&(s=s.args[0]),s},r.prototype.makeJsonQueryCompatible=function(e){return this.options.jsonQueryCompatible&&(e=e.replace(/%3C=/g,"=le=").replace(/%3E=/g,"=ge=").replace(/%3C/g,"=lt=").replace(/%3E/g,"=gt=")),e},r.prototype.convertSlashedArrays=function(e){return-1!==e.indexOf("/")?e.replace(s,function(e){return"("+e.replace(/\//g,",")+")"}):e},r.prototype.convertFiql=function(e){return e.replace(l,function(e,t,n,r){return n=n.length<3?u[n]:n.substring(1,n.length-1),n+"("+t+","+r+")"})},r.prototype.convertStringToValue=function(e){var t,n=e.indexOf(":");if(-1!==n){var r=e.substr(0,n);if(t=o[r],"undefined"==typeof t)throw new Error("Unknown value converter: "+r);e=e.substr(n+1)}else t=this.options.defaultValueConverter;return t(e,this)}});