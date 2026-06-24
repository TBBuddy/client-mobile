import { Map } from 'lucide-react-native';
import { Component, type ReactNode } from 'react';
import { View } from 'react-native';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

export class MapErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <View
            style={{
              flex: 1,
              borderRadius: 24,
              backgroundColor: '#f2efe9',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Map color="#263238" size={28} strokeWidth={1.5} style={{ opacity: 0.25 }} />
          </View>
        )
      );
    }
    return this.props.children;
  }
}
