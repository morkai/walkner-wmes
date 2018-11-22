define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="suggestions-details">\n  <div class="panel panel-primary suggestions-details-props">\n    <div class="panel-heading">\n      '),__append(t("suggestions","PANEL:TITLE:details")),__append('\n    </div>\n    <div class="panel-details '),__append(model.changed.all?"is-changed":""),__append('">\n      <div class="row">\n        <div class="col-md-4">\n          <div class="props first">\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.subject?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:subject")),__append('</div>\n              <div class="prop-value">'),__append(escapeFn(model.subject)),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.status?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:status")),__append('</div>\n              <div class="prop-value">'),__append(model.status),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.section?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:section")),__append('</div>\n              <div class="prop-value">'),__append(model.section),__append('</div>\n            </div>\n          </div>\n        </div>\n        <div class="col-md-4">\n          <div class="props">\n            <div class="prop">\n              <div class="prop-name">'),__append(t("suggestions","PROPERTY:creator")),__append('</div>\n              <div class="prop-value">'),__append(model.creator),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("suggestions","PROPERTY:updater")),__append('</div>\n              <div class="prop-value">'),__append(model.updater),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name '),__append(model.changed.confirmer?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:confirmer")),__append('</div>\n              <div class="prop-value">'),__append(model.confirmer),__append('</div>\n            </div>\n          </div>\n        </div>\n        <div class="col-md-4">\n          <div class="props">\n            <div class="prop">\n              <div class="prop-name">'),__append(t("suggestions","PROPERTY:createdAt")),__append('</div>\n              <div class="prop-value">'),__append(model.createdAt),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("suggestions","PROPERTY:updatedAt")),__append('</div>\n              <div class="prop-value">'),__append(model.updatedAt),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("suggestions","PROPERTY:confirmedAt")),__append('</div>\n              <div class="prop-value">'),__append(model.confirmedAt||"-"),__append('</div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="row suggestions-details-types">\n    '),function(){__append('<div class="col-md-'),__append(suggestionColumnSize),__append('">\n  <div class="panel panel-warning">\n    <div class="panel-heading">'),__append(t("suggestions","type:suggestion")),__append('</div>\n    <div class="panel-details '),__append(model.changed.all?"is-changed":""),__append('">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.suggestionOwners?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:suggestionOwners")),__append('</div>\n          <div class="prop-value">\n            <ul>\n              '),model.suggestionOwners.forEach(function(n){__append("\n              <li>"),__append(n),__append("</li>\n              ")}),__append('\n            </ul>\n          </div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.date?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:date")),__append('</div>\n          <div class="prop-value">'),__append(model.date||"-"),__append('</div>\n        </div>\n        <div class="prop" data-dictionary="categories" data-property="category">\n          <div class="prop-name '),__append(model.changed.categories?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:categories")),__append(' <i class="fa fa-info-circle"></i></div>\n          <div class="prop-value">'),__append(escapeFn(model.categories)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.productFamily?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:productFamily")),__append('</div>\n          <div class="prop-value">'),__append(model.productFamily||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.howItIs?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:howItIs")),__append('</div>\n          <div class="prop-value text-lines">'),__append(model.howItIs||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.howItShouldBe?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:howItShouldBe")),__append('</div>\n          <div class="prop-value text-lines">'),__append(model.howItShouldBe||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.suggestion?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:suggestion")),__append('</div>\n          <div class="prop-value text-lines">'),__append(model.suggestion||"-"),__append("</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n")}.call(this),__append("\n    "),showKaizenPanel&&(__append("\n    "),function(){__append('<div class="col-md-'),__append(kaizenColumnSize),__append('">\n  <div class="panel panel-success">\n    <div class="panel-heading">'),__append(t("suggestions","type:kaizen")),__append('</div>\n    <div class="panel-details '),__append(model.changed.all?"is-changed":""),__append('">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.kaizenOwners?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:kaizenOwners")),__append('</div>\n          <div class="prop-value">\n            '),model.kaizenOwners.length?(__append("\n            <ul>\n              "),model.kaizenOwners.forEach(function(n){__append("\n              <li>"),__append(n),__append("</li>\n              ")}),__append("\n            </ul>\n            ")):__append("\n            -\n            "),__append('\n          </div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.kaizenStartDate?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:kaizenStartDate")),__append('</div>\n          <div class="prop-value">'),__append(model.kaizenStartDate||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.kaizenFinishDate?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:kaizenFinishDate")),__append('</div>\n          <div class="prop-value">'),__append(model.kaizenFinishDate||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.kaizenStartDate||model.changed.kaizenFinishDate?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:kaizenDuration")),__append('</div>\n          <div class="prop-value">'),__append(model.kaizenDuration||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.kaizenFinishDate?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:finishDuration")),__append('</div>\n          <div class="prop-value">'),__append(model.finishDuration||"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.kaizenImprovements?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:kaizenImprovements")),__append('</div>\n          <div class="prop-value text-lines">'),__append(escapeFn(model.kaizenImprovements||"-")),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__append(model.changed.kaizenEffect?"is-changed":""),__append('">'),__append(t("suggestions","PROPERTY:kaizenEffect")),__append('</div>\n          <div class="prop-value text-lines">'),__append(escapeFn(model.kaizenEffect||"-")),__append("</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n")}.call(this),__append("\n    ")),__append('\n  </div>\n  <div class="suggestions-details-tabs">\n    <ul class="nav nav-tabs">\n      <li class="active"><a href="#'),__append(idPrefix),__append('-attachments" data-toggle="tab" data-tab="attachments">'),__append(t("suggestions","tab:attachments")),__append('</a></li>\n      <li><a href="#'),__append(idPrefix),__append('-observers" data-toggle="tab" data-tab="observers">'),__append(t("suggestions","tab:observers")),__append('</a></li>\n    </ul>\n    <div class="tab-content">\n      <div class="tab-pane active" id="'),__append(idPrefix),__append('-attachments">'),function(){__append('<table class="table table-bordered table-condensed table-hover suggestions-details-attachments">\n  <thead>\n    <tr>\n      <th class="is-min">'),__append(t("suggestions","PROPERTY:attachments:description")),__append("</th>\n      <th>"),__append(t("suggestions","PROPERTY:attachments:file")),__append('</th>\n      <th class="actions">'),__append(t("core","LIST:COLUMN:actions")),__append("</th>\n    </tr>\n  </thead>\n  <tbody>\n    "),model.attachments.length||(__append('\n    <tr>\n      <td colspan="3">'),__append(t("suggestions","attachments:noData")),__append("</td>\n    </tr>\n    ")),__append("\n    "),model.attachments.forEach(function(n){__append('\n    <tr>\n      <td class="is-min">'),__append(escapeFn(t.has("suggestions","attachments:"+n.description)?t("suggestions","attachments:"+n.description):n.description)),__append("</td>\n      <td>"),__append(escapeFn(n.name)),__append('</td>\n      <td class="actions">\n        <div class="actions-group">\n          <a class="btn btn-default" href="/suggestions/'),__append(model._id),__append("/attachments/"),__append(n._id),__append('" title="'),__append(t("suggestions","attachments:actions:view")),__append('"><i class="fa fa-file-text-o"></i></a>\n          <a class="btn btn-default" href="/suggestions/'),__append(model._id),__append("/attachments/"),__append(n._id),__append('?download=1" title="'),__append(t("suggestions","attachments:actions:download")),__append('"><i class="fa fa-download"></i></a>\n        </div>\n      </td>\n    </tr>\n    ')}),__append("\n  </tbody>\n</table>\n")}.call(this),__append('</div>\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-observers">'),function(){__append('<table class="table table-bordered table-condensed table-hover suggestions-details-observers">\n  <thead>\n    <tr>\n      <th class="is-min">'),__append(t("suggestions","PROPERTY:observers:name")),__append('</th>\n      <th class="is-min">'),__append(t("suggestions","PROPERTY:observers:role")),__append("</th>\n      <th>"),__append(t("suggestions","PROPERTY:observers:lastSeenAt")),__append("</th>\n    </tr>\n  </thead>\n  <tbody>\n    "),model.observers.length||(__append('\n    <tr>\n      <td colspan="3">'),__append(t("suggestions","observers:noData")),__append("</td>\n    </tr>\n    ")),__append("\n    "),model.observers.forEach(function(n){__append('\n    <tr>\n      <td class="is-min"><span class="userInfo" data-user-id="'),__append(n.user.id),__append('"><span class="userInfo-label">'),__append(escapeFn(n.user.label)),__append('</span></span></td>\n      <td class="is-min">'),__append(escapeFn(t("suggestions","role:"+n.role))),__append("</td>\n      <td>"),__append(escapeFn(n.lastSeenAt?time.format(n.lastSeenAt,"LLLL"):"-")),__append("</td>\n    </tr>\n    ")}),__append("\n  </tbody>\n</table>\n")}.call(this),__append("</div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});