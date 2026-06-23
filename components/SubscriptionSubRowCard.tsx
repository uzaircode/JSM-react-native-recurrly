import { Text, View } from 'react-native';

type Props = {
  label: string;
  value: string;
  children?: React.ReactNode;
};

const SubscriptionSubRowCard = ({ label, value, children }: Props) => {
  return (
    <View className="sub-row">
      <View className="sub-row-copy">
        <Text className="sub-label">{label}</Text>
        <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
          {children ?? value ?? ''}
        </Text>
      </View>
    </View>
  );
};

export default SubscriptionSubRowCard;
