define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<tr class="'),__append(row.isNew?"highlight":""),__append('">\n  <td class="is-min">'),__append(row.time),__append('</td>\n  <td class="is-min">'),__append(escapeFn(row.line)),__append('</td>\n  <td class="is-min">'),__append(row.station),__append('</td>\n  <td class="is-min">'),__append(row.action),__append("</td>\n  <td>"),__append(row.data),__append("</td>\n</tr>\n");return __output}});