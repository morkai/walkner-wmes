define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<tr>\n  <td class="is-min"><input name="autoDowntimes['),__append(autoDowntime.i),__append('].reason" type="hidden" value="'),__append(autoDowntime.reason.id),__append('"> '),__append(escape(autoDowntime.reason.text)),__append('</td>\n  <td class="is-min">\n    '),["initial","always","time"].forEach(function(n){__append('\n    <label class="radio-inline">\n      <input name="autoDowntimes['),__append(autoDowntime.i),__append('].when" type="radio" value="'),__append(n),__append('" '),__append(n===autoDowntime.when?"checked":""),__append(">\n      "),__append(t("subdivisions","autoDowntimes:when:"+n,{time:""})),__append("\n    </label>\n    ")}),__append('\n  </td>\n  <td class="is-min"><input class="form-control subdivisions-form-autoDowntimes-time" name="autoDowntimes['),__append(autoDowntime.i),__append('].time" type="text" value="'),__append(autoDowntime.time),__append('" placeholder="00:00, 00:00..." '),__append("time"===autoDowntime.when?"":"disabled"),__append('></td>\n  <td class="actions">\n    <div class="actions-group">\n      <button class="btn btn-default" data-auto-downtime-action="up" type="button"><i class="fa fa-arrow-up"></i></button>\n      <button class="btn btn-default" data-auto-downtime-action="down" type="button"><i class="fa fa-arrow-down"></i></button>\n      <button class="btn btn-default" data-auto-downtime-action="remove" type="button"><i class="fa fa-remove"></i></button>\n    </div>\n  </td>\n  <td></td>\n</tr>\n');return __output.join("")}});