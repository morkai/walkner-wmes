define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(A){return _ENCODE_HTML_RULES[A]||A}escapeFn=escapeFn||function(A){return void 0==A?"":String(A).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title>Plan dla linii '),__append(escapeFn(lines)),__append(" na dzień "),__append(time.utc.format(date,"LL")),__append("</title>\n  <style>\n    @page {\n      size: A4 portrait;\n      margin: 10mm;\n    }\n    * {\n      margin: 0;\n      padding: 0;\n      line-height: 1;\n      box-sizing: border-box;\n    }\n    body {\n      margin: 15px;\n      font-family: Verdana, sans-serif;\n      font-size: 12px;\n      text-rendering: optimizeLegibility;\n      color: #000;\n      background: #FFF;\n      text-align: center;\n    }\n    .page {\n      margin: auto;\n      text-align: left;\n      width: 21cm;\n      padding: 10mm;\n    }\n    header {\n      padding-bottom: 5mm;\n      margin-bottom: 5mm;\n      font-size: 32px;\n      font-weight: bold;\n      text-align: left;\n      border-bottom: 1px solid #000;\n    }\n    footer {\n      display: flex;\n      padding-top: 5mm;\n      margin-top: 5mm;\n      border-top: 1px solid #000;\n      font-size: 10px;\n    }\n    footer p:first-child {\n      margin-bottom: 3px;\n    }\n    footer > div:first-child {\n      flex: 1 1 auto;\n    }\n    footer > div:last-child {\n      flex: 1 1 auto;\n      text-align: right;\n    }\n    .props {\n      float: right;\n      display: flex;\n    }\n    .prop {\n      margin-left: 5mm;\n    }\n    .prop > span:first-child {\n      display: block;\n      margin-bottom: 3px;\n      font-size: 16px;\n      font-weight: bold;\n    }\n    .prop > span:last-child {\n      display: block;\n      font-size: 16px;\n      font-weight: normal;\n    }\n    table {\n      width: 100%;\n      font-size: 12px;\n      border-collapse: collapse;\n    }\n    th {\n      text-align: left;\n      padding-right: 10px;\n      white-space: nowrap;\n    }\n    td {\n      padding-top: 8px;\n      padding-right: 10px;\n      white-space: nowrap;\n      width: 1%;\n    }\n    th:last-child,\n    td:last-child {\n      padding-right: 0;\n    }\n    .name {\n      width: auto;\n    }\n    .name > span {\n      display: block;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      max-width: "),__append(showTimes?340:400),__append("px;\n    }\n    .comment {\n      width: auto;\n    }\n    .comment > span {\n      display: block;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      max-width: 535px;\n      line-height: 12px;\n    }\n    .is-done td {\n      vertical-align: top;\n      font-size: 10px;\n      line-height: 10px;\n      padding-bottom: 2px;\n    }\n    .is-done .comment {\n      padding-bottom: 0;\n    }\n    .qty,\n    .time {\n      text-align: right;\n    }\n    .is-incomplete {\n      color: darkorange;\n    }\n    .is-completed {\n      color: green;\n    }\n    .is-surplus {\n      color: #E00;\n    }\n    .nextShift {\n      padding-bottom: 10px;\n      border-bottom: 1px solid #000;\n    }\n    .nextShift + tr > td {\n      padding-top: 10px;\n    }\n    h2 {\n      margin-top: 5mm;\n      margin-bottom: 5mm;\n      padding-bottom: 5mm;\n      border-bottom: 1px solid #000;\n    }\n    .hourlyPlan th {\n      padding-left: 10px;\n      padding-right: 10px;\n      text-align: center;\n    }\n    .hourlyPlan td {\n      padding-left: 10px;\n      padding-right: 10px;\n      width: 1%;\n      text-align: center;\n    }\n    .hourlyPlan th:first-child,\n    .hourlyPlan td:first-child {\n      padding-left: 0;\n      text-align: left;\n    }\n    .hourlyPlan th:last-child,\n    .hourlyPlan td:last-child {\n      width: auto;\n      text-align: right;\n      font-weight: normal;\n    }\n    .with-quantityDone th,\n    .with-quantityDone td {\n      padding-right: 0;\n    }\n    #info {\n      position: fixed;\n      top: 0;\n      left: 0;\n      padding: 7px;\n      width: 100%;\n      background: #FFD1D1;\n      border-bottom: 1px solid #F8ACAC;\n      font-size: 28px;\n      text-align: center;\n    }\n    @media print {\n      body {\n        margin: 0;\n      }\n      .page {\n        width: 100%;\n        padding: 0;\n      }\n      .page + .page {\n        page-break-before: always;\n      }\n      .bd {\n        height: 900px;\n      }\n      #info {\n        display: none;\n      }\n    }\n    @font-face {\n      font-family: 'wmes-planning';\n      src: url('data:application/octet-stream;base64,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') format('woff'),\n      url('data:application/octet-stream;base64,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WCA8WS6xKwEUKy2wPiywNSsjIC5GsAIlRlJYIDxZLrErARQrLbA/LLA2K4ogIDywBCNCijgjIC5GsAIlRlJYIDxZLrErARQrsARDLrArKy2wQCywABawBCWwBCYgLkcjRyNhsAlDKyMgPCAuIzixKwEUKy2wQSyxCAQlQrAAFrAEJbAEJSAuRyNHI2EgsAQjQrAJQysgsGBQWCCwQFFYswIgAyAbswImAxpZQkIjIEewBEOwAmIgsABQWLBAYFlmsAFjYCCwASsgiophILACQ2BkI7ADQ2FkUFiwAkNhG7ADQ2BZsAMlsAJiILAAUFiwQGBZZrABY2GwAiVGYTgjIDwjOBshICBGI0ewASsjYTghWbErARQrLbBCLLA1Ky6xKwEUKy2wQyywNishIyAgPLAEI0IjOLErARQrsARDLrArKy2wRCywABUgR7AAI0KyAAEBFRQTLrAxKi2wRSywABUgR7AAI0KyAAEBFRQTLrAxKi2wRiyxAAEUE7AyKi2wRyywNCotsEgssAAWRSMgLiBGiiNhOLErARQrLbBJLLAII0KwSCstsEossgAAQSstsEsssgABQSstsEwssgEAQSstsE0ssgEBQSstsE4ssgAAQistsE8ssgABQistsFAssgEAQistsFEssgEBQistsFIssgAAPistsFMssgABPistsFQssgEAPistsFUssgEBPistsFYssgAAQCstsFcssgABQCstsFgssgEAQCstsFkssgEBQCstsFossgAAQystsFsssgABQystsFwssgEAQystsF0ssgEBQystsF4ssgAAPystsF8ssgABPystsGAssgEAPystsGEssgEBPystsGIssDcrLrErARQrLbBjLLA3K7A7Ky2wZCywNyuwPCstsGUssAAWsDcrsD0rLbBmLLA4Ky6xKwEUKy2wZyywOCuwOystsGgssDgrsDwrLbBpLLA4K7A9Ky2waiywOSsusSsBFCstsGsssDkrsDsrLbBsLLA5K7A8Ky2wbSywOSuwPSstsG4ssDorLrErARQrLbBvLLA6K7A7Ky2wcCywOiuwPCstsHEssDorsD0rLbByLLMJBAIDRVghGyMhWUIrsAhlsAMkUHiwARUwLQBLuADIUlixAQGOWbABuQgACABjcLEABUKyAAEAKrEABUKzCgIBCCqxAAVCsw4AAQgqsQAGQroCwAABAAkqsQAHQroAQAABAAkqsQMARLEkAYhRWLBAiFixA2REsSYBiFFYugiAAAEEQIhjVFixAwBEWVlZWbMMAgEMKrgB/4WwBI2xAgBEAAA=') format('truetype');\n    }\n    i[class^=\"icon-\"]:before, [class*=\" icon-\"]:before {\n      font-family: \"wmes-planning\";\n      font-style: normal;\n      font-weight: normal;\n      speak: none;\n      display: inline-block;\n      text-decoration: inherit;\n      width: 1em;\n      margin-right: .2em;\n      text-align: center;\n      font-variant: normal;\n      text-transform: none;\n      line-height: 1em;\n      margin-left: .2em;\n    }\n    .icon-hard:before { content: '\\e800'; }\n    .icon-small:before { content: '\\e801'; }\n    .icon-easy:before { content: '\\f123'; }\n  </style>\n</head>\n<body>\n<div id=\"info\">\n  Wciśnij <kbd>Ctrl+P</kbd>, aby rozpocząć drukowanie.\n</div>\n"),pages.forEach(function(A){if(__append('\n<section class="page">\n  <header>\n    <div class="props">\n      <div class="prop">\n        <span>Data:</span>\n        <span>'),__append(escapeFn(time.format(date,"dd, LL"))),__append('</span>\n      </div>\n      <div class="prop">\n        <span>MRP:</span>\n        <span>'),__append(escapeFn(A.mrp)),__append(" "),__append('</span>\n      </div>\n      <div class="prop">\n        <span>Linia:</span>\n        <span>'),__append(escapeFn(A.line)),__append('</span>\n      </div>\n      <div class="prop">\n        <span>Obsada:</span>\n        <span>'),__append(A.workerCount),__append('</span>\n      </div>\n    </div>\n    Plan dnia\n  </header>\n  <section class="bd">\n    '),A.orders.length&&(__append('\n    <table>\n      <thead>\n        <th>Lp.</th>\n        <th>Nr zlecenia</th>\n        <th>12NC</th>\n        <th>Wyrób</th>\n        <th class="qty">Ilość</th>\n        '),showTimes&&__append("\n        <th>Czas</th>\n        "),__append("\n      </thead>\n      <tbody>\n      "),A.orders.forEach(function(A){__append("\n      "),A.nextShift&&__append('\n      <tr class="nextShift">\n        <td colspan="6"></td>\n      </tr>\n      '),__append('\n      <tr class="'),__append(A.no?"":"is-done"),__append('">\n        '),A.no?(__append('\n        <td class="no">'),__append(A.no),__append('.</td>\n        <td class="orderNo">'),__append(A.orderNo),__append('</td>\n        <td class="nc12">'),__append(A.nc12),__append('</td>\n        <td class="name"><span><i class="icon-'),__append(A.kind),__append('"></i> '),__append(escapeFn(A.name)),__append("</span></td>\n        ")):(__append('\n        <td class="no">&nbsp;</td>\n        <td class="comment" colspan="3">\n          <span>\n            '),__append(escapeFn(A.delayReason)),__append("\n            <i>"),__append(escapeFn(A.comment)),__append("</i>\n          </span>\n        </td>\n        ")),__append('\n        <td class="qty '),__append(A.qtyClass||""),__append('">'),__append(A.qtyPlan),__append("/"),__append(A.qtyTodo),__append("</td>\n        "),showTimes&&(__append('\n        <td class="time">\n          '),A.startAt?(__append("\n          "),__append(time.utc.format(A.startAt,"HH:mm")),__append("-"),__append(time.utc.format(A.finishAt,"HH:mm")),__append("\n          ")):__append("\n          --:--:--\n          "),__append("\n        </td>\n        ")),__append("\n      </tr>\n      ")}),__append("\n      </tbody>\n    </table>\n    ")),__append("\n    "),A.hourlyPlan){__append('\n    <h2>Plan godzinowy</h2>\n    <table class="hourlyPlan '),__append(done?"with-quantityDone":""),__append('">\n      <thead>\n      <tr>\n        <th>Zmiana</th>\n        <th>1</th>\n        <th>2</th>\n        <th>3</th>\n        <th>4</th>\n        <th>5</th>\n        <th>6</th>\n        <th>7</th>\n        <th>8</th>\n        <th>\n          <i class="icon-small"></i> małe&nbsp;&nbsp;\n          <i class="icon-easy"></i> łatwe&nbsp;&nbsp;\n          <i class="icon-hard"></i> trudne\n        </th>\n      </tr>\n      </thead>\n      <tbody>\n      <tr>\n        <td>I</td>\n        ');for(var n=0;n<8;++n)__append("\n        <td>\n          "),A.quantityDone?(__append("\n          "),__append(pad(A.quantityDone[n])),__append("/"),__append(A.hourlyPlan[n]),__append("\n          ")):(__append("\n          "),__append(A.hourlyPlan[n]),__append("\n          ")),__append("\n        </td>\n        ");__append("\n        <td>\n          "),done&&__append("\n          zlecenie nie robione na danej linii i zmianie,\n          "),__append("\n        </td>\n      </tr>\n      <tr>\n        <td>II</td>\n        ");for(var n=8;n<16;++n)__append("\n        <td>\n          "),A.quantityDone?(__append("\n          "),__append(pad(A.quantityDone[n])),__append("/"),__append(A.hourlyPlan[n]),__append("\n          ")):(__append("\n          "),__append(A.hourlyPlan[n]),__append("\n          ")),__append("\n        </td>\n        ");__append("\n        <td>\n          "),done&&__append('\n          <span class="is-incomplete">zlecenie rozpoczęte</span>,\n          <span class="is-completed">zlecenie zrobione</span>,\n          '),__append("\n        </td>\n      </tr>\n      <tr>\n        <td>III</td>\n        ");for(var n=16;n<24;++n)__append("\n        <td>\n          "),A.quantityDone?(__append("\n          "),__append(pad(A.quantityDone[n])),__append("/"),__append(A.hourlyPlan[n]),__append("\n          ")):(__append("\n          "),__append(A.hourlyPlan[n]),__append("\n          ")),__append("\n        </td>\n        ");__append("\n        <td>\n          "),done&&__append('\n          <span class="is-surplus">zlecenie z nadwyżką</span>\n          '),__append("\n        </td>\n      </tr>\n      </tbody>\n    </table>\n    ")}__append("\n  </section>\n  <footer>\n    <div>\n      <p>Plan dla linii "),__append(escapeFn(A.line)),__append(" na dzień "),__append(time.utc.format(date,"LL")),__append(".</p>\n      <p>Wydrukowano w "),__append(time.format(Date.now(),"LLLL")),__append(" przez "),__append(escapeFn(user.getLabel())),__append(" za pomocą systemu WMES.</p>\n    </div>\n    <div>\n      Strona "),__append(A.pageNo),__append(" z "),__append(A.pageCount),__append("\n    </div>\n  </footer>\n</section>\n")}),__append("\n</body>\n</html>\n");return __output.join("")}});