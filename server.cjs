var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/calculate-price", (req, res) => {
    const { entryDate, exitDate, vehicleType } = req.body;
    if (!entryDate || !exitDate) {
      return res.status(400).json({ error: "\uC785\uCC28 \uBC0F \uCD9C\uCC28 \uB0A0\uC9DC\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4." });
    }
    const start = new Date(entryDate);
    const end = new Date(exitDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    if (diffDays < 0) {
      return res.status(400).json({ error: "\uCD9C\uCC28\uC77C\uC740 \uC785\uCC28\uC77C\uBCF4\uB2E4 \uB2A6\uC5B4\uC57C \uD569\uB2C8\uB2E4." });
    }
    let totalPrice = 0;
    const baseDays = 4;
    const basePrice = 5e4;
    const extraDayPrice = 1e4;
    if (diffDays <= baseDays) {
      totalPrice = basePrice;
    } else {
      totalPrice = basePrice + (diffDays - baseDays) * extraDayPrice;
    }
    res.json({
      days: diffDays,
      totalPrice,
      basePrice,
      extraDayPrice
    });
  });
  app.post("/api/reserve", (req, res) => {
    const reservationData = req.body;
    console.log("New Reservation:", reservationData);
    res.json({ success: true, message: "\uC608\uC57D\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4." });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
