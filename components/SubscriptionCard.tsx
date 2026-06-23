import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from '@/lib/utils';
import clsx from 'clsx';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import SubscriptionSubRowCard from './SubscriptionSubRowCard';

const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  category,
  plan,
  renewalDate,
  expanded,
  onPress,
  paymentMethod,
  startDate,
  status,
}: SubscriptionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={clsx('sub-card', expanded ? 'sub-card-expanded' : 'bg-card')}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image source={icon} className="sub-icon" />
          <View className="sub-copy">
            <Text numberOfLines={1} className="sub-title">
              {name}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate ? formatSubscriptionDateTime(renewalDate) : '')}
            </Text>
          </View>
        </View>
        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </View>
      {expanded && (
        <View className="sub-bdy">
          <View className="sub-details">
            <SubscriptionSubRowCard
              label="Payment:"
              value={paymentMethod ? paymentMethod.trim() : ''}
            />

            <SubscriptionSubRowCard
              label="Started:"
              value={startDate ? formatSubscriptionDateTime(startDate) : ''}
            />
            <SubscriptionSubRowCard
              label="Renewal date:"
              value={renewalDate ? formatSubscriptionDateTime(renewalDate) : ''}
            />
            <SubscriptionSubRowCard
              label="Status:"
              value={status ? formatStatusLabel(status) : ''}
            />
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default SubscriptionCard;
