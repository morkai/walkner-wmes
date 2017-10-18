define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append("<table>\n  <tbody>\n  <tr>\n    <th>"),__append(t("planning","lineOrders:orderNo")),__append("</th>\n    <td>"),__append(escapeFn(lineOrder.orderNo)),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("planning","lineOrders:qty:planned")),__append("</th>\n    <td>"),__append(lineOrder.quantityPlanned.toLocaleString()),__append("</td>\n  </tr>\n  "),lineOrder.quantityRemaining&&(__append("\n  <tr>\n    <th>"),__append(t("planning","lineOrders:qty:remaining")),__append("</th>\n    <td>"),__append(lineOrder.quantityRemaining.toLocaleString()),__append("</td>\n  </tr>\n  ")),__append("\n  <tr>\n    <th>"),__append(t("planning","lineOrders:qty:total")),__append("</th>\n    <td>"),__append(lineOrder.quantityTotal.toLocaleString()),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("planning","lineOrders:pceTime")),__append("</th>\n    <td>"),__append(time.toString(lineOrder.pceTime)),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("planning","lineOrders:manHours")),__append("</th>\n    <td>"),__append(lineOrder.manHours.toLocaleString()),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("planning","lineOrders:time")),__append("</th>\n    <td>"),__append(escapeFn(time.utc.format(lineOrder.startAt,"HH:mm:ss"))),__append("-"),__append(escapeFn(time.utc.format(lineOrder.finishAt,"HH:mm:ss"))),__append("</td>\n  </tr>\n  <tr>\n    <th>"),__append(t("planning","lineOrders:duration")),__append("</th>\n    <td>"),__append(time.toString(lineOrder.duration)),__append("</td>\n  </tr>\n  </tbody>\n</table>\n");return __output.join("")}});