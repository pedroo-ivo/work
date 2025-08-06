/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(["N/encode", "N/search", "N/runtime", "N/crypto", "N/error"], function (
  n,
  t,
  r,
  o,
  i
) {
  return (
    (c = {
      241: function (e) {
        e.exports = n;
      },
      303: function (e) {
        e.exports = t;
      },
      389: function (e) {
        e.exports = r;
      },
      398: function (e) {
        e.exports = o;
      },
      868: function (e, n, t) {
        (t = [t(389), t(303), t(903), t(398), t(241)]),
          (n = function (c, n, r, a, u) {
            var t = "customrecord_nx_account",
              o = "custrecord_nx_account_key_guid";
            function invalidTokenError() {
              return r.create({
                name: "NX_INVALID_TOKEN",
                message: "The provided token is not valid.",
              });
            }
            function getAccountKey() {
              var e = n
                .create({ type: t, columns: [{ name: o }] })
                .run()
                .getRange({ start: 0, end: 1 })[0]
                .getValue({ name: o });
              if (e) return e;
              throw (function accountKeyNotAvailableError() {
                return r.create({
                  name: "NX_MISSING_ACCOUNT_KEY",
                  message: "Account key not available.",
                });
              })();
            }
            return {
              get: function _get(e) {
                try {
                  var n,
                    t = e.token;
                  if (t)
                    return (
                      (n = (function decryptUserToken(e, n) {
                        (n = decodeURIComponent(n).split("|")),
                          (e = JSON.parse(
                            (function decrypt(e, n, t) {
                              (e = a.createSecretKey({
                                guid: e,
                                encoding: u.Encoding.UTF_8,
                              })),
                                (e = a.createDecipher({
                                  algorithm: a.EncryptionAlg.AES,
                                  key: e,
                                  iv: n,
                                }));
                              return (
                                e.update({
                                  input: t,
                                  inputEncoding: u.Encoding.HEX,
                                }),
                                e.final({ outputEncoding: u.Encoding.UTF_8 })
                              );
                            })(e, n[1], n[0])
                          ));
                        if (!e.account || e.account != c.accountId)
                          throw invalidTokenError();
                        if (!e.expiry || new Date(e.expiry) < new Date())
                          throw invalidTokenError();
                        return e;
                      })(getAccountKey(), t)),
                      JSON.stringify({ data: n })
                    );
                  throw (function missingParamsError() {
                    return r.create({
                      name: "NX_MISSING_PARAMS",
                      message:
                        "Some required parameters have not been provided.",
                    });
                  })();
                } catch (e) {
                  return (
                    log.error(e.name, e.message),
                    JSON.stringify({
                      error: { name: e.name, message: e.message },
                    })
                  );
                }
              },
              post: function _post(e) {
                try {
                  var n = e.email,
                    t = e.duration,
                    r = (r = e.access) ? JSON.parse(r) : null,
                    t = t ? Number(t) : null;
                  return JSON.stringify({
                    token: (function generateUserToken(e) {
                      var n =
                          1 < arguments.length && void 0 !== arguments[1]
                            ? arguments[1]
                            : 60,
                        t = 2 < arguments.length ? arguments[2] : void 0,
                        r = 3 < arguments.length ? arguments[3] : void 0,
                        o = {},
                        i = new Date();
                      i.setSeconds(i.getSeconds() + n),
                        (o.expiry = i.toISOString()),
                        (o.account = c.accountId),
                        t && (o.email = t);
                      r && (o.access = r);
                      (n = (function encrypt(e, n) {
                        (e = a.createSecretKey({
                          guid: e,
                          encoding: u.Encoding.UTF_8,
                        })),
                          (e = a.createCipher({
                            algorithm: a.EncryptionAlg.AES,
                            key: e,
                          })),
                          e.update({ input: n }),
                          (n = e.final({ outputEncoding: u.Encoding.HEX }));
                        return { data: n.ciphertext, iv: n.iv };
                      })(e, JSON.stringify(o))),
                        (i = n.data);
                      return encodeURIComponent(i + "|" + n.iv);
                    })(getAccountKey(), t, n, r),
                  });
                } catch (e) {
                  return (
                    log.error(e.name, e.message),
                    JSON.stringify({
                      error: { name: e.name, message: e.message },
                    })
                  );
                }
              },
              put: function _put() {},
              delete: function _delete() {},
            };
          }.apply(n, t));
        void 0 !== n && (e.exports = n);
      },
      903: function (e) {
        e.exports = i;
      },
    }),
    (a = {}),
    (function __webpack_require__(e) {
      var n = a[e];
      return (
        void 0 === n &&
          ((n = a[e] = { exports: {} }),
          c[e](n, n.exports, __webpack_require__)),
        n.exports
      );
    })(868)
  );
  var c, a;
});
