// src/lib/supabase.ts

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native'; // Importe o Platform

const supabaseUrl = "https://rjfcfkdnoguvpnxltvow.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqZmNma2Rub2d1dnBueGx0dm93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTkwOTMsImV4cCI6MjA3NzQ5NTA5M30.mk8EdZSGXtYMWcbmuwBqgEIPy7nk2VFMBCvJMer54Pw";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // AQUI ESTÁ A CORREÇÃO:
    // Só passamos o AsyncStorage se a Platform NÃO for 'web'.
    // Na web, o Supabase usará inteligentemente o localStorage (no browser)
    // e não tentará usar o 'window' no servidor, resolvendo o erro.
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});