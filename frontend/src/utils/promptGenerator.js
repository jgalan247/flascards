// Prompt Builder configuration with explanations for each step

export const promptSteps = [
  {
    id: 1,
    field: 'subject',
    label: 'Subject',
    placeholder: 'e.g., Biology, History, Mathematics',
    explanation: "Setting the subject tells the AI which domain knowledge to use. A Biology prompt will get different vocabulary than a History prompt.",
    example: 'Biology',
    options: [
      'Biology',
      'Chemistry',
      'Physics',
      'Mathematics',
      'English Literature',
      'English Language',
      'History',
      'Geography',
      'Computer Science',
      'Business Studies',
      'Economics',
      'Psychology',
      'Sociology',
      'Art & Design',
      'Music',
      'Drama',
      'Physical Education',
      'Religious Studies',
      'PSHE',
      'French',
      'Spanish',
      'German',
      'Other',
    ],
  },
  {
    id: 2,
    field: 'topic',
    label: 'Topic',
    placeholder: 'e.g., Photosynthesis, World War II, Quadratic Equations',
    explanation: "Be specific! 'Photosynthesis' is better than 'Plants'. The more focused, the more relevant your cards.",
    example: 'Photosynthesis',
  },
  {
    id: 3,
    field: 'learningObjectives',
    label: 'Learning Objectives',
    placeholder: 'e.g., Understand the light-dependent reactions...',
    explanation: "These come from your specification. Including them ensures cards test what students actually need to know for the exam.",
    example: 'Understand the light-dependent and light-independent reactions of photosynthesis. Know the role of chlorophyll.',
    multiline: true,
  },
  {
    id: 4,
    field: 'examBoard',
    label: 'Exam Board',
    placeholder: 'e.g., AQA, Edexcel, OCR, WJEC',
    explanation: "Different boards use different command words and expect different depths. AQA Biology ≠ Edexcel Biology.",
    example: 'AQA',
    options: ['AQA', 'Edexcel', 'OCR', 'WJEC', 'CCEA', 'Cambridge', 'IB', 'Other'],
  },
  {
    id: 5,
    field: 'boardNuances',
    label: 'Exam Board Nuances',
    placeholder: 'e.g., AQA expects students to name specific researchers with dates...',
    explanation: "This is where the magic happens. Telling the AI that 'AQA expects named researchers with dates' transforms generic cards into exam-ready ones.",
    example: 'AQA expects students to know the names of specific scientists and their experiments. Use command words like "describe", "explain", "evaluate".',
    multiline: true,
  },
  {
    id: 6,
    field: 'misconceptions',
    label: 'Common Misconceptions',
    placeholder: 'e.g., Students often confuse mitosis with meiosis...',
    explanation: "You know what students get wrong. Adding this creates cards that specifically target those weak spots.",
    example: 'Students often think glucose is produced in the light-dependent reactions. They confuse the role of oxygen.',
    multiline: true,
  },
  {
    id: 7,
    field: 'yearGroup',
    label: 'Year Group',
    placeholder: 'e.g., Year 10, Year 12, KS3',
    explanation: "Year 10 foundation vs Year 11 revision need different complexity levels.",
    example: 'Year 12',
    options: ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11'],
  },
  {
    id: 8,
    field: 'targetGrade',
    label: 'Target Grade',
    placeholder: 'e.g., Grade 5, Grade 7-9, A*',
    explanation: "Grade 4 cards focus on core knowledge. Grade 8 cards include evaluation and analysis.",
    example: 'Grade 7-9',
    options: ['Grade 1-3', 'Grade 4-5', 'Grade 6-7', 'Grade 7-9', 'A-C', 'A*-B', 'Pass', 'Merit', 'Distinction'],
  },
  {
    id: 9,
    field: 'accessibility',
    label: 'Accessibility Needs',
    placeholder: 'e.g., Dyslexia-friendly, ADHD-friendly, EAL support...',
    explanation: "Students with dyslexia need simpler sentences. ADHD students need shorter, punchier cards. This adapts the output.",
    example: 'Dyslexia-friendly: use shorter sentences, avoid complex vocabulary where possible.',
    multiline: true,
  },
  {
    id: 10,
    field: 'cardCount',
    label: 'Number of Cards',
    placeholder: 'e.g., 20',
    explanation: "20-25 is usually ideal. Too few misses content, too many overwhelms.",
    example: '20',
    type: 'number',
    min: 5,
    max: 50,
  },
]

