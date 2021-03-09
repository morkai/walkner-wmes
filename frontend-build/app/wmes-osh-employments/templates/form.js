define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output="";function __append(n){void 0!==n&&null!==n&&(__output+=n)}with(locals||{})__append('<form class="osh-employments-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      '),__append(helpers.formGroup({name:"month",type:"month",label:"PROPERTY:",required:!0,placeholder:"YYYY-MM",min:time.format(window.PRODUCTION_DATA_START_DATE||"2020-01-01","YYYY-MM"),max:time.getMoment().startOf("month").add(1,"months").format("YYYY-MM"),inputStyle:{width:"175px"},disabled:editMode})),__append('\n      <div class="form-group">\n        <input id="'),__append(id("enableRecount")),__append('" type="checkbox">\n        <button id="'),__append(id("doRecount")),__append('" class="btn btn-default" type="button" disabled>\n          '),__append(t("FORM:recount")),__append('\n        </button>\n      </div>\n      <div class="table-responsive is-colored osh-employments-form-table" style="margin-bottom: 0">\n        <table class="table table-bordered table-condensed table-hover">\n          <thead>\n          <tr>\n            <th class="is-min">'),__append(t("wmes-osh-common","orgUnit:division")),__append('</th>\n            <th class="is-min">'),__append(t("wmes-osh-common","orgUnit:workplace")),__append('</th>\n            <th class="is-min">'),__append(t("wmes-osh-common","orgUnit:department")),__append('</th>\n            <th class="is-min">'),__append(t("PROPERTY:internal")),__append('</th>\n            <th class="is-min">'),__append(t("PROPERTY:external")),__append('</th>\n            <th class="is-min">'),__append(t("PROPERTY:absent")),__append('</th>\n            <th class="is-min">'),__append(t("PROPERTY:observers")),__append("</th>\n            <th></th>\n          </tr>\n          </thead>\n          <tbody>\n          "),divisions.forEach(n=>{__append('\n            <tr class="secondary js-division" data-division="'),__append(n._id),__append('" data-workplace="0" data-department="0">\n              <td class="is-min" colspan="3">'),__append(escapeFn(n.label)),__append('</td>\n              <td class="is-min osh-employments-form-input">\n                <input name="departments.'),__append(n.key),__append('.division" type="hidden">\n                <input name="departments.'),__append(n.key),__append('.workplace" type="hidden">\n                <input name="departments.'),__append(n.key),__append('.department" type="hidden">\n                <input name="departments.'),__append(n.key),__append('.internal" type="number" readonly tabindex="-1" min="0" max="99999" class="form-control no-controls">\n              </td>\n              <td class="is-min osh-employments-form-input">\n                <input name="departments.'),__append(n.key),__append('.external" type="number" readonly tabindex="-1" min="0" max="99999" class="form-control no-controls">\n              </td>\n              <td class="is-min osh-employments-form-input">\n                <input name="departments.'),__append(n.key),__append('.absent" type="number" readonly tabindex="-1" min="0" max="99999" class="form-control no-controls">\n              </td>\n              <td class="is-min osh-employments-form-input">\n                <input name="departments.'),__append(n.key),__append('.observers" type="number" readonly tabindex="-1" min="0" max="99999" class="form-control no-controls">\n              </td>\n              <td></td>\n            </tr>\n            '),n.workplaces.forEach(e=>{__append('\n              <tr class="info js-workplace" data-division="'),__append(n._id),__append('" data-workplace="'),__append(e._id),__append('" data-department="0">\n                <td class="is-min">'),__append(escapeFn(n.label)),__append('</td>\n                <td class="is-min" colspan="2">'),__append(escapeFn(e.label)),__append('</td>\n                <td class="is-min osh-employments-form-input">\n                  <input name="departments.'),__append(e.key),__append('.division" type="hidden">\n                  <input name="departments.'),__append(e.key),__append('.workplace" type="hidden">\n                  <input name="departments.'),__append(e.key),__append('.department" type="hidden">\n                  <input name="departments.'),__append(e.key),__append('.internal" type="number" readonly tabindex="-1" min="0" max="99999" class="form-control no-controls">\n                </td>\n                <td class="is-min osh-employments-form-input">\n                  <input name="departments.'),__append(e.key),__append('.external" type="number" readonly tabindex="-1" min="0" max="99999" class="form-control no-controls">\n                </td>\n                <td class="is-min osh-employments-form-input">\n                  <input name="departments.'),__append(e.key),__append('.absent" type="number" readonly tabindex="-1" min="0" max="99999" class="form-control no-controls">\n                </td>\n                <td class="is-min osh-employments-form-input">\n                  <input name="departments.'),__append(e.key),__append('.observers" type="number" readonly tabindex="-1" min="0" max="99999" class="form-control no-controls">\n                </td>\n                <td></td>\n              </tr>\n              '),e.departments.forEach((p,t)=>{__append('\n                <tr class="js-department" data-division="'),__append(n._id),__append('" data-workplace="'),__append(e._id),__append('" data-department="'),__append(p._id),__append('">\n                  <td class="is-min">'),__append(escapeFn(n.label)),__append('</td>\n                  <td class="is-min">'),__append(escapeFn(e.label)),__append('</td>\n                  <td class="is-min">'),__append(escapeFn(p.label)),__append('</td>\n                  <td class="is-min osh-employments-form-input">\n                    <input name="departments.'),__append(p.key),__append('.division" type="hidden">\n                    <input name="departments.'),__append(p.key),__append('.workplace" type="hidden">\n                    <input name="departments.'),__append(p.key),__append('.department" type="hidden">\n                    <input name="departments.'),__append(p.key),__append('.internal" type="number" min="0" max="99999" class="form-control no-controls">\n                  </td>\n                  <td class="is-min osh-employments-form-input">\n                    <input name="departments.'),__append(p.key),__append('.external" type="number" min="0" max="99999" class="form-control no-controls">\n                  </td>\n                  <td class="is-min osh-employments-form-input">\n                    <input name="departments.'),__append(p.key),__append('.absent" type="number" min="0" max="99999" class="form-control no-controls">\n                  </td>\n                  <td class="is-min osh-employments-form-input">\n                    <input name="departments.'),__append(p.key),__append('.observers" type="number" min="0" max="99999" class="form-control no-controls">\n                  </td>\n                  <td></td>\n                </tr>\n              ')}),__append("\n            ")}),__append("\n          ")}),__append('\n          </tbody>\n        </table>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output}});