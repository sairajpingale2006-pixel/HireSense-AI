import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, VideoOff, CheckCircle, ArrowRight, AlertCircle, Eye } from 'lucide-react';
import Waveform from '@/components/interview/Waveform';
import RealTimeConfidence from '@/components/interview/RealTimeConfidence';
import { interviewApi } from '@/db/api';
import { toast } from 'sonner';
import { ScoringEngine, type AnalysisMetrics } from '@/lib/scoringEngine';

const InterviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { interviewId, questions: initialQuestions } = location.state || {};

  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState('Initializing sensors...');
  const [confidenceScore, setConfidenceScore] = useState(75);
  const [fillerWordAlert, setFillerWordAlert] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [questions, setQuestions] = useState<string[]>(initialQuestions || []);
  const [faceDetected, setFaceDetected] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [metrics, setMetrics] = useState<AnalysisMetrics>({
    wordCount: 0,
    fillerWordCount: 0,
    totalDuration: 0,
    pauseCount: 0,
    faceDetectionFrames: 0,
    totalFrames: 0,
    movementScore: 80
  });
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [lastSpeechTime, setLastSpeechTime] = useState<number>(Date.now());
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const analysisMessages = [
    "Analyzing speech patterns...",
    "Tracking confidence levels...",
    "Evaluating eye contact...",
    "Processing voice tone...",
    "Scanning micro-gestures...",
    "Measuring stress indicators...",
    "Analyzing word consistency...",
    "Detecting speech pace..."
  ];

  const fillerWords = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'sort of', 'kind of'];

  useEffect(() => {
    const detectFace = () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx && video.readyState === 4) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          
          const imageData = ctx.getImageData(
            canvas.width / 4,
            canvas.height / 4,
            canvas.width / 2,
            canvas.height / 2
          );
          
          let brightness = 0;
          for (let i = 0; i < imageData.data.length; i += 4) {
            brightness += (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
          }
          brightness /= (imageData.data.length / 4);
          
          const detected = brightness > 50;
          setFaceDetected(detected);
          
          setMetrics(prev => ({
            ...prev,
            totalFrames: prev.totalFrames + 1,
            faceDetectionFrames: detected ? prev.faceDetectionFrames + 1 : prev.faceDetectionFrames
          }));
        }
      }
    };

    const interval = setInterval(detectFace, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsSpeaking(true);
        setLastSpeechTime(Date.now());
      };
      
      recognitionRef.current.onend = () => setIsSpeaking(false);
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const resultText = event.results[i][0].transcript;
            setTranscript(prev => (prev + ' ' + resultText).trim());
            
            const words = resultText.trim().split(/\s+/);
            const fillers = words.filter((w: string) => fillerWords.includes(w.toLowerCase()));
            
            setMetrics(prev => ({
              ...prev,
              wordCount: prev.wordCount + words.length,
              fillerWordCount: prev.fillerWordCount + fillers.length
            }));
            
            if (fillers.length > 0) {
              setFillerWordAlert(`Avoid: ${fillers[0].toLowerCase()}`);
              setTimeout(() => setFillerWordAlert(null), 3000);
            }
            
            setLastSpeechTime(Date.now());
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setIsSpeaking(interimTranscript.length > 0);
        
        const now = Date.now();
        if (now - lastSpeechTime > 2000) {
          setMetrics(prev => ({ ...prev, pauseCount: prev.pauseCount + 1 }));
        }
      };
    }
  }, [lastSpeechTime]);

  useEffect(() => {
    if (!interviewId || !questions.length) {
      toast.error('Invalid interview session');
      navigate('/');
      return;
    }

    const requestPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        if (recognitionRef.current) recognitionRef.current.start();
      } catch (err) {
        setPermissionError("Camera access required to begin your interview. Please enable permissions and refresh.");
      }
    };

    requestPermissions();

    const textInterval = setInterval(() => {
      setAnalysisText(analysisMessages[Math.floor(Math.random() * analysisMessages.length)]);
    }, 4000);

    return () => {
      clearInterval(textInterval);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const handleNextQuestion = async () => {
    const currentAnswer = transcript.trim() || 'No answer provided';
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    
    const duration = (Date.now() - questionStartTime) / 1000;
    setMetrics(prev => ({ ...prev, totalDuration: prev.totalDuration + duration }));
    
    setTranscript('');
    setQuestionStartTime(Date.now());

    try {
      await interviewApi.updateAnswers(interviewId, newAnswers);
    } catch (error) {
      console.error('Failed to save answer:', error);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleEndInterview(newAnswers);
    }
  };

  const handleEndInterview = async (finalAnswers: string[]) => {
    try {
      const finalScores = ScoringEngine.generateScores(metrics);
      
      const scores = {
        confidence: finalScores.confidence.score,
        communication: finalScores.communication.score,
        bodyLanguage: finalScores.bodyLanguage.score,
        overall: finalScores.overall
      };

      const scoreReasons = {
        communication: finalScores.communication.reasons,
        confidence: finalScores.confidence.reasons,
        bodyLanguage: finalScores.bodyLanguage.reasons
      };

      const feedback = await interviewApi.generateFeedback(questions, finalAnswers, scores);
      await interviewApi.completeInterview(interviewId, scores, feedback, 'Confident', metrics, scoreReasons);

      navigate('/result', { 
        state: { 
          interviewId, 
          scoreReasons,
          validation: finalScores.validation
        } 
      });
    } catch (error) {
      console.error('Failed to complete interview:', error);
      toast.error('Failed to save results');
    }
  };

  useEffect(() => {
    if (metrics.wordCount > 0) {
      const tempScores = ScoringEngine.generateScores(metrics);
      setConfidenceScore(Math.round(tempScores.overall * 10));
    }
  }, [metrics]);

  if (permissionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <div className="max-w-md w-full glass-dark p-8 rounded-2xl border-destructive/50 border text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
            <VideoOff className="text-destructive w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">{permissionError}</p>
          <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden flex flex-col p-6 space-y-6">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-mono tracking-widest uppercase text-primary/80">System: Live AI Analysis</span>
        </div>
        <div className="flex items-center space-x-6">
          <RealTimeConfidence value={confidenceScore} />
          <div className="hidden md:flex items-center space-x-2 glass-dark border border-white/10 px-4 py-2 rounded-xl">
            <Eye className="w-4 h-4 text-secondary" />
            <span className="text-xs font-mono">{Math.round((metrics.faceDetectionFrames / Math.max(metrics.totalFrames, 1)) * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <div className="md:col-span-2 relative">
          <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-primary/30 shadow-[0_0_30px_rgba(0,163,255,0.2)] bg-black/50">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover mirror transform scale-x-[-1]" 
            />
            
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               <motion.div 
                 initial={{ top: "-10%" }}
                 animate={{ top: "110%" }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-[2px] shadow-[0_0_15px_rgba(0,163,255,0.8)]"
               />
               
               <div className="absolute top-10 left-10 w-12 h-12 border-t-2 border-l-2 border-primary/50 rounded-tl-lg" />
               <div className="absolute top-10 right-10 w-12 h-12 border-t-2 border-r-2 border-primary/50 rounded-tr-lg" />
               <div className="absolute bottom-10 left-10 w-12 h-12 border-b-2 border-l-2 border-primary/50 rounded-bl-lg" />
               <div className="absolute bottom-10 right-10 w-12 h-12 border-b-2 border-r-2 border-primary/50 rounded-br-lg" />
               
               <motion.div 
                 animate={{ 
                   opacity: faceDetected ? [0.5, 0.8, 0.5] : 0.2,
                   scale: faceDetected ? [1, 1.02, 1] : 1
                 }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-56 border-2 rounded-3xl ${faceDetected ? 'border-primary border-solid' : 'border-dashed border-secondary/30'}`}
               >
                 <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono tracking-widest uppercase" style={{ color: faceDetected ? 'hsl(var(--primary))' : 'hsl(var(--secondary))' }}>
                    {faceDetected ? 'Face Locked' : 'Searching...'}
                 </div>
               </motion.div>
            </div>

            <AnimatePresence>
              {fillerWordAlert && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-8 right-8 z-20"
                >
                  <div className="glass-dark border border-destructive/50 bg-destructive/10 px-6 py-3 rounded-2xl flex items-center space-x-3 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <span className="text-sm font-bold uppercase tracking-widest text-destructive">{fillerWordAlert}</span>
                  </div>
                </motion.div>
              )}
              {!fillerWordAlert && isSpeaking && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-8 right-8 z-20"
                >
                  <div className="glass border border-primary/30 bg-primary/10 px-6 py-2 rounded-2xl flex items-center space-x-2 backdrop-blur-md">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">Good speaking!</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
             <div className="glass-dark border border-primary/20 p-3 rounded-xl flex items-center space-x-3">
               <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
               <AnimatePresence mode="wait">
                 <motion.p 
                   key={analysisText}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="text-xs font-mono text-primary/90 uppercase tracking-tighter"
                 >
                   {analysisText}
                 </motion.p>
               </AnimatePresence>
             </div>
          </div>
        </div>

        <div className="flex flex-col space-y-6">
          <motion.div 
             key={currentQuestionIndex}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="glass-dark border border-white/10 p-8 rounded-3xl flex-1 flex flex-col justify-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CheckCircle className="w-24 h-24 text-primary" />
            </div>
            <div className="space-y-4">
              <span className="text-xs font-mono text-secondary uppercase tracking-widest">Question {currentQuestionIndex + 1} of {questions.length}</span>
              <h3 className="text-2xl font-medium leading-relaxed">{questions[currentQuestionIndex]}</h3>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
             <div className="glass border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 group overflow-hidden relative">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] uppercase font-mono tracking-widest opacity-60">Speech Analysis</span>
                <Waveform isActive={isSpeaking} />
                <motion.div 
                  animate={{ 
                    scale: isSpeaking ? [1, 1.2, 1] : 1,
                    opacity: isSpeaking ? [0.6, 1, 0.6] : 0.6 
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isSpeaking ? 'bg-primary/30 border border-primary shadow-[0_0_10px_rgba(0,163,255,0.5)]' : 'bg-white/5'}`}
                >
                  <Mic className={`w-5 h-5 ${isSpeaking ? 'text-primary' : 'text-muted-foreground'}`} />
                </motion.div>
             </div>
             <div className="glass border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
                <span className="text-[10px] uppercase font-mono tracking-widest opacity-60">Metrics</span>
                <div className="flex items-center space-x-2">
                   <div className="flex flex-col items-center">
                     <span className="text-2xl font-bold font-mono">{metrics.wordCount}</span>
                     <span className="text-[8px] uppercase tracking-tighter opacity-50">Words</span>
                   </div>
                   <div className="h-8 w-[1px] bg-white/10" />
                   <div className="flex flex-col items-center">
                     <span className="text-2xl font-bold font-mono text-secondary">{metrics.fillerWordCount}</span>
                     <span className="text-[8px] uppercase tracking-tighter opacity-50">Fillers</span>
                   </div>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     animate={{ width: isSpeaking ? ["30%", "70%", "30%"] : "30%" }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="h-full bg-secondary" 
                   />
                </div>
             </div>
          </div>

          <div className="flex flex-col space-y-3">
             <Button 
               onClick={handleNextQuestion}
               className="w-full h-14 bg-primary text-primary-foreground text-lg rounded-2xl flex items-center justify-center space-x-2 hover:scale-[1.02] transition-transform neon-glow"
             >
               <span>{currentQuestionIndex === questions.length - 1 ? 'Complete Evaluation' : 'Next Question'}</span>
               <ArrowRight className="w-5 h-5" />
             </Button>
             <Button 
               onClick={() => handleEndInterview(answers)}
               variant="ghost" 
               className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
             >
               Force Terminate Session
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
