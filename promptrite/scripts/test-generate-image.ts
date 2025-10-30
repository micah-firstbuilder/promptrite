import { experimental_generateImage as generateImage } from "ai";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testGenerateImage() {
  console.log("=".repeat(80));
  console.log("Direct generateImage Test Script");
  console.log("=".repeat(80));
  console.log();

  // Log package version
  try {
    const packageJsonPath = join(__dirname, "..", "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
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
      "not set (will use default: openai/gpt-5-image-mini)"
  );
  console.log(
    "  OPENROUTER_API_KEY:",
    process.env.OPENROUTER_API_KEY
      ? `set (length: ${process.env.OPENROUTER_API_KEY.length})`
      : "❌ NOT SET"
  );
  console.log(
    "  OPENAI_API_KEY:",
    process.env.OPENAI_API_KEY
      ? `set (length: ${process.env.OPENAI_API_KEY.length})`
      : "not set"
  );
  console.log();

  // Test with minimal prompt
  const testPrompt = "test image";
  const model = process.env.IMAGE_MODEL || "openai/gpt-5-image-mini";

  console.log("🚀 Calling generateImage with:");
  console.log("  model:", model);
  console.log("  prompt:", testPrompt);
  console.log();

  try {
    const result = await generateImage({
      model,
      prompt: testPrompt,
    } as any);

    console.log("✅ Success!");
    console.log("Result structure:", {
      hasImages: !!(result as any).images,
      hasImage: !!(result as any).image,
      imagesCount:
        (result as any).images?.length ?? ((result as any).image ? 1 : 0),
      hasWarnings: !!(result as any).warnings,
      hasProviderMetadata: !!(result as any).providerMetadata,
    });
  } catch (err) {
    const error = err as Error;
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
  }
}

testGenerateImage().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
