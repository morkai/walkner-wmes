define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form planning-mrp-filter">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-date" class="control-label">'),__append(t("planning","filter:date")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-date" name="date" class="form-control" type="date" value="'),__append(date),__append('" min="'),__append(minDate),__append('" max="'),__append(maxDate),__append('">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-mrps" class="control-label">'),__append(t("planning","filter:mrps")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-mrps" name="mrps" value="'),__append(mrps),__append('">\n  </div>\n  '),showToggles&&(__append('\n  <div class="form-group filter-actions">\n    <div class="btn-group">\n      <button id="'),__append(idPrefix),__append('-lineOrdersList" type="button" class="btn btn-default '),__append(lineOrdersList?"active":""),__append('">\n        <i class="fa fa-list-ol"></i>\n        <span>'),__append(t("planning","filter:lineOrdersList")),__append('</span>\n      </button>\n      <button id="'),__append(idPrefix),__append('-useDarkerTheme" type="button" class="btn btn-default '),__append(useDarkerTheme?"active":""),__append('">\n        <i class="fa fa-adjust"></i>\n        <span>'),__append(t("planning","filter:useDarkerTheme")),__append("</span>\n      </button>\n    </div>\n  </div>\n  ")),__append('\n  <div class="form-group filter-actions">\n    <div id="'),__append(idPrefix),__append('-copyOrderList" class="btn-group" role="group">\n      <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><i class="fa fa-clipboard"></i><span>'),__append(t("planning","filter:copyOrderList")),__append('</span></button>\n      <ul class="dropdown-menu dropdown-menu-right">\n        '),[0,1,2,3].forEach(function(n){__append('\n        <li><a role="copyOrderList" data-shift="'),__append(n),__append('" href="javascript:void(0)">'),__append(t("planning","toolbar:copyOrderList:"+n)),__append("</a></li>\n        ")}),__append("\n      </ul>\n    </div>\n  </div>\n  "),showStats&&(__append('\n  <div class="form-group" style="flex-grow: 1"></div>\n  <div class="form-group">\n    <table class="planning-mrp-stats">\n      <tbody>\n      '),["manHours","quantity"].forEach(function(n){__append('\n      <tr class="planning-mrp-stats-bd">\n        <th>'),__append(t("planning","filter:stats:"+n)),__append("</th>\n        "),["todo","late","plan","remaining"].forEach(function(p){__append('\n        <td data-group="'),__append(n),__append('" data-subgroup="'),__append(p),__append('" title="'),__append(t("planning","filter:stats:tooltip:"+p)),__append('">0</td>\n        ')}),__append("\n      </tr>\n      ")}),__append("\n      </tbody>\n    </table>\n  </div>\n  ")),__append("\n</form>\n");return __output.join("")}});