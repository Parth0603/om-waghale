
import { GoogleGenAI, Type } from "@google/genai";
import { AIDiagnosis } from "../types";

export const geminiPrescriptionService = {
  getPrescription: async (patientData: any): Promise<AIDiagnosis> => {
    const { age, gender, symptoms, duration, severity, existingConditions, currentMedications } = patientData;
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        You are an experienced medical AI assistant specialized in preliminary diagnosis and prescription for common ailments in rural Indian healthcare settings.

        PATIENT INFORMATION:
        - Age: ${age}
        - Gender: ${gender}
        - Symptoms: ${symptoms}
        - Duration: ${duration}
        - Severity: ${severity}
        - Existing Conditions: ${existingConditions}
        - Current Medications: ${currentMedications}

        TASK:
        Analyze the symptoms and provide a comprehensive assessment.

        CRITICAL INSTRUCTIONS:
        1. Calculate your CONFIDENCE SCORE (0-100%):
           - 100% = Common, well-understood condition with clear symptoms.
           - 60-99% = Likely diagnosis but some uncertainty or requires manual verification.
           - <60% = Requires professional examination for basic clarity.

        2. PRESCRIBING LOGIC:
           - If confidence is 60% or above, provide Over-The-Counter (OTC) medicines for SYMPTOM RELIEF.
           - If confidence is 100%, these can be curative for common minor ailments.
           - If confidence is 60-99%, label these clearly as "Relief Measures" while evaluation is pending.
           - If confidence is below 60%, do NOT prescribe oral medication.

        3. NEVER prescribe for:
           - Chest pain, severe abdominal pain, high fever (>103°F), breathing difficulties, or heavy bleeding.

        4. Use ONLY standard Over-The-Counter (OTC) medicines available in India:
           - Paracetamol, Cetirizine, Ibuprofen, Omeprazole, ORS, Antacids, or basic topical first aid.

        Prioritize patient safety while providing immediate relief for discomfort.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              confidence: { type: Type.NUMBER },
              diagnosis: {
                type: Type.OBJECT,
                properties: {
                  primary: { type: Type.STRING },
                  differential: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        condition: { type: Type.STRING },
                        probability: { type: Type.NUMBER }
                      },
                      required: ["condition", "probability"]
                    }
                  }
                },
                required: ["primary", "differential"]
              },
              analysis: { type: Type.STRING },
              prescription: {
                type: Type.OBJECT,
                properties: {
                  medicines: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        dosage: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        purpose: { type: Type.STRING },
                        precautions: { type: Type.STRING }
                      },
                      required: ["name", "dosage", "duration", "purpose", "precautions"]
                    }
                  },
                  homeRemedies: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["medicines", "homeRemedies"]
              },
              precautions: { type: Type.ARRAY, items: { type: Type.STRING } },
              whenToSeekDoctor: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedSpecialization: { type: Type.STRING },
              urgencyLevel: { type: Type.STRING }
            },
            required: ["confidence", "diagnosis", "analysis", "prescription", "precautions", "whenToSeekDoctor", "recommendedSpecialization", "urgencyLevel"]
          }
        }
      });

      const result = JSON.parse(response.text);
      result.isEmergency = result.urgencyLevel === 'emergency' || result.confidence < 60;
      return result as AIDiagnosis;
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Fallback mock response if API fails
      const fallbackResponse: AIDiagnosis = {
        confidence: 70,
        diagnosis: {
          primary: "Requires Medical Evaluation",
          differential: [
            { condition: "API Error - Manual Assessment Needed", probability: 70 },
            { condition: "Common Viral Infection", probability: 50 },
            { condition: "Stress-related Symptoms", probability: 30 }
          ]
        },
        analysis: "Unable to process with AI at this moment. Please consult with a healthcare professional for proper evaluation of your symptoms.",
        prescription: {
          medicines: [
            {
              name: "Paracetamol",
              dosage: "500mg as needed",
              duration: "For symptom relief only",
              purpose: "General pain and discomfort relief",
              precautions: "Do not exceed 4 doses per day. Consult doctor if symptoms persist."
            }
          ],
          homeRemedies: [
            "Adequate rest and hydration",
            "Balanced nutrition",
            "Monitor symptoms closely",
            "Seek medical advice promptly"
          ]
        },
        precautions: [
          "Monitor symptoms closely",
          "Seek medical attention if symptoms worsen",
          "Maintain good hygiene"
        ],
        whenToSeekDoctor: [
          "Symptoms persist or worsen",
          "High fever above 102°F",
          "Difficulty breathing",
          "Severe pain or discomfort"
        ],
        recommendedSpecialization: "General Physician",
        urgencyLevel: "routine",
        isEmergency: false
      };
      
      return fallbackResponse;
    }
  }
};
