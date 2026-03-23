import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Plus, History, TrendingUp, User, Lock, LogIn, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { interviewApi } from '@/db/api';
import type { Interview } from '@/types/interview';
import { useIsMobile } from '@/hooks/useDevice';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { toast } from 'sonner';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const isMobile = useIsMobile();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadInterviews = async () => {
      try {
        const data = await interviewApi.getUserInterviews();
        setInterviews(data.filter(i => i.completed));
      } catch (error) {
        console.error('Failed to load interviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInterviews();
  }, [user]);

  // Show sign-in prompt for guests
  if (isGuest || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-dark border border-white/10 p-12 rounded-3xl text-center space-y-6 max-w-md"
        >
          <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/30">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Dashboard Locked</h2>
            <p className="text-muted-foreground">
              {isGuest 
                ? "You're in guest mode. Sign in with Google to unlock your personal dashboard and track your interview progress over time."
                : "Sign in with Google to access your personal dashboard and track your interview history."
              }
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => navigate('/')}
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-14"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In with Google
            </Button>
            <Button
              onClick={() => navigate('/landing')}
              size="lg"
              variant="outline"
              className="w-full border-white/20 hover:bg-white/5 rounded-xl h-14"
            >
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const getPerformanceStatus = (score: number) => {
    if (score >= 9) return "Excellent";
    if (score >= 7.5) return "Good Performance";
    if (score >= 6) return "Satisfactory";
    return "Needs Improvement";
  };

  const chartData = interviews.map((interview, index) => ({
    session: `#${index + 1}`,
    overall: interview.scores.overall,
    communication: interview.scores.communication,
    confidence: interview.scores.confidence,
    bodyLanguage: interview.scores.bodyLanguage
  }));

  const avgScore = interviews.length > 0
    ? interviews.reduce((sum, i) => sum + i.scores.overall, 0) / interviews.length
    : 0;

  const handleDeleteInterview = async () => {
    if (!interviewToDelete) return;
    
    setIsDeleting(true);
    try {
      await interviewApi.deleteInterview(interviewToDelete);
      setInterviews(prev => prev.filter(i => i.id !== interviewToDelete));
      toast.success('Interview deleted successfully');
      setDeleteDialogOpen(false);
      setInterviewToDelete(null);
    } catch (error) {
      console.error('Error deleting interview:', error);
      toast.error('Failed to delete interview');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      await interviewApi.deleteAllInterviews();
      setInterviews([]);
      toast.success('All interviews deleted successfully');
      setDeleteAllDialogOpen(false);
    } catch (error) {
      console.error('Error deleting all interviews:', error);
      toast.error('Failed to delete interviews');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInterviewToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 md:p-6 space-y-6 md:space-y-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-3 md:space-x-4">
           <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <User className="text-primary w-5 h-5 md:w-6 md:h-6" />
           </div>
           <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Welcome back!</h2>
              <p className="text-xs md:text-sm text-muted-foreground">Monitor your AI interview preparation metrics.</p>
           </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          {interviews.length > 0 && (
            <Button 
              onClick={() => setDeleteAllDialogOpen(true)}
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-2xl h-12 px-6 w-full md:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All History
            </Button>
          )}
          <Button 
            onClick={() => navigate('/landing')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl h-12 px-6 neon-glow w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start New Interview
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
         <div className="glass-dark border border-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <History className="w-16 md:w-20 h-16 md:h-20 text-primary" />
            </div>
            <div className="space-y-3 md:space-y-4">
               <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Total Sessions</span>
               <div className="text-4xl md:text-5xl font-bold">{interviews.length}</div>
            </div>
         </div>
         <div className="glass-dark border border-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="w-16 md:w-20 h-16 md:h-20 text-secondary" />
            </div>
            <div className="space-y-3 md:space-y-4">
               <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">Average Score</span>
               <div className="text-4xl md:text-5xl font-bold">{avgScore.toFixed(1)}</div>
            </div>
         </div>
         <div className="glass-dark border border-white/5 p-6 md:p-8 rounded-2xl md:rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <TrendingUp className="w-16 md:w-20 h-16 md:h-20 text-accent rotate-90" />
            </div>
            <div className="space-y-3 md:space-y-4">
               <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Top Performance</span>
               <div className="text-4xl md:text-5xl font-bold">
                 {interviews.length > 0 ? Math.max(...interviews.map(i => i.scores.overall)).toFixed(1) : '0.0'}
               </div>
            </div>
         </div>
      </div>

      {/* Trend Chart */}
      {interviews.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark border border-white/5 p-6 md:p-10 rounded-2xl md:rounded-[2rem] h-[300px] md:h-[400px]"
        >
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-bold">Performance Trends</h3>
            <div className="flex items-center space-x-2 md:space-x-4">
               <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full bg-primary" />
                 <span className="text-[10px] md:text-xs font-mono text-muted-foreground uppercase">Overall Score</span>
               </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="session" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: isMobile ? 8 : 10 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: isMobile ? 8 : 10 }}
                domain={[0, 10]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: isMobile ? '10px' : '12px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="overall" 
                stroke="hsl(var(--primary))" 
                strokeWidth={isMobile ? 2 : 3}
                fillOpacity={1} 
                fill="url(#colorScore)" 
                animationDuration={isMobile ? 1000 : 2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* History Table */}
      <div className="space-y-4 md:space-y-6 pb-20 md:pb-10">
         <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-bold">Session History</h3>
         </div>

         {interviews.length === 0 ? (
           <div className="glass border border-white/5 p-12 md:p-20 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 flex items-center justify-center opacity-40">
                 <History className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <div className="space-y-1">
                <p className="text-lg md:text-xl font-medium">No interviews yet</p>
                <p className="text-muted-foreground text-sm">Start your first session to see your progress here.</p>
              </div>
              <Button onClick={() => navigate('/landing')} variant="outline" className="border-white/10 hover:bg-white/5 h-12">Start First Interview</Button>
           </div>
         ) : (
           <AnimatePresence mode="popLayout">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
               {interviews.map((interview, i) => (
                 <motion.div 
                   key={interview.id}
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                   transition={{ delay: i * 0.05 }}
                   className="glass-dark border border-white/5 p-6 rounded-2xl hover:border-primary/50 group transition-all duration-300 relative"
                 >
                   {/* Delete Button */}
                   <button
                     onClick={(e) => openDeleteDialog(interview.id, e)}
                     className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all z-10"
                     aria-label="Delete interview"
                   >
                     <Trash2 className="w-4 h-4 text-destructive" />
                   </button>

                   {/* Card Content - Clickable */}
                   <div 
                     onClick={() => navigate('/result', { state: { interviewId: interview.id } })}
                     className="cursor-pointer"
                   >
                     <div className="flex items-center justify-between mb-6">
                       <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                         {new Date(interview.created_at).toLocaleDateString()}
                       </span>
                       <div className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest ${interview.scores.overall >= 8 ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                         {getPerformanceStatus(interview.scores.overall)}
                       </div>
                     </div>
                     <div className="flex items-end justify-between">
                       <div>
                         <div className="text-3xl font-bold font-mono group-hover:text-primary transition-colors">{interview.scores.overall.toFixed(1)}</div>
                         <div className="text-[10px] font-mono text-muted-foreground uppercase mt-1">Overall Analysis</div>
                       </div>
                       <div className="flex -space-x-1">
                         <div className="w-6 h-6 rounded-full bg-primary/20 border border-background flex items-center justify-center text-[8px] font-bold">{interview.scores.confidence.toFixed(1)}</div>
                         <div className="w-6 h-6 rounded-full bg-secondary/20 border border-background flex items-center justify-center text-[8px] font-bold">{interview.scores.communication.toFixed(1)}</div>
                         <div className="w-6 h-6 rounded-full bg-accent/20 border border-background flex items-center justify-center text-[8px] font-bold">{interview.scores.bodyLanguage.toFixed(1)}</div>
                       </div>
                     </div>
                   </div>
                 </motion.div>
               ))}
             </div>
           </AnimatePresence>
         )}
       </div>

       {/* Delete Confirmation Dialogs */}
       <DeleteConfirmDialog
         open={deleteDialogOpen}
         onOpenChange={setDeleteDialogOpen}
         onConfirm={handleDeleteInterview}
         title="Delete Interview Record"
         description="Are you sure you want to delete this interview record? This action cannot be undone."
         isDeleting={isDeleting}
       />

       <DeleteConfirmDialog
         open={deleteAllDialogOpen}
         onOpenChange={setDeleteAllDialogOpen}
         onConfirm={handleDeleteAll}
         title="Clear All History"
         description="This will permanently delete all your interview data. This action cannot be undone. Are you sure you want to continue?"
         isDeleting={isDeleting}
       />
     </div>
  );
};

export default DashboardPage;
