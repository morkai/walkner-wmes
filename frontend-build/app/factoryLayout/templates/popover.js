define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(p){return _ENCODE_HTML_RULES[p]||p}escape=escape||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append("<table>\n  <tbody>\n  <tr>\n    <th>"),__append(t("factoryLayout","popover:order")),__append('\n    <td><span class="factoryLayout-popover-value">'),__append(escape(order.name)),__append("</span>\n  <tr>\n    <th>"),__append(t("factoryLayout","popover:operation")),__append('\n    <td><span class="factoryLayout-popover-value">'),__append(escape(order.operation)),__append("</span>\n  <tr>\n    <th>"),__append(t("factoryLayout","popover:duration")),__append("\n    <td>"),__append(order.duration),__append("\n  <tr>\n    <th>"),__append(t("factoryLayout","popover:workerCount")),__append("\n    <td>"),__append(order.workerCount),__append(" ("),__append(order.sapWorkerCount),__append(")\n  <tr>\n    <th>"),__append(t("factoryLayout","popover:quantityDone")),__append("\n    <td>"),__append(order.quantityDone),__append("\n  <tr>\n    <th>"),__append(t("factoryLayout","popover:taktTime")),__append("\n    <td>"),__append(order.taktTime),__append("\n  <tr>\n    <th>"),__append(t("factoryLayout","popover:cycleTime")),__append("\n    <td>"),__append(order.cycleTime||"?"),__append(" ("),__append(order.iptCycleTime||"?"),__append(")\n  <tr>\n    <th>"),__append(t("factoryLayout","popover:avgCycleTime")),__append("\n    <td>"),__append(order.avgCycleTime||"?"),__append("\n  "),downtime&&(__append("\n  <tr>\n    <th>"),__append(t("factoryLayout","popover:downtime")),__append("\n    <td>"),__append(escape(downtime.reason)),__append("\n  "),["aor","duration"].forEach(function(p){__append("\n  <tr>\n    <th>"),__append(t("factoryLayout","popover:"+p)),__append('\n    <td><span class="factoryLayout-popover-value">'),__append(downtime[p]),__append("</span>\n  ")}),__append("\n  ")),__append("\n  </tbody>\n</table>\n");return __output.join("")}});