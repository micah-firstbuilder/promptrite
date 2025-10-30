var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent() {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
var ai_1 = require("ai");
var fs_1 = require("fs");
var path_1 = require("path");
var url_1 = require("url");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
var __dirname = (0, path_1.dirname)(__filename);
function testGenerateImage() {
  return __awaiter(this, void 0, void 0, function () {
    var packageJsonPath, packageJson, testPrompt, model, result, err_1, error;
    var _a, _b;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          console.log("=".repeat(80));
          console.log("Direct generateImage Test Script");
          console.log("=".repeat(80));
          console.log();
          // Log package version
          try {
            packageJsonPath = (0, path_1.join)(__dirname, "..", "package.json");
            packageJson = JSON.parse(
              (0, fs_1.readFileSync)(packageJsonPath, "utf-8")
            );
            console.log(
              "📦 ai package version:",
              packageJson.dependencies.ai || "not found"
            );
          } catch (err) {
            console.error("Failed to read package.json:", err);
          }
          console.log();
          // Check environment variables
          console.log("🔐 Environment Variables:");
          console.log(
            "  IMAGE_MODEL:",
            process.env.IMAGE_MODEL ||
              "not set (will use default: image/dall-e-3)"
          );
          console.log(
            "  OPENAI_API_KEY:",
            process.env.OPENAI_API_KEY
              ? "set (length: ".concat(process.env.OPENAI_API_KEY.length, ")")
              : "❌ NOT SET"
          );
          console.log();
          testPrompt = "test image";
          model = process.env.IMAGE_MODEL || "image/dall-e-3";
          console.log("🚀 Calling generateImage with:");
          console.log("  model:", model);
          console.log("  prompt:", testPrompt);
          console.log();
          _c.label = 1;
        case 1:
          _c.trys.push([1, 3, , 4]);
          return [
            4 /*yield*/,
            (0, ai_1.experimental_generateImage)({
              model,
              prompt: testPrompt,
            }),
          ];
        case 2:
          result = _c.sent();
          console.log("✅ Success!");
          console.log("Result structure:", {
            hasImages: !!result.images,
            hasImage: !!result.image,
            imagesCount:
              (_b =
                (_a = result.images) === null || _a === void 0
                  ? void 0
                  : _a.length) !== null && _b !== void 0
                ? _b
                : result.image
                  ? 1
                  : 0,
            hasWarnings: !!result.warnings,
            hasProviderMetadata: !!result.providerMetadata,
          });
          return [3 /*break*/, 4];
        case 3:
          err_1 = _c.sent();
          error = err_1;
          console.error("❌ Error occurred:");
          console.error("  Name:", error.name);
          console.error("  Message:", error.message);
          console.error("  Stack:");
          console.error(error.stack);
          console.error();
          console.error(
            "Full error object:",
            JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
          );
          process.exit(1);
          return [3 /*break*/, 4];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
testGenerateImage().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
