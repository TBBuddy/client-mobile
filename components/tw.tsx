import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import {
  Pressable as NativePressable,
  ScrollView as NativeScrollView,
  Text as NativeText,
  View as NativeView,
} from 'react-native';
import { useCssElement } from 'react-native-css';

type ClassNameProp = { className?: string };

export function View(props: React.ComponentProps<typeof NativeView> & ClassNameProp) {
  return useCssElement(NativeView, props, { className: 'style' });
}

export function Text(props: React.ComponentProps<typeof NativeText> & ClassNameProp) {
  return useCssElement(NativeText, props, { className: 'style' });
}

export function Pressable(props: React.ComponentProps<typeof NativePressable> & ClassNameProp) {
  return useCssElement(NativePressable, props, { className: 'style' });
}

export function ScrollView(
  props: React.ComponentProps<typeof NativeScrollView> &
    ClassNameProp & { contentContainerClassName?: string },
) {
  return useCssElement(NativeScrollView, props, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  });
}

export function Image(props: React.ComponentProps<typeof ExpoImage> & ClassNameProp) {
  return useCssElement(ExpoImage, props, { className: 'style' });
}
