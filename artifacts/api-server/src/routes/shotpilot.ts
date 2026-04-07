import { Router } from "express";
import { db } from "@workspace/db";
import { savedShotPlansTable } from "@workspace/db";
import type { SavedShotPlan } from "@workspace/db";
import { GenerateShotPlanBody, SaveShotPlanBody, DeleteSavedPlanParams } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { eq } from "drizzle-orm";

const shotpilotRouter = Router();

shotpilotRouter.post("/shotpilot/generate", async (req, res) => {
  const parsed = GenerateShotPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { deviceType, brandModel, cameraType, shootingSituation, purpose, skillLevel } = parsed.data;

  try {
    const prompt = `You are an expert cinematographer and video production coach. Create a detailed shooting plan for the following setup:

Device Type: ${deviceType}
Brand & Model: ${brandModel}
Camera Type: ${cameraType}
Shooting Situation: ${shootingSituation}
Purpose: ${purpose} (platform/goal)
Skill Level: ${skillLevel}

Respond ONLY with valid JSON matching this exact structure:
{
  "summary": "2-3 sentence overview of the shooting approach",
  "cameraAngles": ["angle 1 with brief description", "angle 2 with brief description", ...],
  "shotList": ["Step 1: ...", "Step 2: ...", ...],
  "cameraSettings": ["Setting 1: value and why", "Setting 2: value and why", ...],
  "movementTips": ["Tip 1 for camera movement", "Tip 2 for camera movement", ...],
  "editingSuggestions": ["Editing tip 1", "Editing tip 2", ...]
}

Provide 4-6 items for each array. Be specific to the device type and situation.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "user", content: prompt }
      ],
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      res.status(500).json({ error: "Failed to parse AI response" });
      return;
    }

    const plan = JSON.parse(jsonMatch[0]);
    res.json(plan);
  } catch (err) {
    req.log.error({ err }, "Failed to generate shot plan");
    res.status(500).json({ error: "Failed to generate shot plan" });
  }
});

shotpilotRouter.get("/shotpilot/saved", async (req, res) => {
  try {
    const plans = await db
      .select()
      .from(savedShotPlansTable)
      .orderBy(savedShotPlansTable.createdAt);
    res.json(plans.map((p: SavedShotPlan) => ({
      id: p.id,
      name: p.name,
      deviceType: p.deviceType,
      brandModel: p.brandModel,
      shootingSituation: p.shootingSituation,
      purpose: p.purpose,
      skillLevel: p.skillLevel,
      plan: p.plan,
      createdAt: p.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list saved plans");
    res.status(500).json({ error: "Failed to list saved plans" });
  }
});

shotpilotRouter.post("/shotpilot/saved", async (req, res) => {
  const parsed = SaveShotPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const [saved] = await db
      .insert(savedShotPlansTable)
      .values({
        name: parsed.data.name,
        deviceType: parsed.data.deviceType,
        brandModel: parsed.data.brandModel,
        shootingSituation: parsed.data.shootingSituation,
        purpose: parsed.data.purpose,
        skillLevel: parsed.data.skillLevel,
        plan: parsed.data.plan as Record<string, unknown>,
      })
      .returning();

    res.status(201).json({
      id: saved.id,
      name: saved.name,
      deviceType: saved.deviceType,
      brandModel: saved.brandModel,
      shootingSituation: saved.shootingSituation,
      purpose: saved.purpose,
      skillLevel: saved.skillLevel,
      plan: saved.plan,
      createdAt: saved.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to save shot plan");
    res.status(500).json({ error: "Failed to save shot plan" });
  }
});

shotpilotRouter.delete("/shotpilot/saved/:id", async (req, res) => {
  const parsed = DeleteSavedPlanParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const result = await db
      .delete(savedShotPlansTable)
      .where(eq(savedShotPlansTable.id, parsed.data.id))
      .returning();

    if (result.length === 0) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete saved plan");
    res.status(500).json({ error: "Failed to delete saved plan" });
  }
});

export default shotpilotRouter;
