export interface Interview {
  id: string;
  created_at: string;
  branch: 'AIML' | 'CS' | 'IT';
  resume_text?: string;
  questions: string[];
  answers: string[];
  scores: {
    confidence: number;
    communication: number;
    bodyLanguage: number;
    overall: number;
  };
  feedback: string[];
  emotion_summary?: string;
  completed: boolean;
  metrics?: {
    wordCount: number;
    fillerWordCount: number;
    totalDuration: number;
    pauseCount: number;
    faceDetectionFrames: number;
    totalFrames: number;
    movementScore: number;
  };
  scoreReasons?: {
    communication: string[];
    confidence: string[];
    bodyLanguage: string[];
  };
}
