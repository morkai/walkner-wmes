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

!function(e,n){"function"==typeof define&&define.amd?define(n):e.js2form=n()}(this,function(){function e(e,a,i,r,f){arguments.length<3&&(i="."),arguments.length<4&&(r=null),arguments.length<5&&(f=!1);var s,u;s=l(a),u=t(e,f,i,{},!0);for(var d=0;d<s.length;d++){var c=s[d].name,m=s[d].value;"undefined"!=typeof u[c]?n(u[c],m):"undefined"!=typeof u[c.replace(o,"[]")]&&n(u[c.replace(o,"[]")],m)}}function n(e,n){var t,a,l;if(e instanceof Array)for(a=0;a<e.length;a++)(String(e[a].value)==String(n)||n===!0)&&(e[a].checked=!0);else if(d.test(e.nodeName))e.value=n;else if(/SELECT/i.test(e.nodeName))for(t=e.getElementsByTagName("option"),a=0,l=t.length;l>a;a++)if(t[a].value==n){if(t[a].selected=!0,e.multiple)break}else e.multiple||(t[a].selected=!1)}function t(e,n,l,i,r){arguments.length<4&&(i={});for(var f,s,u,d,c,m,p,g={},h=e.firstChild;h;){if(f="",h.name&&""!=h.name?f=h.name:n&&h.id&&""!=h.id&&(f=h.id),""==f){var v=t(h,n,l,i,r);for(u in v)if("undefined"==typeof g[u])g[u]=v[u];else for(d=0;d<v[u].length;d++)g[u].push(v[u][d])}else if(/SELECT/i.test(h.nodeName))for(c=0,p=h.getElementsByTagName("option"),m=p.length;m>c;c++)r&&(p[c].selected=!1),s=a(f,l,i),s=s.replace(o,"[]"),g[s]=h;else/INPUT/i.test(h.nodeName)&&/CHECKBOX|RADIO/i.test(h.type)?(r&&(h.checked=!1),s=a(f,l,i),s=s.replace(o,"[]"),g[s]||(g[s]=[]),g[s].push(h)):(r&&(h.value=""),s=a(f,l,i),g[s]=h);h=h.nextSibling}return g}function a(e,n,t){var a,l,i,r,f,o,d=[],c=e.split(n);for(e=e.replace(u,"[$1].[$2]"),o=0;o<c.length;o++)a=c[o],d.push(a),l=a.match(s),null!=l&&(i=d.join(n),r=i.replace(s,"$3"),i=i.replace(s,"$1"),"undefined"==typeof t[i]&&(t[i]={lastIndex:-1,indexes:{}}),(""==r||"undefined"==typeof t[i].indexes[r])&&(t[i].lastIndex++,t[i].indexes[r]=t[i].lastIndex),f=t[i].indexes[r],d[d.length-1]=a.replace(s,"$1$2"+f+"$4"));return i=d.join(n),i=i.replace("].[","][")}function l(e,n){var t,a,l=[];if(1==arguments.length&&(n=0),null==e)l=[{name:"",value:null}];else if("string"==typeof e||"number"==typeof e||"date"==typeof e||"boolean"==typeof e)l=[{name:"",value:e}];else if(e instanceof Array)for(t=0;t<e.length;t++)a="["+t+"]",l=l.concat(i(e[t],a,n+1));else for(t in e)a=t,l=l.concat(i(e[t],a,n+1));return l}function i(e,n,t){var a,i,o,s=[],u=l(e,t+1);for(i=0;i<u.length;i++)a=n,r.test(u[i].name)?a+=u[i].name:f.test(u[i].name)&&(a+="."+u[i].name),o={name:a,value:u[i].value},s.push(o);return s}var r=/^\[\d+?\]/,f=/^[a-zA-Z_][a-zA-Z_0-9]+/,o=/\[[0-9]+?\]$/,s=/(.*)(\[)([0-9]*)(\])$/,u=/\[([0-9]+)\]\[([0-9]+)\]/g,d=/INPUT|TEXTAREA/i;return e});