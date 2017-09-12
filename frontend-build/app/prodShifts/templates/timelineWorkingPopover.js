define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table class="prodShifts-timeline-popover">\n  '),managing&&(__append('\n  <tfoot>\n    <tr>\n      <td colspan="2"><button class="btn btn-block btn-danger prodShifts-timeline-addDowntime">'),__append(t("prodShifts","timeline:action:addDowntime")),__append('</button></td>\n    </tr>\n    <tr>\n      <td colspan="2"><button class="btn btn-block btn-success prodShifts-timeline-editOrder">'),__append(t("prodShifts","timeline:action:editOrder")),__append('</button></td>\n    </tr>\n    <tr>\n      <td colspan="2"><button class="btn btn-block btn-warning prodShifts-timeline-deleteOrder">'),__append(t("prodShifts","timeline:action:deleteOrder")),__append("</button></td>\n    </tr>\n  </tfoot>\n  ")),__append("\n  <tbody>\n    <tr>\n      <th>"),__append(t("prodShifts","timeline:popover:startedAt")),__append("</th>\n      <td>"),__append(startedAt),__append("</td>\n    </tr>\n    <tr>\n      <th>"),__append(t("prodShifts","timeline:popover:duration")),__append("</th>\n      <td>"),__append(duration),__append("</td>\n    </tr>\n    <tr>\n      <th>"),__append(t("prodShifts","timeline:popover:order")),__append("</th>\n      <td>"),__append(order),__append(", "),__append(operation),__append("</td>\n    </tr>\n    <tr>\n      <th>"),__append(t("prodShifts","timeline:popover:workerCount")),__append("</th>\n      <td>"),__append(workerCount),__append("</td>\n    </tr>\n    <tr>\n      <th>"),__append(t("prodShifts","timeline:popover:quantityDone")),__append("</th>\n      <td>"),__append(quantityDone),__append("</td>\n    </tr>\n    "),user.isAllowedTo("PROD_DATA:VIEW:EFF")&&(__append("\n    "),sapTaktTime&&(__append("\n    <tr>\n      <th>"),__append(t("prodShifts","timeline:popover:sapTaktTime")),__append("</th>\n      <td>"),__append(time.toString(sapTaktTime)),__append("</td>\n    </tr>\n    ")),__append("\n    "),avgTaktTime&&(__append("\n    <tr>\n      <th>"),__append(t("prodShifts","timeline:popover:avgTaktTime")),__append("</th>\n      <td>"),__append(time.toString(avgTaktTime)),__append("</td>\n    </tr>\n    ")),__append("\n    "),"?"!==efficiency&&(__append("\n    <tr>\n      <th>"),__append(t("prodShifts","timeline:popover:efficiency")),__append("</th>\n      <td>"),__append(efficiency),__append("</td>\n    </tr>\n    ")),__append("\n    ")),__append("\n  </tbody>\n</table>\n");return __output.join("")}});