export function generatePrompt(formData) {
  const prompt = `Create ${formData.cardCount || 20} flashcards for ${formData.subject} on the topic of "${formData.topic}".

**Context:**
- Exam Board: ${formData.examBoard || 'Not specified'}
- Year Group: ${formData.yearGroup || 'Not specified'}
- Target Grade: ${formData.targetGrade || 'Not specified'}

**Learning Objectives:**
${formData.learningObjectives || 'Cover key concepts comprehensively'}

**Exam Board Specific Requirements:**
${formData.boardNuances || 'Follow standard exam board expectations'}

**Address These Common Misconceptions:**
${formData.misconceptions || 'Address typical student misunderstandings'}

**Accessibility Considerations:**
${formData.accessibility || 'Standard complexity'}

**Format Requirements:**
Please output the flashcards in this exact JSON format:
\`\`\`json
[
  {
    "question": "Question text here",
    "answer": "Answer text here"
  }
]
\`\`\`

Important:
- Each card should test ONE concept
- Questions should use appropriate command words for the target grade
- Answers should be concise but complete
- Include a mix of recall, understanding, and application questions
- Make sure cards are exam-focused and specification-aligned`

  return prompt
}

export function generateNotebookLMPrompt(formData) {
  const prompt = `Using the sources I've uploaded, create ${formData.cardCount || 20} flashcards for ${formData.subject} on the topic of "${formData.topic}".

**Important: Base all flashcards ONLY on the content from my uploaded sources.** Do not include information from outside these documents.

**Context:**
- Exam Board: ${formData.examBoard || 'Not specified'}
- Year Group: ${formData.yearGroup || 'Not specified'}
- Target Grade: ${formData.targetGrade || 'Not specified'}

**Learning Objectives to focus on:**
${formData.learningObjectives || 'Cover key concepts from the sources comprehensively'}

**Exam Board Specific Requirements:**
${formData.boardNuances || 'Follow standard exam board expectations'}

**Address These Common Misconceptions (if covered in sources):**
${formData.misconceptions || 'Address typical student misunderstandings found in the materials'}

**Accessibility Considerations:**
${formData.accessibility || 'Standard complexity'}

**Format Requirements:**
Please output the flashcards in this exact JSON format:
\`\`\`json
[
  {
    "question": "Question text here",
    "answer": "Answer text here"
  }
]
\`\`\`

Important:
- Each card should test ONE concept from the uploaded sources
- Questions should use appropriate command words for the target grade
- Answers should be concise but complete, using terminology from the sources
- Include a mix of recall, understanding, and application questions
- Reference specific content, examples, or case studies from the uploaded materials
- Make sure cards align with what's actually covered in the sources`

  return prompt
}

// Accessibility needs mapped to specific requirements
const accessibilityRequirements = {
  autism: `AUTISM-FRIENDLY REQUIREMENTS:
1. Use literal language only (no idioms or metaphors)
2. Give explicit, numbered step-by-step instructions
3. Replace pronouns with specific nouns when unclear
4. Use concrete quantities (e.g., "Solve 4 equations" not "Solve a few")
5. Consistent numbered structure throughout
6. Clear transitions between sections (e.g., "You have finished Section 1. Now move to Section 2.")`,

  dyslexia: `DYSLEXIA-FRIENDLY REQUIREMENTS:
1. Use short sentences (max 15-20 words)
2. Use simple, common vocabulary
3. Avoid walls of text - use bullet points and spacing
4. Use sans-serif font friendly formatting
5. Bold key terms and instructions
6. Provide word banks where appropriate`,

  adhd: `ADHD-FRIENDLY REQUIREMENTS:
1. Break tasks into small, timed chunks (5-10 min max)
2. Use engaging, varied activities
3. Include movement or interactive elements where possible
4. Clear visual structure with boxes and borders
5. Frequent checkpoints and mini-goals
6. Reduce visual clutter`,

  eal: `EAL (English as Additional Language) REQUIREMENTS:
1. Use simple, clear English
2. Avoid idioms and cultural references
3. Provide vocabulary definitions
4. Use visuals to support understanding
5. Include sentence starters and frames
6. Allow bilingual glossary space`,

  visual: `VISUAL IMPAIRMENT REQUIREMENTS:
1. Use high contrast text
2. Large, clear fonts
3. Describe all images in text
4. Avoid colour-only information
5. Simple, uncluttered layouts
6. Screen reader compatible structure`,

  default: `ACCESSIBILITY REQUIREMENTS:
1. Clear, simple language
2. Structured layout with numbered sections
3. Visual supports where helpful
4. Explicit instructions`
}

