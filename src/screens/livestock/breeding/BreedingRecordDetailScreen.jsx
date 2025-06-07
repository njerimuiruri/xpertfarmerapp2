import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import { getBreedingRecordById } from '../../../services/breeding';
import { getLivestockForActiveFarm } from '../../../services/livestock';
import { useFocusEffect } from '@react-navigation/native';

const BreedingRecordDetailScreen = ({ navigation, route }) => {
  const { record: initialRecord } = route.params;
  const [record, setRecord] = useState(initialRecord);
  const [livestockMap, setLivestockMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDetailedData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (!loading) {
        refreshBreedingRecord();
      }
    }, [loading])
  );

  const fetchDetailedData = async () => {
    try {
      setLoading(true);
      const updatedRecord = await getBreedingRecordById(record.id);
      setRecord(updatedRecord);

      const { data: livestock, error } = await getLivestockForActiveFarm();
      if (!error && livestock) {
        const map = {};
        livestock.forEach(animal => {
          const animalData = animal?.mammal || animal?.poultry;
          map[animal.id] = {
            id: animal.id,
            idNumber: animalData?.idNumber || 'N/A',
            breedType: animalData?.breedType || 'Unknown',
            type: animal.type || 'Unknown',
            gender: animalData?.gender || 'Unknown',
            dateOfBirth: animalData?.dateOfBirth,
            weight: animalData?.weight,
            healthStatus: animalData?.healthStatus || 'Unknown',
          };
        });
        setLivestockMap(map);
      }
    } catch (error) {
      console.error('Error fetching detailed data:', error);
      Alert.alert('Error', 'Failed to fetch breeding record details');
    } finally {
      setLoading(false);
    }
  };

  const refreshBreedingRecord = async () => {
    try {
      setRefreshing(true);
      const updatedRecord = await getBreedingRecordById(record.id);
      setRecord(updatedRecord);
    } catch (error) {
      console.error('Error refreshing breeding record:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getPregnancyStatus = (record) => {
    const today = new Date();
    const serviceDate = new Date(record.serviceDate);
    const expectedBirthDate = new Date(record.expectedBirthDate);

    if (record.birthRecorded || record.offspring?.length > 0) {
      return {
        status: 'delivered',
        text: 'Delivered',
        color: COLORS.green,
        icon: icons.tick,
        description: 'Birth has been recorded'
      };
    }

    if (today > expectedBirthDate) {
      const daysOverdue = Math.ceil((today - expectedBirthDate) / (1000 * 60 * 60 * 24));
      return {
        status: 'overdue',
        text: `Overdue by ${daysOverdue} days`,
        color: COLORS.red,
        icon: icons.warning,
        description: 'Expected birth date has passed'
      };
    }

    const daysRemaining = Math.ceil((expectedBirthDate - today) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 7) {
      return {
        status: 'due_soon',
        text: `Due in ${daysRemaining} days`,
        color: COLORS.orange,
        icon: icons.clock,
        description: 'Birth expected within a week'
      };
    }

    return {
      status: 'pregnant',
      text: `${daysRemaining} days to go`,
      color: COLORS.blue,
      icon: icons.clock,
      description: `Pregnancy progressing normally`
    };
  };

  const calculatePregnancyDuration = () => {
    const serviceDate = new Date(record.serviceDate);
    const today = new Date();
    const daysPassed = Math.floor((today - serviceDate) / (1000 * 60 * 60 * 24));
    return daysPassed;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleRecordBirth = () => {
    navigation.navigate('RecordBirthScreen', { breedingRecord: record });
  };

  const handleEdit = () => {
    navigation.navigate('EditBreedingRecordScreen', { recordId: record.id });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader title="Breeding Details" />
        <StatusBar barStyle="light-content" backgroundColor={COLORS.green} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={styles.loadingText}>Loading breeding record details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const damInfo = livestockMap[record.damId];
  const sireInfo = livestockMap[record.sireId];
  const pregnancyStatus = getPregnancyStatus(record);
  const pregnancyDuration = calculatePregnancyDuration();

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader title="Breeding Details" />
      <StatusBar barStyle="light-content" backgroundColor={COLORS.green} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {refreshing && (
          <View style={styles.refreshIndicator}>
            <ActivityIndicator size="small" color={COLORS.green} />
            <Text style={styles.refreshText}>Updating...</Text>
          </View>
        )}

        {/* Animals Information - Now First Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderWithStatus}>
            <Text style={styles.sectionTitle}>Animals Involved</Text>
            <View style={[styles.statusBadgeSmall, { backgroundColor: pregnancyStatus.color + '15' }]}>
              <FastImage
                source={pregnancyStatus.icon}
                style={[styles.statusIconSmall, { tintColor: pregnancyStatus.color }]}
              />
              <Text style={[styles.statusTextSmall, { color: pregnancyStatus.color }]}>
                {pregnancyStatus.text}
              </Text>
            </View>
          </View>

          <View style={styles.animalsContainer}>
            {/* Dam Information */}
            <View style={styles.animalCard}>
              <View style={styles.animalHeader}>
                <View style={styles.animalIconContainer}>
                  <FastImage source={icons.heart} style={styles.genderIcon} tintColor={COLORS.pink} />
                </View>
                <View style={styles.animalHeaderText}>
                  <Text style={styles.animalRole}>Dam</Text>
                  <Text style={styles.animalSubRole}>Female</Text>
                </View>
              </View>
              <Text style={styles.animalName}>
                {damInfo ? damInfo.idNumber : 'Unknown'}
              </Text>
              <View style={styles.animalDetailsGrid}>
                <View style={styles.animalDetailRow}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailValue}>{damInfo?.type || 'N/A'}</Text>
                </View>
                <View style={styles.animalDetailRow}>
                  <Text style={styles.detailLabel}>Breed:</Text>
                  <Text style={styles.detailValue}>{damInfo?.breedType || 'N/A'}</Text>
                </View>
                <View style={styles.animalDetailRow}>
                  <Text style={styles.detailLabel}>Health:</Text>
                  <Text style={[styles.detailValue, {
                    color: damInfo?.healthStatus === 'Healthy' ? COLORS.green :
                      damInfo?.healthStatus === 'Sick' ? COLORS.red : COLORS.gray
                  }]}>
                    {damInfo?.healthStatus || 'N/A'}
                  </Text>
                </View>
                {damInfo?.weight && (
                  <View style={styles.animalDetailRow}>
                    <Text style={styles.detailLabel}>Weight:</Text>
                    <Text style={styles.detailValue}>{damInfo.weight} kg</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Sire Information */}
            <View style={styles.animalCard}>
              <View style={styles.animalHeader}>
                <View style={styles.animalIconContainer}>
                  <FastImage source={icons.heart} style={styles.genderIcon} tintColor={COLORS.blue} />
                </View>
                <View style={styles.animalHeaderText}>
                  <Text style={styles.animalRole}>Sire</Text>
                  <Text style={styles.animalSubRole}>Male</Text>
                </View>
              </View>
              <Text style={styles.animalName}>
                {record.serviceType === 'Artificial Insemination'
                  ? record.sireCode || 'AI Code'
                  : sireInfo?.idNumber || 'Unknown'
                }
              </Text>
              <View style={styles.animalDetailsGrid}>
                {record.serviceType === 'Artificial Insemination' ? (
                  <>
                    <View style={styles.animalDetailRow}>
                      <Text style={styles.detailLabel}>Service:</Text>
                      <Text style={styles.detailValue}>Artificial Insemination</Text>
                    </View>
                    <View style={styles.animalDetailRow}>
                      <Text style={styles.detailLabel}>AI Type:</Text>
                      <Text style={styles.detailValue}>{record.aiType || 'Regular'}</Text>
                    </View>
                    {record.sireCode && (
                      <View style={styles.animalDetailRow}>
                        <Text style={styles.detailLabel}>Code:</Text>
                        <Text style={styles.detailValue}>{record.sireCode}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <View style={styles.animalDetailRow}>
                      <Text style={styles.detailLabel}>Type:</Text>
                      <Text style={styles.detailValue}>{sireInfo?.type || 'N/A'}</Text>
                    </View>
                    <View style={styles.animalDetailRow}>
                      <Text style={styles.detailLabel}>Breed:</Text>
                      <Text style={styles.detailValue}>{sireInfo?.breedType || 'N/A'}</Text>
                    </View>
                    <View style={styles.animalDetailRow}>
                      <Text style={styles.detailLabel}>Health:</Text>
                      <Text style={[styles.detailValue, {
                        color: sireInfo?.healthStatus === 'Healthy' ? COLORS.green :
                          sireInfo?.healthStatus === 'Sick' ? COLORS.red : COLORS.gray
                      }]}>
                        {sireInfo?.healthStatus || 'N/A'}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Breeding Information with Status Integration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Breeding Progress</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Current Status</Text>
              <Text style={[styles.progressDescription, { color: pregnancyStatus.color }]}>
                {pregnancyStatus.description}
              </Text>
            </View>

            <View style={styles.progressBar}>
              <View style={styles.progressStep}>
                <View style={[styles.progressDot, { backgroundColor: COLORS.green }]} />
                <Text style={styles.progressLabel}>Service Date</Text>
                <Text style={styles.progressDate}>{formatDate(record.serviceDate)}</Text>
              </View>

              <View style={styles.progressLine} />

              <View style={styles.progressStep}>
                <View style={[styles.progressDot, {
                  backgroundColor: pregnancyStatus.status === 'delivered' ? COLORS.green : COLORS.gray
                }]} />
                <Text style={styles.progressLabel}>Expected Birth</Text>
                <Text style={styles.progressDate}>{formatDate(record.expectedBirthDate)}</Text>
              </View>

              {(record.birthRecorded || record.offspring?.length > 0) && record.birthDate && (
                <>
                  <View style={styles.progressLine} />
                  <View style={styles.progressStep}>
                    <View style={[styles.progressDot, { backgroundColor: COLORS.green }]} />
                    <Text style={styles.progressLabel}>Actual Birth</Text>
                    <Text style={styles.progressDate}>{formatDate(record.birthDate)}</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Purpose</Text>
              <Text style={styles.infoValue}>{record.purpose || 'N/A'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Strategy</Text>
              <Text style={styles.infoValue}>{record.strategy || 'N/A'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Service Type</Text>
              <Text style={styles.infoValue}>{record.serviceType || 'Natural'}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{pregnancyDuration} days</Text>
            </View>
          </View>
        </View>

        {/* Birth Information (if applicable) */}
        {(record.birthRecorded || record.offspring?.length > 0) && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderWithIcon}>
              <FastImage source={icons.tick} style={styles.sectionIcon} tintColor={COLORS.green} />
              <Text style={styles.sectionTitle}>Birth Recorded</Text>
            </View>

            <View style={styles.birthSuccessContainer}>
              <View style={styles.birthInfoGrid}>
                {record.birthDate && (
                  <View style={styles.birthInfoItem}>
                    <Text style={styles.birthInfoLabel}>Birth Date</Text>
                    <Text style={styles.birthInfoValue}>{formatDate(record.birthDate)}</Text>
                  </View>
                )}

                {record.offspring?.length > 0 && (
                  <View style={styles.birthInfoItem}>
                    <Text style={styles.birthInfoLabel}>Offspring Count</Text>
                    <Text style={styles.birthInfoValue}>{record.offspring.length}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Additional Information */}
        {(record.notes || record.veterinarianNotes) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>

            {record.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>General Notes</Text>
                <Text style={styles.notesText}>{record.notes}</Text>
              </View>
            )}

            {record.veterinarianNotes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Veterinarian Notes</Text>
                <Text style={styles.notesText}>{record.veterinarianNotes}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.bottomButtons}>
        {pregnancyStatus.status !== 'delivered' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.recordBirthButton]}
            onPress={handleRecordBirth}
          >
            <FastImage source={icons.submited} style={styles.buttonIcon} tintColor={COLORS.white} />
            <Text style={styles.buttonText}>Record Birth</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
        >
          <FastImage source={icons.edit} style={styles.buttonIcon} tintColor={COLORS.white} />
          <Text style={styles.buttonText}>Edit Record</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.green,
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeaderWithStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  statusBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIconSmall: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  statusTextSmall: {
    fontSize: 12,
    fontWeight: '600',
  },
  animalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  animalCard: {
    flex: 1,
    backgroundColor: COLORS.lightGray2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray3,
  },
  animalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  animalIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  genderIcon: {
    width: 18,
    height: 18,
  },
  animalHeaderText: {
    flex: 1,
  },
  animalRole: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '600',
  },
  animalSubRole: {
    fontSize: 12,
    color: COLORS.gray,
  },
  animalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  animalDetailsGrid: {
    gap: 8,
  },
  animalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: COLORS.black,
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: COLORS.lightGray2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  progressHeader: {
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  progressDescription: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  progressLine: {
    height: 2,
    backgroundColor: COLORS.gray3,
    flex: 1,
    marginHorizontal: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  progressDate: {
    fontSize: 10,
    color: COLORS.black,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '600',
  },
  birthSuccessContainer: {
    backgroundColor: COLORS.green + '10',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.green + '30',
  },
  birthInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  birthInfoItem: {
    alignItems: 'center',
  },
  birthInfoLabel: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 4,
  },
  birthInfoValue: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  notesContainer: {
    backgroundColor: COLORS.lightGray2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.blue,
  },
  notesLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
  bottomButtons: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray3,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  recordBirthButton: {
    backgroundColor: COLORS.green,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  buttonIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
export default BreedingRecordDetailScreen;