import { useState, useEffect, useCallback } from 'react';
import { Pedometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { Linking, AppState } from 'react-native';

type PermissionStatus = Location.PermissionStatus; // Can be: 'granted' | 'denied' | 'undetermined'

interface UseActivityPermissionsOptions {
  pedometer?: boolean;
  location?: boolean;
}

// Helper to open app settings, will be used in components
export const openAppSettings = () => {
  Linking.openSettings();
};

export const useActivityPermissions = (options: UseActivityPermissionsOptions) => {
  const [activityStatus, setActivityStatus] = useState<PermissionStatus>('undetermined');
  const [locationStatus, setLocationStatus] = useState<PermissionStatus>('undetermined');

  const checkPermissions = useCallback(async () => {
    if (options.pedometer) {
      const { status } = await Pedometer.getPermissionsAsync();
      setActivityStatus(status);
    } else {
      // If the component using this hook doesn't need this permission, treat it as granted.
      setActivityStatus('granted');
    }

    if (options.location) {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationStatus(status);
    } else {
       // If the component using this hook doesn't need this permission, treat it as granted.
      setLocationStatus('granted');
    }
  }, [options.pedometer, options.location]);

  useEffect(() => {
    checkPermissions();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
            checkPermissions();
        }
    });

    return () => {
        subscription.remove();
    };
  }, [checkPermissions]);

  const requestPermissionsAsync = async () => {
    // Request all permissions that this instance of the hook is configured for
    if (options.pedometer) {
      await Pedometer.requestPermissionsAsync();
    }
    if (options.location) {
      await Location.requestForegroundPermissionsAsync();
    }

    // After attempting to get permissions, re-check the latest status from the OS
    await checkPermissions();
  };

  return { activityStatus, locationStatus, requestPermissionsAsync };
};
