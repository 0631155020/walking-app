import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { useActivityPermissions, openAppSettings } from '../lib/useActivityPermissions';

const DailyStepsWidget = () => {
  // This component ONLY needs the pedometer permission.
  // The new hook returns activityStatus and locationStatus separately.
  const { activityStatus, requestPermissionsAsync } = useActivityPermissions({ pedometer: true });
  const [stepCount, setStepCount] = useState(0);

  useEffect(() => {
    const fetchStepCount = async () => {
      // We now check the specific activityStatus
      if (activityStatus === 'granted') {
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0); // Midnight

        try {
          const result = await Pedometer.getStepCountAsync(start, end);
          setStepCount(result.steps);
        } catch (error) {
          console.error("Failed to get step count:", error);
        }
      }
    };

    fetchStepCount();
    // Refresh the step count every minute
    const interval = setInterval(fetchStepCount, 60000);

    return () => clearInterval(interval);
  }, [activityStatus]); // The effect depends on the activityStatus

  const handlePermissionRequest = () => {
      if (activityStatus === 'denied') {
          // If denied, the prompt won't show again. Guide user to settings.
          openAppSettings();
      } else {
          requestPermissionsAsync();
      }
  }

  const renderContent = () => {
    // The switch now uses the specific activityStatus
    switch (activityStatus) {
      case 'granted':
        return <Text style={styles.text}>Сегодня пройдено: {stepCount} шагов</Text>;
      case 'denied':
        return (
          <View style={styles.centered}>
            <Text style={styles.text}>Permission for Physical Activity is denied.</Text>
            <Text style={styles.subText}>Step counting requires this permission. Please enable it in your phone settings.</Text>
            <Button title="Open Settings" onPress={handlePermissionRequest} />
          </View>
        );
      default: // 'undetermined'
        return (
           <View style={styles.centered}>
             <Text style={styles.text}>Track your daily steps</Text>
             <Button title="Enable Step Counter" onPress={handlePermissionRequest} />
           </View>
        );
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  }
});

export default DailyStepsWidget;
