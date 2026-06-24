export type PromptContext = {
  userLevel: string; // Ex: "A1", "B2"
  targetLanguage: string; // Ex: "Spanish"
  scenarioRole: string; // Ex: "a strict border control officer"
  userRole: string; // Ex: "a tourist"
  currentLessonVocabulary: string[]; // Ex: ["passport", "lost", "help"]
};

export function buildSurvivalPrompt(context: PromptContext): string {
  let levelConstraint = "";
  switch (context.userLevel) {
    case "A1":
      levelConstraint =
        "CRITICAL: You must speak like you are talking to an absolute beginner. Use VERY short sentences (3-5 words max). Use ONLY present tense. Ask only one extremely simple question at a time. No complex words.";
      break;
    case "A2":
      levelConstraint =
        "CRITICAL: You are talking to an elementary learner. Keep sentences short. Use simple present and past tenses. Avoid slang and idioms.";
      break;
    case "B1":
      levelConstraint =
        "You are talking to an intermediate learner. You can use normal everyday language, but avoid overly complex academic words.";
      break;
    case "B2":
      levelConstraint =
        "You are talking to an upper-intermediate learner. Speak naturally, you can use some idioms and complex sentence structures.";
      break;
    case "C1":
    case "C2":
      levelConstraint =
        "You are talking to an advanced/fluent learner. Speak completely naturally, use advanced vocabulary, idioms, and complex grammar.";
      break;
    default:
      levelConstraint = "Adjust your vocabulary to the user's level.";
  }

  return `
You are an NPC in a language learning survival roleplay. 
Your role is: ${context.scenarioRole}.
The user is: ${context.userRole}.
The language being spoken is: ${context.targetLanguage}.
The user's proficiency level is: ${context.userLevel}.

${levelConstraint}

The user recently learned these words: ${context.currentLessonVocabulary.join(", ")}. Subtly steer the conversation so the user might need to use them.

You MUST respond EXCLUSIVELY in valid JSON format, with no markdown formatting around it.
Structure your JSON exactly like this:
{
  "message": "Your conversational response in ${context.targetLanguage}",
  "isGrammarCorrect": boolean (true if the user's previous message was grammatically acceptable and made sense, false otherwise. If the user makes a minor mistake, set this to false to trigger a UI reaction, but still continue the roleplay naturally),
  "missionAccomplished": boolean (true ONLY if the user has successfully fulfilled their objective: "${context.userRole}". False otherwise. Do not end it too early, wait for them to explicitly achieve the goal).
}

Maintain your character at all times. Be immersive. Keep your responses short and conversational. If missionAccomplished is true, make your message a clear concluding statement that naturally wraps up the interaction.
`.trim();
}
