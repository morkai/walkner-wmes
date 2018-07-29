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

!function(e,n){"function"==typeof define&&define.amd?define(n):e.js2form=n()}(this,function(){"use strict";function e(e,l,i,r,o){arguments.length<3&&(i="."),arguments.length,arguments.length<5&&(o=!1);var s,u;s=a(l),u=t(e,o,i,{},!0);for(var c=0;c<s.length;c++){var d=s[c].name,m=s[c].value;void 0!==u[d]?n(u[d],m):void 0!==u[d.replace(f,"[]")]&&n(u[d.replace(f,"[]")],m)}}function n(e,n){var t,l,a;if(e instanceof Array)for(l=0;l<e.length;l++)String(e[l].value)==String(n)&&(e[l].checked=!0);else if(c.test(e.nodeName)&&"file"!==e.type)e.value=n;else if(/SELECT/i.test(e.nodeName))for(t=e.getElementsByTagName("option"),l=0,a=t.length;l<a;l++)if(t[l].value==n){if(t[l].selected=!0,e.multiple)break}else e.multiple||(t[l].selected=!1)}function t(e,n,a,i,r){arguments.length<4&&(i={});for(var o,s,u,c,d,m,p,v={},g=e.firstChild;g;){if(o="",g.name&&""!=g.name?o=g.name:n&&g.id&&""!=g.id&&(o=g.id),""==o){var h=t(g,n,a,i,r);for(u in h)if(void 0===v[u])v[u]=h[u];else for(c=0;c<h[u].length;c++)v[u].push(h[u][c])}else if(/SELECT/i.test(g.nodeName))for(d=0,p=g.getElementsByTagName("option"),m=p.length;d<m;d++)r&&(p[d].selected=!1),s=l(o,a,i),s=s.replace(f,"[]"),v[s]=g;else/INPUT/i.test(g.nodeName)&&/CHECKBOX|RADIO/i.test(g.type)?(r&&(g.checked=!1),s=l(o,a,i),s=s.replace(f,"[]"),v[s]||(v[s]=[]),v[s].push(g)):(r&&(g.value=""),s=l(o,a,i),v[s]=g);g=g.nextSibling}return v}function l(e,n,t){var l,a,i,r,o,f=[],c=e.split(n);for(e=e.replace(u,"[$1].[$2]"),o=0;o<c.length;o++)l=c[o],f.push(l),null!=l.match(s)&&(a=f.join(n),i=a.replace(s,"$3"),a=a.replace(s,"$1"),void 0===t[a]&&(t[a]={lastIndex:-1,indexes:{}}),""!=i&&void 0!==t[a].indexes[i]||(t[a].lastIndex++,t[a].indexes[i]=t[a].lastIndex),r=t[a].indexes[i],f[f.length-1]=l.replace(s,"$1$2"+r+"$4"));return a=f.join(n),a=a.replace("].[","][")}function a(e,n){var t,l,a=[];if(1==arguments.length&&(n=0),null==e)a=[{name:"",value:null}];else if("string"==typeof e||"number"==typeof e||"date"==typeof e||"boolean"==typeof e)a=[{name:"",value:e}];else if(e instanceof Array)for(t=0;t<e.length;t++)l="["+t+"]",a=a.concat(i(e[t],l,n+1));else for(t in e)l=t,a=a.concat(i(e[t],l,n+1));return a}function i(e,n,t){var l,i,f,s=[],u=a(e,t+1);for(i=0;i<u.length;i++)l=n,r.test(u[i].name)?l+=u[i].name:o.test(u[i].name)&&(l+="."+u[i].name),f={name:l,value:u[i].value},s.push(f);return s}var r=/^\[\d+?\]/,o=/^[a-zA-Z_][a-zA-Z_0-9]*/,f=/\[[0-9]+?\]$/,s=/(.*)(\[)([0-9]*)(\])$/,u=/\[([0-9]+)\]\[([0-9]+)\]/g,c=/INPUT|TEXTAREA/i;return e});