import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';

export interface ParsedReadingTest {
  passage: string;
  questions: ParsedQuestion[];
}

export interface ParsedQuestion {
  number: number;
  question: string;
  answer: string;
  options?: string[];
}

/**
 * Parse the AI-generated reading test content into passage and questions
 */
export function parseReadingTestContent(content: string): ParsedReadingTest {
  // Split content into passage and questions sections
  const sections = content.split(/Questions?:\s*/i);
  
  if (sections.length < 2) {
    throw new Error('Invalid reading test format: missing Questions section');
  }

  const passage = sections[0].replace(/Reading Passage:\s*/i, '').trim();
  const questionsText = sections[1].trim();

  // Parse questions - look for numbered patterns like "1.", "2.", etc.
  const questionPattern = /(\d+)\.\s*([^\n]+(?:\n(?!\d+\.)[^\n]+)*)\s*(?:Answer[:\s]*([^\n]+))?/gi;
  const questions: ParsedQuestion[] = [];
  
  let match;
  while ((match = questionPattern.exec(questionsText)) !== null) {
    const questionNumber = parseInt(match[1]);
    let questionText = match[2].trim();
    let answer = match[3]?.trim() || '';

    // Extract answer if it's on the next line
    if (!answer) {
      const nextLineMatch = questionText.match(/\n\s*(?:Answer[:\s]*|Response[:\s]*)(.+)/i);
      if (nextLineMatch) {
        answer = nextLineMatch[1].trim();
        questionText = questionText.replace(/\n\s*(?:Answer[:\s]*|Response[:\s]*)(.+)/i, '').trim();
      }
    }

    // Extract options if it's multiple choice (A), B), C), etc.)
    const optionsMatch = questionText.match(/\n\s*([A-D][\).])\s*(.+?)(?=\n\s*[A-D][\).]|\n\s*Answer|$)/gi);
    let options: string[] | undefined;
    
    if (optionsMatch && optionsMatch.length > 1) {
      options = optionsMatch.map(opt => opt.trim());
      // Remove options from question text
      questionText = questionText.split(/\n\s*[A-D][\).]/)[0].trim();
    }

    questions.push({
      number: questionNumber,
      question: questionText,
      answer: answer,
      options: options,
    });
  }

  return {
    passage,
    questions,
  };
}

/**
 * Create a Word document from parsed reading test
 */
export async function createReadingTestDocument(
  topic: string,
  parsedTest: ParsedReadingTest
): Promise<Blob> {
  const { passage, questions } = parsedTest;

  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: `Reading Test: ${topic}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Reading Passage Section
  children.push(
    new Paragraph({
      text: 'Reading Passage',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 200 },
    })
  );

  // Split passage into paragraphs
  const passageParagraphs = passage.split(/\n\n+/);
  passageParagraphs.forEach((para) => {
    if (para.trim()) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: para.trim(),
              size: 24, // 12pt
            }),
          ],
          spacing: { after: 200 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }
  });

  // Questions Section
  children.push(
    new Paragraph({
      text: 'Questions',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  // Add each question
  questions.forEach((q) => {
    // Question number and text
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${q.number}. `,
            bold: true,
            size: 24,
          }),
          new TextRun({
            text: q.question,
            size: 24,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    // Options if multiple choice
    if (q.options && q.options.length > 0) {
      q.options.forEach((option) => {
        children.push(
          new Paragraph({
            text: option,
            size: 24,
            spacing: { after: 50 },
            indent: { left: 720 }, // 0.5 inch indent
          })
        );
      });
    }

    // Answer
    if (q.answer) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Answer: ',
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: q.answer,
              size: 24,
              italics: true,
            }),
          ],
          spacing: { after: 200 },
          indent: { left: 360 },
        })
      );
    }
  });

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  // Generate blob
  const blob = await Packer.toBlob(doc);
  return blob;
}

/**
 * Create separate Word documents for passage and questions
 */
export async function createSeparateDocuments(
  topic: string,
  parsedTest: ParsedReadingTest
): Promise<{ passageBlob: Blob; questionsBlob: Blob }> {
  const { passage, questions } = parsedTest;

  // Passage Document
  const passageChildren: Paragraph[] = [];
  passageChildren.push(
    new Paragraph({
      text: `Reading Passage: ${topic}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  const passageParagraphs = passage.split(/\n\n+/);
  passageParagraphs.forEach((para) => {
    if (para.trim()) {
      passageChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: para.trim(),
              size: 24,
            }),
          ],
          spacing: { after: 200 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }
  });

  const passageDoc = new Document({
    sections: [{ properties: {}, children: passageChildren }],
  });

  // Questions Document
  const questionsChildren: Paragraph[] = [];
  questionsChildren.push(
    new Paragraph({
      text: `Questions: ${topic}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  questions.forEach((q) => {
    questionsChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${q.number}. `,
            bold: true,
            size: 24,
          }),
          new TextRun({
            text: q.question,
            size: 24,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    if (q.options && q.options.length > 0) {
      q.options.forEach((option) => {
        questionsChildren.push(
          new Paragraph({
            text: option,
            size: 24,
            spacing: { after: 50 },
            indent: { left: 720 },
          })
        );
      });
    }

    if (q.answer) {
      questionsChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Answer: ',
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: q.answer,
              size: 24,
              italics: true,
            }),
          ],
          spacing: { after: 200 },
          indent: { left: 360 },
        })
      );
    }
  });

  const questionsDoc = new Document({
    sections: [{ properties: {}, children: questionsChildren }],
  });

  const passageBlob = await Packer.toBlob(passageDoc);
  const questionsBlob = await Packer.toBlob(questionsDoc);

  return { passageBlob, questionsBlob };
}

