import React from "react";
import { StyleSheet, View, ScrollView, Dimensions } from "react-native";
import { Text, Card } from "react-native-paper";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 80;
const MAX_BAR_HEIGHT = 200;

// Mock data - in a real app, this would come from storage/API
const lifetimeStats = {
  totalGoodPosture: 125000, // seconds
  totalBadPosture: 45000, // seconds
  totalSessions: 12,
};

const sessionData = [
  { date: "2024-01-15", good: 7200, bad: 1800 },
  { date: "2024-01-16", good: 8100, bad: 900 },
  { date: "2024-01-17", good: 5400, bad: 3600 },
  { date: "2024-01-18", good: 9000, bad: 0 },
  { date: "2024-01-19", good: 6300, bad: 2700 },
  { date: "2024-01-20", good: 7200, bad: 1800 },
  { date: "2024-01-21", good: 8100, bad: 900 },
];

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
};

const BarChart = ({ data }: { data: typeof sessionData }) => {
  const maxValue = Math.max(
    ...data.map((d) => d.good + d.bad)
  );

  return (
    <View style={styles.chartContainer}>
      <Text variant="titleMedium" style={styles.chartTitle}>
        Últimas 7 sesiones
      </Text>
      <View style={styles.chart}>
        {data.map((session, index) => {
          const total = session.good + session.bad;
          const goodHeight = (session.good / maxValue) * MAX_BAR_HEIGHT;
          const badHeight = (session.bad / maxValue) * MAX_BAR_HEIGHT;
          const totalHeight = goodHeight + badHeight;

          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    styles.goodBar,
                    { height: goodHeight },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    styles.badBar,
                    { height: badHeight },
                  ]}
                />
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>
                {formatDate(session.date)}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.goodBar]} />
          <Text style={styles.legendText}>Buena postura</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.badBar]} />
          <Text style={styles.legendText}>Mala postura</Text>
        </View>
      </View>
    </View>
  );
};

export default function Statistics() {
  const totalTime = lifetimeStats.totalGoodPosture + lifetimeStats.totalBadPosture;
  const goodPercentage = Math.round(
    (lifetimeStats.totalGoodPosture / totalTime) * 100
  );
  const badPercentage = Math.round(
    (lifetimeStats.totalBadPosture / totalTime) * 100
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Estadísticas
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Tiempo total
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={styles.statValue}>
                  {formatTime(lifetimeStats.totalGoodPosture)}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Buena postura
                </Text>
                <Text variant="bodySmall" style={styles.statPercentage}>
                  {goodPercentage}%
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={[styles.statValue, styles.badValue]}>
                  {formatTime(lifetimeStats.totalBadPosture)}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Mala postura
                </Text>
                <Text variant="bodySmall" style={[styles.statPercentage, styles.badPercentage]}>
                  {badPercentage}%
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Resumen
            </Text>
            <View style={styles.summaryRow}>
              <Text variant="bodyLarge">Total de sesiones:</Text>
              <Text variant="bodyLarge" style={styles.summaryValue}>
                {lifetimeStats.totalSessions}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyLarge">Tiempo total:</Text>
              <Text variant="bodyLarge" style={styles.summaryValue}>
                {formatTime(totalTime)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <BarChart data={sessionData} />
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f1f6",
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 24,
    fontWeight: "bold",
  },
  card: {
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontWeight: "bold",
    color: "#81c784",
    marginBottom: 4,
  },
  badValue: {
    color: "#e57373",
  },
  statLabel: {
    color: "#666",
    marginBottom: 4,
  },
  statPercentage: {
    color: "#81c784",
    fontWeight: "600",
  },
  badPercentage: {
    color: "#e57373",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryValue: {
    fontWeight: "600",
  },
  chartContainer: {
    marginTop: 8,
  },
  chartTitle: {
    marginBottom: 16,
    fontWeight: "600",
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: MAX_BAR_HEIGHT + 40,
    justifyContent: "space-between",
    marginBottom: 16,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 2,
  },
  barWrapper: {
    width: "100%",
    height: MAX_BAR_HEIGHT,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  bar: {
    width: "100%",
    minHeight: 2,
  },
  goodBar: {
    backgroundColor: "#81c784",
  },
  badBar: {
    backgroundColor: "#e57373",
  },
  barLabel: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
});

