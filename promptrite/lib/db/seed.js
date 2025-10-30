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
exports.seedChallenges = seedChallenges;
var index_1 = require("./index");
var challenges_1 = require("./schema/challenges");
var seedData = [
  {
    title: "Landing Page Revamp",
    description: "Wireframe and refine a hero section for a product",
    goals: [
      {
        id: "hero-section",
        title: "Hero Section",
        criteria: "Create a visually appealing hero section",
        weight: 30,
      },
      {
        id: "cta-buttons",
        title: "Call-to-Action",
        criteria: "Include clear call-to-action buttons",
        weight: 25,
      },
      {
        id: "responsive-design",
        title: "Responsive Design",
        criteria: "Ensure responsive design",
        weight: 25,
      },
      {
        id: "accessibility",
        title: "Accessibility",
        criteria: "Optimize for accessibility",
        weight: 20,
      },
    ],
    difficulty: "easy",
    category: "design",
    is_active: 1,
  },
  {
    title: "Refactor Utilities",
    description: "Improve a small helper library",
    goals: [
      {
        id: "readability",
        title: "Code Readability",
        criteria: "Improve code readability",
        weight: 25,
      },
      {
        id: "error-handling",
        title: "Error Handling",
        criteria: "Add proper error handling",
        weight: 25,
      },
      {
        id: "performance",
        title: "Performance",
        criteria: "Optimize performance",
        weight: 25,
      },
      {
        id: "testing",
        title: "Testing",
        criteria: "Add comprehensive tests",
        weight: 25,
      },
    ],
    difficulty: "medium",
    category: "code",
    is_active: 1,
  },
  {
    title: "Prompted Poster",
    description: "Generate a minimal poster from a short brief",
    goals: [
      {
        id: "composition",
        title: "Visual Composition",
        criteria: "Create visually balanced composition",
        weight: 30,
      },
      {
        id: "typography",
        title: "Typography",
        criteria: "Use appropriate typography",
        weight: 25,
      },
      {
        id: "brand-consistency",
        title: "Brand Consistency",
        criteria: "Maintain brand consistency",
        weight: 25,
      },
      {
        id: "readability",
        title: "Readability",
        criteria: "Ensure readability at different sizes",
        weight: 20,
      },
    ],
    difficulty: "easy",
    category: "image",
    is_active: 1,
  },
  {
    title: "Onboarding Flow",
    description: "Design a 3‑step signup with progress",
    goals: [
      {
        id: "user-flow",
        title: "User Flow",
        criteria: "Create intuitive user flow",
        weight: 30,
      },
      {
        id: "progress-indicators",
        title: "Progress Indicators",
        criteria: "Include progress indicators",
        weight: 25,
      },
      {
        id: "mobile-first",
        title: "Mobile First",
        criteria: "Optimize for mobile first",
        weight: 25,
      },
      {
        id: "form-validation",
        title: "Form Validation",
        criteria: "Include form validation",
        weight: 20,
      },
    ],
    difficulty: "medium",
    category: "design",
    is_active: 1,
  },
  {
    title: "Build a REST Endpoint",
    description: "Create a small endpoint with pagination",
    goals: [
      { criteria: "Implement proper REST conventions", weight: 25 },
      { criteria: "Add pagination functionality", weight: 25 },
      { criteria: "Include error handling", weight: 25 },
      { criteria: "Add API documentation", weight: 25 },
    ],
    difficulty: "medium",
    category: "code",
    is_active: 1,
  },
  {
    title: "Product Demo Video",
    description: "Create an engaging demo video for a SaaS product",
    goals: [
      {
        id: "script-clarity",
        title: "Script Clarity",
        criteria: "Write a clear, concise script",
        weight: 25,
      },
      {
        id: "visual-flow",
        title: "Visual Flow",
        criteria: "Maintain smooth visual transitions",
        weight: 25,
      },
      {
        id: "pacing",
        title: "Pacing",
        criteria: "Optimize for viewer engagement",
        weight: 25,
      },
      {
        id: "call-to-action",
        title: "Call-to-Action",
        criteria: "Include a strong CTA",
        weight: 25,
      },
    ],
    difficulty: "hard",
    category: "video",
    is_active: 1,
  },
  // Additional Image challenges
  {
    title: "Product Photography",
    description:
      "Generate a professional product photo with clean lighting and background",
    goals: [
      {
        id: "lighting",
        title: "Lighting Quality",
        criteria: "Use professional, even lighting",
        weight: 30,
      },
      {
        id: "composition",
        title: "Composition",
        criteria: "Create visually appealing product composition",
        weight: 25,
      },
      {
        id: "background",
        title: "Background",
        criteria: "Use clean, uncluttered background",
        weight: 25,
      },
      {
        id: "product-focus",
        title: "Product Focus",
        criteria: "Ensure product is the clear focal point",
        weight: 20,
      },
    ],
    difficulty: "medium",
    category: "image",
    is_active: 1,
  },
  {
    title: "Abstract Artwork",
    description:
      "Create a vibrant abstract digital artwork with geometric patterns",
    goals: [
      {
        id: "color-harmony",
        title: "Color Harmony",
        criteria: "Use harmonious color palette",
        weight: 30,
      },
      {
        id: "composition",
        title: "Visual Balance",
        criteria: "Create balanced visual composition",
        weight: 25,
      },
      {
        id: "pattern-design",
        title: "Pattern Design",
        criteria: "Include interesting geometric patterns",
        weight: 25,
      },
      {
        id: "artistic-quality",
        title: "Artistic Quality",
        criteria: "Demonstrate artistic creativity",
        weight: 20,
      },
    ],
    difficulty: "easy",
    category: "image",
    is_active: 1,
  },
  // Additional Video challenges
  {
    title: "Quick Tutorial Video",
    description:
      "Create a 30-second tutorial video explaining a simple concept",
    goals: [
      {
        id: "clarity",
        title: "Clarity",
        criteria: "Explain concept clearly and concisely",
        weight: 30,
      },
      {
        id: "visual-aids",
        title: "Visual Aids",
        criteria: "Use effective visual aids and graphics",
        weight: 25,
      },
      {
        id: "pacing",
        title: "Pacing",
        criteria: "Maintain appropriate pacing for tutorial",
        weight: 25,
      },
      {
        id: "engagement",
        title: "Engagement",
        criteria: "Keep viewer engaged throughout",
        weight: 20,
      },
    ],
    difficulty: "medium",
    category: "video",
    is_active: 1,
  },
  {
    title: "Animated Logo Reveal",
    description: "Design an animated logo reveal with smooth transitions",
    goals: [
      {
        id: "animation-quality",
        title: "Animation Quality",
        criteria: "Create smooth, professional animations",
        weight: 30,
      },
      {
        id: "timing",
        title: "Timing",
        criteria: "Use appropriate timing and pacing",
        weight: 25,
      },
      {
        id: "visual-impact",
        title: "Visual Impact",
        criteria: "Create strong visual impact",
        weight: 25,
      },
      {
        id: "brand-representation",
        title: "Brand Representation",
        criteria: "Effectively represent brand identity",
        weight: 20,
      },
    ],
    difficulty: "hard",
    category: "video",
    is_active: 1,
  },
  // Additional Code challenges
  {
    title: "Sorting Algorithm Implementation",
    description:
      "Implement an efficient sorting algorithm with clear documentation",
    goals: [
      {
        id: "algorithm-correctness",
        title: "Correctness",
        criteria: "Algorithm correctly sorts input",
        weight: 30,
      },
      {
        id: "efficiency",
        title: "Efficiency",
        criteria: "Optimize for time and space complexity",
        weight: 25,
      },
      {
        id: "code-quality",
        title: "Code Quality",
        criteria: "Write clean, readable code",
        weight: 25,
      },
      {
        id: "documentation",
        title: "Documentation",
        criteria: "Include clear comments and documentation",
        weight: 20,
      },
    ],
    difficulty: "medium",
    category: "code",
    is_active: 1,
  },
  {
    title: "Data Structure: Linked List",
    description:
      "Implement a linked list data structure with common operations",
    goals: [
      {
        id: "structure-implementation",
        title: "Implementation",
        criteria: "Correctly implement linked list structure",
        weight: 30,
      },
      {
        id: "operations",
        title: "Operations",
        criteria: "Implement insert, delete, and search operations",
        weight: 25,
      },
      {
        id: "edge-cases",
        title: "Edge Cases",
        criteria: "Handle edge cases properly",
        weight: 25,
      },
      {
        id: "type-safety",
        title: "Type Safety",
        criteria: "Ensure proper type safety",
        weight: 20,
      },
    ],
    difficulty: "medium",
    category: "code",
    is_active: 1,
  },
  {
    title: "API Client Library",
    description:
      "Build a reusable API client library with error handling and retries",
    goals: [
      {
        id: "functionality",
        title: "Functionality",
        criteria: "Implement core API client functionality",
        weight: 30,
      },
      {
        id: "error-handling",
        title: "Error Handling",
        criteria: "Add comprehensive error handling",
        weight: 25,
      },
      {
        id: "retry-logic",
        title: "Retry Logic",
        criteria: "Implement retry logic for failed requests",
        weight: 25,
      },
      {
        id: "usability",
        title: "Usability",
        criteria: "Create easy-to-use API interface",
        weight: 20,
      },
    ],
    difficulty: "hard",
    category: "code",
    is_active: 1,
  },
];
function seedChallenges() {
  return __awaiter(this, void 0, void 0, function () {
    var existingChallenges, error_1;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          console.log("Seeding challenges...");
          _a.label = 1;
        case 1:
          _a.trys.push([1, 4, , 5]);
          return [
            4 /*yield*/,
            index_1.db.select().from(challenges_1.challenges).limit(1),
          ];
        case 2:
          existingChallenges = _a.sent();
          if (existingChallenges.length > 0) {
            console.log("Challenges already exist, skipping seed");
            return [2 /*return*/];
          }
          // Insert seed data
          return [
            4 /*yield*/,
            index_1.db.insert(challenges_1.challenges).values(seedData),
          ];
        case 3:
          // Insert seed data
          _a.sent();
          console.log(
            "Successfully seeded ".concat(seedData.length, " challenges")
          );
          return [3 /*break*/, 5];
        case 4:
          error_1 = _a.sent();
          console.error("Error seeding challenges:", error_1);
          throw error_1;
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
// Run seed if this file is executed directly
if (require.main === module) {
  seedChallenges()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