function getAccessibilityRequirements(accessibility) {
  if (!accessibility) return accessibilityRequirements.default

  const lower = accessibility.toLowerCase()
  if (lower.includes('autism') || lower.includes('asc') || lower.includes('asd')) {
    return accessibilityRequirements.autism
  }
  if (lower.includes('dyslexia')) {
    return accessibilityRequirements.dyslexia
  }
  if (lower.includes('adhd') || lower.includes('attention')) {
    return accessibilityRequirements.adhd
  }
  if (lower.includes('eal') || lower.includes('english as additional')) {
    return accessibilityRequirements.eal
  }
  if (lower.includes('visual') || lower.includes('blind') || lower.includes('sight')) {
    return accessibilityRequirements.visual
  }

  return `ACCESSIBILITY REQUIREMENTS:\n${accessibility}`
}

export function generateWorksheetPrompt(formData, duration = 40) {
  const accessibilityReqs = getAccessibilityRequirements(formData.accessibility)

  const prompt = `Create a ${duration}-minute ${formData.yearGroup || 'KS3'} ${formData.subject} worksheet on ${formData.topic}${formData.accessibility ? ` for a student with ${formData.accessibility}` : ''}.

LEARNING OBJECTIVES:
${formData.learningObjectives || '- Cover key concepts for this topic'}

${accessibilityReqs}

STRUCTURE:
- Key vocabulary box with definitions
- Starter activity (5-10 min)
- Worked example with numbered steps
- Main practice (20-30 min) - easy to hard progression
- Extension for early finishers

FORMAT:
- Success criteria for each task
- Hint boxes for challenging questions
- Time estimates per section
${formData.subject?.toLowerCase().includes('math') ? '- Use LaTeX for maths notation' : ''}`

  return prompt
}

export function generateAdaptPrompt(formData, originalMaterial = '') {
  const accessibilityReqs = getAccessibilityRequirements(formData.accessibility)

  const prompt = `Adapt this ${formData.subject} resource on "${formData.topic}" for a student with ${formData.accessibility || 'additional learning needs'}.

KEEP: Learning objectives, core content, key concepts

ADAPT WITH THESE REQUIREMENTS:
${accessibilityReqs}

ALSO ADD:
- Vocabulary box with key terms defined
- Success criteria for tasks
- Hint boxes where needed
- Clear section transitions

ORIGINAL MATERIAL TO ADAPT:
${originalMaterial || '[Paste your original material here]'}`

  return prompt
}

export function generateQuizPrompt(formData) {
  const accessibilityReqs = getAccessibilityRequirements(formData.accessibility)

  const prompt = `Create ${formData.cardCount || 20} quiz questions on ${formData.topic} for ${formData.yearGroup || 'KS3'} ${formData.subject}${formData.accessibility ? ` for a student with ${formData.accessibility}` : ''}.

LEARNING OBJECTIVES:
${formData.learningObjectives || '- Cover key concepts for this topic'}

${accessibilityReqs}

REQUIREMENTS:
1. One concept per question
2. Clear, unambiguous wording
3. Progress from recall → understanding → application
4. Include answer key

FORMAT:
\`\`\`json
[
  {
    "question": "Clear question text",
    "answer": "Correct answer",
    "hint": "Optional hint for support"
  }
]
\`\`\``

  return prompt
}
