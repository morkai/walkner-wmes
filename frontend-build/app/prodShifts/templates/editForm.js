define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{}){__append('<form class="prodShifts-editForm" method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(escape(formMethod)),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="row">\n        <div class="form-group col-md-4">\n          <label for="'),__append(idPrefix),__append('-master" class="control-label">'),__append(t("prodShifts","PROPERTY:master")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-master" type="text" name="master">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="'),__append(idPrefix),__append('-leader" class="control-label">'),__append(t("prodShifts","PROPERTY:leader")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-leader" type="text" name="leader">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="'),__append(idPrefix),__append('-operator" class="control-label">'),__append(t("prodShifts","PROPERTY:operator")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-operator" type="text" name="operator">\n        </div>\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(t("prodShifts","PROPERTY:quantitiesDone")),__append('</label>\n        <table class="table table-bordered table-condensed prodShifts-form-quantitiesDone">\n          <thead>\n            <tr>\n              <th>'),__append(t("prodShifts","PROPERTY:quantitiesDone:hour")),__append("</th>\n              <th>"),__append(t("prodShifts","PROPERTY:quantitiesDone:planned")),__append("</th>\n              <th>"),__append(t("prodShifts","PROPERTY:quantitiesDone:actual")),__append("</th>\n            </tr>\n          </thead>\n          <tbody>\n            ");for(var h=0;8>h;++h)__append("\n            <tr>\n              <td>"),__append(h+1),__append('.</td>\n              <td><input class="form-control" type="number" name="quantitiesDone['),__append(h),__append('].planned" value="0" min="0" required></td>\n              <td><input class="form-control" type="number" name="quantitiesDone['),__append(h),__append('].actual" value="0" min="0" required></td>\n            </tr>\n            ');__append('\n          </tbody>\n        </table>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n")}return __output.join("")}});