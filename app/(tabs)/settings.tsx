import '@/global.css';
import { useClerk, useUser } from '@clerk/expo';
import { styled } from 'nativewind';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

const SettingsRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-center justify-between py-3 border-b border-border">
    <Text className="text-sm font-sans-medium text-muted-foreground">{label}</Text>
    <Text className="text-sm font-sans-semibold text-primary" numberOfLines={1}>
      {value}
    </Text>
  </View>
);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();

  const displayName =
    user?.fullName ?? user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? 'Account';
  const email = user?.emailAddresses?.[0]?.emailAddress ?? '';
  const initial = (user?.firstName?.[0] ?? email[0] ?? '?').toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-sans-bold text-primary mb-6">Account</Text>

        {/* Profile card */}
        <View className="rounded-3xl border border-border bg-card p-5 mb-5">
          <View className="items-center mb-5">
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                className="size-20 rounded-full mb-3"
              />
            ) : (
              <View className="size-20 rounded-full bg-accent items-center justify-center mb-3">
                <Text className="text-3xl font-sans-extrabold text-background">
                  {initial}
                </Text>
              </View>
            )}
            <Text className="text-xl font-sans-bold text-primary">{displayName}</Text>
            {email ? (
              <Text className="text-sm font-sans-medium text-muted-foreground mt-1">
                {email}
              </Text>
            ) : null}
          </View>

          <SettingsRow label="Name" value={displayName} />
          <SettingsRow label="Email" value={email || '—'} />
          <SettingsRow
            label="Member since"
            value={
              user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'
            }
          />
          <View className="flex-row items-center justify-between pt-3">
            <Text className="text-sm font-sans-medium text-muted-foreground">
              Account status
            </Text>
            <View className="flex-row items-center gap-1.5">
              <View className="size-2 rounded-full bg-success" />
              <Text className="text-sm font-sans-semibold text-success">Active</Text>
            </View>
          </View>
        </View>

        {/* Sign out */}
        <Pressable
          className="items-center rounded-2xl border border-destructive/30 bg-destructive/10 py-4"
          onPress={() => signOut()}
        >
          <Text className="text-base font-sans-bold text-destructive">Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
