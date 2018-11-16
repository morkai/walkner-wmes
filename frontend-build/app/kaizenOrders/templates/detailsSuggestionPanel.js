define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="col-md-'),__append(suggestionColumnSize),__append('">\n  <div class="panel panel-warning">\n    <div class="panel-heading">'),__append(t("kaizenOrders","type:suggestion")),__append('</div>\n    <div class="panel-details '),__append(model.changed.all?"is-changed":""),__append('">\n      '),showNearMissPanel?(__append('\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.suggestionOwners?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:suggestionOwners")),__append('</div>\n          <div class="prop-value">\n            <ul>\n              '),model.suggestionOwners.forEach(function(e){__append("\n              <li>"),__append(e),__append("</li>\n              ")}),__append('\n            </ul>\n          </div>\n        </div>\n        <div class="prop" data-dictionary="categories" data-property="suggestionCategory">\n          <div class="prop-name '),__append(model.changed.suggestionCategory?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:suggestionCategory")),__append(' <i class="fa fa-info-circle"></i></div>\n          <div class="prop-value">'),__append(model.suggestionCategory||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.suggestion?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:suggestion")),__append('</div>\n          <div class="prop-value text-lines">'),__append(model.suggestion||"-"),__append("</div>\n        </div>\n      </div>\n      ")):(__append('\n      <div class="row">\n        <div class="col-md-6">\n          <div class="props first">\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.suggestionOwners?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:nearMissOwners")),__append('</div>\n              <div class="prop-value">\n                <ul>\n                  '),model.suggestionOwners.forEach(function(e){__append("\n                  <li>"),__append(e),__append("</li>\n                  ")}),__append('\n                </ul>\n              </div>\n            </div>\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.eventDate?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:eventDate")),__append('</div>\n              <div class="prop-value">'),__append(model.eventDate||"-"),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.area?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:area")),__append('</div>\n              <div class="prop-value">'),__append(model.area||"-"),__append('</div>\n            </div>\n            <div class="prop" data-dictionary="causes" data-property="cause">\n              <div class="prop-name '),__append(model.changed.cause||model.changed.causeText?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:causeText")),__append(' <i class="fa fa-info-circle"></i></div>\n              <div class="prop-value">\n                '),model.cause||model.causeText?model.cause&&model.causeText?(__append("\n                <em>"),__append(model.cause),__append('</em><br>\n                <span class="text-lines">'),__append(escapeFn(model.causeText)),__append("</span>\n                ")):model.cause?(__append("\n                "),__append(model.cause),__append("\n                ")):(__append("\n                "),__append(escapeFn(model.causeText)),__append("\n                ")):__append("\n                -\n                "),__append('\n              </div>\n            </div>\n            <div class="prop" data-dictionary="risks" data-property="risk">\n              <div class="prop-name '),__append(model.changed.risk?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:risk")),__append(' <i class="fa fa-info-circle"></i></div>\n              <div class="prop-value">'),__append(model.risk||"-"),__append('</div>\n            </div>\n            <div class="prop" data-dictionary="categories" data-property="nearMissCategory">\n              <div class="prop-name '),__append(model.changed.nearMissCategory?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:nearMissCategory")),__append(' <i class="fa fa-info-circle"></i></div>\n              <div class="prop-value">'),__append(model.nearMissCategory||"-"),__append('</div>\n            </div>\n            <div class="prop" data-dictionary="categories" data-property="suggestionCategory">\n              <div class="prop-name '),__append(model.changed.suggestionCategory?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:suggestionCategory")),__append(' <i class="fa fa-info-circle"></i></div>\n              <div class="prop-value">'),__append(model.suggestionCategory||"-"),__append('</div>\n            </div>\n          </div>\n        </div>\n        <div class="col-md-6">\n          <div class="props">\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.description?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:description")),__append('</div>\n              <div class="prop-value text-lines">'),__append(model.description||"-"),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.correctiveMeasures?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:correctiveMeasures")),__append('</div>\n              <div class="prop-value text-lines">'),__append(model.correctiveMeasures||"-"),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.suggestion?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:suggestion")),__append('</div>\n              <div class="prop-value text-lines">'),__append(model.suggestion||"-"),__append("</div>\n            </div>\n          </div>\n        </div>\n      </div>\n      ")),__append("\n    </div>\n  </div>\n</div>");return __output.join("")}});