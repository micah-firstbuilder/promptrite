import { db } from "./index";
import { challenges } from "./schema/challenges";

const seedData = [
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
    difficulty: "easy" as const,
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
    difficulty: "medium" as const,
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
    difficulty: "easy" as const,
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
    difficulty: "medium" as const,
    category: "design",
    is_active: 1,
  },
  {
    title: "Build a REST Endpoint",
    description: "Create a small endpoint with pagination",
    goals: [
      {
        id: "rest-conventions",
        title: "REST Conventions",
        criteria: "Implement proper REST conventions",
        weight: 25,
      },
      {
        id: "pagination",
        title: "Pagination",
        criteria: "Add pagination functionality",
        weight: 25,
      },
      {
        id: "error-handling",
        title: "Error Handling",
        criteria: "Include error handling",
        weight: 25,
      },
      {
        id: "api-documentation",
        title: "API Documentation",
        criteria: "Add API documentation",
        weight: 25,
      },
    ],
    difficulty: "medium" as const,
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
    difficulty: "hard" as const,
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
    difficulty: "medium" as const,
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
    difficulty: "easy" as const,
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
    difficulty: "medium" as const,
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
    difficulty: "hard" as const,
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
    difficulty: "medium" as const,
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
    difficulty: "medium" as const,
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
    difficulty: "hard" as const,
    category: "code",
    is_active: 1,
  },
];

export async function seedChallenges() {
  console.log("Seeding challenges...");

  try {
    // Check if challenges already exist
    const existingChallenges = await db.select().from(challenges).limit(1);

    if (existingChallenges.length > 0) {
      console.log("Challenges already exist, skipping seed");
      return;
    }

    // Insert seed data
    await db.insert(challenges).values(seedData);
    console.log(`Successfully seeded ${seedData.length} challenges`);
  } catch (error) {
    console.error("Error seeding challenges:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedChallenges()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
