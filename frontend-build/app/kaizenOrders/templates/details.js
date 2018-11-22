define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="kaizenOrders-details">\n  <div class="panel panel-primary kaizenOrders-details-props">\n    <div class="panel-heading">\n      '),multi?(__append("\n      "),__append(escapeFn(model.subject||t("kaizenOrders","PANEL:TITLE:details"))),__append("\n      ")):(__append("\n      "),__append(t("kaizenOrders","PANEL:TITLE:details")),__append("\n      ")),__append('\n    </div>\n    <div class="panel-details '),__append(model.changed.all?"is-changed":""),__append('">\n      <div class="row">\n        <div class="col-md-4">\n          <div class="props first">\n            <div class="prop">\n              '),multi?(__append('\n              <div class="prop-name '),__append(model.changed.types?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:types")),__append('</div>\n              <div class="prop-value">'),__append(model.types),__append("</div>\n              ")):(__append('\n              <div class="prop-name '),__append(model.changed.subject?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:subject")),__append('</div>\n              <div class="prop-value">'),__append(escapeFn(model.subject)),__append("</div>\n              ")),__append('\n            </div>\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.status?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:status")),__append('</div>\n              <div class="prop-value">'),__append(model.status),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.section?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:section")),__append('</div>\n              <div class="prop-value">'),__append(model.section),__append('</div>\n            </div>\n          </div>\n        </div>\n        <div class="col-md-4">\n          <div class="props">\n            <div class="prop">\n              <div class="prop-name">'),__append(t("kaizenOrders","PROPERTY:creator")),__append('</div>\n              <div class="prop-value">'),__append(model.creator),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("kaizenOrders","PROPERTY:updater")),__append('</div>\n              <div class="prop-value">'),__append(model.updater),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.confirmer?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:confirmer")),__append('</div>\n              <div class="prop-value">'),__append(model.confirmer),__append('</div>\n            </div>\n          </div>\n        </div>\n        <div class="col-md-4">\n          <div class="props">\n            <div class="prop">\n              <div class="prop-name">'),__append(t("kaizenOrders","PROPERTY:createdAt")),__append('</div>\n              <div class="prop-value">'),__append(model.createdAt),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("kaizenOrders","PROPERTY:updatedAt")),__append('</div>\n              <div class="prop-value">'),__append(model.updatedAt),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("kaizenOrders","PROPERTY:confirmedAt")),__append('</div>\n              <div class="prop-value">'),__append(model.confirmedAt||"-"),__append('</div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="row kaizenOrders-details-types">\n    '),showNearMissPanel&&(__append("\n    "),function(){__append('<div class="col-md-'),__append(nearMissColumnSize),__append('">\n  <div class="panel panel-danger">\n    <div class="panel-heading">'),__append(t("kaizenOrders","type:nearMiss")),__append('</div>\n    <div class="panel-details '),__append(model.changed.all?"is-changed":""),__append('">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.nearMissOwners?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:nearMissOwners")),__append('</div>\n          <div class="prop-value">\n            <ul>\n              '),model.nearMissOwners.forEach(function(e){__append("\n              <li>"),__append(e),__append("</li>\n              ")}),__append('\n            </ul>\n          </div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.eventDate?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:eventDate")),__append('</div>\n          <div class="prop-value">'),__append(model.eventDate||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.area?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:area")),__append('</div>\n          <div class="prop-value">'),__append(model.area||"-"),__append('</div>\n        </div>\n        <div class="prop" data-dictionary="causes" data-property="cause">\n          <div class="prop-name '),__append(model.changed.cause||model.changed.causeText?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:causeText")),__append(' <i class="fa fa-info-circle"></i></div>\n          <div class="prop-value">\n            '),model.cause||model.causeText?model.cause&&model.causeText?(__append("\n            <em>"),__append(model.cause),__append('</em><br>\n            <span class="text-lines">'),__append(escapeFn(model.causeText)),__append("</span>\n            ")):model.cause?(__append("\n            "),__append(model.cause),__append("\n            ")):(__append("\n            "),__append(escapeFn(model.causeText)),__append("\n            ")):__append("\n            -\n            "),__append('\n          </div>\n        </div>\n        <div class="prop" data-dictionary="risks" data-property="risk">\n          <div class="prop-name '),__append(model.changed.risk?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:risk")),__append(' <i class="fa fa-info-circle"></i></div>\n          <div class="prop-value">'),__append(model.risk||"-"),__append('</div>\n        </div>\n        <div class="prop" data-dictionary="categories" data-property="nearMissCategory">\n          <div class="prop-name '),__append(model.changed.nearMissCategory?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:nearMissCategory")),__append(' <i class="fa fa-info-circle"></i></div>\n          <div class="prop-value">'),__append(model.nearMissCategory||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.description?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:description")),__append('</div>\n          <div class="prop-value text-lines">'),__append(escapeFn(model.description||"-")),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.correctiveMeasures?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:correctiveMeasures")),__append('</div>\n          <div class="prop-value text-lines">'),__append(escapeFn(model.correctiveMeasures||"-")),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.preventiveMeasures?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:preventiveMeasures")),__append('</div>\n          <div class="prop-value text-lines">'),__append(escapeFn(model.preventiveMeasures||"-")),__append("</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n")}.call(this),__append("\n    ")),__append("\n    "),showSuggestionPanel&&(__append("\n    "),function(){__append('<div class="col-md-'),__append(suggestionColumnSize),__append('">\n  <div class="panel panel-warning">\n    <div class="panel-heading">'),__append(t("kaizenOrders","type:suggestion")),__append('</div>\n    <div class="panel-details '),__append(model.changed.all?"is-changed":""),__append('">\n      '),showNearMissPanel?(__append('\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.suggestionOwners?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:suggestionOwners")),__append('</div>\n          <div class="prop-value">\n            <ul>\n              '),model.suggestionOwners.forEach(function(e){__append("\n              <li>"),__append(e),__append("</li>\n              ")}),__append('\n            </ul>\n          </div>\n        </div>\n        <div class="prop" data-dictionary="categories" data-property="suggestionCategory">\n          <div class="prop-name '),__append(model.changed.suggestionCategory?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:suggestionCategory")),__append(' <i class="fa fa-info-circle"></i></div>\n          <div class="prop-value">'),__append(model.suggestionCategory||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.suggestion?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:suggestion")),__append('</div>\n          <div class="prop-value text-lines">'),__append(model.suggestion||"-"),__append("</div>\n        </div>\n      </div>\n      ")):(__append('\n      <div class="row">\n        <div class="col-md-6">\n          <div class="props first">\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.suggestionOwners?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:nearMissOwners")),__append('</div>\n              <div class="prop-value">\n                <ul>\n                  '),model.suggestionOwners.forEach(function(e){__append("\n                  <li>"),__append(e),__append("</li>\n                  ")}),__append('\n                </ul>\n              </div>\n            </div>\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.eventDate?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:eventDate")),__append('</div>\n              <div class="prop-value">'),__append(model.eventDate||"-"),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.area?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:area")),__append('</div>\n              <div class="prop-value">'),__append(model.area||"-"),__append('</div>\n            </div>\n            <div class="prop" data-dictionary="causes" data-property="cause">\n              <div class="prop-name '),__append(model.changed.cause||model.changed.causeText?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:causeText")),__append(' <i class="fa fa-info-circle"></i></div>\n              <div class="prop-value">\n                '),model.cause||model.causeText?model.cause&&model.causeText?(__append("\n                <em>"),__append(model.cause),__append('</em><br>\n                <span class="text-lines">'),__append(escapeFn(model.causeText)),__append("</span>\n                ")):model.cause?(__append("\n                "),__append(model.cause),__append("\n                ")):(__append("\n                "),__append(escapeFn(model.causeText)),__append("\n                ")):__append("\n                -\n                "),__append('\n              </div>\n            </div>\n            <div class="prop" data-dictionary="risks" data-property="risk">\n              <div class="prop-name '),__append(model.changed.risk?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:risk")),__append(' <i class="fa fa-info-circle"></i></div>\n              <div class="prop-value">'),__append(model.risk||"-"),__append('</div>\n            </div>\n            <div class="prop" data-dictionary="categories" data-property="nearMissCategory">\n              <div class="prop-name '),__append(model.changed.nearMissCategory?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:nearMissCategory")),__append(' <i class="fa fa-info-circle"></i></div>\n              <div class="prop-value">'),__append(model.nearMissCategory||"-"),__append('</div>\n            </div>\n            <div class="prop" data-dictionary="categories" data-property="suggestionCategory">\n              <div class="prop-name '),__append(model.changed.suggestionCategory?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:suggestionCategory")),__append(' <i class="fa fa-info-circle"></i></div>\n              <div class="prop-value">'),__append(model.suggestionCategory||"-"),__append('</div>\n            </div>\n          </div>\n        </div>\n        <div class="col-md-6">\n          <div class="props">\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.description?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:description")),__append('</div>\n              <div class="prop-value text-lines">'),__append(model.description||"-"),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.correctiveMeasures?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:correctiveMeasures")),__append('</div>\n              <div class="prop-value text-lines">'),__append(model.correctiveMeasures||"-"),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.suggestion?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:suggestion")),__append('</div>\n              <div class="prop-value text-lines">'),__append(model.suggestion||"-"),__append("</div>\n            </div>\n          </div>\n        </div>\n      </div>\n      ")),__append("\n    </div>\n  </div>\n</div>")}.call(this),__append("\n    ")),__append("\n    "),showKaizenPanel&&(__append("\n    "),function(){__append('<div class="col-md-'),__append(kaizenColumnSize),__append('">\n  <div class="panel panel-success">\n    <div class="panel-heading">'),__append(t("kaizenOrders","type:kaizen")),__append('</div>\n    <div class="panel-details '),__append(model.changed.all?"is-changed":""),__append('">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.kaizenOwners?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:kaizenOwners")),__append('</div>\n          <div class="prop-value">\n            '),model.kaizenOwners.length?(__append("\n            <ul>\n              "),model.kaizenOwners.forEach(function(e){__append("\n              <li>"),__append(e),__append("</li>\n              ")}),__append("\n            </ul>\n            ")):__append("\n            -\n            "),__append('\n          </div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.kaizenStartDate?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:kaizenStartDate")),__append('</div>\n          <div class="prop-value">'),__append(model.kaizenStartDate||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.kaizenFinishDate?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:kaizenFinishDate")),__append('</div>\n          <div class="prop-value">'),__append(model.kaizenFinishDate||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.kaizenStartDate||model.changed.kaizenFinishDate?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:kaizenDuration")),__append('</div>\n          <div class="prop-value">'),__append(model.kaizenDuration||"-"),__append("</div>\n        </div>\n        "),showSuggestionPanel||(__append('\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.suggestion?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:suggestion")),__append('</div>\n          <div class="prop-value text-lines">'),__append(model.suggestion||"-"),__append("</div>\n        </div>\n        ")),__append('\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.kaizenImprovements?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:kaizenImprovements")),__append('</div>\n          <div class="prop-value text-lines">'),__append(escapeFn(model.kaizenImprovements||"-")),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.kaizenEffect?"is-changed":""),__append('">'),__append(t("kaizenOrders","PROPERTY:kaizenEffect")),__append('</div>\n          <div class="prop-value text-lines">'),__append(escapeFn(model.kaizenEffect||"-")),__append("</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>")}.call(this),__append("\n    ")),__append('\n  </div>\n  <div class="kaizenOrders-details-tabs">\n    <ul class="nav nav-tabs">\n      <li class="active"><a href="#'),__append(idPrefix),__append('-attachments" data-toggle="tab" data-tab="attachments">'),__append(t("kaizenOrders","tab:attachments")),__append('</a></li>\n      <li><a href="#'),__append(idPrefix),__append('-observers" data-toggle="tab" data-tab="observers">'),__append(t("kaizenOrders","tab:observers")),__append('</a></li>\n    </ul>\n    <div class="tab-content">\n      <div class="tab-pane active" id="'),__append(idPrefix),__append('-attachments">'),function(){__append('<table class="table table-bordered table-condensed table-hover kaizenOrders-details-attachments">\n  <thead>\n    <tr>\n      <th class="is-min">'),__append(t("kaizenOrders","PROPERTY:attachments:description")),__append("</th>\n      <th>"),__append(t("kaizenOrders","PROPERTY:attachments:file")),__append('</th>\n      <th class="actions">'),__append(t("core","LIST:COLUMN:actions")),__append("</th>\n    </tr>\n  </thead>\n  <tbody>\n    "),model.attachments.length||(__append('\n    <tr>\n      <td colspan="3">'),__append(t("kaizenOrders","attachments:noData")),__append("</td>\n    </tr>\n    ")),__append("\n    "),model.attachments.forEach(function(e){__append('\n    <tr>\n      <td class="is-min">'),__append(escapeFn(t.has("kaizenOrders","attachments:"+e.description)?t("kaizenOrders","attachments:"+e.description):e.description)),__append("</td>\n      <td>"),__append(escapeFn(e.name)),__append('</td>\n      <td class="actions">\n        <div class="actions-group">\n          <a class="btn btn-default" href="/kaizen/orders/'),__append(model._id),__append("/attachments/"),__append(e._id),__append('" title="'),__append(t("kaizenOrders","attachments:actions:view")),__append('"><i class="fa fa-file-text-o"></i></a>\n          <a class="btn btn-default" href="/kaizen/orders/'),__append(model._id),__append("/attachments/"),__append(e._id),__append('?download=1" title="'),__append(t("kaizenOrders","attachments:actions:download")),__append('"><i class="fa fa-download"></i></a>\n        </div>\n      </td>\n    </tr>\n    ')}),__append("\n  </tbody>\n</table>\n")}.call(this),__append('</div>\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-observers">'),function(){__append('<table class="table table-bordered table-condensed table-hover kaizenOrders-details-observers">\n  <thead>\n    <tr>\n      <th class="is-min">'),__append(t("kaizenOrders","PROPERTY:observers:name")),__append('</th>\n      <th class="is-min">'),__append(t("kaizenOrders","PROPERTY:observers:role")),__append("</th>\n      <th>"),__append(t("kaizenOrders","PROPERTY:observers:lastSeenAt")),__append("</th>\n    </tr>\n  </thead>\n  <tbody>\n    "),model.observers.length||(__append('\n    <tr>\n      <td colspan="3">'),__append(t("kaizenOrders","observers:noData")),__append("</td>\n    </tr>\n    ")),__append("\n    "),model.observers.forEach(function(e){__append('\n    <tr>\n      <td class="is-min"><span class="userInfo" data-user-id="'),__append(e.user.id),__append('"><span class="userInfo-label">'),__append(escapeFn(e.user.label)),__append('</span></span></td>\n      <td class="is-min">'),__append(escapeFn(t("kaizenOrders","role:"+e.role))),__append("</td>\n      <td>"),__append(escapeFn(e.lastSeenAt?time.format(e.lastSeenAt,"LLLL"):"-")),__append("</td>\n    </tr>\n    ")}),__append("\n  </tbody>\n</table>\n")}.call(this),__append("</div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});