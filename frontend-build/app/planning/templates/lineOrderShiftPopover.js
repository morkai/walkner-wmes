define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append("<table>\n  <tbody>\n  <tr>\n    <th>"),__append(t("planning","stats:orderCount")),__append('</th>\n    <td colspan="8">'),__append(stats.orderCount.toLocaleString()),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("planning","stats:quantity")),__append('</th>\n    <td colspan="8">'),__append(stats.quantity.toLocaleString()),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("planning","stats:manHours")),__append('</th>\n    <td colspan="8">'),__append(stats.manHours.toLocaleString()),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("planning","stats:hourlyPlan")),__append("</th>\n    "),stats.hourlyPlan.forEach(function(n){__append('\n    <td class="is-number">'),__append(n),__append("</td>\n    ")}),__append("\n  </tr>\n  </tbody>\n</table>\n");return __output.join("")}});