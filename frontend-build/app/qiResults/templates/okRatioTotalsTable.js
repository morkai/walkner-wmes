define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table class="table table-condensed table-hover table-bordered qiResults-okRatioReport-table">\n  <thead>\n  <tr>\n    <th>'),__append(t("qiResults","report:column:division")),__append("</th>\n    <th>"),__append(t("qiResults","report:column:nok")),__append("</th>\n    <th>"),__append(t("qiResults","report:column:all")),__append("</th>\n    <th>"),__append(t("qiResults","report:column:ratio")),__append("</th>\n  </tr>\n  </thead>\n  <tbody>\n  "),columns.forEach(function(n){__append("\n  <tr>\n    <td>"),__append(escapeFn(n.label)),__append('</td>\n    <td class="is-number">'),__append(total[n._id].nok.toLocaleString()),__append('</td>\n    <td class="is-number">'),__append(total[n._id].all.toLocaleString()),__append('</td>\n    <td class="is-number">'),__append((Math.round(100*total[n._id].ratio)/100).toLocaleString()),__append("%</td>\n  </tr>\n  ")}),__append("\n  </tbody>\n</table>\n");return __output.join("")}});