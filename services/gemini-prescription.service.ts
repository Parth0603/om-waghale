
import { GoogleGenAI, Type } from "@google/genai";
import { AIDiagnosis } from "../types";

export const geminiPrescriptionService = {
  getPrescription: async (patientData: any): Promise<AIDiagnosis> => {
    const { age, gender, symptoms, duration, severity, existingConditions, currentMedications } = patientData;
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        You are Dr. AI, a highly experienced medical consultant with 20+ years of clinical practice in rural Indian healthcare. You have access to a comprehensive medicine database and must provide detailed, personalized medical consultations.

        PATIENT PROFILE:
        - Age: ${age} years
        - Gender: ${gender}
        - Current Symptoms: ${symptoms}
        - Duration: ${duration}
        - Severity Level: ${severity}
        - Existing Medical Conditions: ${existingConditions}
        - Current Medications: ${currentMedications}

        COMPREHENSIVE MEDICINE DATABASE (Use these specific medicines):
        
        FEVER & PAIN MANAGEMENT:
        - Paracetamol (Acetaminophen) 500mg/650mg tablets
        - Ibuprofen 200mg/400mg tablets
        - Aspirin 325mg tablets (avoid in children)
        - Diclofenac 50mg tablets
        - Nimesulide 100mg tablets
        - Mefenamic Acid 250mg tablets

        RESPIRATORY CONDITIONS:
        - Cetirizine 10mg tablets (antihistamine)
        - Loratadine 10mg tablets (non-drowsy antihistamine)
        - Chlorpheniramine 4mg tablets
        - Dextromethorphan 15mg (cough suppressant)
        - Guaifenesin 200mg (expectorant)
        - Salbutamol 2mg/4mg tablets (bronchodilator)
        - Montelukast 10mg tablets (asthma/allergy)
        - Ambroxol 30mg tablets (mucolytic)

        GASTROINTESTINAL:
        - Omeprazole 20mg/40mg capsules (PPI)
        - Pantoprazole 40mg tablets
        - Ranitidine 150mg tablets (H2 blocker)
        - Domperidone 10mg tablets (anti-nausea)
        - Ondansetron 4mg tablets (severe nausea)
        - Loperamide 2mg tablets (anti-diarrheal)
        - ORS sachets (oral rehydration)
        - Simethicone 40mg (gas relief)
        - Sucralfate 1g tablets (ulcer protection)

        ANTIBIOTICS (when bacterial infection suspected):
        - Amoxicillin 500mg capsules
        - Azithromycin 250mg/500mg tablets
        - Ciprofloxacin 250mg/500mg tablets
        - Cephalexin 250mg/500mg capsules
        - Doxycycline 100mg tablets
        - Metronidazole 400mg tablets

        CARDIOVASCULAR:
        - Amlodipine 5mg/10mg tablets (calcium channel blocker)
        - Atenolol 25mg/50mg tablets (beta blocker)
        - Enalapril 2.5mg/5mg tablets (ACE inhibitor)
        - Hydrochlorothiazide 25mg tablets (diuretic)
        - Aspirin 75mg (cardioprotective)

        DIABETES MANAGEMENT:
        - Metformin 500mg/850mg tablets
        - Glimepiride 1mg/2mg tablets
        - Glibenclamide 5mg tablets

        VITAMINS & SUPPLEMENTS:
        - Vitamin D3 60,000 IU sachets
        - Vitamin B-Complex tablets
        - Iron + Folic Acid tablets
        - Calcium + Vitamin D3 tablets
        - Multivitamin tablets
        - Zinc 20mg tablets

        TOPICAL MEDICATIONS:
        - Betadine antiseptic solution
        - Calamine lotion
        - Hydrocortisone 1% cream
        - Clotrimazole 1% cream (antifungal)
        - Mupirocin 2% ointment (antibiotic)

        CONSULTATION REQUIREMENTS:
        1. Provide SPECIFIC DIAGNOSIS based on symptoms, not generic terms
        2. Calculate precise CONFIDENCE SCORE (0-100%) based on symptom clarity
        3. Prescribe EXACT MEDICINES with proper dosages, timing, and duration
        4. Consider patient's age, gender, existing conditions, and current medications
        5. Provide DETAILED REASONING for each medicine prescribed
        6. Include specific BRAND NAMES when relevant (e.g., Crocin for Paracetamol)
        7. Give PERSONALIZED home remedies based on the specific condition
        8. Provide CLEAR WARNING SIGNS specific to the diagnosed condition

        SAFETY PROTOCOLS:
        - Never prescribe antibiotics unless bacterial infection is highly suspected
        - Always check for drug interactions with existing medications
        - Adjust dosages based on age (pediatric/geriatric considerations)
        - Provide specific contraindications for each medicine
        - Include monitoring parameters (what to watch for)

        RESPONSE FORMAT: Provide a detailed medical consultation as if you're sitting with the patient, explaining everything clearly in a caring, professional manner.
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
                        genericName: { type: Type.STRING },
                        dosage: { type: Type.STRING },
                        frequency: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        timing: { type: Type.STRING },
                        purpose: { type: Type.STRING },
                        precautions: { type: Type.STRING },
                        sideEffects: { type: Type.STRING },
                        contraindications: { type: Type.STRING }
                      },
                      required: ["name", "genericName", "dosage", "frequency", "duration", "timing", "purpose", "precautions"]
                    }
                  },
                  homeRemedies: { type: Type.ARRAY, items: { type: Type.STRING } },
                  dietaryAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
                  lifestyleModifications: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["medicines", "homeRemedies", "dietaryAdvice", "lifestyleModifications"]
              },
              precautions: { type: Type.ARRAY, items: { type: Type.STRING } },
              whenToSeekDoctor: { type: Type.ARRAY, items: { type: Type.STRING } },
              followUpAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedSpecialization: { type: Type.STRING },
              urgencyLevel: { type: Type.STRING },
              expectedRecoveryTime: { type: Type.STRING },
              redFlagSymptoms: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["confidence", "diagnosis", "analysis", "prescription", "precautions", "whenToSeekDoctor", "followUpAdvice", "recommendedSpecialization", "urgencyLevel", "expectedRecoveryTime", "redFlagSymptoms"]
          }
        }
      });

      const result = JSON.parse(response.text);
      result.isEmergency = result.urgencyLevel === 'emergency' || result.confidence < 60;
      return result as AIDiagnosis;
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Enhanced fallback response with more detailed medicine information
      const fallbackResponse: AIDiagnosis = {
        confidence: 70,
        diagnosis: {
          primary: "Symptomatic Treatment Required - API Consultation Unavailable",
          differential: [
            { condition: "Viral Upper Respiratory Infection", probability: 60 },
            { condition: "Bacterial Infection", probability: 30 },
            { condition: "Stress-related Symptoms", probability: 25 }
          ]
        },
        analysis: "Due to technical limitations, I cannot provide a complete AI analysis at this moment. However, based on common symptom patterns, here's a basic treatment approach. Please consult with a healthcare professional for proper evaluation.",
        prescription: {
          medicines: [
            {
              name: "Paracetamol (Crocin/Dolo)",
              genericName: "Acetaminophen",
              dosage: "500mg",
              frequency: "Every 6-8 hours",
              duration: "3-5 days",
              timing: "After meals",
              purpose: "Fever reduction and pain relief",
              precautions: "Do not exceed 4 doses per day. Avoid alcohol consumption.",
              sideEffects: "Rare: Nausea, skin rash",
              contraindications: "Severe liver disease, alcohol dependency"
            },
            {
              name: "Cetirizine (Zyrtec)",
              genericName: "Cetirizine Hydrochloride",
              dosage: "10mg",
              frequency: "Once daily",
              duration: "5-7 days",
              timing: "At bedtime",
              purpose: "Reduce allergic symptoms, runny nose",
              precautions: "May cause drowsiness. Avoid driving.",
              sideEffects: "Drowsiness, dry mouth, fatigue",
              contraindications: "Severe kidney disease"
            }
          ],
          homeRemedies: [
            "Drink warm water with honey and ginger 3-4 times daily",
            "Steam inhalation for 10-15 minutes twice daily",
            "Adequate rest for 7-8 hours daily",
            "Maintain room temperature between 20-22°C"
          ],
          dietaryAdvice: [
            "Increase fluid intake to 3-4 liters per day",
            "Consume warm soups and broths",
            "Avoid cold, oily, and spicy foods",
            "Include vitamin C rich fruits (oranges, lemons)"
          ],
          lifestyleModifications: [
            "Complete bed rest for 2-3 days",
            "Avoid strenuous physical activities",
            "Maintain good hand hygiene",
            "Use face mask when around others"
          ]
        },
        precautions: [
          "Monitor temperature every 4-6 hours",
          "Watch for signs of dehydration (dry mouth, reduced urination)",
          "Maintain isolation to prevent spread of infection",
          "Keep emergency contact numbers handy"
        ],
        whenToSeekDoctor: [
          "Fever above 102°F (38.9°C) for more than 3 days",
          "Difficulty breathing or chest pain",
          "Severe headache with neck stiffness",
          "Persistent vomiting or signs of dehydration",
          "No improvement after 5 days of treatment"
        ],
        followUpAdvice: [
          "Schedule follow-up if symptoms persist beyond 5 days",
          "Complete the full course of prescribed medications",
          "Gradually return to normal activities after fever subsides",
          "Monitor for any new symptoms"
        ],
        recommendedSpecialization: "General Physician / Family Medicine",
        urgencyLevel: "routine",
        expectedRecoveryTime: "5-7 days with proper treatment and rest",
        redFlagSymptoms: [
          "High fever above 103°F (39.4°C)",
          "Severe breathing difficulty",
          "Chest pain or pressure",
          "Confusion or altered mental state",
          "Severe dehydration signs"
        ],
        isEmergency: false
      };
      
      return fallbackResponse;
    }
  }
};
