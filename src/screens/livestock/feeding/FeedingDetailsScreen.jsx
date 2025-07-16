import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Box,
  HStack,
  VStack,
  Badge,
  Divider,
  Center,
} from 'native-base';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import { getFeedingProgramById } from '../../../services/feeding';
import { getLivestockForActiveFarm } from '../../../services/livestock';

const FeedingDetailsScreen = ({ navigation, route }) => {
  const { programId } = route.params;
  const [program, setProgram] = useState(null);
  const [livestock, setLivestock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProgramDetails();
  }, [programId]);

  const fetchProgramDetails = async () => {
    try {
      setLoading(true);
      const [programData, livestockData] = await Promise.all([
        getFeedingProgramById(programId),
        getLivestockForActiveFarm(),
      ]);

      setProgram(programData);
      setLivestock(livestockData);
    } catch (error) {
      console.error('Error fetching program details:', error);
      Alert.alert('Error', 'Failed to load program details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProgramDetails();
    setRefreshing(false);
  };

  const getAnimalInfo = (program) => {
    if (!program) return null;

    if (program.programType === 'Single Animal' && program.animalId) {
      const animal = livestock.find(l => l.id === program.animalId);
      return {
        name: animal?.mammal?.idNumber || program.animalId,
        type: program.animalType,
        category: 'Animal',
        details: animal?.mammal,
      };
    } else if (program.programType === 'Group' && program.groupId) {
      const group = livestock.find(l => l.id === program.groupId);
      return {
        name: group?.poultry?.flockId || program.groupId,
        type: program.groupType,
        category: 'Group',
        quantity: group?.poultry?.currentQuantity || group?.poultry?.initialQuantity || 0,
        details: group?.poultry,
      };
    }
    return null;
  };

  const getFeedTypeColor = (feedType) => {
    switch (feedType) {
      case 'Basal Feed Only':
        return COLORS.green2;
      case 'Basal Feed + Concentrates + Supplements':
        return COLORS.lightOrange;
      case 'Concentrates Only':
        return COLORS.primary;
      default:
        return COLORS.gray;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateTotalCost = () => {
    if (!program?.feedDetails) return 0;
    return program.feedDetails.reduce((total, feed) => total + (feed.cost || 0), 0);
  };

  const calculateTotalQuantity = () => {
    if (!program?.feedDetails) return 0;
    return program.feedDetails.reduce((total, feed) => total + (feed.quantity || 0), 0);
  };

  const renderHeader = () => {
    const animalInfo = getAnimalInfo(program);

    return (
      <Box bg="white" borderRadius={16} shadow={2} mb={4} overflow="hidden">
        <Box bg={COLORS.lightGreen} px={4} py={4}>
          <HStack alignItems="center" space={3}>
            <Box bg={getFeedTypeColor(program.feedType)} p={3} borderRadius={12}>
              <Text style={styles.headerIcon}>
                {program.programType === 'Single Animal' ? '🐄' : '🐔'}
              </Text>
            </Box>
            <VStack flex={1}>
              <Text style={styles.headerTitle}>
                {animalInfo?.name || 'Unknown'}
              </Text>
              <HStack alignItems="center" space={2}>
                <Badge
                  bg={program.programType === 'Single Animal' ? COLORS.green2 : '#FF8C00'}
                  borderRadius={12}
                  _text={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                  {program.programType}
                </Badge>
                <Text style={styles.headerSubtitle}>
                  {animalInfo?.type}
                  {animalInfo?.category === 'Group' && ` (${animalInfo.quantity} birds)`}
                </Text>
              </HStack>
            </VStack>
          </HStack>
        </Box>

        <VStack p={4} space={3}>
          <HStack alignItems="center" justifyContent="space-between">
            <Text style={styles.labelText}>Feed Type</Text>
            <Badge
              bg={getFeedTypeColor(program.feedType)}
              borderRadius={12}
              _text={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
              {program.feedType}
            </Badge>
          </HStack>

          <HStack alignItems="center" justifyContent="space-between">
            <Text style={styles.labelText}>Created</Text>
            <Text style={styles.valueText}>{formatDate(program.createdAt)}</Text>
          </HStack>

          <HStack alignItems="center" justifyContent="space-between">
            <Text style={styles.labelText}>Status</Text>
            <HStack alignItems="center" space={2}>
              <Box w={2} h={2} bg={COLORS.green2} borderRadius={1} />
              <Text style={styles.activeText}>Active</Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>
    );
  };

  const renderLifecycleStages = () => {
    const lifecycleStages = program.programType === 'Single Animal'
      ? program.lifecycleStages || []
      : program.groupLifecycleStages || [];

    if (lifecycleStages.length === 0) return null;

    return (
      <Box bg="white" borderRadius={16} shadow={2} mb={4} p={4}>
        <Text style={styles.sectionTitle}>Lifecycle Stages</Text>
        <HStack flexWrap="wrap" space={2} mt={2}>
          {lifecycleStages.map((stage, index) => (
            <Badge
              key={index}
              bg={COLORS.green2}
              borderRadius={8}
              mb={2}
              _text={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
              {stage}
            </Badge>
          ))}
        </HStack>
      </Box>
    );
  };

  const renderFeedingSchedule = () => {
    if (!program.timeOfDay || program.timeOfDay.length === 0) return null;

    return (
      <Box bg="white" borderRadius={16} shadow={2} mb={4} p={4}>
        <Text style={styles.sectionTitle}>Feeding Schedule</Text>
        <VStack space={2} mt={2}>
          {program.timeOfDay.map((time, index) => (
            <HStack key={index} alignItems="center" space={3}>
              <Box bg="#FF8C00" p={2} borderRadius={8}>
                <FastImage
                  source={icons.clock}
                  style={styles.scheduleIcon}
                  tintColor="white"
                />
              </Box>
              <Text style={styles.scheduleText}>{time}</Text>
            </HStack>
          ))}
        </VStack>
      </Box>
    );
  };

  const renderFeedDetails = () => {
    if (!program.feedDetails || program.feedDetails.length === 0) return null;

    return (
      <Box bg="white" borderRadius={16} shadow={2} mb={4} p={4}>
        <Text style={styles.sectionTitle}>Feed Details</Text>
        <VStack space={3} mt={3}>
          {program.feedDetails.map((feed, index) => (
            <Box key={index} bg={COLORS.lightGreen} p={3} borderRadius={12}>
              <HStack alignItems="center" justifyContent="space-between" mb={2}>
                <Text style={styles.feedTypeTitle}>{feed.feedType}</Text>
                <Badge
                  bg={getFeedTypeColor(feed.feedType)}
                  borderRadius={8}
                  _text={{ color: 'white', fontSize: 11, fontWeight: '600' }}>
                  {feed.quantity}kg
                </Badge>
              </HStack>

              <VStack space={1}>
                <HStack alignItems="center" justifyContent="space-between">
                  <Text style={styles.feedDetailLabel}>Source:</Text>
                  <Text style={styles.feedDetailValue}>{feed.source || 'Not specified'}</Text>
                </HStack>

                <HStack alignItems="center" justifyContent="space-between">
                  <Text style={styles.feedDetailLabel}>Schedule:</Text>
                  <Text style={styles.feedDetailValue}>{feed.schedule || 'Not specified'}</Text>
                </HStack>

                <HStack alignItems="center" justifyContent="space-between">
                  <Text style={styles.feedDetailLabel}>Cost:</Text>
                  <Text style={styles.feedDetailValue}>
                    ${feed.cost ? feed.cost.toFixed(2) : '0.00'}
                  </Text>
                </HStack>

                {feed.supplier && (
                  <HStack alignItems="center" justifyContent="space-between">
                    <Text style={styles.feedDetailLabel}>Supplier:</Text>
                    <Text style={styles.feedDetailValue}>{feed.supplier}</Text>
                  </HStack>
                )}

                <HStack alignItems="center" justifyContent="space-between">
                  <Text style={styles.feedDetailLabel}>Date:</Text>
                  <Text style={styles.feedDetailValue}>{formatDate(feed.date)}</Text>
                </HStack>
              </VStack>
            </Box>
          ))}
        </VStack>
      </Box>
    );
  };

  const renderCostSummary = () => {
    const totalCost = calculateTotalCost();
    const totalQuantity = calculateTotalQuantity();

    return (
      <Box bg="white" borderRadius={16} shadow={2} mb={4} p={4}>
        <Text style={styles.sectionTitle}>Cost Summary</Text>
        <VStack space={3} mt={3}>
          <HStack alignItems="center" justifyContent="space-between">
            <Text style={styles.summaryLabel}>Total Quantity:</Text>
            <Text style={styles.summaryValue}>{totalQuantity.toFixed(2)} kg</Text>
          </HStack>

          <HStack alignItems="center" justifyContent="space-between">
            <Text style={styles.summaryLabel}>Total Cost:</Text>
            <Text style={[styles.summaryValue, { color: COLORS.green2, fontWeight: 'bold' }]}>
              ${totalCost.toFixed(2)}
            </Text>
          </HStack>

          <Divider />

          <HStack alignItems="center" justifyContent="space-between">
            <Text style={styles.summaryLabel}>Cost per kg:</Text>
            <Text style={styles.summaryValue}>
              ${totalQuantity > 0 ? (totalCost / totalQuantity).toFixed(2) : '0.00'}
            </Text>
          </HStack>
        </VStack>
      </Box>
    );
  };

  const renderNotes = () => {
    if (!program.notes) return null;

    return (
      <Box bg="white" borderRadius={16} shadow={2} mb={4} p={4}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Text style={styles.notesText}>{program.notes}</Text>
      </Box>
    );
  };

  const renderActionButtons = () => (
    <Box bg="white" borderRadius={16} shadow={2} mb={4} p={4}>
      <HStack space={3}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.green }]}
          onPress={() => navigation.navigate('EditFeedingRequirementScreen', { programId: program.id })}>
          <FastImage source={icons.edit} style={styles.actionIcon} tintColor="white" />
          <Text style={styles.actionButtonText}>Edit Program</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.red }]}
          onPress={() => navigation.navigate('FeedingRecordScreen', { programId: program.id })}>
          <FastImage source={icons.add} style={styles.actionIcon} tintColor="white" />
          <Text style={styles.actionButtonText}>Delete Feed</Text>
        </TouchableOpacity>
      </HStack>
    </Box>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader
          title="Program Details"
          onBackPress={() => navigation.goBack()}
          backgroundColor={COLORS.lightGreen}
        />
        <Center flex={1}>
          <ActivityIndicator size="large" color={COLORS.green2} />
          <Text style={styles.loadingText}>Loading program details...</Text>
        </Center>
      </SafeAreaView>
    );
  }

  if (!program) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader
          title="Program Details"
          onBackPress={() => navigation.goBack()}
          backgroundColor={COLORS.lightGreen}
        />
        <Center flex={1}>
          <Text style={styles.errorText}>Program not found</Text>
        </Center>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Program Details"
        onBackPress={() => navigation.goBack()}
        backgroundColor={COLORS.lightGreen}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>

        {renderHeader()}
        {renderLifecycleStages()}
        {renderFeedingSchedule()}
        {renderFeedDetails()}
        {renderCostSummary()}
        {renderNotes()}
        {renderActionButtons()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  activeText: {
    fontSize: 12,
    color: COLORS.green2,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  scheduleIcon: {
    width: 16,
    height: 16,
  },
  scheduleText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  feedTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  feedDetailLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  feedDetailValue: {
    fontSize: 12,
    color: COLORS.black,
    fontWeight: '500',
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
  },
  actionIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default FeedingDetailsScreen;