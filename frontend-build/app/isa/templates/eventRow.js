define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<tr class="'),__append(event.className),__append('" data-id="'),__append(event._id),__append('">\n  <td class="is-min">'),__append(event.time),__append('</td>\n  <td class="is-min">'),__append(escapeFn(event.line)),__append('</td>\n  <td class="is-min">'),__append(escapeFn(event.user)),__append("</td>\n  <td>"),__append(event.action),__append("</td>\n</tr>\n");return __output.join("")}});