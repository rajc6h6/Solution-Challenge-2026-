import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
);

// Gemini 2.5 Flash — latest model with audio support
const MODEL = 'gemini-2.5-flash-preview-04-17';

type AgentAction = 'reroute_shipment' | 'notify_driver' | 'escalate_to_human' | 'monitor_and_wait';

interface AgentShipmentData {
  shipmentId: string;
  origin?: { city?: string };
  destination?: { city?: string };
  currentRoute?: string;
  customerPriority?: string;
  carrier?: string;
}

interface AgentPredictionData {
  disruptionProbability: number;
  riskLevel: string;
  expectedDelayMinutes: number;
  confidenceScore: number;
  weatherSeverity: number;
}

export async function processAudioQuery(audioBase64: string, query: string = "Analyze this supply chain audio query") {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: { temperature: 0.7, topP: 0.95, topK: 40, maxOutputTokens: 1024 }
    });

    const result = await model.generateContent([
      { inlineData: { mimeType: "audio/webm", data: audioBase64 } },
      { text: query }
    ]);

    return result.response.text();
  } catch (error) {
    console.error('Error processing audio:', error);
    throw error;
  }
}

export async function processImageQuery(imageBase64: string, query: string = "Analyze this supply chain image") {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent([
      { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
      { text: query }
    ]);
    return result.response.text();
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

export async function processTextQuery(query: string, context?: Record<string, unknown>) {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: { temperature: 0.7, topP: 0.95, topK: 40 }
    });

    const contextStr = context ? `\n\nLive Fleet Data:\n${JSON.stringify(context, null, 2)}` : '';
    const prompt = `You are CASCADE, an autonomous supply chain AI agent powered by Google Cloud. ${query}${contextStr}

Respond concisely in 2-3 sentences with specific numbers from the data.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error processing text:', error);
    throw error;
  }
}

// ── Gemini Function Calling: Autonomous Decision Making ─────────────────────

export async function agentDecision(shipmentData: AgentShipmentData, predictionData: AgentPredictionData) {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      tools: [{
        functionDeclarations: [
          {
            name: "reroute_shipment",
            description: "Automatically reroute a shipment to avoid disruptions. Use when risk > 70%, cost < $500, confidence > 85%",
            parameters: {
              type: "object" as const,
              properties: {
                shipmentId: { type: "string" as const, description: "The unique shipment identifier" },
                newRoute: { type: "string" as const, description: "The new route (e.g. 'Via I-80 Alt', 'Southern bypass')" },
                reason: { type: "string" as const, description: "Explanation for the reroute decision" }
              },
              required: ["shipmentId", "newRoute", "reason"]
            }
          },
          {
            name: "notify_driver",
            description: "Send email notification to driver about route changes or delays. Use when risk 40-70%.",
            parameters: {
              type: "object" as const,
              properties: {
                shipmentId: { type: "string" as const },
                message: { type: "string" as const, description: "Notification message for the driver" }
              },
              required: ["shipmentId", "message"]
            }
          },
          {
            name: "escalate_to_human",
            description: "Escalate to human operator when: risk > 70% AND (cost > $500 OR confidence < 85%)",
            parameters: {
              type: "object" as const,
              properties: {
                shipmentId: { type: "string" as const },
                reason: { type: "string" as const, description: "Why this needs human review" }
              },
              required: ["shipmentId", "reason"]
            }
          },
          {
            name: "monitor_and_wait",
            description: "Continue monitoring without action. Use when risk < 40%.",
            parameters: {
              type: "object" as const,
              properties: {
                shipmentId: { type: "string" as const },
                nextCheckMinutes: { type: "number" as const }
              },
              required: ["shipmentId", "nextCheckMinutes"]
            }
          }
        ]
      }]
    });

    const prompt = `You are CASCADE, an autonomous supply chain agent on Google Cloud.

Shipment: ${shipmentData.shipmentId}
Route: ${shipmentData.origin?.city} → ${shipmentData.destination?.city}
Current Route: ${shipmentData.currentRoute}
Priority: ${shipmentData.customerPriority}
Carrier: ${shipmentData.carrier}

Prediction:
- Disruption Probability: ${(predictionData.disruptionProbability * 100).toFixed(1)}%
- Risk Level: ${predictionData.riskLevel}
- Expected Delay: ${predictionData.expectedDelayMinutes} minutes
- Confidence Score: ${(predictionData.confidenceScore * 100).toFixed(1)}%
- Weather Severity: ${predictionData.weatherSeverity}/10

Decision Rules:
1. Risk > 70%, confidence > 85%, priority critical/high → reroute_shipment (auto-execute)
2. Risk > 70%, low confidence OR high cost → escalate_to_human
3. Risk 40-70% → notify_driver with alert
4. Risk < 40% → monitor_and_wait

Call the appropriate function now.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const functionCall = response.functionCalls?.()?.[0];

    if (functionCall && isAgentAction(functionCall.name)) {
      return {
        action: functionCall.name,
        args: (functionCall.args ?? {}) as Record<string, unknown>,
        reasoning: response.text?.() || 'Function called based on risk analysis'
      };
    }

    // Fallback
    return {
      action: 'monitor_and_wait' as const,
      args: { shipmentId: shipmentData.shipmentId, nextCheckMinutes: 15 },
      reasoning: response.text?.() || 'No immediate action required'
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in agentDecision:', errorMessage);
    return {
      action: 'escalate_to_human' as const,
      args: { shipmentId: shipmentData.shipmentId, reason: 'Agent error — requires human review' },
      reasoning: 'Error during decision making'
    };
  }
}

export async function generateAudioResponse(_text: string): Promise<string | null> {
  // Web Speech API handles TTS in browser (free, no API key needed)
  return null;
}

function isAgentAction(value: string): value is AgentAction {
  return (
    value === 'reroute_shipment' ||
    value === 'notify_driver' ||
    value === 'escalate_to_human' ||
    value === 'monitor_and_wait'
  );
}
