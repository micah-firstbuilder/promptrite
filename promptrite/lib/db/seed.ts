import { db } from "./index";
import { challenges } from "./schema/challenges";

const seedData = [
  {
    title: "Landing Page Revamp",
    description: "Wireframe and refine a hero section for a product",
    goals: [
      { criteria: "Create a visually appealing hero section", weight: 30 },
      { criteria: "Include clear call-to-action buttons", weight: 25 },
      { criteria: "Ensure responsive design", weight: 25 },
      { criteria: "Optimize for accessibility", weight: 20 },
    ],
    difficulty: "easy" as const,
    category: "design",
    is_active: 1,
  },
  {
    title: "Refactor Utilities",
    description: "Improve a small helper library",
    goals: [
      { criteria: "Improve code readability", weight: 25 },
      { criteria: "Add proper error handling", weight: 25 },
      { criteria: "Optimize performance", weight: 25 },
      { criteria: "Add comprehensive tests", weight: 25 },
    ],
    difficulty: "medium" as const,
    category: "code",
    is_active: 1,
  },
  {
    title: "Prompted Poster",
    description: "Generate a minimal poster from a short brief",
    goals: [
      { criteria: "Create visually balanced composition", weight: 30 },
      { criteria: "Use appropriate typography", weight: 25 },
      { criteria: "Maintain brand consistency", weight: 25 },
      { criteria: "Ensure readability at different sizes", weight: 20 },
    ],
    difficulty: "easy" as const,
    category: "image",
    is_active: 1,
  },
  {
    title: "Onboarding Flow",
    description: "Design a 3‑step signup with progress",
    goals: [
      { criteria: "Create intuitive user flow", weight: 30 },
      { criteria: "Include progress indicators", weight: 25 },
      { criteria: "Optimize for mobile first", weight: 25 },
      { criteria: "Include form validation", weight: 20 },
    ],
    difficulty: "medium" as const,
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
    difficulty: "medium" as const,
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
