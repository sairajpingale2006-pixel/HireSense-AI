export interface AnalysisMetrics {
  wordCount: number;
  fillerWordCount: number;
  totalDuration: number; // in seconds
  pauseCount: number;
  faceDetectionFrames: number;
  totalFrames: number;
  movementScore: number; // 0-100, higher = more stable
}

export interface ScoreBreakdown {
  score: number; // 0-10
  reasons: string[];
}

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  canScore: boolean;
}

export interface FinalScores {
  communication: ScoreBreakdown;
  confidence: ScoreBreakdown;
  bodyLanguage: ScoreBreakdown;
  overall: number;
  metrics: AnalysisMetrics;
  validation: ValidationResult;
}

export class ScoringEngine {
  // Validate metrics before scoring
  static validateMetrics(metrics: AnalysisMetrics): ValidationResult {
    const warnings: string[] = [];
    let canScore = true;

    // Check for no speech
    if (metrics.wordCount < 5) {
      warnings.push('No sufficient speech detected. Please provide a complete answer.');
      canScore = false;
    }

    // Check for very short answer
    if (metrics.wordCount >= 5 && metrics.wordCount < 20) {
      warnings.push('Response too short to evaluate effectively. Aim for more detailed answers.');
    }

    // Check camera visibility
    const faceVisibility = metrics.totalFrames > 0 
      ? (metrics.faceDetectionFrames / metrics.totalFrames) * 100 
      : 0;
    
    if (faceVisibility < 30) {
      warnings.push('Face not clearly visible. Please maintain camera visibility for accurate body language analysis.');
    }

    // Check speaking speed
    const wpm = metrics.totalDuration > 0 ? (metrics.wordCount / metrics.totalDuration) * 60 : 0;
    if (wpm < 50 && metrics.wordCount > 0) {
      warnings.push('Speaking speed extremely slow. Try to maintain a natural pace.');
    } else if (wpm > 220) {
      warnings.push('Speaking speed too fast. Slow down for better clarity.');
    }

    // Check filler word ratio
    const fillerRatio = metrics.wordCount > 0 ? (metrics.fillerWordCount / metrics.wordCount) * 100 : 0;
    if (fillerRatio > 15) {
      warnings.push('Excessive filler words detected. Practice reducing "um", "uh", and "like".');
    }

    // Check for missing data
    if (metrics.totalFrames === 0) {
      warnings.push('Camera data unavailable. Body language analysis incomplete.');
    }

    if (metrics.totalDuration === 0 && metrics.wordCount > 0) {
      warnings.push('Duration data missing. Confidence metrics may be inaccurate.');
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      canScore
    };
  }

  // Communication Score (0-10)
  static calculateCommunicationScore(
    wordCount: number,
    fillerWordCount: number
  ): ScoreBreakdown {
    let score = 5; // baseline
    const reasons: string[] = [];

    // Handle edge case: no speech
    if (wordCount < 5) {
      return {
        score: 1,
        reasons: ['Insufficient speech data for evaluation']
      };
    }

    // Word count analysis
    if (wordCount >= 60) {
      score += 2;
      reasons.push('Comprehensive response with sufficient detail');
    } else if (wordCount >= 40) {
      score += 1;
      reasons.push('Adequate response length');
    } else if (wordCount < 20) {
      score -= 2;
      reasons.push('Response too brief, lacks detail');
    } else {
      reasons.push('Response length could be improved');
    }

    // Filler word ratio
    const fillerRatio = wordCount > 0 ? (fillerWordCount / wordCount) * 100 : 0;
    if (fillerRatio < 2) {
      score += 2;
      reasons.push('Minimal filler words, clear articulation');
    } else if (fillerRatio < 5) {
      score += 1;
      reasons.push('Low filler word usage');
    } else if (fillerRatio > 15) {
      score -= 3;
      reasons.push(`Excessive filler words detected (${fillerWordCount} fillers in ${wordCount} words)`);
    } else if (fillerRatio > 10) {
      score -= 2;
      reasons.push('Frequent filler words detected (um, uh, like)');
    } else {
      score -= 1;
      reasons.push('Moderate filler word usage');
    }

    // Clamp score
    score = Math.max(1, Math.min(10, score));

    return { score, reasons };
  }

