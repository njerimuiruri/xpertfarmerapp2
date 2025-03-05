import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {icons} from '../../constants';
import {COLORS} from '../../constants/theme';
import SecondaryHeader from '../../components/headers/secondary-header';

const AnimalDetailScreen = ({route, navigation}) => {
  const {animalData} = route.params || {};
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabs = () => {
    const tabs = [
      {id: 'overview', label: 'Overview'},
      {id: 'health', label: 'Health Records'},
      {id: 'breeding', label: 'Breeding'},
      {id: 'feeding', label: 'Feeding'},
    ];

    return (
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderOverview = () => (
    <View style={styles.contentSection}>
      <View style={styles.infoCard}>
        <View style={styles.animalIconContainer}>
          <FastImage
            source={icons.livestock}
            style={styles.animalIcon}
            tintColor={COLORS.green2}
          />
        </View>
        <View style={styles.basicInfoContainer}>
          <Text style={styles.infoTitle}>Basic Information</Text>
          <InfoRow label="ID" value={animalData.id} />
          <InfoRow label="Breed" value={animalData.breed} />
          <InfoRow label="Sex" value={animalData.sex} />
          <InfoRow label="Date of Birth" value={animalData.dob} />
          <InfoRow label="Farm ID" value={animalData.farmId} />
        </View>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Description</Text>
        <Text style={styles.descriptionText}>
          {animalData.title} ({animalData.breed}) is a{' '}
          {animalData.sex.toLowerCase()} animal born on {animalData.dob}. This
          animal is registered under farm {animalData.farmId}. Currently
          producing approximately {animalData.production}.
        </Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Current Status</Text>
        <InfoRow label="Health Status" value={animalData.health || 'Healthy'} />
        <InfoRow label="Production" value={animalData.production || 'N/A'} />
        <InfoRow label="Last Check" value={animalData.lastCheck || 'N/A'} />
      </View>
    </View>
  );

  const renderHealthRecords = () => (
    <View style={styles.contentSection}>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Health Summary</Text>
        <Text style={styles.healthStatus}>
          {animalData.health || 'Healthy'}
        </Text>
        <View style={styles.addRecordContainer}>
          <TouchableOpacity
            style={styles.addRecordButton}
            onPress={() =>
              navigation.navigate('AddHealthRecords', {animalId: animalData.id})
            }>
            <FastImage
              source={icons.add}
              style={styles.addIcon}
              tintColor={COLORS.white}
            />
            <Text style={styles.addRecordText}>Add Health Record</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Vaccination History</Text>
        {renderVaccinationHistory()}
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Treatment History</Text>
        {renderTreatmentHistory()}
      </View>
    </View>
  );

  const renderVaccinationHistory = () => {
    const vaccinations = animalData.vaccinationHistory || [];
    return vaccinations.length > 0 ? (
      vaccinations.map((record, index) => (
        <View key={index} style={styles.historyItem}>
          <View style={styles.historyDateContainer}>
            <Text style={styles.historyDate}>{record.date}</Text>
          </View>
          <View style={styles.historyDetails}>
            <Text style={styles.historyTitle}>{record.vaccine}</Text>
            <Text style={styles.historySubtext}>
              Batch: {record.batchNumber}
            </Text>
            <Text style={styles.historySubtext}>
              Admin by: {record.adminBy}
            </Text>
          </View>
        </View>
      ))
    ) : (
      <Text style={styles.noRecordsText}>No vaccination records found</Text>
    );
  };

  const renderTreatmentHistory = () => {
    const treatments = animalData.treatmentHistory || [];
    return treatments.length > 0 ? (
      treatments.map((record, index) => (
        <View key={index} style={styles.historyItem}>
          <View style={styles.historyDateContainer}>
            <Text style={styles.historyDate}>{record.date}</Text>
          </View>
          <View style={styles.historyDetails}>
            <Text style={styles.historyTitle}>{record.treatment}</Text>
            <Text style={styles.historySubtext}>{record.notes}</Text>
            <Text style={styles.historySubtext}>
              Admin by: {record.adminBy}
            </Text>
          </View>
        </View>
      ))
    ) : (
      <Text style={styles.noRecordsText}>No treatment records found</Text>
    );
  };

  const renderBreeding = () => (
    <View style={styles.contentSection}>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Breeding Status</Text>
        <Text style={styles.breedingStatus}>
          {animalData.breedingStatus || 'No records available'}
        </Text>
        <View style={styles.addRecordContainer}>
          <TouchableOpacity
            style={styles.addRecordButton}
            onPress={() =>
              navigation.navigate('BreedingRecordForm', {
                animalId: animalData.id,
              })
            }>
            <FastImage
              source={icons.add}
              style={styles.addIcon}
              tintColor={COLORS.white}
            />
            <Text style={styles.addRecordText}>Add Breeding Record</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Breeding History</Text>
        <Text style={styles.noRecordsText}>No breeding records found</Text>
      </View>
    </View>
  );

  const renderFeeding = () => (
    <View style={styles.contentSection}>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Feeding Regimen</Text>
        {renderFeedingRegimen()}
        <View style={styles.addRecordContainer}>
          <TouchableOpacity
            style={styles.addRecordButton}
            onPress={() =>
              navigation.navigate('FarmFeedsScreen', {animalId: animalData.id})
            }>
            <FastImage
              source={icons.edit}
              style={styles.addIcon}
              tintColor={COLORS.white}
            />
            <Text style={styles.addRecordText}>Add Feeding Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Feeding Records</Text>
        <Text style={styles.noRecordsText}>
          No recent feeding records found
        </Text>
      </View>
    </View>
  );

  const renderFeedingRegimen = () => {
    const feedingData = animalData.feedingRegimen || [];

    return (
      <View style={styles.feedingTable}>
        <View style={styles.feedingRow}>
          <Text style={[styles.feedingCell, styles.feedingHeader]}>
            Feed Type
          </Text>
          <Text style={[styles.feedingCell, styles.feedingHeader]}>Amount</Text>
        </View>
        {feedingData.map((item, index) => (
          <View key={index} style={styles.feedingRow}>
            <Text style={styles.feedingCell}>{item.feed}</Text>
            <Text style={styles.feedingCell}>{item.amount}</Text>
          </View>
        ))}
      </View>
    );
  };

  const InfoRow = ({label, value}) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor={COLORS.green2}
        animated={true}
        barStyle={'light-content'}
      />
      <SecondaryHeader title={animalData.title} showBackButton={true} />
      {renderTabs()}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'health' && renderHealthRecords()}
        {activeTab === 'breeding' && renderBreeding()}
        {activeTab === 'feeding' && renderFeeding()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  tabContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 4,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.green2,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.black,
  },
  activeTabText: {
    color: COLORS.green2,
    fontWeight: 'bold',
  },
  contentSection: {
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  animalIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  animalIcon: {
    width: 80,
    height: 80,
  },
  basicInfoContainer: {
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 120,
    fontSize: 14,
    color: COLORS.black,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
  },
  healthStatus: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 16,
  },
  addRecordContainer: {
    marginTop: 16,
  },
  addRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green2,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  addIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  addRecordText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 8,
    backgroundColor: COLORS.lightGray2,
    borderRadius: 8,
  },
  historyDateContainer: {
    width: 80,
    marginRight: 12,
  },
  historyDate: {
    fontSize: 13,
    color: COLORS.black,
    fontWeight: '500',
  },
  historyDetails: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
    marginBottom: 4,
  },
  historySubtext: {
    fontSize: 13,
    color: COLORS.black,
  },
  noRecordsText: {
    fontSize: 14,
    color: COLORS.black,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  productionData: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 16,
  },
  breedingStatus: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 16,
  },
  feedingTable: {
    marginTop: 8,
  },
  feedingRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray3,
  },
  feedingHeader: {
    fontWeight: 'bold',
    backgroundColor: COLORS.lightGray2,
  },
  feedingCell: {
    flex: 1,
    padding: 8,
    fontSize: 14,
    color: COLORS.black,
  },
});

export default AnimalDetailScreen;
