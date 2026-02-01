
import { GoogleGenAI, Modality } from "@google/genai";
import { Emotion, VoiceOption, PodcastSpeaker } from "../types";
import { decode, decodeAudioData, audioBufferToWav } from "../utils/audioUtils";

const API_KEY = "AIzaSyCCJV06PLqQ4gC7MvIRvtPLBPxG6oBc8Nk";

/**
 * Synthesize speech from a script with specific emotion and voice profile.
 */
export async function generateSpeech(
  text: string,
  emotion: Emotion,
  voice: VoiceOption
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `System: High-Fidelity Neural Speech Synthesis.
Persona: ${voice.label} (${voice.gender}), ${voice.description}.
Emotion: ${emotion}.
Behavior: Natural phrasing, realistic breath control.
Script: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice.geminiVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Synthesis engine returned empty signal.");

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const decodedData = decode(base64Audio);
    const audioBuffer = await decodeAudioData(decodedData, audioCtx, 24000, 1);
    const wavBlob = audioBufferToWav(audioBuffer);
    return URL.createObjectURL(wavBlob);
  } catch (err: any) {
    throw new Error(err.message?.includes("gemini") ? "Protocol interrupt in neural engine." : err.message);
  }
}

/**
 * Synthesize a multi-speaker podcast conversation with advanced conversational delays.
 */
export async function generatePodcast(
  script: string,
  speakerA: PodcastSpeaker,
  speakerB: PodcastSpeaker
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `System: Professional Podcast Production Module v2.0.
Generate a high-fidelity conversational master track between ${speakerA.name} and ${speakerB.name}.

STRICT CONVERSATIONAL PACING:
1. MANDATORY DELAY: Insert a 1.5 to 2.0 second pause after every speaker turn. Do not rush the dialogue.
2. TURN TAKING: Ensure ${speakerA.name} and ${speakerB.name} sound like they are listening to each other.
3. PERSONALITY:
   - ${speakerA.name} (Voice: ${speakerA.voice.label}) should sound ${speakerA.emotion}.
   - ${speakerB.name} (Voice: ${speakerB.voice.label}) should sound ${speakerB.emotion}.
4. AUDIO QUALITY: Ensure seamless transitions between voice models.

Script:
${script}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: speakerA.name,
                voiceConfig: { prebuiltVoiceConfig: { voiceName: speakerA.voice.geminiVoice } }
              },
              {
                speaker: speakerB.name,
                voiceConfig: { prebuiltVoiceConfig: { voiceName: speakerB.voice.geminiVoice } }
              }
            ]
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Podcast synthesis failed.");

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const decodedData = decode(base64Audio);
    const audioBuffer = await decodeAudioData(decodedData, audioCtx, 24000, 1);
    const wavBlob = audioBufferToWav(audioBuffer);
    return URL.createObjectURL(wavBlob);
  } catch (err: any) {
    throw new Error("Multi-track synthesis failed: " + err.message);
  }
}
