define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{}){__output.push('<form class="prodShifts-form" method="post" action="'),__output.push(formAction),__output.push('">\n  <input type="hidden" name="_method" value="'),__output.push(escape(formMethod)),__output.push('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__output.push(panelTitleText),__output.push('</div>\n    <div class="panel-body">\n      <div class="row">\n        <div class="form-group col-md-4 has-required-select2">\n          <label for="'),__output.push(idPrefix),__output.push('-prodLine" class="control-label">'),__output.push(t("prodShifts","PROPERTY:prodLine")),__output.push('</label>\n          <input id="'),__output.push(idPrefix),__output.push('-prodLine" type="text" name="prodLine" required>\n        </div>\n        <div class="form-group col-md-4">\n          <label for="'),__output.push(idPrefix),__output.push('-date" class="control-label">'),__output.push(t("prodShifts","PROPERTY:date")),__output.push('</label>\n          <input id="'),__output.push(idPrefix),__output.push('-date" class="form-control" type="date" name="date" required min="2013-12-01" max="'),__output.push(time.format(Date.now(),"YYYY-MM-DD")),__output.push('">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="'),__output.push(idPrefix),__output.push('-shift-1" class="control-label">'),__output.push(t("prodShifts","PROPERTY:shift")),__output.push('</label>\n          <div>\n            <label class="radio-inline"><input id="'),__output.push(idPrefix),__output.push('-shift-1" name="shift" type="radio" value="1" checked required> '),__output.push(t("core","SHIFT:1")),__output.push('</label>\n            <label class="radio-inline"><input name="shift" type="radio" value="2" required> '),__output.push(t("core","SHIFT:2")),__output.push('</label>\n            <label class="radio-inline"><input name="shift" type="radio" value="3" required> '),__output.push(t("core","SHIFT:3")),__output.push('</label>\n          </div>\n        </div>\n      </div>\n      <div class="row">\n        <div class="form-group col-md-4">\n          <label for="'),__output.push(idPrefix),__output.push('-master" class="control-label">'),__output.push(t("prodShifts","PROPERTY:master")),__output.push('</label>\n          <input id="'),__output.push(idPrefix),__output.push('-master" type="text" name="master">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="'),__output.push(idPrefix),__output.push('-leader" class="control-label">'),__output.push(t("prodShifts","PROPERTY:leader")),__output.push('</label>\n          <input id="'),__output.push(idPrefix),__output.push('-leader" type="text" name="leader">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="'),__output.push(idPrefix),__output.push('-operator" class="control-label">'),__output.push(t("prodShifts","PROPERTY:operator")),__output.push('</label>\n          <input id="'),__output.push(idPrefix),__output.push('-operator" type="text" name="operator">\n        </div>\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__output.push(t("prodShifts","PROPERTY:quantitiesDone")),__output.push('</label>\n        <table class="table table-bordered table-condensed prodShifts-form-quantitiesDone">\n          <thead>\n            <tr>\n              <th>'),__output.push(t("prodShifts","PROPERTY:quantitiesDone:hour")),__output.push("</th>\n              <th>"),__output.push(t("prodShifts","PROPERTY:quantitiesDone:planned")),__output.push("</th>\n              <th>"),__output.push(t("prodShifts","PROPERTY:quantitiesDone:actual")),__output.push("</th>\n            </tr>\n          </thead>\n          <tbody>\n            ");for(var h=0;8>h;++h)__output.push("\n            <tr>\n              <td>"),__output.push(h+1),__output.push('.</td>\n              <td><input class="form-control" type="number" name="quantitiesDone['),__output.push(h),__output.push('].planned" value="0" min="0" required></td>\n              <td><input class="form-control" type="number" name="quantitiesDone['),__output.push(h),__output.push('].actual" value="0" min="0" required></td>\n            </tr>\n            ');__output.push('\n          </tbody>\n        </table>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__output.push(formActionText),__output.push("</button>\n    </div>\n  </div>\n</form>\n")}return __output.join("")}});