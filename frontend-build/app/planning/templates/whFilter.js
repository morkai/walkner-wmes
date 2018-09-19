define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form planning-mrp-filter" autocomplete="stahp">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-date" class="control-label">'),__append(t("planning","filter:date")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-date" name="date" class="form-control" type="date" value="'),__append(date),__append('" min="'),__append(minDate),__append('" max="'),__append(maxDate),__append('">\n  </div>\n  <div class="form-group">\n    <div class="filter-radioLabels">'),["1","0","mine","wh"].forEach(function(n){__append('<label><input name="mrpMode" type="radio" value="'),__append(n),__append('" '),__append(n===mrpMode?"checked":""),__append("> "),__append(t("planning","filter:mrps:"+n)),__append("</label>")}),__append('</div>\n    <input id="'),__append(idPrefix),__append('-mrps" name="mrps" type="text" value="'),__append(mrps),__append('">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-lines" class="control-label">'),__append(t("planning","filter:lines")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-lines" name="lines" type="text" value="'),__append(lines),__append('">\n  </div>\n  <div class="form-group filter-actions">\n    <div class="btn-group">\n      <button id="'),__append(idPrefix),__append('-useDarkerTheme" type="button" class="btn btn-default '),__append(useDarkerTheme?"active":""),__append('">\n        <i class="fa fa-adjust"></i>\n        <span>'),__append(t("planning","filter:useDarkerTheme")),__append('</span>\n      </button>\n    </div>\n  </div>\n  <div class="form-group" style="flex-grow: 1"></div>\n  <div class="form-group" style="align-self: center">\n    <table class="planning-wh-stats">\n      <tbody id="'),__append(idPrefix),__append('-stats">\n      <tr>\n        '),["all",0,1,2,3].forEach(function(n){__append('\n        <th class="planning-wh-stats-k">'),__append(t("planning","wh:status:"+n,{qtySent:0})),__append("</th>\n        ")}),__append("\n      </tr>\n      <tr>\n        "),["all",0,1,2,3].forEach(function(n){__append('\n        <td class="planning-wh-stats-v" data-status="'),__append(n),__append('">0</td>\n        ')}),__append("\n      </tr>\n      </tbody>\n    </table>\n  </div>\n</form>\n");return __output.join("")}});