// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/viewport"],function(e){return function(n,r,o){var t=new n({_id:r.params.id});e.loadPage("app/core/pages/ActionFormPage",function(e){return new e({model:t,actionKey:"delete",successUrl:t.genClientUrl("base"),cancelUrl:o||t.genClientUrl("base"),formMethod:"DELETE",formAction:t.url(),formActionSeverity:"danger"})})}});