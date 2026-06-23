import '@/global.css';
import { useSignUp } from '@clerk/expo';
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

interface LocalErrors {
  email?: string;
  password?: string;
}

export default function SignUp() {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [localErrors, setLocalErrors] = useState<LocalErrors>({});

  const validate = () => {
    const errs: LocalErrors = {};
    if (!email) errs.email = 'Email is required.';
    else if (!EMAIL_RE.test(email)) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 8)
      errs.password = 'Password must be at least 8 characters.';
    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLocalErrors({});

    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) return;

    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl('/');
          if (url.startsWith('http')) return;
          router.replace('/(tabs)' as Href);
        },
      });
    }
  };

  const isVerificationStep =
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0;

  const isLoading = fetchStatus === 'fetching';

  if (isVerificationStep) {
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
                    <Text className="auth-wordmark-sub">Smart Billing</Text>
                  </View>
                </View>
              </View>

              <Text className="auth-title">Verify your email</Text>
              <Text className="auth-subtitle">
                We sent a 6-digit code to {email}. Enter it below to confirm
                your account.
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

                  {errors.global && errors.global.length > 0 && (
                    <Text className="auth-error">
                      {errors.global[0].message}
                    </Text>
                  )}

                  <Pressable
                    className={clsx(
                      'auth-button',
                      (isLoading || !code) && 'auth-button-disabled',
                    )}
                    onPress={handleVerify}
                    disabled={isLoading || !code}
                  >
                    <Text className="auth-button-text">
                      {isLoading ? 'Verifying…' : 'Verify email'}
                    </Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signUp.verifications.sendEmailCode()}
                    disabled={isLoading}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend code
                    </Text>
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

            <Text className="auth-title">Create your account</Text>
            <Text className="auth-subtitle">
              Start tracking and managing your subscriptions
            </Text>

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={clsx(
                      'auth-input',
                      (localErrors.email || errors.fields.emailAddress) &&
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
                  {(localErrors.email || errors.fields.emailAddress) && (
                    <Text className="auth-error">
                      {localErrors.email || errors.fields.emailAddress?.message}
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
                      placeholder="Min. 8 characters"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      secureTextEntry={!showPassword}
                      autoComplete="new-password"
                      textContentType="newPassword"
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
                  onPress={handleSignUp}
                  disabled={!email || !password || isLoading}
                >
                  <Text className="auth-button-text">
                    {isLoading ? 'Creating account…' : 'Create account'}
                  </Text>
                </Pressable>
              </View>

              <View className="auth-link-row">
                <Text className="auth-link-copy">
                  Already have a Recurly account?
                </Text>
                <Link href="/(auth)/sign-in" asChild>
                  <Pressable>
                    <Text className="auth-link"> Sign in</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>

          {/* Required for Clerk bot sign-up protection */}
          <View nativeID="clerk-captcha" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
