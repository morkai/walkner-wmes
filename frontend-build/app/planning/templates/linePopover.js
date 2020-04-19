define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<table data-item-type="line" data-item-id="'),__append(line._id),__append('">\n  <tbody>\n  <tr>\n    <th>'),__append(t("lines:division")),__append('</th>\n    <td><span class="planning-mrp-popover-value">'),__append(escapeFn(line.division)),__append("</span></td>\n  </tr>\n  <tr>\n    <th>"),__append(t("lines:prodFlow")),__append('</th>\n    <td><span class="planning-mrp-popover-value">'),__append(escapeFn(line.prodFlow)),__append("</span></td>\n  </tr>\n  "),"06:00-06:00"!==line.activeTime&&(__append("\n  <tr>\n    <th>"),__append(t("lines:activeTime")),__append("</th>\n    <td>"),__append(escapeFn(line.activeTime)),__append("</td>\n  </tr>\n  ")),__append("\n  <tr>\n    <th>"),__append(t("lines:workerCount")),__append("</th>\n    <td>"),__append(escapeFn(line.workerCount.toLocaleString())),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("lines:orderPriority")),__append("</th>\n    <td>"),__append(escapeFn(line.orderPriority)),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("lines:mrpPriority")),__append("</th>\n    <td>"),__append(escapeFn(line.mrpPriority)),__append("</td>\n  </tr>\n  "),line.redirLine&&(__append("\n  <tr>\n    <th>"),__append(t("lines:redirLine")),__append("</th>\n    <td>"),__append(escapeFn(line.redirLine)),__append("</td>\n  </tr>\n  ")),__append("\n  "),line.whLine&&(__append("\n  <tr>\n    <th>"),__append(t("lines:wh:pickup")),__append("</th>\n    <td>\n      <strong>"),__append(t("lines:wh:sets")),__append(": </strong>"),__append(escapeFn(line.whLine.pickup.sets)),__append("&nbsp;&nbsp;\n      <strong>"),__append(t("lines:wh:qty")),__append(": </strong>"),__append(escapeFn(line.whLine.pickup.qty)),__append("&nbsp;&nbsp;\n      <strong>"),__append(t("lines:wh:time")),__append(": </strong>"),__append(escapeFn(time.toString(line.whLine.pickup.time/1e3,!0))),__append("\n    </td>\n  </tr>\n  <tr>\n    <th>"),__append(t("lines:wh:components")),__append("</th>\n    <td>\n      <strong>"),__append(t("lines:wh:qty")),__append(": </strong>"),__append(escapeFn(line.whLine.components.qty)),__append("&nbsp;&nbsp;\n      <strong>"),__append(t("lines:wh:time")),__append(": </strong>"),__append(escapeFn(time.toString(line.whLine.components.time/1e3,!0))),__append("\n    </td>\n  </tr>\n  ")),__append("\n  </tbody>\n</table>\n");return __output}});