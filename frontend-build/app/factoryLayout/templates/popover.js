define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(p){return _ENCODE_HTML_RULES[p]||p}var __output="";function __append(p){void 0!==p&&null!==p&&(__output+=p)}with(locals||{})__append("<table>\n  <tbody>\n  "),heff?(__append("\n  "),["totalActual","currentPlanned","endOfHourPlanned","totalPlanned","totalRemaining"].forEach(function(p){__append("\n  <tr>\n    <th>"),__append(t("popover:heff:"+p)),__append("\n    <td>"),__append(heff[p].toLocaleString()),__append("\n  ")}),__append("\n  ")):(__append("\n  "),order&&(__append("\n  <tr>\n    <th>"),__append(t("popover:order")),__append('\n    <td><span class="factoryLayout-popover-value">'),__append(escapeFn(order.name)),__append("</span>\n  <tr>\n    <th>"),__append(t("popover:operation")),__append('\n    <td><span class="factoryLayout-popover-value">'),__append(escapeFn(order.operation)),__append("</span>\n  <tr>\n    <th>"),__append(t("popover:duration")),__append("\n    <td>"),__append(order.duration),__append("\n  <tr>\n    <th>"),__append(t("popover:workerCount")),__append("\n    <td>"),__append(order.workerCount),__append(" ("),__append(order.sapWorkerCount),__append(")\n  <tr>\n    <th>"),__append(t("popover:quantityDone")),__append("\n    <td>"),__append(order.quantityDone),__append("\n  "),user.isAllowedTo("PROD_DATA:VIEW:EFF")&&(__append("\n  <tr>\n    <th>"),__append(t("popover:taktTime")),__append("\n    <td>"),__append(order.taktTime),__append("\n  <tr>\n    <th>"),__append(t("popover:cycleTime")),__append("\n    <td>"),__append(order.cycleTime||"?"),__append(" ("),__append(order.iptCycleTime||"?"),__append(")\n  <tr>\n    <th>"),__append(t("popover:avgCycleTime")),__append("\n    <td>"),__append(order.avgCycleTime||"?"),__append("\n  ")),__append("\n  ")),__append("\n  "),downtime&&(__append("\n  <tr>\n    <th>"),__append(t("popover:downtime")),__append("\n    <td>"),__append(escapeFn(downtime.reason)),__append("\n  "),["aor","duration"].forEach(function(p){__append("\n  <tr>\n    <th>"),__append(t("popover:"+p)),__append('\n    <td><span class="factoryLayout-popover-value">'),__append(downtime[p]),__append("</span>\n  ")}),__append("\n  ")),__append("\n  ")),__append("\n  </tbody>\n</table>\n");return __output}});