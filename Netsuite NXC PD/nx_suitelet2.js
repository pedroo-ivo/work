/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define([
  "N/suiteAppInfo",
  "N/record",
  "N/search",
  "N/runtime",
  "N/ui/serverWidget",
], function (r, t, n, o, c) {
  return (
    (i = {
      68: function (e) {
        e.exports = r;
      },
      202: function (e, r, t) {
        function _typeof(e) {
          return (_typeof =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    "function" == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? "symbol"
                    : typeof e;
                })(e);
        }
        function _defineProperty(e, r, t) {
          return (
            (r = (function _toPropertyKey(e) {
              e = (function _toPrimitive(e, r) {
                if ("object" != _typeof(e) || !e) return e;
                var t = e[Symbol.toPrimitive];
                if (void 0 === t) return ("string" === r ? String : Number)(e);
                t = t.call(e, r || "default");
                if ("object" != _typeof(t)) return t;
                throw new TypeError(
                  "@@toPrimitive must return a primitive value."
                );
              })(e, "string");
              return "symbol" == _typeof(e) ? e : e + "";
            })(r)) in e
              ? Object.defineProperty(e, r, {
                  value: t,
                  enumerable: !0,
                  configurable: !0,
                  writable: !0,
                })
              : (e[r] = t),
            e
          );
        }
        (t = [t(641), t(266), t(389), t(303), t(68)]),
          void 0 !==
            (r = function (t, i, u, n, s) {
              var o = "customrecord_nx_account",
                c = "custrecord_nx_account_key_guid",
                a = "custrecord_nx_account_key_last_updated",
                _ = "customscript_nx_suitelet2",
                d = "customscript_nx_restlet2",
                r = "./nx_client2.js",
                p = 138180,
                l = "Field Service Management",
                y = "Field Service Account Key Setup",
                f = "custpage_nx_account_key",
                m = "custpage_nx_message",
                x = "Please wait while an account key is being generated.",
                g = 2,
                b =
                  "Account key could not be generated, please contact your administrator.",
                v = function createAccountKeyForm(e) {
                  var r = (e = e || h()).addSecretKeyField({
                    id: f,
                    label: "Account Key",
                    restrictToScriptIds: [_, d],
                  });
                  return (
                    (r.isMandatory = !0),
                    (r.maxLength = 32),
                    r.updateDisplayType({
                      displayType: t.FieldDisplayType.HIDDEN,
                    }),
                    e.addSubmitButton({ label: "Generate Key" }),
                    (e = S(x, g, e))
                  );
                },
                S = function createResponseForm(e, r, t) {
                  return (
                    ((t = t || h()).addField({
                      id: m,
                      label: "Message",
                      type: "longtext",
                    }).defaultValue = JSON.stringify({
                      type: r,
                      title: "FSM Account Key Generation",
                      message: e,
                    })),
                    t
                  );
                },
                h = function initializeForm() {
                  var e = t.createForm({ title: y });
                  return (e.clientScriptModulePath = r), e;
                },
                w = function saveAccountKeyValue(e) {
                  var r = n
                    .create({ type: o })
                    .run()
                    .getRange({ start: 0, end: 1 });
                  i.submitFields({
                    type: o,
                    id: r[0].id,
                    values: _defineProperty(
                      _defineProperty({}, c, e),
                      a,
                      new Date()
                    ),
                  });
                },
                P = function createErrorRecord(e, r) {
                  var t,
                    n = s.listInstalledBundles(),
                    n =
                      n.find(function (e) {
                        return e.id === p;
                      }) ||
                      n.find(function (e) {
                        return e.name === l;
                      }),
                    o = {
                      name: e.name || "Error",
                      custrecord_nx_error_message: e.message,
                      custrecord_nx_error_stack_trace: JSON.stringify(e.stack),
                      custrecord_nx_error_date: e.date || new Date(),
                      custrecord_nx_error_user: e.user || u.getCurrentUser().id,
                      custrecord_nx_error_role:
                        e.role || u.getCurrentUser().role,
                      custrecord_nx_error_script_version:
                        e.scriptversion || (n && n.version),
                      custrecord_nx_error_script_deployment:
                        e.scriptdeployment || u.getCurrentScript().deploymentId,
                      custrecord_nx_error_script_context:
                        e.scriptcontext || u.executionContext,
                      custrecord_nx_error_request_url: r.url,
                      custrecord_nx_error_request_method: r.method,
                      custrecord_nx_error_request_parameters: r.parameters,
                      custrecord_nx_error_request_headers: r.headers,
                      custrecord_nx_error_request_body: r.body,
                    },
                    c = i.create({ type: "customrecord_nx_error" });
                  for (t in o) c.setValue({ fieldId: t, value: o[t] });
                  return c.save();
                };
              return {
                onRequest: function onRequest(t) {
                  var e,
                    n = t.request,
                    t = t.response;
                  try {
                    "GET" == n.method
                      ? t.writePage({ pageObject: v() })
                      : ((e = n.parameters.custpage_nx_account_key),
                        w(e),
                        t.writePage({
                          pageObject: S(
                            "Account key successfully generated.",
                            0
                          ),
                        }));
                  } catch (r) {
                    log.error(r.name, r.message);
                    try {
                      var o = P(r, n);
                      t.writePage({
                        pageObject: S(
                          b +
                            " A Field Service Error record has been created: " +
                            o,
                          3
                        ),
                      });
                    } catch (e) {
                      t.write(b + " " + r.name + ": " + r.message);
                    }
                  }
                },
              };
            }.apply(r, t)) && (e.exports = r);
      },
      266: function (e) {
        e.exports = t;
      },
      303: function (e) {
        e.exports = n;
      },
      389: function (e) {
        e.exports = o;
      },
      641: function (e) {
        e.exports = c;
      },
    }),
    (u = {}),
    (function __webpack_require__(e) {
      var r = u[e];
      return (
        void 0 === r &&
          ((r = u[e] = { exports: {} }),
          i[e](r, r.exports, __webpack_require__)),
        r.exports
      );
    })(202)
  );
  var i, u;
});
