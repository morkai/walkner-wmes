define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table class="table table-bordered table-condensed">\n  <thead class="reports-9-table-options">\n  <tr></tr>\n  <tr>\n    <th colspan="4">\n      <table>\n        <tr>\n          <td class="reports-9-table-options-name">'),__append(t("reports","9:summary:daysInMonth")),__append('</td>\n          <td class="reports-9-table-options-value reports-9-editable '),__append(summary.customDaysInMonth?"reports-9-custom":""),__append('" data-editor="daysInMonth">\n            <span class="reports-9-editable-value">'),__append(summary.daysInMonth.toLocaleString()),__append('</span>\n          </td>\n        </tr>\n        <tr>\n          <td class="reports-9-table-options-name">'),__append(t("reports","9:summary:shiftsInDay")),__append('</td>\n          <td class="reports-9-table-options-value reports-9-editable '),__append(summary.customShiftsInDay?"reports-9-custom":""),__append('" data-editor="shiftsInDay">\n            <span class="reports-9-editable-value">'),__append(summary.shiftsInDay.toLocaleString()),__append('</span>\n          </td>\n        </tr>\n        <tr>\n          <td class="reports-9-table-options-name">'),__append(t("reports","9:summary:hoursInShift")),__append('</td>\n          <td class="reports-9-table-options-value reports-9-editable '),__append(summary.customHoursInShift?"reports-9-custom":""),__append('" data-editor="hoursInShift">\n            <span class="reports-9-editable-value">'),__append(summary.hoursInShift.toLocaleString()),__append('</span>\n          </td>\n        </tr>\n      </table>\n    </th>\n  </tr>\n  </thead>\n  <thead>\n  <tr>\n    <th colspan="4">'),__append(t("reports","9:summary:header")),__append("</th>\n  </tr>\n  <tr>\n    <th>"),__append(t("reports","9:summary:avgQPerShift")),__append("</th>\n    <th>"),__append(t("reports","9:summary:maxOnLine")),__append("</th>\n    <th>"),__append(t("reports","9:summary:lineCount")),__append("</th>\n    <th>"),__append(t("reports","9:summary:maxOnLines")),__append('</th>\n  </tr>\n  </thead>\n  <tbody id="'),__append(idPrefix),__append('-summaryRows">\n  '),_.forEach(cags,function(n,t){__append("\n  "),function(){__append('<tr data-index="'),__append(t),__append('" class="'),__append(n.group.contrast?"is-contrast":"is-not-contrast"),__append('" style="background: '),__append(n.group.color),__append('">\n  <td>'),__append(n.avgQPerShift),__append("</td>\n  <td>"),__append(n.maxOnLine),__append('</td>\n  <td class="reports-9-editable '),__append(null==n.customLines?"":"reports-9-custom"),__append('" data-editor="customLines" data-cag-index="'),__append(t),__append('">\n    <span class="reports-9-editable-value">'),__append(null==n.customLines?n.lines:n.customLines),__append("</span>\n  </td>\n  <td>"),__append(n.maxOnLines),__append("</td>\n</tr>\n")}.call(this),__append("\n  ")}),__append("\n  </tbody>\n</table>\n");return __output.join("")}});