define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<table class="table table-bordered table-condensed table-hover fte-leaderEntry">\n  <thead>\n    <tr>\n      <th class="fte-leaderEntry-column-task" rowspan="3">'),__output.push(t("fte","leaderEntry:column:task")),__output.push("\n      <th>"),__output.push(t("fte","leaderEntry:column:taskTotal")),__output.push("\n      "),companies.forEach(function(t,u){__output.push('\n      <th class="fte-leaderEntry-column-company" colspan="'),__output.push(divisions.length),__output.push('" data-column="'),__output.push(u),__output.push('">'),__output.push(escape(t.name)),__output.push("\n      ")}),__output.push('\n    </tr>\n    <tr>\n      <th class="fte-leaderEntry-total-overall" rowspan="2">'),__output.push(round(total)),__output.push("\n      "),companies.forEach(function(t,u){__output.push('\n      <th class="fte-leaderEntry-total-company" colspan="'),__output.push(divisions.length),__output.push('" data-column="'),__output.push(escape(u)),__output.push('">'),__output.push(round(t.total)),__output.push("\n      ")}),__output.push("\n    </tr>\n    "),divisions.length&&(__output.push("\n    <tr>\n      "),companies.forEach(function(t,u){__output.push("\n      "),divisions.forEach(function(t,p){__output.push('\n      <th class="fte-leaderEntry-column-division" data-column="'),__output.push(u),__output.push(":"),__output.push(p),__output.push('">'),__output.push(t),__output.push("\n      ")}),__output.push("\n      ")}),__output.push("\n    </tr>\n    ")),__output.push("\n  </thead>\n  <tbody>\n    "),tasks.forEach(function(t,u){__output.push('\n    <tr>\n      <td class="fte-leaderEntry-cell-task">'),__output.push(escape(t.name)),__output.push('\n      <td class="fte-leaderEntry-total-task">'),__output.push(round(t.total)),__output.push("\n      "),t.companies.forEach(function(t,p){__output.push("\n      "),Array.isArray(t.count)?(__output.push("\n      "),t.count.forEach(function(t,n){__output.push("\n      <td "),__output.push(editable?"":'class="fte-leaderEntry-count"'),__output.push(">\n        "),editable?(__output.push('\n        <input\n          class="form-control no-controls fte-leaderEntry-count"\n          type="number"\n          min="0"\n          max="9999"\n          value="'),__output.push(t.value),__output.push('"\n          data-value="'),__output.push(t.value),__output.push('"\n          data-task="'),__output.push(u),__output.push('"\n          data-company="'),__output.push(p),__output.push('"\n          data-division="'),__output.push(n),__output.push('">\n        ')):(__output.push("\n        "),__output.push(round(t.value)),__output.push("\n        ")),__output.push("\n      </td>\n      ")}),__output.push("\n      ")):(__output.push("\n      <td "),__output.push(editable?"":'class="fte-leaderEntry-count"'),__output.push(' colspan="'),__output.push(divisions.length),__output.push('">\n        '),editable?(__output.push('\n        <input\n          class="form-control no-controls fte-leaderEntry-count"\n          type="number"\n          min="0"\n          max="9999"\n          value="'),__output.push(t.count),__output.push('"\n          data-value="'),__output.push(t.count),__output.push('"\n          data-task="'),__output.push(u),__output.push('"\n          data-company="'),__output.push(p),__output.push('">\n        ')):(__output.push("\n        "),__output.push(round(t.count)),__output.push("\n        ")),__output.push("\n      </td>\n      ")),__output.push("\n      ")}),__output.push("\n    </tr>\n    ")}),__output.push("\n  </tbody>\n</table>\n");return __output.join("")}});