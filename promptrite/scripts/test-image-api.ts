async function testImageAPI() {
  console.log("=".repeat(80));
  console.log("API POST Reproduction Script");
  console.log("=".repeat(80));
  console.log();

  const url = "http://localhost:3000/api/tools/image";
  const requestBody = {
    prompt: "test image",
  };

  console.log("📤 Request Details:");
  console.log("  Method: POST");
  console.log("  URL:", url);
  console.log("  Headers:", { "Content-Type": "application/json" });
  console.log("  Body:", JSON.stringify(requestBody, null, 2));
  console.log();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📥 Response Details:");
    console.log("  Status:", response.status, response.statusText);
    console.log("  Headers:", Object.fromEntries(response.headers.entries()));
    console.log();

    const responseBody = await response.json();
    console.log("  Body:", JSON.stringify(responseBody, null, 2));
    console.log();

    if (response.ok) {
      console.log("✅ Request succeeded!");
    } else {
      console.error("❌ Request failed with status", response.status);
      if (responseBody.error) {
        console.error("  Error message:", responseBody.error);
      }
      if (responseBody.stack) {
        console.error("  Stack trace:");
        console.error(responseBody.stack);
      }
      if (responseBody.requestBody) {
        console.error("  Request body (as received by server):");
        console.error(JSON.stringify(responseBody.requestBody, null, 2));
      }
      process.exit(1);
    }
  } catch (err) {
    const error = err as Error;
    console.error("❌ Network or parsing error:");
    console.error("  Name:", error.name);
    console.error("  Message:", error.message);
    console.error("  Stack:");
    console.error(error.stack);
    process.exit(1);
  }
}

testImageAPI().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
