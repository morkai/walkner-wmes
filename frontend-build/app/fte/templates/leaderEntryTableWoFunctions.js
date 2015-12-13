define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<table class="table table-bordered table-condensed table-hover fte-leaderEntry">\n  <thead>\n    <tr>\n      <th class="fte-leaderEntry-column-task" rowspan="3">'),__append(t("fte","leaderEntry:column:task")),__append("\n      <th>"),__append(t("fte","leaderEntry:column:taskTotal")),__append("\n      "),companies.forEach(function(n,a){__append('\n      <th class="fte-leaderEntry-column-company" colspan="'),__append(divisions.length),__append('" data-column="'),__append(a),__append('">'),__append(escape(n.name)),__append("\n      ")}),__append('\n    </tr>\n    <tr>\n      <th class="fte-leaderEntry-total-overall" rowspan="2">'),__append(round(total)),__append("\n      "),companies.forEach(function(n,a){__append('\n      <th class="fte-leaderEntry-total-company" colspan="'),__append(divisions.length),__append('" data-column="'),__append(escape(a)),__append('">'),__append(round(n.total)),__append("\n      ")}),__append("\n    </tr>\n    "),divisions.length&&(__append("\n    <tr>\n      "),companies.forEach(function(n,a){__append("\n      "),divisions.forEach(function(n,p){__append('\n      <th class="fte-leaderEntry-column-division" data-column="'),__append(a),__append(":"),__append(p),__append('">'),__append(n),__append("\n      ")}),__append("\n      ")}),__append("\n    </tr>\n    ")),__append("\n  </thead>\n  <tbody>\n    "),tasks.forEach(function(n,a){__append('\n    <tr>\n      <td class="fte-leaderEntry-cell-task">'),__append(escape(n.name)),__append('\n      <td class="fte-leaderEntry-total-task">'),__append(round(n.total)),__append("\n      "),n.companies.forEach(function(n,p){__append("\n      "),Array.isArray(n.count)?(__append("\n      "),n.count.forEach(function(n,e){__append("\n      <td "),__append(editable?"":'class="fte-leaderEntry-count"'),__append(">\n        "),editable?(__append('\n        <input\n          class="form-control no-controls fte-leaderEntry-count"\n          type="number"\n          min="0"\n          max="9999"\n          value="'),__append(n.value),__append('"\n          data-value="'),__append(n.value),__append('"\n          data-task="'),__append(a),__append('"\n          data-company="'),__append(p),__append('"\n          data-division="'),__append(e),__append('">\n        ')):(__append("\n        "),__append(round(n.value)),__append("\n        ")),__append("\n      </td>\n      ")}),__append("\n      ")):(__append("\n      <td "),__append(editable?"":'class="fte-leaderEntry-count"'),__append(' colspan="'),__append(divisions.length),__append('">\n        '),editable?(__append('\n        <input\n          class="form-control no-controls fte-leaderEntry-count"\n          type="number"\n          min="0"\n          max="9999"\n          value="'),__append(n.count),__append('"\n          data-value="'),__append(n.count),__append('"\n          data-task="'),__append(a),__append('"\n          data-company="'),__append(p),__append('">\n        ')):(__append("\n        "),__append(round(n.count)),__append("\n        ")),__append("\n      </td>\n      ")),__append("\n      ")}),__append("\n    </tr>\n    ")}),__append("\n  </tbody>\n</table>\n");return __output.join("")}});