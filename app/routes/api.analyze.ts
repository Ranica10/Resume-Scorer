import { GoogleGenAI } from "@google/genai";
import type { Route } from "./+types/api.analyze";
import { prepareInstructions } from "~/constants";

export async function action({ request }: Route.ActionArgs) {
    const body = await request.json();

    // Extract the required fields from the request body
    const {
        jobTitle,
        jobDescription,
        resumeText,
    } = body;

    // Validate the request body
    if (!jobTitle || !jobDescription || !resumeText) {
        return Response.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    // Check if the Gemini API key is configured
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return Response.json(
            { error: "Gemini API key is not configured" },
            { status: 500 }
        );
    }

    // Create a new instance of the GoogleGenAI client with the API key
    const ai = new GoogleGenAI({
        apiKey,
    });

    // Send the request to the Gemini API and get the feedback
    const interaction = await ai.interactions.create({
        model: "gemini-3.1-flash-lite",
        input: prepareInstructions({
            jobTitle,
            jobDescription,
            resumeText,
        }),
    });

    const output = interaction.output_text;

    // Check if the output is empty and return an error response if it is
    if (!output) {
        return Response.json(
            { error: "Gemini returned no response" },
            { status: 500 }
        );
    }

    const feedback = JSON.parse(output);

    // Return the feedback in the response
    return Response.json({
        feedback,
    });
}