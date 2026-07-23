import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { loginUser } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  getSavedUsername,
  getSavedCredentials,
  saveCredentials,
} from '../utils/secureCredentials';
import { colors, fonts } from '../theme';
import TexturedBackground from '../components/TexturedBackground';

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [faceIdLoading, setFaceIdLoading] = useState(false);
  const [savedUsername, setSavedUsername] = useState(null);
  const { signIn, biometricsAvailable } = useAuth();

  const passwordRef = useRef(null);

  // Check (no biometric prompt needed for this) whether there's a saved
  // Face ID login available, and whose name to show on the button.
  useEffect(() => {
    getSavedUsername().then(setSavedUsername);
  }, []);

  const validate = () => {
    let ok = true;
    if (!name.trim()) {
      setNameError('Username is required.');
      ok = false;
    } else {
      setNameError('');
    }
    if (!password) {
      setPasswordError('Password is required.');
      ok = false;
    } else {
      setPasswordError('');
    }
    return ok;
  };

  const completeLogin = async (loginName, loginPassword) => {
    const result = await loginUser(loginName, loginPassword);

    if (result.error) {
      Alert.alert('Login failed', result.error);
      return false;
    }
    if (!result.accessToken) {
      Alert.alert('Login failed', 'No access token returned from the server.');
      return false;
    }

    await signIn(result.accessToken);
    return true;
  };

  const maybeOfferFaceIdSetup = async (loginName, loginPassword) => {
    if (!biometricsAvailable) return;
    if (savedUsername === loginName) return; // already saved for this user

    Alert.alert(
      'Enable Face ID Login?',
      'Log in faster next time using Face ID instead of typing your password.',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Enable',
          onPress: async () => {
            const ok = await saveCredentials(loginName, loginPassword);
            if (ok) setSavedUsername(loginName);
          },
        },
      ]
    );
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const trimmedName = name.trim();
      const success = await completeLogin(trimmedName, password);
      if (success) {
        await maybeOfferFaceIdSetup(trimmedName, password);
      }
    } catch (e) {
      Alert.alert('Connection error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFaceIdLogin = async () => {
    setFaceIdLoading(true);
    try {
      const creds = await getSavedCredentials();
      if (!creds) {
        // Cancelled or failed Face ID check - not an error, just abandon quietly.
        return;
      }
      await completeLogin(creds.name, creds.password);
    } catch (e) {
      Alert.alert('Connection error', e.message);
    } finally {
      setFaceIdLoading(false);
    }
  };

  return (
    <TexturedBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.title}>MTG Collection</Text>
        <View style={styles.divider} />

        {biometricsAvailable && savedUsername ? (
          <>
            <TouchableOpacity
              style={styles.faceIdBtn}
              onPress={handleFaceIdLogin}
              disabled={faceIdLoading}
            >
              {faceIdLoading ? (
                <ActivityIndicator color={colors.gold} />
              ) : (
                <Text style={styles.faceIdBtnText}>
                  {'\u25C9'} Log In as {savedUsername} with Face ID
                </Text>
              )}
            </TouchableOpacity>
            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.orLine} />
            </View>
          </>
        ) : null}

        <TextInput
          style={[styles.input, nameError ? styles.inputError : null]}
          placeholder="Username"
          placeholderTextColor={colors.parchmentDim}
          autoCapitalize="none"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (nameError) setNameError('');
          }}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}

        <View style={styles.passwordWrap}>
          <TextInput
            ref={passwordRef}
            style={[styles.input, styles.passwordInput, passwordError ? styles.inputError : null]}
            placeholder="Password"
            placeholderTextColor={colors.parchmentDim}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (passwordError) setPasswordError('');
            }}
            returnKeyType="go"
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.toggleBtnText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.parchment} />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Need an account? Register</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TexturedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    fontWeight: '700',
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gold,
    opacity: 0.4,
    width: '40%',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 28,
  },
  faceIdBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  faceIdBtnText: { color: colors.gold, fontSize: 15, fontWeight: '600' },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  orLine: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { color: colors.parchmentDim, fontSize: 12, marginHorizontal: 10 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.parchment,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: { borderColor: colors.error },
  fieldError: { color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 },
  passwordWrap: { position: 'relative', justifyContent: 'center', marginTop: 14 },
  passwordInput: { paddingRight: 60, marginTop: 0 },
  toggleBtn: { position: 'absolute', right: 14 },
  toggleBtnText: { color: colors.gold, fontSize: 13, fontWeight: '600' },
  button: {
    backgroundColor: colors.purple,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  buttonText: { color: colors.parchment, fontSize: 16, fontWeight: '600' },
  link: { color: colors.gold, textAlign: 'center', marginTop: 20, fontSize: 15 },
});
