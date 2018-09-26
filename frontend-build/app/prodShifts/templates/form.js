define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{}){__append('<form class="prodShifts-form" method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(escapeFn(formMethod)),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append("</div>\n    "),isChangeRequest&&(__append('\n    <div class="message message-inline message-warning">'),__append(t("prodShifts","changeRequest:warning:"+(editMode?"edit":"add"))),__append("</div>\n    ")),__append('\n    <div class="panel-body">\n      '),isChangeRequest&&(__append('\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-requestComment" class="control-label">'),__append(t("prodShifts","changeRequest:commentLabel")),__append('</label>\n        <textarea id="'),__append(idPrefix),__append('-requestComment" class="form-control" name="requestComment" rows="2"></textarea>\n      </div>\n      ')),__append('\n      <div class="row">\n        <div class="form-group col-md-4 has-required-select2">\n          <label for="'),__append(idPrefix),__append('-prodLine" class="control-label is-required">'),__append(t("prodShifts","PROPERTY:prodLine")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-prodLine" type="text" autocomplete="new-password" name="prodLine" required>\n        </div>\n        <div class="form-group col-md-4">\n          <label for="'),__append(idPrefix),__append('-date" class="control-label is-required">'),__append(t("prodShifts","PROPERTY:date")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-date" class="form-control" type="date" name="date" required min="2013-12-01" max="'),__append(time.format(Date.now(),"YYYY-MM-DD")),__append('">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="'),__append(idPrefix),__append('-shift-1" class="control-label is-required">'),__append(t("prodShifts","PROPERTY:shift")),__append('</label>\n          <div>\n            <label class="radio-inline"><input id="'),__append(idPrefix),__append('-shift-1" name="shift" type="radio" value="1" checked required> '),__append(t("core","SHIFT:1")),__append('</label>\n            <label class="radio-inline"><input name="shift" type="radio" value="2" required> '),__append(t("core","SHIFT:2")),__append('</label>\n            <label class="radio-inline"><input name="shift" type="radio" value="3" required> '),__append(t("core","SHIFT:3")),__append('</label>\n          </div>\n        </div>\n      </div>\n      <div class="row">\n        <div class="form-group col-md-4">\n          <label for="'),__append(idPrefix),__append('-master" class="control-label">'),__append(t("prodShifts","PROPERTY:master")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-master" type="text" autocomplete="new-password" name="master">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="'),__append(idPrefix),__append('-leader" class="control-label">'),__append(t("prodShifts","PROPERTY:leader")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-leader" type="text" autocomplete="new-password" name="leader">\n        </div>\n        <div class="form-group col-md-4">\n          <label for="'),__append(idPrefix),__append('-operator" class="control-label">'),__append(t("prodShifts","PROPERTY:operator")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-operator" type="text" autocomplete="new-password" name="operator">\n        </div>\n      </div>\n      <div class="form-group">\n        <label class="control-label">'),__append(t("prodShifts","PROPERTY:quantitiesDone")),__append('</label>\n        <table class="table table-bordered table-condensed prodShifts-form-quantitiesDone">\n          <thead>\n            <tr>\n              <th>'),__append(t("prodShifts","PROPERTY:quantitiesDone:hour")),__append("</th>\n              <th>"),__append(t("prodShifts","PROPERTY:quantitiesDone:planned")),__append("</th>\n              <th>"),__append(t("prodShifts","PROPERTY:quantitiesDone:actual")),__append("</th>\n            </tr>\n          </thead>\n          <tbody>\n            ");for(var h=0;h<8;++h)__append("\n            <tr>\n              <td>"),__append(h+1),__append('.</td>\n              <td><input class="form-control" type="number" name="quantitiesDone['),__append(h),__append('].planned" value="0" min="0" required></td>\n              <td><input class="form-control" type="number" name="quantitiesDone['),__append(h),__append('].actual" value="0" min="0" required></td>\n            </tr>\n            ');__append('\n          </tbody>\n        </table>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n")}return __output.join("")}});