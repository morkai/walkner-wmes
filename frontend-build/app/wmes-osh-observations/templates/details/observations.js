define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output="";function __append(e){void 0!==e&&null!==e&&(__output+=e)}with(locals||{})__append('<div class="panel panel-default osh-details-observations-panel osh-details-observations-'),__append(property),__append(" is-colored "),__append(observations.length?"":"hidden"),__append('">\n  <div class="panel-heading">'),__append(t(`PROPERTY:${property}`)),__append('</div>\n  <div class="table-responsive">\n  <table class="table table-bordered table-condensed table-hover '),__append(unseen?"osh-unseen":""),__append('">\n    <thead>\n    <tr>\n      <th class="osh-observations-details-category">'),__append(t(`PROPERTY:${property}.category`)),__append("</th>\n      "),"behaviors"===property&&(__append('\n        <th class="text-center osh-observations-details-safeRisky">'),__append(t("details:observations:safeRisky")),__append("</th>\n      ")),__append('\n      <th class="text-center osh-observations-details-easyHard">'),__append(t("details:observations:easyHard")),__append('</th>\n      <th class="osh-observations-details-whatWhy">'),__append(t(`PROPERTY:${property}.what`)),__append('</th>\n      <th class="osh-observations-details-whatWhy">'),__append(t(`PROPERTY:${property}.why`)),__append('</th>\n      <th class="osh-observations-details-resolution">'),__append(t(`PROPERTY:${property}.resolution`)),__append("</th>\n    </tr>\n    </thead>\n    <tbody>\n    "),observations.forEach(e=>{__append('\n    <tr data-id="'),__append(e._id),__append('" class="'),__append(e.safe?"success":e.easy?"warning":"danger"),__append('">\n      <td class="osh-observations-details-category">'),__append(escapeFn(e.text)),__append("</td>\n      "),"behaviors"===property&&(__append('\n        <td class="text-center">'),__append(t(`safe:${e.safe}`)),__append("</td>\n      ")),__append('\n      <td class="text-center">'),__append(t(`easy:${e.easy}`)),__append('</td>\n      <td class="text-lines osh-observations-details-whatWhy">'),__append(escapeFn(e.what)),__append('</td>\n      <td class="text-lines osh-observations-details-whatWhy">'),__append(escapeFn(e.why)),__append('</td>\n      <td class="osh-observations-details-resolution" '),e.resolution.rid&&(__append('data-rid="'),__append(e.resolution.rid),__append('"')),__append(">\n        "),e.resolution._id?(__append('\n          <a href="'),__append(e.resolution.url),__append('" class="text-mono">'),__append(escapeFn(e.resolution.rid)),__append("</a>\n          "),e.resolution.icon&&(__append('\n            <i class="fa '),__append(e.resolution.icon),__append('"></i>\n          ')),__append("\n        ")):e.resolution.resolvable&&(__append('\n        <a href="javascript:void(0)" data-action="addResolution" style="display: block">\n          <i class="fa fa-plus"></i><span>'),__append(t("resolution:add")),__append("</span>\n        </a>\n        ")),__append("\n      </td>\n    </tr>\n    ")}),__append("\n    </tbody>\n  </table>\n  </div>\n</div>\n");return __output}});