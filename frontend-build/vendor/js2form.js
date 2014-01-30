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

!function(e,t){"function"==typeof define&&define.amd?define(t):e.js2form=t()}(this,function(){function e(e,r,o,a,s){arguments.length<3&&(o="."),arguments.length<4&&(a=null),arguments.length<5&&(s=!1);var u,c;u=i(r),c=n(e,s,o,{},!0);for(var d=0;d<u.length;d++){var p=u[d].name,h=u[d].value;"undefined"!=typeof c[p]?t(c[p],h):"undefined"!=typeof c[p.replace(l,"[]")]&&t(c[p.replace(l,"[]")],h)}}function t(e,t){var n,r,i;if(e instanceof Array)for(r=0;r<e.length;r++)(String(e[r].value)==String(t)||t===!0)&&(e[r].checked=!0);else if(d.test(e.nodeName))e.value=t;else if(/SELECT/i.test(e.nodeName))for(n=e.getElementsByTagName("option"),r=0,i=n.length;i>r;r++)if(n[r].value==t){if(n[r].selected=!0,e.multiple)break}else e.multiple||(n[r].selected=!1)}function n(e,t,i,o,a){arguments.length<4&&(o={});for(var s,u,c,d,p,h,f,m={},g=e.firstChild;g;){if(s="",g.name&&""!=g.name?s=g.name:t&&g.id&&""!=g.id&&(s=g.id),""==s){var v=n(g,t,i,o,a);for(c in v)if("undefined"==typeof m[c])m[c]=v[c];else for(d=0;d<v[c].length;d++)m[c].push(v[c][d])}else if(/SELECT/i.test(g.nodeName))for(p=0,f=g.getElementsByTagName("option"),h=f.length;h>p;p++)a&&(f[p].selected=!1),u=r(s,i,o),m[u]=g;else/INPUT/i.test(g.nodeName)&&/CHECKBOX|RADIO/i.test(g.type)?(a&&(g.checked=!1),u=r(s,i,o),u=u.replace(l,"[]"),m[u]||(m[u]=[]),m[u].push(g)):(a&&(g.value=""),u=r(s,i,o),m[u]=g);g=g.nextSibling}return m}function r(e,t,n){var r,i,o,a,s,l,d=[],p=e.split(t);for(e=e.replace(c,"[$1].[$2]"),l=0;l<p.length;l++)r=p[l],d.push(r),i=r.match(u),null!=i&&(o=d.join(t),a=o.replace(u,"$3"),o=o.replace(u,"$1"),"undefined"==typeof n[o]&&(n[o]={lastIndex:-1,indexes:{}}),(""==a||"undefined"==typeof n[o].indexes[a])&&(n[o].lastIndex++,n[o].indexes[a]=n[o].lastIndex),s=n[o].indexes[a],d[d.length-1]=r.replace(u,"$1$2"+s+"$4"));return o=d.join(t),o=o.replace("].[","][")}function i(e,t){var n,r,i=[];if(1==arguments.length&&(t=0),null==e)i=[{name:"",value:null}];else if("string"==typeof e||"number"==typeof e||"date"==typeof e||"boolean"==typeof e)i=[{name:"",value:e}];else if(e instanceof Array)for(n=0;n<e.length;n++)r="["+n+"]",i=i.concat(o(e[n],r,t+1));else for(n in e)r=n,i=i.concat(o(e[n],r,t+1));return i}function o(e,t,n){var r,o,l,u=[],c=i(e,n+1);for(o=0;o<c.length;o++)r=t,a.test(c[o].name)?r+=c[o].name:s.test(c[o].name)&&(r+="."+c[o].name),l={name:r,value:c[o].value},u.push(l);return u}var a=/^\[\d+?\]/,s=/^[a-zA-Z_][a-zA-Z_0-9]+/,l=/\[[0-9]+?\]$/,u=/(.*)(\[)([0-9]*)(\])$/,c=/\[([0-9]+)\]\[([0-9]+)\]/g,d=/INPUT|TEXTAREA/i;return e});