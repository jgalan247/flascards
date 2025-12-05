// Prompt Builder configuration with explanations for each step

export const promptSteps = [
  {
    id: 1,
    field: 'subject',
    label: 'Subject',
    placeholder: 'e.g., Biology, History, Mathematics',
    explanation: "Setting the subject tells the AI which domain knowledge to use. A Biology prompt will get different vocabulary than a History prompt.",
    example: 'Biology',
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
    options: ['AQA', 'Edexcel', 'OCR', 'WJEC', 'Cambridge', 'IB', 'Other'],
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
    options: ['Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13', 'KS3', 'GCSE', 'A-Level'],
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
