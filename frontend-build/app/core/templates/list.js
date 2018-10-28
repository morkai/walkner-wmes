define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="list '),__append("undefined"==typeof className?"":className),__append('">\n  <div class="table-responsive"><table class="table '),__append(tableClassName),__append('">\n      <thead>\n      <tr>\n        '),columns.forEach(function(n){__append('\n        <th data-column-id="'),__append(n.id),__append('" '),__append("function"==typeof n.thAttrs?n.thAttrs(n):n.thAttrs||""),__append(">"),__append(n.label),__append("</th>\n        ")}),__append("\n        "),"function"==typeof actions&&(__append('\n        <th class="actions">'),__append(t("core","LIST:COLUMN:actions")),__append("</th>\n        ")),__append("\n      </tr>\n      </thead>\n      <tbody>\n        "),rows.length||(__append('\n        <tr>\n          <td colspan="'),__append(columns.length+1),__append('">'),__append(noData),__append("</td>\n        </tr>\n        ")),__append("\n        "),rows.forEach(function(n){__append('\n        <tr class="list-item '),__append(n.className?n.className:""),__append('"\n          '),n.dataAttrs&&(__append("\n          "),Object.keys(n.dataAttrs).forEach(function(p){__append("\n          data-"),__append(p),__append('="'),__append(escapeFn(n.dataAttrs[p])),__append('"\n          ')}),__append("\n          ")),__append("\n          "),n._id&&(__append('data-id="'),__append(n._id),__append('"')),__append("\n        >\n          "),columns.forEach(function(p){__append("\n          <td "),__append("function"==typeof p.tdAttrs?p.tdAttrs(n):p.tdAttrs||""),__append(' data-id="'),__append(p.id),__append('">\n          '),null==n[p.id]?(__append("\n            "),null==p.noData?(__append("\n            <em>"),__append(t("core","LIST:NO_DATA:cell")),__append("</em>\n            ")):(__append("\n            "),__append(p.noData),__append("\n            ")),__append("\n            ")):(__append("\n            "),__append("function"==typeof p.tdDecorator?p.tdDecorator(p.id,n[p.id]):n[p.id]),__append("\n            ")),__append("\n          </td>\n          ")}),__append("\n          "),"function"==typeof actions&&(__append('\n          <td class="actions">\n            <div class="actions-group">\n              '),actions(n).forEach(function(n){__append("\n              "),n.href?(__append('\n              <a href="'),__append(n.href),__append('" class="btn btn-'),__append(n.type||"default"),__append(" "),__append(n.id?"action-"+n.id:""),__append(" "),__append(n.className||""),__append('" title="'),__append(escapeFn(n.label)),__append('"><i class="fa fa-'),__append(n.icon),__append('"></i>'),__append(n.text||""),__append("</a>\n              ")):(__append('\n              <button type="button" class="btn btn-'),__append(n.type||"default"),__append(" "),__append(n.id?"action-"+n.id:""),__append(" "),__append(n.className||""),__append('" title="'),__append(escapeFn(n.label)),__append('"><i class="fa fa-'),__append(n.icon),__append('"></i>'),__append(n.text||""),__append("</button>\n              ")),__append("\n              ")}),__append("\n            </div>\n          </td>\n          ")),__append("\n        </tr>\n        ")}),__append('\n      </tbody>\n    </table></div>\n  <div class="pagination-container"></div>\n</div>\n');return __output.join("")}});