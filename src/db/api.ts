import { supabase } from './supabase';
import type { Interview } from '@/types/interview';

export const interviewApi = {
  // Create new interview session
  async createInterview(branch: 'AIML' | 'CS' | 'IT', resumeText?: string, userId?: string | null) {
    const { data, error } = await supabase
      .from('interviews')
      .insert({
        branch,
        resume_text: resumeText || null,
        user_id: userId || null,
        questions: [],
        answers: [],
        scores: {},
        feedback: [],
        completed: false
      })
      .select()
      .single();

    if (error) throw error;
    return data as Interview;
  },

  // Update interview with questions
  async updateQuestions(id: string, questions: string[]) {
    const { error } = await supabase
      .from('interviews')
      .update({ questions })
      .eq('id', id);

    if (error) throw error;
  },

  // Update interview with answers
  async updateAnswers(id: string, answers: string[]) {
    const { error } = await supabase
      .from('interviews')
      .update({ answers })
      .eq('id', id);

    if (error) throw error;
  },

  // Complete interview with final scores and feedback
  async completeInterview(
    id: string,
    scores: Interview['scores'],
    feedback: string[],
    emotionSummary?: string,
    metrics?: Interview['metrics'],
    scoreReasons?: Interview['scoreReasons']
  ) {
    const { error } = await supabase
      .from('interviews')
      .update({
        scores,
        feedback,
        emotion_summary: emotionSummary || null,
        completed: true
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Get all interviews
  async getAllInterviews() {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Interview[];
  },

  // Get user's interviews (for logged-in users)
  async getUserInterviews() {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Interview[];
  },

  // Get single interview
  async getInterview(id: string) {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Interview | null;
  },

  // Delete single interview
  async deleteInterview(id: string) {
    const { error } = await supabase
      .from('interviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Delete all interviews for current user
  async deleteAllInterviews() {
    const { error } = await supabase
      .from('interviews')
      .delete()
      .not('user_id', 'is', null); // Only delete interviews with user_id (logged-in users)

    if (error) throw error;
  },

  // Generate questions via Edge Function
  async generateQuestions(branch: string, resumeText?: string, previousAnswers?: string[]) {
    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: { branch, resumeText, previousAnswers }
    });

    if (error) {
      const errorMsg = await error?.context?.text?.();
      console.error('Edge function error in generate-questions:', errorMsg || error?.message);
      throw new Error(errorMsg || error.message);
    }

    return data.questions as string[];
  },

  // Generate feedback via Edge Function
  async generateFeedback(
    questions: string[],
    answers: string[],
    scores: Interview['scores']
  ) {
    const { data, error } = await supabase.functions.invoke('generate-feedback', {
      body: { questions, answers, scores }
    });

    if (error) {
      const errorMsg = await error?.context?.text?.();
      console.error('Edge function error in generate-feedback:', errorMsg || error?.message);
      throw new Error(errorMsg || error.message);
    }

    return data.feedback as string[];
  }
};
