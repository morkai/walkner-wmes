define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(s){return void 0==s?"":String(s).replace(_MATCH_HTML,function(s){return _ENCODE_HTML_RULES[s]||s})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<table class="table table-bordered table-condensed pressWorksheets-form-orders">\n  <thead>\n    <tr>\n      <th rowspan="'),__output.push(rowspan),__output.push('">'),__output.push(t("core","#")),__output.push('</th>\n      <th rowspan="'),__output.push(rowspan),__output.push('" data-column="part">\n        '),__output.push(t("pressWorksheets","PROPERTY:order.part")),__output.push('\n        <span class="pressWorksheets-form-focusLastPart">'),__output.push(t("pressWorksheets","FORM:focusLastPart")),__output.push('</span>\n      </th>\n      <th rowspan="'),__output.push(rowspan),__output.push('" data-column="operation">'),__output.push(t("pressWorksheets","PROPERTY:order.operation")),__output.push('</th>\n      <th class="pressWorksheets-form-min" rowspan="'),__output.push(rowspan),__output.push('" data-column="prodLine">'),__output.push(t("pressWorksheets","PROPERTY:order.prodLine")),__output.push('</th>\n      <th class="pressWorksheets-form-min" rowspan="'),__output.push(rowspan),__output.push('" data-column="quantityDone">'),__output.push(t("pressWorksheets","PROPERTY:order.quantityDone")),__output.push('</th>\n      <th class="pressWorksheets-form-min pressWorksheets-form-timeCell" rowspan="'),__output.push(rowspan),__output.push('" data-column="startedAt">'),__output.push(t("pressWorksheets","PROPERTY:order.startedAt")),__output.push('</th>\n      <th class="pressWorksheets-form-min pressWorksheets-form-timeCell" rowspan="'),__output.push(rowspan),__output.push('" data-column="finishedAt">'),__output.push(t("pressWorksheets","PROPERTY:order.finishedAt")),__output.push("</th>\n      "),lossReasons.length&&(__output.push('\n      <th class="pressWorksheets-form-lossCell pressWorksheets-form-min pressWorksheets-form-separator" colspan="'),__output.push(lossReasons.length),__output.push('">'),__output.push(t("pressWorksheets","PROPERTY:order.losses")),__output.push("</th>\n      ")),__output.push("\n      "),downtimeReasons.length&&(__output.push('\n      <th class="pressWorksheets-form-downtimeCell pressWorksheets-form-min pressWorksheets-form-separator" colspan="'),__output.push(downtimeReasons.length),__output.push('">'),__output.push(t("pressWorksheets","PROPERTY:order.downtimes")),__output.push("</th>\n      ")),__output.push('\n      <th class="actions" rowspan="'),__output.push(rowspan),__output.push('"></th>\n    </tr>\n    '),rowspan&&(__output.push('\n    <tr class="pressWorksheets-form-losses">\n      '),lossReasons.forEach(function(s,t){__output.push('\n      <th class="pressWorksheets-form-lossCell '),__output.push(t?"":"pressWorksheets-form-separator"),__output.push('" data-column="loss.'),__output.push(t),__output.push('"><span class="pressWorksheets-form-loss">'),__output.push(s.label),__output.push("</span></th>\n      ")}),__output.push("\n      "),downtimeReasons.forEach(function(s,t){__output.push('\n      <th class="pressWorksheets-form-downtimeCell '),__output.push(t?"":"pressWorksheets-form-separator"),__output.push('" data-column="downtime.'),__output.push(t),__output.push('" data-type="'),__output.push(s.type),__output.push('"><span class="pressWorksheets-form-loss">'),__output.push(s.label),__output.push("</span></th>\n      ")}),__output.push("\n    </tr>\n    ")),__output.push("\n  </thead>\n  <tbody></tbody>\n</table>\n");return __output.join("")}});