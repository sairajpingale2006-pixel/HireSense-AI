import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, LayoutDashboard, RotateCcw, Sparkles, Brain, AlertTriangle } from 'lucide-react';
import { interviewApi } from '@/db/api';
import type { Interview } from '@/types/interview';

interface CircularMeterProps {
  value: number;
  label: string;
  color: string;
  delay?: number;
}

const CircularMeter: React.FC<CircularMeterProps> = ({ value, label, color, delay = 0 }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (currentValue / 10) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentValue(prev => {
          if (prev >= value) {
            clearInterval(interval);
            return value;
          }
          return prev + 0.1;
        });
      }, 20);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="56" cy="56" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
          <circle cx="56" cy="56" r="40" stroke={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="transparent" className="transition-all duration-300 ease-out shadow-[0_0_10px_rgba(0,163,255,0.5)]" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold font-mono">{currentValue.toFixed(1)}</span>
        </div>
      </div>
      <span className="text-xs uppercase tracking-widest font-mono text-muted-foreground">{label}</span>
    </div>
  );
};

const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { interviewId, scoreReasons, validation } = location.state || {};
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    const loadInterview = async () => {
      if (!interviewId) {
        navigate('/dashboard');
        return;
      }

      setTimeout(() => setAnalyzing(false), 2500);

      try {
        const data = await interviewApi.getInterview(interviewId);
        setInterview(data);
      } catch (error) {
        console.error('Failed to load interview:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [interviewId, navigate]);

  if (loading || analyzing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-20 h-20 mx-auto">
            <Brain className="w-full h-full text-primary" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary">AI analyzing behavioral patterns...</h2>
            <p className="text-sm text-muted-foreground font-mono">Processing speech, body language, and confidence metrics</p>
          </div>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive text-xl font-mono">Interview not found</div>
      </div>
    );
  }

  const reasons = scoreReasons || interview.scoreReasons || {
    communication: ['Analysis complete'],
    confidence: ['Analysis complete'],
    bodyLanguage: ['Analysis complete']
  };

  const warnings = validation?.warnings || [];
  const canScore = validation?.canScore !== false;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 space-y-8 max-w-6xl mx-auto overflow-hidden">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/landing')} className="text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        <div className="font-mono text-xs text-primary/70 uppercase tracking-widest">{interview.branch} Interview</div>
      </div>

      {warnings.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`glass-dark border-2 p-6 rounded-2xl ${!canScore ? 'border-destructive/50 bg-destructive/5' : 'border-yellow-500/50 bg-yellow-500/5'}`}>
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl ${!canScore ? 'bg-destructive/20' : 'bg-yellow-500/20'}`}>
              <AlertTriangle className={`w-6 h-6 ${!canScore ? 'text-destructive' : 'text-yellow-500'}`} />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className={`text-lg font-bold ${!canScore ? 'text-destructive' : 'text-yellow-500'}`}>
                {!canScore ? 'Evaluation Incomplete' : 'Issues Detected'}
              </h3>
              <div className="space-y-2">
                {warnings.map((warning: string, i: number) => (
                  <p key={i} className="text-sm text-muted-foreground">• {warning}</p>
                ))}
              </div>
              {!canScore && (
                <div className="pt-4 flex gap-3">
                  <Button onClick={() => navigate('/landing')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retry Interview
                  </Button>
                  <Button onClick={() => navigate('/dashboard')} variant="outline" className="border-white/10">
                    View Dashboard
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {canScore && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-2 glass-dark border border-white/10 p-10 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative space-y-12">
              <div className="flex items-end justify-between">
                <div className="space-y-2">
                   <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">Evaluation Complete</h2>
                   <p className="text-muted-foreground">AI has processed your performance analytics.</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono text-secondary uppercase tracking-widest block mb-1">Overall Score</span>
                  <span className="text-7xl font-bold font-mono text-primary gradient-text">{interview.scores.overall.toFixed(1)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-8 border-y border-white/5">
                <CircularMeter value={interview.scores.communication} label="Communication" color="hsl(var(--primary))" delay={0.2} />
                <CircularMeter value={interview.scores.confidence} label="Confidence" color="hsl(var(--secondary))" delay={0.4} />
                <CircularMeter value={interview.scores.bodyLanguage} label="Body Language" color="hsl(280, 100%, 60%)" delay={0.6} />
              </div>

              {interview.metrics && (
                <div className="grid grid-cols-4 gap-4 p-6 bg-white/5 rounded-2xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-primary">{interview.metrics.wordCount}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Total Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-destructive">{interview.metrics.fillerWordCount}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Filler Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-secondary">
                      {interview.metrics.totalDuration > 0 ? Math.round((interview.metrics.wordCount / interview.metrics.totalDuration) * 60) : 0}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">WPM</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-accent">
                      {Math.round((interview.metrics.faceDetectionFrames / Math.max(interview.metrics.totalFrames, 1)) * 100)}%
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Eye Contact</div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-4">
                 <Button onClick={() => navigate('/landing')} size="lg" className="rounded-2xl px-8 h-14 bg-primary text-primary-foreground hover:scale-[1.02] transition-transform">
                   <RotateCcw className="w-5 h-5 mr-2" />
                   New Interview
                 </Button>
                 <Button onClick={() => navigate('/dashboard')} size="lg" variant="outline" className="rounded-2xl px-8 h-14 border-white/10 hover:bg-white/5 hover:scale-[1.02] transition-transform">
                   <LayoutDashboard className="w-5 h-5 mr-2" />
                   View Dashboard
                 </Button>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
             <h3 className="text-sm font-mono text-secondary uppercase tracking-widest pl-2">Score Breakdown</h3>
             
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass border border-white/5 p-6 rounded-2xl space-y-3">
               <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Sparkles className="text-primary w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm">Communication</span>
                    <span className="ml-2 text-primary font-mono">{interview.scores.communication.toFixed(1)}/10</span>
                  </div>
               </div>
               {reasons.communication.map((reason: string, i: number) => (
                 <p key={i} className="text-xs text-muted-foreground leading-relaxed pl-11">• {reason}</p>
               ))}
             </motion.div>

             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass border border-white/5 p-6 rounded-2xl space-y-3">
               <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Sparkles className="text-secondary w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm">Confidence</span>
                    <span className="ml-2 text-secondary font-mono">{interview.scores.confidence.toFixed(1)}/10</span>
                  </div>
               </div>
               {reasons.confidence.map((reason: string, i: number) => (
                 <p key={i} className="text-xs text-muted-foreground leading-relaxed pl-11">• {reason}</p>
               ))}
             </motion.div>

             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="glass border border-white/5 p-6 rounded-2xl space-y-3">
               <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Sparkles className="text-accent w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm">Body Language</span>
                    <span className="ml-2 text-accent font-mono">{interview.scores.bodyLanguage.toFixed(1)}/10</span>
                  </div>
               </div>
               {reasons.bodyLanguage.map((reason: string, i: number) => (
                 <p key={i} className="text-xs text-muted-foreground leading-relaxed pl-11">• {reason}</p>
               ))}
             </motion.div>

             <div className="pt-4">
               <h3 className="text-sm font-mono text-secondary uppercase tracking-widest pl-2 mb-4">AI Feedback</h3>
               <div className="space-y-3">
                 {interview.feedback.slice(0, 3).map((f: string, i: number) => (
                   <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + (i * 0.1) }} className="glass border border-white/5 p-4 rounded-xl">
                     <p className="text-xs text-muted-foreground leading-relaxed">💡 {f}</p>
                   </motion.div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      )}

      {!canScore && (
        <div className="glass-dark border border-white/10 p-20 rounded-3xl text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Unable to Generate Scores</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              The system requires sufficient data to provide accurate evaluation. Please retry the interview with proper camera and audio setup.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultPage;
