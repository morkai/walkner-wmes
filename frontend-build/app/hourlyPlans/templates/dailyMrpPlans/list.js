define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="dailyMrpPlanList-container">\n  <a class="dailyMrpPlanList-prev" href="'),__append(prevLink),__append('"><i class="fa fa-caret-left"></i></a>\n  '),rows.forEach(function(n){__append('\n  <div class="dailyMrpPlanList-day">\n    <div class="dailyMrpPlanList-hd">\n      '),__append(n.moment.format("llll").replace(n.moment.format("LT"),"")),__append("\n    </div>\n    "),n.mrps.forEach(function(a){__append('\n    <a class="dailyMrpPlanList-mrp" href="#dailyMrpPlans?date='),__append(n.date),__append('">\n      <span class="dailyMrpPlanList-mrp-id">'),__append(a._id),__append('</span>\n      <span class="dailyMrpPlanList-mrp-lines">\n        '),a.lines.forEach(function(n){__append('\n        <span class="dailyMrpPlanList-mrp-line">'),__append(n._id),__append(" ("),__append(n.workerCount),__append(")</span>\n        ")}),__append("\n        "),a.lines.length||__append("\n        &nbsp;\n        "),__append("\n      </span>\n    </a>\n    ")}),__append("\n  </div>\n  ")}),__append('\n  <a class="dailyMrpPlanList-next" href="'),__append(nextLink),__append('"><i class="fa fa-caret-right"></i></a>\n</div>\n');return __output.join("")}});