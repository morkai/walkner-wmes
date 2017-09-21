define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="planning-settings-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-requiredStatuses">'),__append(t("planning","settings:requiredStatuses")),__append('</label>\n        <p class="help-block">'),__append(t("planning","settings:requiredStatuses:help")),__append('</p>\n        <input id="'),__append(idPrefix),__append('-requiredStatuses" name="requiredStatuses" type="text" data-object="plan">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-ignoredStatuses">'),__append(t("planning","settings:ignoredStatuses")),__append('</label>\n        <p class="help-block">'),__append(t("planning","settings:ignoredStatuses:help")),__append('</p>\n        <input id="'),__append(idPrefix),__append('-ignoredStatuses" name="ignoredStatuses" type="text" data-object="plan">\n      </div>\n      <div class="checkbox">\n        <label class="control-label">\n          <input id="'),__append(idPrefix),__append('-ignoreCompleted" name="ignoreCompleted" type="checkbox" value="true" data-object="plan">\n          '),__append(t("planning","settings:ignoreCompleted")),__append('\n        </label>\n        <p class="help-block">'),__append(t("planning","settings:ignoreCompleted:help")),__append('</p>\n      </div>\n      <div class="checkbox">\n        <label class="control-label">\n          <input id="'),__append(idPrefix),__append('-useRemainingQuantity" name="useRemainingQuantity" type="checkbox" value="true" data-object="plan">\n          '),__append(t("planning","settings:useRemainingQuantity")),__append('\n        </label>\n        <p class="help-block">'),__append(t("planning","settings:useRemainingQuantity:help")),__append('</p>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-hardComponents">'),__append(t("planning","settings:hardComponents")),__append('</label>\n        <p class="help-block">'),__append(t("planning","settings:hardComponents:help")),__append('</p>\n        <input id="'),__append(idPrefix),__append('-hardComponents" name="hardComponents" type="text" data-object="plan">\n      </div>\n      <hr>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-line">'),__append(t("planning","settings:line")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-line" type="text">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-mrpPriority">'),__append(t("planning","settings:mrpPriority")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-mrpPriority" type="text">\n      </div>\n      <div class="row">\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-activeFrom">'),__append(t("planning","settings:activeFrom")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-activeFrom" name="activeFrom" class="form-control" type="text" placeholder="hh:mm" pattern="^[0-9]{2}:[0-9]{2}$" data-object="line">\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-activeTo">'),__append(t("planning","settings:activeTo")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-activeTo" name="activeTo" class="form-control" type="text" placeholder="hh:mm" pattern="^[0-9]{2}:[0-9]{2}$" data-object="line">\n        </div>\n      </div>\n      <hr>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-mrp">'),__append(t("planning","settings:mrp")),__append('</label>\n        <p class="help-block">'),__append(t("planning","settings:mrp:help")),__append('</p>\n        <input id="'),__append(idPrefix),__append('-mrp" type="text">\n      </div>\n      <div class="row">\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-extraOrderSeconds">'),__append(t("planning","settings:extraOrderSeconds")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-extraOrderSeconds" name="extraOrderSeconds" class="form-control" type="number" min="0" max="600" step="1" data-object="mrp">\n          <p class="help-block">'),__append(t("planning","settings:extraOrderSeconds:help")),__append('</p>\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-extraShiftSeconds-1">'),__append(t("planning","settings:extraShiftSeconds:1")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-extraShiftSeconds-1" name="extraShiftSeconds" class="form-control" type="number" min="0" max="3600" step="1" data-object="mrp">\n          <p class="help-block">'),__append(t("planning","settings:extraShiftSeconds:help")),__append('</p>\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-extraShiftSeconds-2">'),__append(t("planning","settings:extraShiftSeconds:2")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-extraShiftSeconds-2" name="extraShiftSeconds" class="form-control" type="number" min="0" max="3600" step="1" data-object="mrp">\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-extraShiftSeconds-3">'),__append(t("planning","settings:extraShiftSeconds:3")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-extraShiftSeconds-3" name="extraShiftSeconds" class="form-control" type="number" min="0" max="3600" step="1" data-object="mrp">\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-bigOrderQuantity">'),__append(t("planning","settings:bigOrderQuantity")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-bigOrderQuantity" name="bigOrderQuantity" class="form-control" type="number" min="0" max="9999" step="1" data-object="mrp">\n          <p class="help-block">'),__append(t("planning","settings:bigOrderQuantity:help")),__append('</p>\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-hardOrderManHours">'),__append(t("planning","settings:hardOrderManHours")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-hardOrderManHours" name="hardOrderManHours" class="form-control" type="number" min="0" max="9999" step="0.001" data-object="mrp">\n          <p class="help-block">'),__append(t("planning","settings:hardOrderManHours:help")),__append('</p>\n        </div>\n      </div>\n      <hr>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-mrpLine">'),__append(t("planning","settings:mrpLine")),__append('</label>\n        <p class="help-block">'),__append(t("planning","settings:mrpLine:help")),__append('</p>\n        <input id="'),__append(idPrefix),__append('-mrpLine" type="text">\n      </div>\n      <div class="row">\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-workerCount">'),__append(t("planning","settings:workerCount")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-workerCount" name="workerCount" class="form-control" type="number" min="0" max="9999" step="1" data-object="line">\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-orderPriority">'),__append(t("planning","settings:orderPriority")),__append('</label>\n        <p class="help-block">'),__append(t("planning","settings:orderPriority:help")),__append('</p>\n        <input id="'),__append(idPrefix),__append('-orderPriority" type="text">\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});