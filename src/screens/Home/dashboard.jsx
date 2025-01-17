import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const FarmDashboard = () => {
    const cards = [
        {
          title: 'Production Analysis',
          details: ['Total Animal: 200', 'Cows: 100', 'Dairy: 100'],
          colors: ['#F4EBD0', '#4C7153'], 
        },
        {
          title: 'Sales Data',
          details: ['Milk Yield: 200ML', 'Animal sold: 100', 'Feeds Purchased: 10KG'],
          colors: ['#D79F91', '#4C7153'], 
        },
        {
          title: 'Employees',
          details: ['Total: 20', 'Exits: 2'],
          colors: ['#91D79E', '#4C7153'], 
        },
        {
          title: 'Feeds',
          details: ['Feeds available: 10KG', 'Feeds Purchased: 10KG'],
          colors: ['#CBD18F', '#4C7153'], 
        },
        {
          title: 'Animals',
          details: ['Total Animal: 200', 'Flocks: 100'],
          colors: ['#BD91D7', '#4C7153'], 
        },
        {
          title: 'Breeding',
          details: ['Total Animal: 50', 'Young ones: 52'],
          colors: ['#CDD9CD', '#4C7153'], 
        },
      ];

  const renderCard = ({ title, details, colors }) => (
    <LinearGradient colors={colors} style={styles.card} key={title}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        {details.map((detail, index) => (
          <Text key={index} style={styles.cardDetail}>
            {detail}
          </Text>
        ))}
      </View>
      <Icon name="plus-circle-outline" size={24} style={styles.plusIcon} color="#fff" />
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="cog" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.headerTitle}>Hello, John!</Text>

        {/* Welcome Banner */}
        <LinearGradient colors={['#8CD18C', '#8CD18C']} style={styles.welcomeBanner}>
          <View>
            <Text style={styles.welcomeTitle}>Welcome to Xpert Farmers</Text>
            <Text style={styles.welcomeSubtitle}>
              Cultivating Success,{'\n'}Harvesting Excellence,{'\n'}Nurturing Tomorrow
            </Text>
          </View>
          <TouchableOpacity style={styles.seeMoreButton}>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Farm Overview */}
        <View style={styles.overviewSection}>
          <Text style={styles.overviewTitle}>Farm Overview</Text>
          <TouchableOpacity style={styles.monthSelector}>
            <Text style={styles.monthText}>This month</Text>
            <Icon name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Cards Grid */}
        <View style={styles.cardsGrid}>{cards.map(renderCard)}</View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: StatusBar.currentHeight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 0,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  welcomeBanner: {
    margin: 16,
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  seeMoreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 50,
  },
  seeMoreText: {
    color: '#fff',
    fontWeight: '500',
  },
  overviewSection: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  monthText: {
    marginRight: 4,
    color: '#666',
  },
  cardsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    minHeight: 140,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardDetail: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 4,
  },
  plusIcon: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
});

export default FarmDashboard;
