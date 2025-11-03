// app/index.tsx (Substitua o conteúdo anterior)

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router'; // Importe o router para navegar
import { supabase } from '../../src/lib/supabase'; // Importe o seu cliente supabase
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // 1. Inicialize o router
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    setAuthError('');
    
    if (!inputCode) {
      setAuthError('Por favor, insira o seu ID de Acesso.');
      setIsLoading(false);
      return;
    }

    try {
      // 2. Lógica de autenticação REAL
      // Esta lógica é inspirada em `PatientView.tsx`,
      // mas consulta diretamente pelo 'access_code'
      const { data: patient, error } = await supabase
        .from('patients')
        .select('id, name, access_code') // Pedimos apenas o que precisamos
        .eq('access_code', inputCode.trim()) // Usamos o código do input
        .single(); // Esperamos apenas um resultado

      if (error || !patient) {
        console.error('Erro Supabase:', error);
        setAuthError('ID de Acesso incorreto. Tente novamente.');
        setIsLoading(false);
        return;
      }

      // 3. Sucesso!
      Alert.alert('Sucesso!', `Bem-vindo, ${patient.name.split(' ')[0]}!`);
      
      // 4. Navegar para a tela do plano e passar o ID do paciente
      router.push({
        pathname: '/(main)/plan',
        params: { patientId: patient.id },
      });

    } catch (e) {
      setAuthError('Ocorreu um erro inesperado.');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Plano Protegido hahah</Text>
        <Text style={styles.description}>
          Insira o seu ID de Acesso para ver o seu plano.
        </Text>
        <Text style={styles.label}>ID de Acesso</Text>
        <TextInput
          style={styles.input}
          placeholder="XXXXXX"
          placeholderTextColor="#999"
          value={inputCode}
          onChangeText={setInputCode}
          secureTextEntry={true}
          editable={!isLoading}
          autoCapitalize="none"
        />
        {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
        <Button
          title={isLoading ? 'A verificar...' : 'Aceder ao Plano'}
          onPress={handleLogin}
          disabled={isLoading}
        />
        {isLoading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}
      </View>
    </SafeAreaView>
  );
}

// Estilos (sem alterações)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
});