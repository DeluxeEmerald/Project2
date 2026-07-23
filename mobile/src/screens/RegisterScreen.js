import React, { useRef, useState } from 'react';
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
import { registerUser } from '../api';
import { colors, fonts } from '../theme';
import TexturedBackground from '../components/TexturedBackground';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const validate = () => {
    let ok = true;

    if (!name.trim()) {
      setNameError('Username is required.');
      ok = false;
    } else {
      setNameError('');
    }

    if (!email.trim()) {
      setEmailError('Email is required.');
      ok = false;
    } else if (!EMAIL_RE.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      ok = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required.');
      ok = false;
    } else if (password.length < 6) {
      setPasswordError('Password should be at least 6 characters.');
      ok = false;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password.');
      ok = false;
    } else if (password && confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match.');
      ok = false;
    } else {
      setConfirmPasswordError('');
    }

    return ok;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await registerUser(name.trim(), email.trim(), password);

      if (result.error) {
        Alert.alert('Registration failed', result.error);
        return;
      }
      if (result.id === -1 || result.id === '-1') {
        Alert.alert('Registration failed', 'Something went wrong creating your account.');
        return;
      }

      Alert.alert('Account created', 'You can now log in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e) {
      Alert.alert('Connection error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TexturedBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.title}>Create Account</Text>
        <View style={styles.divider} />

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
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}

        <TextInput
          ref={emailRef}
          style={[styles.input, styles.spaced, emailError ? styles.inputError : null]}
          placeholder="Email"
          placeholderTextColor={colors.parchmentDim}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (emailError) setEmailError('');
          }}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

        <View style={[styles.passwordWrap, styles.spaced]}>
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
              // Re-check the match as soon as this changes, so a stale
              // "Passwords do not match" doesn't linger after a fix.
              if (confirmPasswordError && confirmPassword && t === confirmPassword) {
                setConfirmPasswordError('');
              }
            }}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
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

        <View style={[styles.passwordWrap, styles.spaced]}>
          <TextInput
            ref={confirmPasswordRef}
            style={[
              styles.input,
              styles.passwordInput,
              confirmPasswordError ? styles.inputError : null,
            ]}
            placeholder="Confirm Password"
            placeholderTextColor={colors.parchmentDim}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (confirmPasswordError && t === password) {
                setConfirmPasswordError('');
              }
            }}
            returnKeyType="go"
            onSubmitEditing={handleRegister}
          />
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setShowConfirmPassword((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.toggleBtnText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        {confirmPasswordError ? (
          <Text style={styles.fieldError}>{confirmPasswordError}</Text>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.parchment} />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Log In</Text>
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
    fontSize: 30,
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
    marginBottom: 32,
  },
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
  spaced: { marginTop: 14 },
  inputError: { borderColor: colors.error },
  fieldError: { color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 },
  passwordWrap: { position: 'relative', justifyContent: 'center' },
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
