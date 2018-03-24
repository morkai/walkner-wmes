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
 * Date: 09.09.2010
 * Time: 19:02:33
 */

!function(e,n){"function"==typeof define&&define.amd?define(n):e.form2js=n()}(this,function(){"use strict";function e(e,r,u,a,i){void 0!==u&&null!=u||(u=!0),void 0!==r&&null!=r||(r="."),arguments.length<5&&(i=!1),e="string"==typeof e?document.getElementById(e):e;var l,c=[],s=0;if(e.constructor==Array||"undefined"!=typeof NodeList&&e.constructor==NodeList)for(;l=e[s++];)c=c.concat(t(l,a,i));else c=t(e,a,i);return n(c,u,r)}function n(e,n,t){var r,u,a,i,l,c,s,o,f,h,d,g,m,p={},v={};for(r=0;r<e.length;r++)if(l=e[r].value,!n||""!==l&&null!==l){for(g=e[r].name,m=g.split(t),c=[],s=p,o="",u=0;u<m.length;u++)if(d=m[u].split("]["),d.length>1)for(a=0;a<d.length;a++)if(0==a?d[a]=d[a]+"]":a==d.length-1?d[a]="["+d[a]:d[a]="["+d[a]+"]",h=d[a].match(/([a-z_]+)?\[([a-z_][a-z0-9_]+?)\]/i))for(i=1;i<h.length;i++)h[i]&&c.push(h[i]);else c.push(d[a]);else c=c.concat(d);for(u=0;u<c.length;u++)d=c[u],d.indexOf("[]")>-1&&u==c.length-1?(f=d.substr(0,d.indexOf("[")),o+=f,s[f]||(s[f]=[]),s[f].push(l)):d.indexOf("[")>-1?(f=d.substr(0,d.indexOf("[")),h=d.replace(/(^([a-z_]+)?\[)|(\]$)/gi,""),o+="_"+f+"_"+h,v[o]||(v[o]={}),""==f||s[f]||(s[f]=[]),u==c.length-1?""==f?(s.push(l),v[o][h]=s[s.length-1]):(s[f].push(l),v[o][h]=s[f][s[f].length-1]):v[o][h]||(/^[a-z_]+\[?/i.test(c[u+1])?s[f].push({}):s[f].push([]),v[o][h]=s[f][s[f].length-1]),s=v[o][h]):(o+=d,u<c.length-1?(s[d]||(s[d]={}),s=s[d]):s[d]=l)}return p}function t(e,n,t){var a=u(e,n,t);return a.length>0?a:r(e,n,t)}function r(e,n,t){for(var r=[],a=e.firstChild;a;)r=r.concat(u(a,n,t)),a=a.nextSibling;return r}function u(e,n,t){var u,l,c,s=a(e,t);return u=n&&n(e),u&&u.name?c=[u]:""!=s&&e.nodeName.match(/INPUT|TEXTAREA/i)?(l=i(e),c=[{name:s,value:l}]):""!=s&&e.nodeName.match(/SELECT/i)?(l=i(e),c=[{name:s.replace(/\[\]$/,""),value:l}]):c=r(e,n,t),c}function a(e,n){return e.name&&""!=e.name?e.name:n&&e.id&&""!=e.id?e.id:""}function i(e){if(e.disabled)return null;switch(e.nodeName){case"INPUT":case"TEXTAREA":switch(e.type.toLowerCase()){case"radio":if(e.checked&&"false"===e.value)return!1;case"checkbox":if(e.checked&&"true"===e.value)return!0;if(!e.checked&&"true"===e.value)return!1;if(e.checked)return e.value;break;case"button":case"reset":case"submit":case"image":return"";default:return e.value}break;case"SELECT":return l(e)}return null}function l(e){var n,t,r,u=e.multiple,a=[];if(!u)return e.value;for(n=e.getElementsByTagName("option"),t=0,r=n.length;t<r;t++)n[t].selected&&a.push(n[t].value);return a}return e});