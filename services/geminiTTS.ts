import { GoogleGenAI, Modality } from "@google/genai";
import { Emotion, VoiceOption, PodcastSpeaker } from "../types";
import { decode, decodeAudioData, audioBufferToWav } from "../utils/audioUtils";

/**
 * Maps internal emotion keys to adverbs/instruction phrases for the TTS prompt.
 */
function getEmotionDirective(emotion: Emotion): string {
  switch (emotion) {
    case 'happy': return 'Say happily: ';
    case 'sad': return 'Say sadly: ';
    case 'excited': return 'Say excitedly: ';
    case 'angry': return 'Say angrily: ';
    case 'romantic': return 'Say in a romantic tone: ';
    case 'calm': return 'Say calmly: ';
    case 'motivational': return 'Say with motivation: ';
    case 'storytelling': return 'Narrate like a story: ';
    case 'neutral':
    default:
      return '';
  }
}

/**
 * Synthesize speech from a script with specific emotion and voice profile.
 */
export async function generateSpeech(
  text: string,
  emotion: Emotion,
  voice: VoiceOption
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Construct the text part with the emotion directive if applicable.
  // We avoid "System:" prompts as the TTS model tends to read them aloud.
  const directive = getEmotionDirective(emotion);
  const finalPrompt = `${directive}${text}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: finalPrompt }] }],
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
 * Synthesize a multi-speaker podcast conversation.
 */
export async function generatePodcast(
  script: string,
  speakerA: PodcastSpeaker,
  speakerB: PodcastSpeaker
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use the documented format for multi-speaker conversations.
  // This ensures the model treats the input as a transcript to be acted out.
  const prompt = `TTS the following conversation between ${speakerA.name} and ${speakerB.name}:
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