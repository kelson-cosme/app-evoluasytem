// src/lib/supabase.ts

import 'react-native-url-polyfill/auto'; // Importante para o Supabase no React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Pegue estes valores do seu ficheiro .env do projeto web
const supabaseUrl = "https://rjfcfkdnoguvpnxltvow.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqZmNma2Rub2d1dnBueGx0dm93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTkwOTMsImV4cCI6MjA3NzQ5NTA5M30.mk8EdZSGXtYMWcbmuwBqgEIPy7nk2VFMBCvJMer54Pw";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage, // A grande diferença: usar AsyncStorage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Desativar para mobile
  },
});