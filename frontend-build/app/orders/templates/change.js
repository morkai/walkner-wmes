define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<tbody class="'),__append(change.user.id?"is-user-change":"is-system-change"),__append('" data-index="'),__append(i),__append('">\n  '),change.values.length&&(__append('\n  <tr>\n    <td class="is-min orders-changes-time" rowspan="'),__append(change.rowSpan),__append('">\n      '),change.timeEditable?(__append('\n      <a class="link orders-changes-time-editable">'),__append(change.timeText),__append("</a>\n      ")):(__append("\n      "),__append(change.timeText),__append("\n      ")),__append('\n    </td>\n    <td class="is-min orders-changes-user" rowspan="'),__append(change.rowSpan),__append('">'),__append(change.userText),__append('</td>\n    <td class="is-min orders-changes-property">'),__append(renderPropertyLabel(change.values[0],i)),__append('</td>\n    <td class="is-min">'),__append(renderValueChange(change.values[0],i,"oldValue")),__append("</td>\n    <td>"),__append(renderValueChange(change.values[0],i,"newValue")),__append("</td>\n  </tr>\n  ")),__append("\n  "),change.values.forEach(function(e,n){__append("\n  "),0!==n&&(__append('\n  <tr class="orders-changes-noTimeAndUser">\n    <td class="is-min orders-changes-property">'),__append(renderPropertyLabel(e,i)),__append('</td>\n    <td class="is-min">'),__append(renderValueChange(e,i,"oldValue")),__append("</td>\n    <td>"),__append(renderValueChange(e,i,"newValue")),__append("</td>\n  </tr>\n  "))}),__append("\n  "),""!==change.comment&&(__append('\n  <tr class="'),__append(change.values.length?"orders-changes-noTimeAndUser":""),__append('">\n    '),change.values.length||(__append('\n    <td class="is-min orders-changes-time">'),__append(change.timeText),__append('</td>\n    <td class="is-min orders-changes-user">'),__append(change.userText),__append("</td>\n    ")),__append('\n    <td class="orders-changes-comment" colspan="3">'),__append(change.comment),__append("</td>\n  </tr>\n  ")),__append("\n</tbody>\n");return __output.join("")}});