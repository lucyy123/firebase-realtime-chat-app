import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Text, 
  Alert, 
  AppState, 
  AppStateStatus, 
  Linking
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
// import { captureException } from '@/utils/error-handling'; // Your error reporting utility

interface CameraComponentProps {
  onImageCaptured: (uri: string) => void;
  onClose: () => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ 
  onImageCaptured, 
  onClose 
}) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const appState = useRef(AppState.currentState);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);



  const openSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      // captureException(error, 'Failed to open settings');
      Alert.alert('Error', 'Could not open system settings');
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // Resume camera when returning to app
      cameraRef.current?.resumePreview();
    }
    appState.current = nextAppState;
  };

  // Handle camera permissions
  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          {permission.canAskAgain 
            ? 'We need access to your camera to take photos'
            : 'Please enable camera access in settings'}
        </Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={permission.canAskAgain ? requestPermission : openSettings}
          disabled={!permission.canAskAgain}
        >
          <Text style={styles.buttonText}>
            {permission.canAskAgain ? 'Grant Permission' : 'Open Settings'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }


  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;
    
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: true,
        exif: false,
      });

      if (!photo?.uri) {
        throw new Error('Failed to capture image');
      }

      onImageCaptured(photo?.uri);
      onClose();
    } catch (error) {
      // captureException(error, 'Camera capture failed');
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => 
      current === 'back' ? 'front' :'back'
    );
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={false}
        mode="picture"
        isActive={!isCapturing}
      >
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={onClose}
            disabled={isCapturing}
          >
            <Ionicons name="close" size={32} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.captureButton, isCapturing && styles.disabledButton]}
            onPress={takePicture}
            disabled={isCapturing}
          >
            <View style={styles.captureInner} />
            {isCapturing && <View style={styles.captureOverlay} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleCameraFacing}
            disabled={isCapturing}
          >
            <Ionicons name="camera-reverse" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  controls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 32,
  },
  controlButton: {
    padding: 16,
    opacity: 1,
  },
  captureButton: {
    borderWidth: 4,
    borderColor: 'white',
    borderRadius: 50,
    padding: 8,
    position: 'relative',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
  },
  captureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 32,
  },
  disabledButton: {
    opacity: 0.5,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'black',
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    minWidth: 160,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  }
});

export default React.memo(CameraComponent);