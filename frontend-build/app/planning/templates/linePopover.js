define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table data-item-type="line" data-item-id="'),__append(line._id),__append('">\n  <tbody>\n  <tr>\n    <th>'),__append(t("planning","lines:division")),__append('</th>\n    <td><span class="planning-mrp-popover-value">'),__append(escapeFn(line.division)),__append("</span></td>\n  </tr>\n  <tr>\n    <th>"),__append(t("planning","lines:prodFlow")),__append('</th>\n    <td><span class="planning-mrp-popover-value">'),__append(escapeFn(line.prodFlow)),__append("</span></td>\n  </tr>\n  "),line.prodLine&&(__append("\n  <tr>\n    <th>"),__append(t("planning","lines:prodLine")),__append('</th>\n    <td><span class="planning-mrp-popover-value">'),__append(escapeFn(line.prodLine)),__append("</span></td>\n  </tr>\n  ")),__append("\n  <tr>\n    <th>"),__append(t("planning","lines:activeTime")),__append("</th>\n    <td>"),__append(escapeFn(line.activeTime)),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("planning","lines:workerCount")),__append("</th>\n    <td>"),__append(escapeFn(line.workerCount.toLocaleString())),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("planning","lines:orderPriority")),__append("</th>\n    <td>"),__append(escapeFn(line.orderPriority)),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("planning","lines:mrpPriority")),__append("</th>\n    <td>"),__append(escapeFn(line.mrpPriority)),__append("</td>\n  </tr>\n  </tbody>\n</table>\n");return __output.join("")}});