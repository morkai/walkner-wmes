define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<tr class="list-item" data-id="'),__append(escapeFn(row._id)),__append('">\n  <td class="is-min text-fixed">'),__append(escapeFn(row._id)),__append('</td>\n  <td class="is-min is-number">'),__append(row.pickup.sets.toLocaleString()),__append('</td>\n  <td class="is-min is-number">'),__append(row.pickup.qty.toLocaleString()),__append('</td>\n  <td class="is-min is-number">'),__append(time.toString(row.pickup.time/1e3,!0,!1)),__append('</td>\n  <td class="is-min is-number">'),__append(row.components.qty.toLocaleString()),__append('</td>\n  <td class="is-min is-number">'),__append(time.toString(row.components.time/1e3,!0,!1)),__append("</td>\n  <td></td>\n</tr>\n");return __output}});