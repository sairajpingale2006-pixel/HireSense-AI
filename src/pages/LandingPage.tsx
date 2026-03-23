import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import AIBrain from '@/components/3d/AIBrain';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Sparkles } from 'lucide-react';
import { interviewApi } from '@/db/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/useDevice';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const isMobile = useIsMobile();
  const [branch, setBranch] = useState<'AIML' | 'CS' | 'IT'>('CS');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to auth page if not authenticated
  useEffect(() => {
    if (!user && !isGuest) {
      navigate('/');
    }
  }, [user, isGuest, navigate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      toast.success('Resume uploaded successfully');
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= Math.min(pdf.numPages, 3); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
      }

      return fullText.trim();
    } catch (error) {
      console.error('PDF parsing error:', error);
      return '';
    }
  };

  const handleStartInterview = async () => {
    setIsLoading(true);
    try {
      let resumeText = '';
      if (resumeFile) {
        resumeText = await extractTextFromPDF(resumeFile);
      }

      // Pass user ID if logged in, null for guest
      const userId = user?.id || null;
      const interview = await interviewApi.createInterview(branch, resumeText, userId);
      const questions = await interviewApi.generateQuestions(branch, resumeText);
      await interviewApi.updateQuestions(interview.id, questions);

      navigate('/interview', { state: { interviewId: interview.id, questions, branch } });
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Background data stream animation - hidden on mobile */}
      {!isMobile && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ top: "-20%", left: `${i * 4}%`, opacity: 0 }}
              animate={{ top: "120%", opacity: [0, 1, 0] }}
              transition={{ 
                duration: 3 + Math.random() * 7, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 5 
              }}
              className="absolute w-[2px] h-64 bg-gradient-to-b from-transparent via-primary/50 to-transparent shadow-[0_0_10px_rgba(0,163,255,0.3)]"
            />
          ))}
        </div>
      )}
      {/* 3D Brain visualization - hidden on mobile */}
      {!isMobile && (
        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-60 pointer-events-none">
          <div className="w-full h-full max-w-4xl max-h-[80vh]">
            <AIBrain />
          </div>
        </div>
      )}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-20 text-center space-y-6 md:space-y-8 w-full max-w-3xl"
      >
        <div className="space-y-3 md:space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-[9px] md:text-[10px] font-mono tracking-[0.3em] uppercase text-primary mb-3 md:mb-4"
          >
            Neural Protocol v4.2 Active
          </motion.div>
          <h1 className="text-[clamp(2.5rem,8vw,6rem)] font-bold tracking-tighter gradient-text drop-shadow-[0_0_15px_rgba(0,163,255,0.3)]">
            HireSense AI
          </h1>
          <p className="text-base md:text-xl lg:text-2xl text-muted-foreground/80 max-w-2xl mx-auto font-light tracking-wide">
            Next-generation virtual HR for immersive real-time interview evaluation
          </p>
        </div>

        {/* Configuration Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-dark border border-white/10 p-6 md:p-8 rounded-2xl md:rounded-3xl space-y-5 md:space-y-6 backdrop-blur-xl"
        >
          <div className="space-y-3 md:space-y-4">
            <label className="text-xs md:text-sm font-mono uppercase tracking-widest text-muted-foreground block text-left">
              Select Your Branch
            </label>
            <Select value={branch} onValueChange={(v) => setBranch(v as any)}>
              <SelectTrigger className="w-full h-12 md:h-14 bg-white/5 border-white/10 text-base md:text-lg rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AIML">AI & Machine Learning</SelectItem>
                <SelectItem value="CS">Computer Science</SelectItem>
                <SelectItem value="IT">Information Technology</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 md:space-y-4">

          </div>
        </motion.div>

        <div className="pt-4 md:pt-6">
          <Button 
            size="lg"
            onClick={handleStartInterview}
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow h-14 md:h-16 px-10 md:px-12 text-lg md:text-xl rounded-full transition-all duration-300 active:scale-95 group overflow-hidden relative disabled:opacity-50 w-full md:w-auto"
          >
            <span className="relative z-10 flex items-center justify-center">
              {isLoading ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Initializing AI...
                </>
              ) : (
                <>
                  Start Evaluation
                  {!isMobile && (
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="ml-2"
                    >
                      →
                    </motion.div>
                  )}
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
        </div>
      </motion.div>
      {/* Footer HUD elements */}
      <div className="absolute bottom-10 left-10 hidden md:flex flex-col space-y-2 opacity-40">
        <div className="flex items-center space-x-2">
           <div className="w-1.5 h-1.5 rounded-full bg-primary" />
           <span className="text-[8px] font-mono tracking-widest uppercase">Syncing Neural Core...</span>
        </div>
        <div className="flex items-center space-x-2">
           <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
           <span className="text-[8px] font-mono tracking-widest uppercase">Scanning Environment...</span>
        </div>
      </div>
      <div className="absolute bottom-10 right-10 hidden md:block opacity-40">

      </div>
    </div>
  );
};

export default LandingPage;
