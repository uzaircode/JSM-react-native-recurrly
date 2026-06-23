import '@/global.css';
import { useSignIn } from '@clerk/expo';
import clsx from 'clsx';
import { type Href, Link, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [localErrors, setLocalErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = 'Email is required.';
    else if (!EMAIL_RE.test(email)) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setLocalErrors({});

    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) return;

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl('/');
          if (url.startsWith('http')) return;
          router.replace('/(tabs)' as Href);
        },
      });
    } else if (
      signIn.status === 'needs_client_trust' ||
      signIn.status === 'needs_second_factor'
    ) {
      const emailFactor = signIn.supportedSecondFactors?.find(
        (f) => f.strategy === 'email_code',
      );
      if (emailFactor) await signIn.mfa.sendEmailCode();
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });
    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl('/');
          if (url.startsWith('http')) return;
          router.replace('/(tabs)' as Href);
        },
      });
    }
  };

  const isMfaStep =
    signIn.status === 'needs_client_trust' ||
    signIn.status === 'needs_second_factor';
  const isLoading = fetchStatus === 'fetching';

  if (isMfaStep) {
    return (
      <SafeAreaView className="auth-safe-area">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            className="auth-scroll"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="auth-content">
              <View className="auth-brand-block">
                <View className="auth-logo-wrap">
                  <View className="auth-logo-mark">
                    <Text className="auth-logo-mark-text">R</Text>
                  </View>
                  <View>
                    <Text className="auth-wordmark">Recurly</Text>
                    <Text className="auth-wordmark-sub mt-1">
                      Smart Billing
                    </Text>
                  </View>
                </View>
              </View>

              <Text className="auth-title">Verify your identity</Text>
              <Text className="auth-subtitle">
                We sent a verification code to your email address.
              </Text>

              <View className="auth-card">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className={clsx(
                        'auth-input',
                        errors.fields.code && 'auth-input-error',
                      )}
                      value={code}
                      onChangeText={setCode}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                    />
                    {errors.fields.code && (
                      <Text className="auth-error">
                        {errors.fields.code.message}
                      </Text>
                    )}
                  </View>

                  <Pressable
                    className={clsx(
                      'auth-button',
                      (isLoading || !code) && 'auth-button-disabled',
                    )}
                    onPress={handleVerify}
                    disabled={isLoading || !code}
                  >
                    <Text className="auth-button-text">Verify</Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signIn.mfa.sendEmailCode()}
                    disabled={isLoading}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend code
                    </Text>
                  </Pressable>
                </View>

                <View className="auth-link-row">
                  <Pressable onPress={() => signIn.reset()}>
                    <Text className="auth-link">Start over</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="auth-content">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View className="gap-1">
                  <Text className="auth-wordmark">Recurly</Text>
                  <Text className="auth-wordmark-sub">Smart Billing</Text>
                </View>
              </View>
            </View>

            <Text className="auth-title">Welcome back</Text>
            <Text className="auth-subtitle">
              Sign in to continue managing your subscriptions
            </Text>

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={clsx(
                      'auth-input',
                      (localErrors.email || errors.fields.identifier) &&
                        'auth-input-error',
                    )}
                    value={email}
                    onChangeText={(v) => {
                      setEmail(v);
                      if (localErrors.email)
                        setLocalErrors((e) => ({ ...e, email: undefined }));
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    textContentType="emailAddress"
                  />
                  {(localErrors.email || errors.fields.identifier) && (
                    <Text className="auth-error">
                      {localErrors.email || errors.fields.identifier?.message}
                    </Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <View className="relative">
                    <TextInput
                      className={clsx(
                        'auth-input',
                        (localErrors.password || errors.fields.password) &&
                          'auth-input-error',
                      )}
                      value={password}
                      onChangeText={(v) => {
                        setPassword(v);
                        if (localErrors.password)
                          setLocalErrors((e) => ({
                            ...e,
                            password: undefined,
                          }));
                      }}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      secureTextEntry={!showPassword}
                      autoComplete="current-password"
                      textContentType="password"
                    />
                    <Pressable
                      onPress={() => setShowPassword((v) => !v)}
                      style={{
                        position: 'absolute',
                        right: 16,
                        top: 0,
                        bottom: 0,
                        justifyContent: 'center',
                      }}
                    >
                      <Text className="auth-helper">
                        {showPassword ? 'Hide' : 'Show'}
                      </Text>
                    </Pressable>
                  </View>
                  {(localErrors.password || errors.fields.password) && (
                    <Text className="auth-error">
                      {localErrors.password || errors.fields.password?.message}
                    </Text>
                  )}
                </View>

                {errors.global && errors.global.length > 0 && (
                  <Text className="auth-error">{errors.global[0].message}</Text>
                )}

                <Pressable
                  className={clsx(
                    'auth-button',
                    (!email || !password || isLoading) &&
                      'auth-button-disabled',
                  )}
                  onPress={handleSignIn}
                  disabled={!email || !password || isLoading}
                >
                  <Text className="auth-button-text">
                    {isLoading ? 'Signing in…' : 'Sign in'}
                  </Text>
                </Pressable>
              </View>

              <View className="auth-link-row">
                <Text className="auth-link-copy">New to Recurly?</Text>
                <Link href="/(auth)/sign-up" asChild>
                  <Pressable>
                    <Text className="auth-link"> Create an account</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
