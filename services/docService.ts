import { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType } from 'docx';
import saveAs from 'file-saver';

interface Rule {
    rule: string;
    explanation: string;
}

export const generateDaubertOutline = (
    title: string,
    issueSummary: string,
    rules: Rule[],
    questions: string[]
) => {
    const doc = new Document({
        styles: {
            paragraphStyles: [
                {
                    id: "normal",
                    name: "Normal",
                    basedOn: "Normal",
                    next: "Normal",
                    run: {
                        font: "Calibri",
                        size: 24, // 12pt
                    },
                },
                 {
                    id: "heading1",
                    name: "Heading 1",
                    basedOn: "Normal",
                    next: "Normal",
                     run: {
                        font: "Calibri",
                        size: 32, // 16pt
                        bold: true,
                        color: "2E74B5",
                    },
                     paragraph: {
                        spacing: { after: 240 },
                    },
                },
                {
                    id: "heading2",
                    name: "Heading 2",
                    basedOn: "Normal",
                    next: "Normal",
                     run: {
                        font: "Calibri",
                        size: 26, // 13pt
                        bold: true,
                        color: "2E74B5",
                    },
                     paragraph: {
                        spacing: { after: 120, before: 240 },
                    },
                },
            ],
        },
        sections: [{
            children: [
                new Paragraph({
                    text: "MOTION TO EXCLUDE EXPERT TESTIMONY",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    text: `RE: Unreliable Forensic Methodology (${title})`,
                     heading: HeadingLevel.HEADING_2,
                     alignment: AlignmentType.CENTER,
                }),

                // I. Introduction
                new Paragraph({ text: "I. INTRODUCTION", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({
                    style: "normal",
                    children: [
                        new TextRun("This motion seeks to exclude the testimony of the opposing expert based on their reliance on a forensic tool that produces unverifiable and demonstrably false results. The methodology employed fails to meet the standards of scientific reliability required under Federal Rule of Evidence 702 and the principles established in "),
                        new TextRun({ text: "Daubert v. Merrell Dow Pharmaceuticals, Inc.", italics: true }),
                        new TextRun("."),
                    ],
                }),

                // II. Statement of Issues
                new Paragraph({ text: "II. STATEMENT OF ISSUES", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({
                    style: "normal",
                    text: issueSummary,
                }),

                // III. Argument
                new Paragraph({ text: "III. ARGUMENT", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "The expert's testimony is inadmissible because it is not based on reliable principles and methods. The tool's output is unreliable for the following reasons:",
                            bold: true,
                        }),
                    ],
                }),
                ...rules.map(rule => new Paragraph({
                    children: [
                        new TextRun({ text: `${rule.rule}: `, bold: true }),
                        new TextRun(rule.explanation),
                    ],
                    bullet: { level: 0 },
                })),

                // IV. Proposed Cross-Examination Questions
                 new Paragraph({ text: "IV. PROPOSED CROSS-EXAMINATION QUESTIONS", heading: HeadingLevel.HEADING_2 }),
                 ...questions.map(q => new Paragraph({
                    text: q,
                    bullet: { level: 0 },
                    style: "normal",
                 })),
                 
                 // V. Conclusion
                 new Paragraph({ text: "V. CONCLUSION", heading: HeadingLevel.HEADING_2 }),
                 new Paragraph({
                     style: "normal",
                     text: "For the foregoing reasons, the expert's testimony and any conclusions derived from the unreliable forensic tool should be excluded.",
                 }),
            ],
        }],
    });

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, `Daubert_Motion_Outline_${title.replace(/\s/g, '_')}.docx`);
    });
};