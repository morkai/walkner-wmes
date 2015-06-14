define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="list '),__output.push("undefined"==typeof className?"":className),__output.push('">\n  <div class="table-responsive"><table class="table table-bordered table-hover table-condensed">\n      <thead>\n      <tr>\n        '),columns.forEach(function(t){__output.push("\n        <th "),__output.push("function"==typeof t.thAttrs?t.thAttrs(t):t.thAttrs||""),__output.push(">"),__output.push(t.label),__output.push("</th>\n        ")}),__output.push("\n        "),"function"==typeof actions&&(__output.push('\n        <th class="actions">'),__output.push(t("core","LIST:COLUMN:actions")),__output.push("</th>\n        ")),__output.push("\n      </tr>\n      </thead>\n      <tbody>\n        "),rows.length||(__output.push('\n        <tr>\n          <td colspan="'),__output.push(columns.length+1),__output.push('">'),__output.push(t("core","LIST:NO_DATA")),__output.push("</td>\n        </tr>\n        ")),__output.push("\n        "),rows.forEach(function(u){__output.push('\n        <tr class="list-item '),__output.push(u.className?u.className:""),__output.push('"\n          '),u.dataAttrs&&(__output.push("\n          "),Object.keys(u.dataAttrs).forEach(function(t){__output.push("\n          data-"),__output.push(t),__output.push('="'),__output.push(escape(u.dataAttrs[t])),__output.push('"\n          ')}),__output.push("\n          ")),__output.push("\n          "),u._id&&(__output.push('data-id="'),__output.push(u._id),__output.push('"')),__output.push("\n        >\n          "),columns.forEach(function(p){__output.push("\n          <td "),__output.push("function"==typeof p.tdAttrs?p.tdAttrs(u):p.tdAttrs||""),__output.push(' data-id="'),__output.push(p.id),__output.push('">\n          '),null==u[p.id]?(__output.push("\n            "),null==p.noData?(__output.push("\n            <em>"),__output.push(t("core","LIST:NO_DATA:cell")),__output.push("</em>\n            ")):(__output.push("\n            "),__output.push(p.noData),__output.push("\n            ")),__output.push("\n            ")):(__output.push("\n            "),__output.push(u[p.id]),__output.push("\n            ")),__output.push("\n          </td>\n          ")}),__output.push("\n          "),"function"==typeof actions&&(__output.push('\n          <td class="actions">\n            '),actions(u).forEach(function(t){__output.push("\n            "),t.href?(__output.push('\n            <a href="'),__output.push(t.href),__output.push('" class="btn btn-'),__output.push(t.type||"default"),__output.push(" "),__output.push(t.id?"action-"+t.id:""),__output.push(" "),__output.push(t.className||""),__output.push('" title="'),__output.push(escape(t.label)),__output.push('"><i class="fa fa-'),__output.push(t.icon),__output.push('"></i>'),__output.push(t.text||""),__output.push("</a>\n            ")):(__output.push('\n            <button type="button" class="btn btn-'),__output.push(t.type||"default"),__output.push(" "),__output.push(t.id?"action-"+t.id:""),__output.push(" "),__output.push(t.className||""),__output.push('" title="'),__output.push(escape(t.label)),__output.push('"><i class="fa fa-'),__output.push(t.icon),__output.push('"></i>'),__output.push(t.text||""),__output.push("</button>\n            ")),__output.push("\n            ")}),__output.push("\n          </td>\n          ")),__output.push("\n        </tr>\n        ")}),__output.push('\n      </tbody>\n    </table></div>\n  <div class="pagination-container"></div>\n</div>\n');return __output.join("")}});