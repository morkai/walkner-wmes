define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append("<table>\n  <tbody>\n  <tr>\n    <th>"),__append(t("hourlyPlans","planning:lineOrders:orderNo")),__append("\n    <td>"),__append(escape(lineOrder.orderNo)),__append("\n  <tr>\n    <th>"),__append(t("hourlyPlans","planning:lineOrders:qty")),__append("\n    <td>"),__append(lineOrder.qty.toLocaleString()),__append("\n      "),lineOrder.incomplete&&(__append("\n      "),__append(t("hourlyPlans","planning:lineOrders:incomplete",{qty:lineOrder.incomplete.toLocaleString()})),__append("\n      ")),__append("\n  "),lineOrder.pceTime&&(__append("\n  <tr>\n    <th>"),__append(t("hourlyPlans","planning:lineOrders:pceTime")),__append("\n    <td>"),__append(time.toString(lineOrder.pceTime)),__append("\n  ")),__append("\n  <tr>\n    <th>"),__append(t("hourlyPlans","planning:lineOrders:time")),__append("\n    <td>"),__append(escape(time.format(lineOrder.startAt,"HH:mm:ss"))),__append("-"),__append(escape(time.format(lineOrder.finishAt,"HH:mm:ss"))),__append("\n  <tr>\n    <th>"),__append(t("hourlyPlans","planning:lineOrders:duration")),__append("\n    <td>"),__append(time.toString(lineOrder.duration)),__append("\n  </tbody>\n</table>\n");return __output.join("")}});