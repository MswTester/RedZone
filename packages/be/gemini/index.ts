import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  MediaResolution,
  Type,
} from '@google/genai';

async function analyzeImage(image: string) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {
    temperature: 0.1,
    maxOutputTokens: 4096,
    mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,  // Block few
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,  // Block some
      },
    ],
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        Accident: {
          type: Type.OBJECT,
          required: ["Tag", "Message", "Solution"],
          properties: {
            Tag: {
              type: Type.INTEGER,
              description: "재해 분류 = -1:해당없음, 0:얽힘, 1:협착, 2:전도(넘어짐), 3:비래, 4:추락, 5:낙하, 6충돌, 7:폭발, 8:동작, 9:감전, 10:접촉, 11:붕괴. 이중에서 가장 연관성 높은 분류를 지정",
            },
            Message: {
              type: Type.STRING,
              description: "어떠한 산업 재해가 발생한 정황에 대한 설명",
            },
            Solution: {
              type: Type.STRING,
              description: "해당 산업 재해를 해결, 혹은 예방하기 위한 솔루션",
            },
          },
        },
      },
    },
    systemInstruction: [
        {
          text: `현재 사진에서 발생한 산업 재해를 찾아줘.
만약 사진에서 산업 재해를 찾을 수 없다면 빈 오브젝트를 반환해.
Tag = -1:해당없음, 0:얽힘, 1:협착, 2:전도(넘어짐짐), 3:비래, 4:추락, 5:낙하, 6충돌, 7:폭발, 8:동작, 9:감전, 10:접촉, 11:붕괴
Message, Solution은 전부 한글로 적어줘.`,
        }
    ],
  };
  const model = 'gemini-2.0-flash-lite';
  const contents = [
    // {
    //   role: 'user',
    //   parts: [
    //     {
    //       inlineData: {
    //         data: `INSERT_INPUT_HERE`,
    //         mimeType: `image/png`,
    //       },
    //     },
    //   ],
    // },
    // {
    //   role: 'model',
    //   parts: [
    //     {
    //       text: `{
    //         "Accident": {
    //           "Message": "해당 사진에서는 산업 재해를 확인할 수 없습니다.",
    //           "Solution": "해당 없음",
    //           "Tag": -1
    //         }
    //       }`,
    //     },
    //   ],
    // },
    {
      role: 'user',
      parts: [
        {
          text: `${image}`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({model, config, contents});
  
  try {
    return JSON.parse(response.text as string);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export { analyzeImage };