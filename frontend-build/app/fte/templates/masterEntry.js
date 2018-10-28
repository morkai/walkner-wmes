define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div>\n  <div class="message message-inline message-warning fte-changeRequest-warning">\n    <p>'),__append(t("fte","changeRequest:warning:edit")),__append('</p>\n  </div>\n  <textarea id="'),__append(idPrefix),__append('-comment" class="form-control fte-changeRequest-comment" rows="3" placeholder="'),__append(t("fte","changeRequest:comment:placeholder")),__append('"></textarea>\n  <div class="well">\n    <div class="fte-property">\n      <span class="fte-property-name">'),__append(t("core","ORG_UNIT:subdivision")),__append('</span>\n      <span class="fte-property-value">'),__append(subdivision),__append('</span>\n    </div>\n    <div class="fte-property">\n      <span class="fte-property-name">'),__append(t("fte","property:date")),__append('</span>\n      <span class="fte-property-value">'),__append(date),__append('</span>\n    </div>\n    <div class="fte-property">\n      <span class="fte-property-name">'),__append(t("fte","property:shift")),__append('</span>\n      <span class="fte-property-value">'),__append(shift),__append('</span>\n    </div>\n  </div>\n  <div id="'),__append(idPrefix),__append('-entryPanel" class="panel panel-primary fte-entryPanel '),__append(editable?"":"is-colored"),__append('">\n    <div class="panel-heading">'),__append(t("fte","masterEntry:tasksPanel:title"+(editable?":editable":""))),__append('</div>\n    <table class="table table-bordered table-condensed table-hover fte-masterEntry '),__append(editable?"is-editing":""),__append('">\n      <thead>\n      <tr>\n        <th class="fte-masterEntry-column-task" rowspan="5">\n          '),__append(t("fte","masterEntry:column:task")),__append("\n          "),editable&&(__append('\n          <div class="btn-group fte-masterEntry-noPlan-dropdown" style="display: none">\n            <button type="button" class="btn btn-lg btn-default dropdown-toggle" data-toggle="dropdown" title="'),__append(t("fte","showHidden")),__append('">\n              <i class="fa fa-low-vision"></i>\n            </button>\n            <ul class="dropdown-menu"></ul>\n          </div>\n          ')),__append("\n        </th>\n        "),absence.available&&(__append('\n        <th class="fte-masterEntry-demand fte-masterEntry-totalColumn" rowspan="3" colspan="'),__append(demand.columnCount),__append('">\n          '),__append(t("fte","masterEntry:column:demand")),__append('\n        </th>\n        <th class="fte-masterEntry-shortage fte-masterEntry-totalColumn" rowspan="2" colspan="'),__append(shortage.columnCount),__append('">\n          '),__append(t("fte","masterEntry:column:shortage")),__append("\n        </th>\n        ")),__append("\n        "),editable&&(__append('\n        <th class="fte-masterEntry-column-noPlan even" rowspan="5">\n          '),__append(t("fte","masterEntry:column:noPlan")),__append("\n        </th>\n        ")),__append('\n        <th class="fte-masterEntry-supply fte-masterEntry-totalColumn" colspan="'),__append(supply.columnCount),__append('">\n          '),__append(t("fte","masterEntry:column:supply")),__append('\n        </th>\n      </tr>\n      <tr>\n        <th class="fte-masterEntry-supply fte-masterEntry-totalColumn" colspan="'),__append(companyCount),__append('">\n          '),__append(t("fte","masterEntry:column:total")),__append("\n        </th>\n        "),Object.keys(supply.totalByProdFunction).forEach(function(n,a){__append('\n        <th class="fte-masterEntry-supply fte-masterEntry-column-prodFunction" colspan="'),__append(Object.keys(supply.totalByProdFunction[n].companies).length),__append('" data-column="'),__append(a),__append('">\n          '),__append(supply.totalByProdFunction[n].name),__append("\n        </th>\n        ")}),__append("\n      </tr>\n      <tr>\n        "),absence.available&&(__append('\n        <th class="fte-masterEntry-shortage fte-masterEntry-shortage-diff-total fte-masterEntry-totalColumn">'),__append(round(absence.overallTotal)),__append("</th>\n        "),_.forEach(companies,function(n,a){__append('\n        <th class="fte-masterEntry-shortage fte-masterEntry-shortage-diff" data-companyid="'),__append(a),__append('">\n          '),__append(round(absence.totalByCompany[a])),__append("\n        </th>\n        ")}),__append("\n        ")),__append('\n\n        <th class="fte-masterEntry-supply fte-masterEntry-total fte-masterEntry-totalColumn" colspan="'),__append(companyCount),__append('">'),__append(round(supply.overallTotal)),__append("</th>\n        "),Object.keys(supply.totalByProdFunction).forEach(function(n,a){__append('\n        <th class="fte-masterEntry-supply fte-masterEntry-total-prodFunction" colspan="'),__append(Object.keys(supply.totalByProdFunction[n].companies).length),__append('" class="fte-masterEntry-total-prodFunction" data-column="'),__append(a),__append('" data-functionId="'),__append(n),__append('">\n          '),__append(round(supply.totalByProdFunction[n].total)),__append("\n        </th>\n        ")}),__append("\n      </tr>\n      <tr>\n        "),absence.available&&(__append('\n        <th class="fte-masterEntry-demand fte-masterEntry-totalColumn">'),__append(t("fte","masterEntry:column:total")),__append("</th>\n        "),_.forEach(companies,function(n){__append('\n        <th class="fte-masterEntry-demand fte-masterEntry-column-company">'),__append(escapeFn(n)),__append("</th>\n        ")}),__append('\n        <th class="fte-masterEntry-shortage fte-masterEntry-totalColumn">'),__append(t("fte","masterEntry:column:total")),__append("</th>\n        "),_.forEach(companies,function(n){__append('\n        <th class="fte-masterEntry-shortage fte-masterEntry-column-company">'),__append(escapeFn(n)),__append("</th>\n        ")}),__append("\n        ")),__append("\n\n        "),_.forEach(supply.totalByCompany,function(n){__append('\n        <th class="fte-masterEntry-supply fte-masterEntry-column-company fte-masterEntry-totalColumn">'),__append(escapeFn(n.name)),__append("</th>\n        ")}),__append("\n        "),Object.keys(supply.totalByProdFunction).forEach(function(n,a){__append("\n        "),Object.keys(supply.totalByProdFunction[n].companies).forEach(function(n,e){__append('\n        <th class="fte-masterEntry-supply fte-masterEntry-column-company" data-column="'),__append(a),__append(":"),__append(e),__append('">\n          '),__append(escapeFn(supply.totalByCompany[n].name)),__append("\n        </th>\n        ")}),__append("\n        ")}),__append("\n      </tr>\n      <tr>\n        "),absence.available&&(__append('\n        <th class="fte-masterEntry-demand fte-masterEntry-total-demand">'),__append(round(demand.overallTotal)),__append("</th>\n        "),_.forEach(companies,function(n,a){__append('\n        <th class="fte-masterEntry-demand fte-masterEntry-total-demand-company fte-count-container" data-key="demand:'),__append(a),__append('" data-companyId="'),__append(a),__append('">\n          '),editable?(__append('\n          <input\n            class="form-control no-controls fte-masterEntry-count"\n            type="number"\n            min="0"\n            max="9999"\n            value="'),__append(demand.totalByCompany[a]||""),__append('"\n            data-kind="demand"\n            data-value="'),__append(demand.totalByCompany[a]),__append('"\n            data-companyId="'),__append(a),__append('">\n          ')):(__append('\n          <span class="fte-count">'),__append(round(demand.totalByCompany[a])),__append("</span>\n          ")),__append("\n        </th>\n        ")}),__append('\n        <th class="fte-masterEntry-shortage fte-masterEntry-total-shortage">'),__append(round(shortage.overallTotal)),__append("</th>\n        "),_.forEach(companies,function(n,a){__append('\n        <th class="fte-masterEntry-shortage fte-masterEntry-total-shortage-company" data-companyId="'),__append(a),__append('">\n          '),__append(round(shortage.totalByCompany[a])),__append("\n        </th>\n        ")}),__append("\n        ")),__append("\n\n        "),Object.keys(supply.totalByCompany).forEach(function(n){__append('\n        <th class="fte-masterEntry-supply fte-masterEntry-total-company" data-companyId="'),__append(n),__append('">\n          '),__append(round(supply.totalByCompany[n].total)),__append("\n        </th>\n        ")}),__append("\n        "),Object.keys(supply.totalByProdFunction).forEach(function(n,a){__append("\n        "),Object.keys(supply.totalByProdFunction[n].companies).forEach(function(e,p){__append('\n        <th class="fte-masterEntry-supply fte-masterEntry-total-prodFunction-company" data-functionId="'),__append(n),__append('" data-companyId="'),__append(e),__append('" data-column="'),__append(a),__append(":"),__append(p),__append('">\n          '),__append(round(supply.totalByProdFunction[n].companies[e])),__append("\n        </th>\n        ")}),__append("\n        ")}),__append("\n      </tr>\n      </thead>\n      <tbody>\n      "),tasks.forEach(function(n,a){__append("\n      "),(changing||editable||!n.noPlan&&n.total)&&(__append('\n      <tr data-task-index="'),__append(a),__append('" style="display: '),__append(!changing&&n.noPlan?"none":"table-row"),__append('">\n        <td class="fte-masterEntry-cell-task" colspan="'),__append(1+(absence.available?demand.columnCount+shortage.columnCount:0)),__append('">\n          '),"prodFlow"===n.type?(__append("\n          "),__append(escapeFn(n.name)),__append("\n          ")):(__append("\n          <em>"),__append(escapeFn(n.name)),__append("</em>\n          ")),__append("\n        </td>\n        "),editable&&(__append('\n        <td class="fte-masterEntry-noPlan-container even">\n          '),n.absence?__append("\n          &nbsp;\n          "):(__append("\n          "),editable?(__append('\n          <input class="fte-masterEntry-noPlan" type="checkbox" data-taskId="'),__append(n.id),__append('" data-task="'),__append(a),__append('" '),__append(n.noPlan?"checked":""),__append(">\n          ")):(__append('\n          <i class="fa fa-'),__append(n.noPlan?"check":"times"),__append('"></i>\n          ')),__append("\n          ")),__append("\n        </td>\n        ")),__append("\n        "),Object.keys(n.totalByCompany).forEach(function(a,e){__append('\n        <td class="fte-masterEntry-'),__append(n.absence?"shortage":"supply"),__append(' fte-masterEntry-total-company-task" data-companyId="'),__append(a),__append('" data-companyIndex="'),__append(e),__append('">\n          '),__append(round(n.totalByCompany[a])),__append("\n        </td>\n        ")}),__append("\n        "),n.functions.forEach(function(e,p){__append("\n        "),e.companies.forEach(function(t,_){__append('\n        <td class="fte-masterEntry-'),__append(n.absence?"shortage":"supply"),__append(' fte-count-container" data-key="'),__append(a),__append(":"),__append(p),__append(":"),__append(_),__append('">\n          '),editable?(__append('\n          <input\n            class="form-control no-controls fte-masterEntry-count"\n            type="number"\n            min="0"\n            max="9999"\n            value="'),__append(t.count||""),__append('"\n            data-kind="supply"\n            data-value="'),__append(t.count),__append('"\n            data-task="'),__append(a),__append('"\n            data-function="'),__append(p),__append('"\n            data-company="'),__append(_),__append('"\n            data-functionId="'),__append(e.id),__append('"\n            data-companyId="'),__append(t.id),__append('"\n            '),__append(n.noPlan?"disabled":""),__append(">\n          ")):(__append('\n          <span class="fte-count">'),__append(round(t.count)),__append("</span>\n          ")),__append("\n        </td>\n        ")}),__append("\n        ")}),__append("\n      </tr>\n      "))}),__append('\n      </tbody>\n    </table>\n  </div>\n  <div class="panel panel-primary fte-masterEntry-absence">\n    <div class="panel-heading">'),__append(t("fte","masterEntry:absencePanel:title"+(editable?":editable":""))),__append("</div>\n    "),editable&&__append('\n    <div class="fte-masterEntry-absence-userFinder-container">\n      <input class="fte-masterEntry-absence-userFinder" type="text" autocomplete="new-password">\n    </div>\n    '),__append('\n    <table class="table table-bordered table-condensed table-hover fte-masterEntry-absence">\n      <thead>\n      <tr>\n        <th>'),__append(t("users","PROPERTY:personellId")),__append("\n        <th>"),__append(t("users","PROPERTY:name")),__append("\n        "),editable&&(__append('\n        <th class="actions">'),__append(t("core","LIST:COLUMN:actions")),__append("</th>\n        ")),__append('\n      </tr>\n      </thead>\n      <tbody class="fte-masterEntry-absence-noEntries">\n      <tr>\n        <td colspan="3">'),__append(t("core","LIST:NO_DATA")),__append('\n      <tbody class="fte-masterEntry-absence-entries">\n      '),absentUsers.forEach(function(n){__append("\n      "),__append(renderAbsentUserRow({absentUser:n,editable:editable})),__append("\n      ")}),__append("\n    </table>\n  </div>\n</div>\n");return __output.join("")}});