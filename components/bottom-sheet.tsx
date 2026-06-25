import { X } from "lucide-react-native";
import { useEffect, useState, type ReactNode } from "react";
import { Dimensions, Keyboard, Modal, Platform } from "react-native";

import { Pressable, ScrollView, Text, View } from "./tw";

const WINDOW_HEIGHT = Dimensions.get("window").height;

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  // Track the keyboard height and lift the sheet by that amount. This is more
  // reliable than KeyboardAvoidingView inside a transparent Modal (which the
  // Android window's adjustResize does not affect).
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) setKeyboardHeight(0);
  }, [visible]);

  const maxSheetHeight = Math.max(220, WINDOW_HEIGHT * 0.85 - keyboardHeight);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={{ flex: 1 }}>
        <Pressable
          onPress={onClose}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
        />
        {/* Solid white sheet, lifted above the keyboard */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            marginBottom: keyboardHeight,
          }}
        >
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
            <Text className="text-[17px] font-bold text-brand-ink">{title}</Text>
            <Pressable
              accessibilityRole="button"
              className="h-8 w-8 items-center justify-center rounded-full bg-brand-mist active:opacity-70"
              onPress={onClose}
            >
              <X color="#263238" size={16} strokeWidth={2} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerClassName="px-5 pb-8 gap-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: maxSheetHeight }}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
