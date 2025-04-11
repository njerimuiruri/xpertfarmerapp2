import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {icons} from '../../../constants';
import {COLORS} from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';

const FeedingDetailsScreen = ({route, navigation}) => {
  const {feedingData} = route.params;
  const [activeTab, setActiveTab] = useState('overview');

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Basic Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Animal Type:</Text>
          <Text style={styles.infoValue}>{feedingData.animalType}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Feed Name:</Text>
          <Text style={styles.infoValue}>{feedingData.feedName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Frequency:</Text>
          <Text style={styles.infoValue}>{feedingData.frequency}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Amount:</Text>
          <Text style={styles.infoValue}>{feedingData.amount}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Schedule Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Fed:</Text>
          <Text style={styles.infoValue}>{formatDate(feedingData.lastFed)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Next Feeding:</Text>
          <Text style={styles.infoValue}>{formatDate(feedingData.nextFeeding)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Time of Day:</Text>
          <View style={styles.timeSlotContainer}>
            {feedingData.timeOfDay.map(time => (
              <View key={time} style={styles.timeChip}>
                <Text style={styles.timeChipText}>{time}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const renderDetailsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Program Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Program Type:</Text>
          <Text style={styles.infoValue}>
            {feedingData.id ? 'Single Animal' : 'Group'}
          </Text>
        </View>
        {feedingData.id ? (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Animal ID:</Text>
              <Text style={styles.infoValue}>{feedingData.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lifecycle Stage:</Text>
              <View style={styles.chipContainer}>
                {feedingData.lifecycleStages?.map(stage => (
                  <View key={stage} style={styles.chip}>
                    <Text style={styles.chipText}>{stage}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Group ID:</Text>
              <Text style={styles.infoValue}>{feedingData.groupId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Group Lifecycle:</Text>
              <View style={styles.chipContainer}>
                {feedingData.groupLifecycleStages?.map(stage => (
                  <View key={stage} style={styles.chip}>
                    <Text style={styles.chipText}>{stage}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Feed Type Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Feed Type Category:</Text>
          <Text style={styles.infoValue}>{feedingData.feedTypeCategory || 'Basal Feeds'}</Text>
        </View>
      </View>
    </View>
  );

  const renderFeedDetailsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Basal Feed</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Feed Type:</Text>
          <Text style={styles.infoValue}>{feedingData.basal?.feedType || 'High-protein Mix'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Source:</Text>
          <Text style={styles.infoValue}>{feedingData.basal?.source || 'Personally Grown'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Schedule:</Text>
          <Text style={styles.infoValue}>{feedingData.basal?.schedule || feedingData.frequency}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Quantity:</Text>
          <Text style={styles.infoValue}>{feedingData.basal?.quantity || feedingData.amount}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date Acquired:</Text>
          <Text style={styles.infoValue}>{formatDate(feedingData.basal?.date || '2025-03-01')}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cost:</Text>
          <Text style={styles.infoValue}>{feedingData.basal?.cost || '$450'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Supplier:</Text>
          <Text style={styles.infoValue}>{feedingData.basal?.supplier || 'Farm Supply Co.'}</Text>
        </View>
      </View>

      {(feedingData.feedTypeCategory === 'Basal Feed + Concentrates + Supplements' || 
        feedingData.concentrate) && (
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Concentrate Feed</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Feed Type:</Text>
            <Text style={styles.infoValue}>{feedingData.concentrate?.feedType || 'Protein Supplement'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Source:</Text>
            <Text style={styles.infoValue}>{feedingData.concentrate?.source || 'Purely Purchased'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Schedule:</Text>
            <Text style={styles.infoValue}>{feedingData.concentrate?.schedule || 'Daily'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quantity:</Text>
            <Text style={styles.infoValue}>{feedingData.concentrate?.quantity || '2 kg per animal'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date Acquired:</Text>
            <Text style={styles.infoValue}>{formatDate(feedingData.concentrate?.date || '2025-03-01')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cost:</Text>
            <Text style={styles.infoValue}>{feedingData.concentrate?.cost || '$180'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Supplier:</Text>
            <Text style={styles.infoValue}>{feedingData.concentrate?.supplier || 'Premium Feeds Inc.'}</Text>
          </View>
        </View>
      )}

      {(feedingData.feedTypeCategory === 'Basal Feed + Concentrates + Supplements' || 
        feedingData.supplement) && (
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Supplement Feed</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Feed Type:</Text>
            <Text style={styles.infoValue}>{feedingData.supplement?.feedType || 'Vitamin Mix'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Source:</Text>
            <Text style={styles.infoValue}>{feedingData.supplement?.source || 'Purely Purchased'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Schedule:</Text>
            <Text style={styles.infoValue}>{feedingData.supplement?.schedule || 'Daily'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quantity:</Text>
            <Text style={styles.infoValue}>{feedingData.supplement?.quantity || '0.5 kg per animal'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date Acquired:</Text>
            <Text style={styles.infoValue}>{formatDate(feedingData.supplement?.date || '2025-03-01')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cost:</Text>
            <Text style={styles.infoValue}>{feedingData.supplement?.cost || '$120'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Supplier:</Text>
            <Text style={styles.infoValue}>{feedingData.supplement?.supplier || 'Animal Health Solutions'}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => 
          navigation.navigate('EditFeedingRequirementScreen', {requirement: feedingData})
        }
      >
        <FastImage
          source={icons.submited}
          style={styles.actionIcon}
          tintColor={COLORS.white}
        />
        <Text style={styles.actionButtonText}>Edit</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.markFedButton]}
        onPress={() => {
          // Logic to mark as fed would go here
          navigation.goBack();
        }}
      >
        <FastImage
          source={icons.tick}
          style={styles.actionIcon}
          tintColor={COLORS.white}
        />
        <Text style={styles.actionButtonText}>Mark as Fed</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader 
        title="Feeding Details" 
        onBack={() => navigation.goBack()}
      />
      
      <View style={styles.feedInfoHeader}>
        <View style={styles.feedInfoContainer}>
          <Text style={styles.animalTypeHeading}>{feedingData.animalType}</Text>
          <Text style={styles.feedNameHeading}>{feedingData.feedName}</Text>
        </View>
        <View style={styles.statusContainer}>
          {new Date(feedingData.nextFeeding).toDateString() === new Date().toDateString() ? (
            <View style={styles.feedTodayBadge}>
              <Text style={styles.feedTodayText}>Feed Today</Text>
            </View>
          ) : (
            <View style={styles.nextFeedContainer}>
              <Text style={styles.nextFeedLabel}>Next Feed:</Text>
              <Text style={styles.nextFeedDate}>{formatDate(feedingData.nextFeeding)}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'overview' && styles.activeTabButton]}
          onPress={() => setActiveTab('overview')}>
          <Text style={[styles.tabButtonText, activeTab === 'overview' && styles.activeTabButtonText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'details' && styles.activeTabButton]}
          onPress={() => setActiveTab('details')}>
          <Text style={[styles.tabButtonText, activeTab === 'details' && styles.activeTabButtonText]}>
            Program Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'feeds' && styles.activeTabButton]}
          onPress={() => setActiveTab('feeds')}>
          <Text style={[styles.tabButtonText, activeTab === 'feeds' && styles.activeTabButtonText]}>
            Feed Details
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'details' && renderDetailsTab()}
        {activeTab === 'feeds' && renderFeedDetailsTab()}
        
        <View style={styles.notesContainer}>
          <Text style={styles.notesSectionTitle}>Notes</Text>
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>
              {feedingData.notes || 
                "Ensure fresh water is always available. Monitor feed consumption and adjust quantities if necessary. Report any appetite changes immediately."}
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {renderActionButtons()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  feedInfoHeader: {
    backgroundColor: COLORS.green2,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedInfoContainer: {
    flex: 1,
  },
  animalTypeHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  feedNameHeading: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  feedTodayBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  feedTodayText: {
    color: COLORS.green2,
    fontWeight: 'bold',
    fontSize: 14,
  },
  nextFeedContainer: {
    alignItems: 'flex-end',
  },
  nextFeedLabel: {
    color: COLORS.white,
    fontSize: 12,
  },
  nextFeedDate: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.green2,
  },
  tabButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabButtonText: {
    color: COLORS.green2,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.green2,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  infoLabel: {
    width: '35%',
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  chipContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#e0f2f1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.green2,
  },
  timeSlotContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeChip: {
    backgroundColor: '#e0f2f1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  timeChipText: {
    fontSize: 12,
    color: COLORS.green2,
  },
  notesContainer: {
    padding: 16,
    paddingTop: 0,
  },
  notesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  notesCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 80, // Extra space for action buttons
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  markFedButton: {
    backgroundColor: '#4CAF50',
    marginRight: 0,
    marginLeft: 8,
  },
  actionIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default FeedingDetailsScreen;