  // Confidence Score (0-10)
  static calculateConfidenceScore(
    wordCount: number,
    totalDuration: number,
    pauseCount: number
  ): ScoreBreakdown {
    let score = 5; // baseline
    const reasons: string[] = [];

    // Handle edge case: no speech
    if (wordCount < 5) {
      return {
        score: 1,
        reasons: ['Insufficient speech data for evaluation']
      };
    }

    // Handle edge case: no duration data
    if (totalDuration === 0) {
      return {
        score: 5,
        reasons: ['Duration data unavailable, confidence metrics incomplete']
      };
    }

    // Calculate WPM
    const wpm = totalDuration > 0 ? (wordCount / totalDuration) * 60 : 0;

    // Speaking speed analysis
    if (wpm >= 100 && wpm <= 160) {
      score += 2.5;
      reasons.push(`Speaking pace within optimal range (${Math.round(wpm)} WPM)`);
    } else if (wpm >= 80 && wpm < 100) {
      score += 1;
      reasons.push(`Speaking pace slightly slow (${Math.round(wpm)} WPM)`);
    } else if (wpm > 160 && wpm <= 190) {
      score += 1;
      reasons.push(`Speaking pace slightly fast (${Math.round(wpm)} WPM)`);
    } else if (wpm < 50) {
      score -= 2.5;
      reasons.push(`Speaking pace extremely slow (${Math.round(wpm)} WPM) - outside optimal range`);
    } else if (wpm < 80) {
      score -= 1.5;
      reasons.push(`Speaking pace too slow (${Math.round(wpm)} WPM)`);
    } else if (wpm > 220) {
      score -= 2.5;
      reasons.push(`Speaking pace extremely fast (${Math.round(wpm)} WPM) - outside optimal range`);
    } else if (wpm > 190) {
      score -= 1.5;
      reasons.push(`Speaking pace too fast (${Math.round(wpm)} WPM)`);
    }

    // Pause analysis
    const pauseRatio = wordCount > 0 ? pauseCount / (wordCount / 10) : 0;
    if (pauseRatio < 1) {
      score += 1.5;
      reasons.push('Smooth delivery with minimal hesitation');
    } else if (pauseRatio < 2) {
      score += 0.5;
      reasons.push('Occasional pauses, generally confident');
    } else if (pauseRatio > 4) {
      score -= 2;
      reasons.push('High hesitation detected - frequent long pauses');
    } else if (pauseRatio > 3) {
      score -= 1.5;
      reasons.push('Frequent hesitation detected');
    } else {
      score -= 0.5;
      reasons.push('Moderate hesitation observed');
    }

    // Clamp score
    score = Math.max(1, Math.min(10, score));

    return { score, reasons };
  }

  // Body Language Score (0-10)
  static calculateBodyLanguageScore(
    faceDetectionFrames: number,
    totalFrames: number,
    movementScore: number
  ): ScoreBreakdown {
    let score = 5; // baseline
    const reasons: string[] = [];

    // Handle edge case: no camera data
    if (totalFrames === 0) {
      return {
        score: 1,
        reasons: ['Camera data unavailable - body language analysis incomplete']
      };
    }

    // Face visibility analysis
    const faceVisibility = totalFrames > 0 ? (faceDetectionFrames / totalFrames) * 100 : 0;
    
    if (faceVisibility > 90) {
      score += 2.5;
      reasons.push('Excellent eye contact maintained throughout');
    } else if (faceVisibility > 75) {
      score += 1.5;
      reasons.push('Good eye contact, mostly visible');
    } else if (faceVisibility > 50) {
      score += 0.5;
      reasons.push('Moderate eye contact');
    } else if (faceVisibility < 30) {
      score -= 3;
      reasons.push(`Low face visibility (${Math.round(faceVisibility)}%) - camera may be covered or positioned incorrectly`);
    } else {
      score -= 2;
      reasons.push('Low face visibility detected, improve camera positioning');
    }

    // Movement stability analysis
    if (movementScore > 80) {
      score += 1.5;
      reasons.push('Stable posture maintained, professional presence');
    } else if (movementScore > 60) {
      score += 0.5;
      reasons.push('Generally stable posture');
    } else if (movementScore < 40) {
      score -= 1.5;
      reasons.push('Excessive movement detected, maintain steadier posture');
    } else {
      score -= 0.5;
      reasons.push('Moderate movement, could be more stable');
    }

    // Clamp score
    score = Math.max(1, Math.min(10, score));

    return { score, reasons };
  }

  // Calculate overall score
  static calculateOverallScore(
    communication: number,
    confidence: number,
    bodyLanguage: number
  ): number {
    const weighted = communication * 0.4 + confidence * 0.35 + bodyLanguage * 0.25;
    return Math.round(weighted * 10) / 10; // Round to 1 decimal
  }

  // Main scoring function
  static generateScores(metrics: AnalysisMetrics): FinalScores {
    // Validate metrics first
    const validation = this.validateMetrics(metrics);

    // If cannot score, return minimal scores with validation info
    if (!validation.canScore) {
      return {
        communication: { score: 1, reasons: ['Insufficient data for evaluation'] },
        confidence: { score: 1, reasons: ['Insufficient data for evaluation'] },
        bodyLanguage: { score: 1, reasons: ['Insufficient data for evaluation'] },
        overall: 1,
        metrics,
        validation
      };
    }

    const communication = this.calculateCommunicationScore(
      metrics.wordCount,
      metrics.fillerWordCount
    );

    const confidence = this.calculateConfidenceScore(
      metrics.wordCount,
      metrics.totalDuration,
      metrics.pauseCount
    );

    const bodyLanguage = this.calculateBodyLanguageScore(
      metrics.faceDetectionFrames,
      metrics.totalFrames,
      metrics.movementScore
    );

    const overall = this.calculateOverallScore(
      communication.score,
      confidence.score,
      bodyLanguage.score
    );

    return {
      communication,
      confidence,
      bodyLanguage,
      overall,
      metrics,
      validation
    };
  }
}
