// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../router","../viewport","../user"],function(e,n,p){"use strict";e.map("/help",p.auth("LOCAL","USER"),function(e){n.loadPage(["app/help/pages/HelpPage","i18n!app/nls/help"],function(n){return new n({folder:e.query.folder,file:e.query.file})})})});