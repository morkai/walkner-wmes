define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table class="table table-bordered table-condensed pressWorksheets-form-orders">\n  <thead>\n    <tr>\n      <th rowspan="'),__append(rowspan),__append('">'),__append(t("core","#")),__append('</th>\n      <th rowspan="'),__append(rowspan),__append('" data-column="part">\n        '),__append(t("pressWorksheets","PROPERTY:order.part")),__append('\n        <span class="pressWorksheets-form-focusLastPart">'),__append(t("pressWorksheets","FORM:focusLastPart")),__append('</span>\n      </th>\n      <th rowspan="'),__append(rowspan),__append('" data-column="operation">'),__append(t("pressWorksheets","PROPERTY:order.operation")),__append('</th>\n      <th class="pressWorksheets-form-min" rowspan="'),__append(rowspan),__append('" data-column="prodLine">'),__append(t("pressWorksheets","PROPERTY:order.prodLine")),__append('</th>\n      <th class="pressWorksheets-form-min" rowspan="'),__append(rowspan),__append('" data-column="quantityDone">'),__append(t("pressWorksheets","PROPERTY:order.quantityDone")),__append('</th>\n      <th class="pressWorksheets-form-min pressWorksheets-form-timeCell" rowspan="'),__append(rowspan),__append('" data-column="startedAt">'),__append(t("pressWorksheets","PROPERTY:order.startedAt")),__append('</th>\n      <th class="pressWorksheets-form-min pressWorksheets-form-timeCell" rowspan="'),__append(rowspan),__append('" data-column="finishedAt">'),__append(t("pressWorksheets","PROPERTY:order.finishedAt")),__append("</th>\n      "),lossReasons.length&&(__append('\n      <th class="pressWorksheets-form-lossCell pressWorksheets-form-min pressWorksheets-form-separator" colspan="'),__append(lossReasons.length),__append('">'),__append(t("pressWorksheets","PROPERTY:order.losses")),__append("</th>\n      ")),__append("\n      "),downtimeReasons.length&&(__append('\n      <th class="pressWorksheets-form-downtimeCell pressWorksheets-form-min pressWorksheets-form-separator" colspan="'),__append(downtimeReasons.length),__append('">'),__append(t("pressWorksheets","PROPERTY:order.downtimes")),__append("</th>\n      ")),__append('\n      <th class="actions" rowspan="'),__append(rowspan),__append('"></th>\n    </tr>\n    '),rowspan&&(__append('\n    <tr class="pressWorksheets-form-losses">\n      '),lossReasons.forEach(function(e,s){__append('\n      <th class="pressWorksheets-form-lossCell '),__append(s?"":"pressWorksheets-form-separator"),__append('" data-column="loss.'),__append(s),__append('"><span class="pressWorksheets-form-loss">'),__append(e.label),__append("</span></th>\n      ")}),__append("\n      "),downtimeReasons.forEach(function(e,s){__append('\n      <th class="pressWorksheets-form-downtimeCell '),__append(s?"":"pressWorksheets-form-separator"),__append('" data-column="downtime.'),__append(s),__append('" data-type="'),__append(e.type),__append('"><span class="pressWorksheets-form-loss">'),__append(e.label),__append("</span></th>\n      ")}),__append("\n    </tr>\n    ")),__append("\n  </thead>\n  <tbody></tbody>\n</table>\n");return __output.join("")}});