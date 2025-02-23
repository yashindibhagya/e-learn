import dedent from "dedent";

export default {
  IDEA: dedent`:
    As you are a coaching teacher:
    - User wants to learn about the topic
    - Generate 5-7 Course titles for study
    - Make sure it is related to the description
    - Output will be an ARRAY of Strings in JSON format
    - Do not add any plain text in output
  `,

  COURSE: dedent`:
    As you are a coaching teacher:
    - User wants to learn about all topics
    - Create 3 Courses with Course Name, Description, and 5 to 8 chapters in each course.
    - Make sure to add chapters with all learning materials
    - Add CourseBanner Image from ('/banner1.png', '/banner2.png','/banner3.png')
    - Explain the chapter content as detailed as possible
    - Generate 5 Quizzes, 10 Flashcards, and 5 Q&A
    - Each chapter should contain multiple topics inside "content"
    - Rename "quizzes" to "quiz" and include:
      - question
      - correctAns
      - options (array with 4 choices)
    - Tag each course to one of the category from :["Tech & Coding" , "Business & Finance" , "Health & Fitness" , "Arts & Creativity" , "Science & Engineering"]
    - Output in JSON Format only:

    {
      "courses": [
        {
          "courseName": "Introduction to Mathematics",
          "description": "A beginner-friendly course covering fundamental math concepts.",
          "bannerImage": "/book.png",
          "category":""
          "chapters": [
            {
              "chapterTitle": "Basic Arithmetic",
              "content": [
                {
                  "topic": "Understanding Basic Arithmetic Operations",
                  "code": "let sum = 5 + 3;\nconsole.log(sum);",
                  "example": "8",
                  "explain": "This covers addition, subtraction, multiplication, and division."
                }
              ]
            },
            {
              "chapterTitle": "Algebra Basics",
              "content": [
                {
                  "topic": "Solving Linear Equations",
                  "code": "let x = (10 - 2) / 2;\nconsole.log(x);",
                  "example": "4",
                  "explain": "Equations where the highest exponent of the variable is 1."
                }
              ]
            },
            {
              "chapterTitle": "Geometry",
              "content": [
                {
                  "topic": "Understanding Angles",
                  "code": "let angle = 90;\nconsole.log(angle);",
                  "example": "90",
                  "explain": "Angles measure the space between two intersecting lines."
                }
              ]
            },
            {
              "chapterTitle": "Trigonometry",
              "content": [
                {
                  "topic": "Basic Trigonometric Ratios",
                  "code": "let sinA = opposite / hypotenuse;",
                  "example": "sinA = 0.5",
                  "explain": "Defines the relationships between angles and sides in triangles."
                }
              ]
            }
          ],
          "quiz": [
            { "question": "What is 2 + 2?", "correctAns": "4", "options": ["3", "4", "5", "6"] },
            { "question": "Solve for x: 3x = 12", "correctAns": "x = 4", "options": ["x = 2", "x = 4", "x = 6", "x = 8"] },
            { "question": "What is the square root of 9?", "correctAns": "3", "options": ["2", "3", "4", "5"] }
          ],
          "flashcards": [
            { "term": "Equation", "definition": "A mathematical statement that asserts equality." },
            { "term": "Variable", "definition": "A symbol representing an unknown value." },
            { "term": "Coefficient", "definition": "A numerical or constant factor in a term." }
          ],
          "qna": [
            { "question": "Why is math important?", "answer": "Math helps develop problem-solving skills and logical thinking." },
            { "question": "What is a prime number?", "answer": "A number greater than 1 that has only two factors: 1 and itself." },
            { "question": "How do you calculate percentage?", "answer": "Divide the part by the whole and multiply by 100." }
          ]
        },
        {
          "courseName": "Fundamentals of Science",
          "description": "Explore basic scientific principles in physics, chemistry, and biology.",
          "bannerImage": "/science.png",
          "chapters": [
            {
              "chapterTitle": "Introduction to Physics",
              "content": [
                {
                  "topic": "Understanding Motion",
                  "code": "let velocity = distance / time;",
                  "example": "Velocity = Distance / Time",
                  "explain": "Describes how objects move."
                }
              ]
            },
            {
              "chapterTitle": "Basic Chemistry",
              "content": [
                {
                  "topic": "Atoms and Molecules",
                  "code": "const water = 'H2O';",
                  "example": "H2O",
                  "explain": "The smallest unit of matter."
                }
              ]
            }
          ],
          "quiz": [
            { "question": "What is 2 + 2?", "correctAns": "4", "options": ["3", "4", "5", "6"] },
            { "question": "Solve for x: 3x = 12", "correctAns": "x = 4", "options": ["x = 2", "x = 4", "x = 6", "x = 8"] },
            { "question": "What is the square root of 9?", "correctAns": "3", "options": ["2", "3", "4", "5"] },
            { "question": "What is 5! (5 factorial)?", "correctAns": "120", "options": ["20", "60", "120", "240"] },
            { "question": "What is 10 divided by 2?", "correctAns": "5", "options": ["2", "4", "5", "6"] }
          ],
          "flashcards": [
            { "term": "Equation", "definition": "A mathematical statement that asserts equality." },
            { "term": "Variable", "definition": "A symbol representing an unknown value." },
            { "term": "Coefficient", "definition": "A numerical or constant factor in a term." },
            { "term": "Integer", "definition": "A whole number, positive or negative, including zero." },
            { "term": "Denominator", "definition": "The bottom part of a fraction." }
          ],
          "qna": [
            { "question": "Why is math important?", "answer": "Math helps develop problem-solving skills and logical thinking." },
            { "question": "What is a prime number?", "answer": "A number greater than 1 that has only two factors: 1 and itself." },
            { "question": "How do you calculate percentage?", "answer": "Divide the part by the whole and multiply by 100." },
            { "question": "What is the value of pi?", "answer": "Approximately 3.14159." },
            { "question": "What is an irrational number?", "answer": "A number that cannot be expressed as a simple fraction." }
          ]
        }
      ]
    }
  `
};
