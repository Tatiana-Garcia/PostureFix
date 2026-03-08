import * as FileSystem from 'expo-file-system';

const SESSION_DATA_FILE = `${FileSystem.documentDirectory}session_data.txt`;

export interface SessionData {
  date: string;
  rectoSeconds: number;
  encorvadoSeconds: number;
}

export interface AllSessionsData {
  totalRectoSeconds: number;
  totalEncorvadoSeconds: number;
  sessions: SessionData[];
}

// Load all session data from text file
export async function loadSessionData(): Promise<AllSessionsData> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(SESSION_DATA_FILE);
    if (!fileInfo.exists) {
      return { totalRectoSeconds: 0, totalEncorvadoSeconds: 0, sessions: [] };
    }
    
    const content = await FileSystem.readAsStringAsync(SESSION_DATA_FILE);
    return JSON.parse(content) as AllSessionsData;
  } catch (error) {
    console.error('Error loading session data:', error);
    return { totalRectoSeconds: 0, totalEncorvadoSeconds: 0, sessions: [] };
  }
}

// Save a new session to the text file
export async function saveSession(rectoSeconds: number, encorvadoSeconds: number): Promise<void> {
  try {
    const allData = await loadSessionData();
    
    // Update totals
    allData.totalRectoSeconds += rectoSeconds;
    allData.totalEncorvadoSeconds += encorvadoSeconds;
    
    // Add new session
    const newSession: SessionData = {
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      rectoSeconds,
      encorvadoSeconds,
    };
    
    allData.sessions.push(newSession);
    
    // Keep only the last 7 sessions for the graph
    if (allData.sessions.length > 7) {
      allData.sessions = allData.sessions.slice(-7);
    }
    
    // Save as JSON text file
    await FileSystem.writeAsStringAsync(SESSION_DATA_FILE, JSON.stringify(allData, null, 2));
  } catch (error) {
    console.error('Error saving session data:', error);
  }
}

// Get statistics from all sessions
export async function getStatistics(): Promise<{
  totalGoodPosture: number;
  totalBadPosture: number;
  totalSessions: number;
  recentSessions: SessionData[];
}> {
  const allData = await loadSessionData();
  
  return {
    totalGoodPosture: allData.totalRectoSeconds,
    totalBadPosture: allData.totalEncorvadoSeconds,
    totalSessions: allData.sessions.length,
    recentSessions: allData.sessions,
  };
}


