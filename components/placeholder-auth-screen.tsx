import { ScrollView, Text, View } from './tw';

type PlaceholderAuthScreenProps = {
  title: string;
  description: string;
};

export function PlaceholderAuthScreen({ title, description }: PlaceholderAuthScreenProps) {
  return (
    <ScrollView
      className="flex-1 bg-brand-mist"
      contentContainerClassName="flex-grow items-center justify-center gap-3 px-8 py-12"
      contentInsetAdjustmentBehavior="automatic">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-aqua">
        <Text className="text-[32px] font-extrabold text-brand-ink">T</Text>
      </View>
      <Text className="text-center text-[30px] font-extrabold text-brand-ink" selectable>
        {title}
      </Text>
      <Text className="max-w-[320px] text-center text-[16px] leading-6 text-brand-ink" selectable>
        {description}
      </Text>
    </ScrollView>
  );
}
