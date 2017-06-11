/**
 * Copyright (c) 2010 Maxim Vasiliev
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @author Maxim Vasiliev
 * Date: 19.09.11
 * Time: 23:40
 */

!function(e,n){"function"==typeof define&&define.amd?define(n):e.js2form=n()}(this,function(){"use strict";function e(e,l,i,f,r){arguments.length<3&&(i="."),arguments.length<4&&(f=null),arguments.length<5&&(r=!1);var s,u;s=a(l),u=t(e,r,i,{},!0);for(var d=0;d<s.length;d++){var c=s[d].name,p=s[d].value;"undefined"!=typeof u[c]?n(u[c],p):"undefined"!=typeof u[c.replace(o,"[]")]&&n(u[c.replace(o,"[]")],p)}}function n(e,n){var t,l,a;if(e instanceof Array)for(l=0;l<e.length;l++)String(e[l].value)==String(n)&&(e[l].checked=!0);else if(d.test(e.nodeName))e.value=n;else if(/SELECT/i.test(e.nodeName))for(t=e.getElementsByTagName("option"),l=0,a=t.length;l<a;l++)if(t[l].value==n){if(t[l].selected=!0,e.multiple)break}else e.multiple||(t[l].selected=!1)}function t(e,n,a,i,f){arguments.length<4&&(i={});for(var r,s,u,d,c,p,m,g={},h=e.firstChild;h;){if(r="",h.name&&""!=h.name?r=h.name:n&&h.id&&""!=h.id&&(r=h.id),""==r){var v=t(h,n,a,i,f);for(u in v)if("undefined"==typeof g[u])g[u]=v[u];else for(d=0;d<v[u].length;d++)g[u].push(v[u][d])}else if(/SELECT/i.test(h.nodeName))for(c=0,m=h.getElementsByTagName("option"),p=m.length;c<p;c++)f&&(m[c].selected=!1),s=l(r,a,i),s=s.replace(o,"[]"),g[s]=h;else/INPUT/i.test(h.nodeName)&&/CHECKBOX|RADIO/i.test(h.type)?(f&&(h.checked=!1),s=l(r,a,i),s=s.replace(o,"[]"),g[s]||(g[s]=[]),g[s].push(h)):(f&&(h.value=""),s=l(r,a,i),g[s]=h);h=h.nextSibling}return g}function l(e,n,t){var l,a,i,f,r,o,d=[],c=e.split(n);for(e=e.replace(u,"[$1].[$2]"),o=0;o<c.length;o++)l=c[o],d.push(l),a=l.match(s),null!=a&&(i=d.join(n),f=i.replace(s,"$3"),i=i.replace(s,"$1"),"undefined"==typeof t[i]&&(t[i]={lastIndex:-1,indexes:{}}),""!=f&&"undefined"!=typeof t[i].indexes[f]||(t[i].lastIndex++,t[i].indexes[f]=t[i].lastIndex),r=t[i].indexes[f],d[d.length-1]=l.replace(s,"$1$2"+r+"$4"));return i=d.join(n),i=i.replace("].[","][")}function a(e,n){var t,l,a=[];if(1==arguments.length&&(n=0),null==e)a=[{name:"",value:null}];else if("string"==typeof e||"number"==typeof e||"date"==typeof e||"boolean"==typeof e)a=[{name:"",value:e}];else if(e instanceof Array)for(t=0;t<e.length;t++)l="["+t+"]",a=a.concat(i(e[t],l,n+1));else for(t in e)l=t,a=a.concat(i(e[t],l,n+1));return a}function i(e,n,t){var l,i,o,s=[],u=a(e,t+1);for(i=0;i<u.length;i++)l=n,f.test(u[i].name)?l+=u[i].name:r.test(u[i].name)&&(l+="."+u[i].name),o={name:l,value:u[i].value},s.push(o);return s}var f=/^\[\d+?\]/,r=/^[a-zA-Z_][a-zA-Z_0-9]*/,o=/\[[0-9]+?\]$/,s=/(.*)(\[)([0-9]*)(\])$/,u=/\[([0-9]+)\]\[([0-9]+)\]/g,d=/INPUT|TEXTAREA/i;return e});