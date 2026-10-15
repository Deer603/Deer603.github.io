"use strict";
importScripts("codec-core.js?v=1");
self.onmessage = function (event) {
  var request = event.data;
  try {
    var result = DeerCodec.convert(request.mode, request.text, request.password);
    self.postMessage({ id: request.id, result: result }, [result.ends.buffer]);
  } catch (error) {
    self.postMessage({ id: request.id, error: error.code || "conversion-failed" });
  }
};
