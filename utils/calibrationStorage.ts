import * as FileSystem from 'expo-file-system/legacy';

const CALIBRATION_FILE = `${FileSystem.documentDirectory}calibration.json`;

export interface CalibrationData {
  baselineAngle: number; // The "good posture" reference angle
  thresholdAngle: number; // Angle threshold for bad posture (default: 20)
  calibratedAt: string; // ISO timestamp of when calibration was done
}

export async function loadCalibration(): Promise<CalibrationData | null> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(CALIBRATION_FILE);
    if (!fileInfo.exists) {
      return null;
    }
    
    const content = await FileSystem.readAsStringAsync(CALIBRATION_FILE);
    return JSON.parse(content) as CalibrationData;
  } catch (error) {
    console.error('Error loading calibration:', error);
    return null;
  }
}

export async function saveCalibration(data: CalibrationData): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(
      CALIBRATION_FILE, 
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    console.error('Error saving calibration:', error);
  }
}

export async function clearCalibration(): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(CALIBRATION_FILE);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(CALIBRATION_FILE);
    }
  } catch (error) {
    console.error('Error clearing calibration:', error);
  }
}