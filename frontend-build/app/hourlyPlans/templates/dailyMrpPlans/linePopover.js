define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table class="'),__append(editable?"dailyMrpPlan-popover-editable":""),__append('" data-plan="'),__append(line.plan),__append('" data-item-type="line" data-item-id="'),__append(line._id),__append('">\n  <tbody>\n  <tr>\n    <th>'),__append(t("hourlyPlans","planning:lines:division")),__append('\n    <td><span class="dailyMrpPlan-popover-value">'),__append(escape(line.division)),__append("</span>\n  <tr>\n    <th>"),__append(t("hourlyPlans","planning:lines:prodFlow")),__append('\n    <td><span class="dailyMrpPlan-popover-value">'),__append(escape(line.prodFlow)),__append("</span>\n  <tr>\n    <th>"),__append(t("hourlyPlans","planning:lines:prodLine")),__append('\n    <td><span class="dailyMrpPlan-popover-value">'),__append(escape(line.prodLine)),__append("</span>\n  <tr>\n    <th>"),__append(t("hourlyPlans","planning:lines:workerCount")),__append("\n    <td>\n      "),editable?(__append('\n      <input class="dailyMrpPlan-popover-input" name="workerCount" type="number" value="'),__append(line.workerCount),__append('" min="0" max="99" step="1">\n      ')):(__append("\n      "),__append(escape(line.workerCount.toLocaleString())),__append("\n      ")),__append("\n  <tr>\n    <th>"),__append(t("hourlyPlans","planning:lines:activeFrom")),__append("\n    <td>\n      "),editable?(__append('\n      <input class="dailyMrpPlan-popover-input" name="activeFrom" type="time" value="'),__append(line.activeFrom||""),__append('" step="60">\n      ')):(__append("\n      "),__append(line.activeFrom||"-"),__append("\n      ")),__append("\n  <tr>\n    <th>"),__append(t("hourlyPlans","planning:lines:activeTo")),__append("\n    <td>\n      "),editable?(__append('\n      <input class="dailyMrpPlan-popover-input" name="activeTo" type="time" value="'),__append(line.activeTo||""),__append('" step="60">\n      ')):(__append("\n      "),__append(line.activeTo||"-"),__append("\n      ")),__append("\n  </tbody>\n</table>\n");return __output.join("")}});