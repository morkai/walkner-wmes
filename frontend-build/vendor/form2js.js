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

!function(e,t){"function"==typeof define&&define.amd?define(t):e.form2js=t()}(this,function(){function e(e,r,i,o,a){("undefined"==typeof i||null==i)&&(i=!0),("undefined"==typeof r||null==r)&&(r="."),arguments.length<5&&(a=!1),e="string"==typeof e?document.getElementById(e):e;var s,l=[],u=0;if(e.constructor==Array||"undefined"!=typeof NodeList&&e.constructor==NodeList)for(;s=e[u++];)l=l.concat(n(s,o,a));else l=n(e,o,a);return t(l,i,r)}function t(e,t,n){var r,i,o,a,s,l,u,c,d,p,f,h,m,v={},g={};for(r=0;r<e.length;r++)if(s=e[r].value,!t||""!==s&&null!==s){for(h=e[r].name,m=h.split(n),l=[],u=v,c="",i=0;i<m.length;i++)if(f=m[i].split("]["),f.length>1)for(o=0;o<f.length;o++)if(f[o]=0==o?f[o]+"]":o==f.length-1?"["+f[o]:"["+f[o]+"]",p=f[o].match(/([a-z_]+)?\[([a-z_][a-z0-9_]+?)\]/i))for(a=1;a<p.length;a++)p[a]&&l.push(p[a]);else l.push(f[o]);else l=l.concat(f);for(i=0;i<l.length;i++)f=l[i],f.indexOf("[]")>-1&&i==l.length-1?(d=f.substr(0,f.indexOf("[")),c+=d,u[d]||(u[d]=[]),u[d].push(s)):f.indexOf("[")>-1?(d=f.substr(0,f.indexOf("[")),p=f.replace(/(^([a-z_]+)?\[)|(\]$)/gi,""),c+="_"+d+"_"+p,g[c]||(g[c]={}),""==d||u[d]||(u[d]=[]),i==l.length-1?""==d?(u.push(s),g[c][p]=u[u.length-1]):(u[d].push(s),g[c][p]=u[d][u[d].length-1]):g[c][p]||(/^[a-z_]+\[?/i.test(l[i+1])?u[d].push({}):u[d].push([]),g[c][p]=u[d][u[d].length-1]),u=g[c][p]):(c+=f,i<l.length-1?(u[f]||(u[f]={}),u=u[f]):u[f]=s)}return v}function n(e,t,n){var o=i(e,t,n);return o.length>0?o:r(e,t,n)}function r(e,t,n){for(var r=[],o=e.firstChild;o;)r=r.concat(i(o,t,n)),o=o.nextSibling;return r}function i(e,t,n){var i,s,l,u=o(e,n);return i=t&&t(e),i&&i.name?l=[i]:""!=u&&e.nodeName.match(/INPUT|TEXTAREA/i)?(s=a(e),l=[{name:u,value:s}]):""!=u&&e.nodeName.match(/SELECT/i)?(s=a(e),l=[{name:u.replace(/\[\]$/,""),value:s}]):l=r(e,t,n),l}function o(e,t){return e.name&&""!=e.name?e.name:t&&e.id&&""!=e.id?e.id:""}function a(e){if(e.disabled)return null;switch(e.nodeName){case"INPUT":case"TEXTAREA":switch(e.type.toLowerCase()){case"radio":if(e.checked&&"false"===e.value)return!1;case"checkbox":if(e.checked&&"true"===e.value)return!0;if(!e.checked&&"true"===e.value)return!1;if(e.checked)return e.value;break;case"button":case"reset":case"submit":case"image":return"";default:return e.value}break;case"SELECT":return s(e)}return null}function s(e){var t,n,r,i=e.multiple,o=[];if(!i)return e.value;for(t=e.getElementsByTagName("option"),n=0,r=t.length;r>n;n++)t[n].selected&&o.push(t[n].value);return o}return e});