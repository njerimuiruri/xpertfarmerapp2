import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { icons } from '../../../constants';
import { COLORS } from '../../../constants/theme';
import SecondaryHeader from '../../../components/headers/secondary-header';
import {
  getVaccinationById,
  deleteVaccination
} from '../../../services/healthservice';
import { getLivestockById } from '../../../services/livestock';

const VaccineDetailScreen = ({ navigation, route }) => {
  const { recordId, recordData } = route.params;

  const [record, setRecord] = useState(recordData || null);
  const [animal, setAnimal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadDetailedData();
  }, []);

  const loadDetailedData = async () => {
    setIsLoading(true);
    try {
      // Load detailed record data
      const recordResult = await getVaccinationById(recordId);
      if (recordResult && !recordResult.error && recordResult.data) {
        setRecord(recordResult.data);

        // Load animal data if livestockId exists
        if (recordResult.data.livestockId) {
          const animalResult = await getLivestockById(recordResult.data.livestockId);
          if (animalResult && !animalResult.error) {
            setAnimal(animalResult.data);
          }
        }
      }
    } catch (error) {
      console.error('Error loading detailed data:', error);
      Alert.alert('Error', 'Failed to load vaccine details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAnimalDisplayName = (animal) => {
    if (!animal) return 'Unknown Animal';

    if (animal.category === 'poultry' && animal.poultry) {
      return `${animal.type.toUpperCase()} - Flock ID: ${animal.poultry.flockId || 'N/A'}`;
    } else if (animal.category === 'mammal' && animal.mammal) {
      return `${animal.type.toUpperCase()} - ID: ${animal.mammal.idNumber || 'N/A'}`;
    }
    return `${animal.type.toUpperCase()} - ID: ${animal.id}`;
  };

  const formatCurrency = (amount) => {
    return amount ? `KES ${parseFloat(amount).toLocaleString()}` : 'N/A';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatWeight = (weight) => {
    return weight ? `${weight} kg` : 'N/A';
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Unknown';

    const birth = new Date(dateOfBirth);
    const now = new Date();
    const diffTime = Math.abs(now - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditVaccineRecord', {
      recordId: record.id,
      recordData: record
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Vaccine Record',
      'Are you sure you want to delete this vaccination record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteVaccination(recordId);
      if (result && !result.error) {
        Alert.alert(
          'Success',
          'Vaccine record deleted successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to delete vaccine record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      Alert.alert('Error', 'Failed to delete vaccine record');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !record) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader
          title="Vaccine Details"
          onBackPress={() => navigation.goBack()}
          showNotification={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.success || '#10B981'} />
          <Text style={styles.loadingText}>Loading vaccine details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalCost = (parseFloat(record.costOfVaccine) || 0) + (parseFloat(record.costOfService) || 0);

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Vaccine Details"
        onBackPress={() => navigation.goBack()}
        showNotification={true}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <LinearGradient
            colors={['#F0FDF4', '#FFFFFF']}
            style={styles.headerGradient}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Completed</Text>
            </View>

            <Text style={styles.vaccinationTitle}>{record.vaccinationAgainst}</Text>
            <Text style={styles.drugName}>{record.drugAdministered}</Text>

            <View style={styles.dateContainer}>
              <FastImage source={icons.calendar} style={styles.calendarIcon} tintColor={COLORS.success || '#10B981'} />
              <Text style={styles.dateText}>{formatDate(record.dateAdministered)}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Animal Information Section */}
        {animal && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Animal Information</Text>
            <View style={styles.animalCard}>
              <LinearGradient
                colors={['#F8FAFC', '#FFFFFF']}
                style={styles.animalCardGradient}>

                <View style={styles.animalHeader}>
                  <View style={styles.animalIconContainer}>
                    <LinearGradient
                      colors={[COLORS.success || '#10B981', '#059669']}
                      style={styles.animalIcon}>
                      <FastImage
                        source={icons.livestock || icons.account}
                        style={styles.animalIconImage}
                        tintColor="#FFFFFF"
                      />
                    </LinearGradient>
                  </View>
                  <View style={styles.animalHeaderInfo}>
                    <Text style={styles.animalName}>{formatAnimalDisplayName(animal)}</Text>
                    <Text style={styles.animalCategory}>
                      {animal.category === 'poultry' ? 'Poultry' : 'Mammal'} • {animal.type}
                    </Text>
                  </View>
                </View>

                <View style={styles.animalDetailsGrid}>
                  <View style={styles.detailGridRow}>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailLabel}>Breed</Text>
                      <Text style={styles.detailValue}>
                        {animal.category === 'poultry' && animal.poultry?.breedType ||
                          animal.category === 'mammal' && animal.mammal?.breedType ||
                          'Not specified'}
                      </Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailLabel}>Gender</Text>
                      <Text style={styles.detailValue}>
                        {animal.category === 'poultry' ? 'Mixed' :
                          animal.category === 'mammal' && animal.mammal?.gender ||
                          'Not specified'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailGridRow}>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailLabel}>Age</Text>
                      <Text style={styles.detailValue}>
                        {animal.category === 'poultry' && animal.poultry?.dateOfHatch ?
                          calculateAge(animal.poultry.dateOfHatch) :
                          animal.category === 'mammal' && animal.mammal?.dateOfBirth ?
                            calculateAge(animal.mammal.dateOfBirth) :
                            'Not specified'}
                      </Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailLabel}>Weight</Text>
                      <Text style={styles.detailValue}>
                        {animal.category === 'poultry' && animal.poultry?.weight ?
                          formatWeight(animal.poultry.weight) :
                          animal.category === 'mammal' && animal.mammal?.currentWeight ?
                            formatWeight(animal.mammal.currentWeight) :
                            'Not specified'}
                      </Text>
                    </View>
                  </View>

                  {animal.category === 'poultry' && animal.poultry && (
                    <View style={styles.detailGridRow}>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailLabel}>Flock Size</Text>
                        <Text style={styles.detailValue}>
                          {animal.poultry.numberOfBirds || 'Not specified'}
                        </Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailLabel}>Purpose</Text>
                        <Text style={styles.detailValue}>
                          {animal.poultry.purpose || 'Not specified'}
                        </Text>
                      </View>
                    </View>
                  )}

                  {animal.category === 'mammal' && animal.mammal && (
                    <View style={styles.detailGridRow}>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailLabel}>Color/Markings</Text>
                        <Text style={styles.detailValue}>
                          {animal.mammal.colorAndMarkings || 'Not specified'}
                        </Text>
                      </View>
                      <View style={styles.detailGridItem}>
                        <Text style={styles.detailLabel}>Purpose</Text>
                        <Text style={styles.detailValue}>
                          {animal.mammal.purpose || 'Not specified'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Vaccination Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vaccination Details</Text>
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Vaccination Against:</Text>
              <Text style={styles.detailText}>{record.vaccinationAgainst || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Drug Administered:</Text>
              <Text style={styles.detailText}>{record.drugAdministered || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Dosage:</Text>
              <Text style={styles.detailText}>{record.dosage || 'N/A'}</Text>
            </View>
            <View style={[styles.detailRow, styles.lastRow]}>
              <Text style={styles.detailKey}>Date Administered:</Text>
              <Text style={styles.detailText}>
                {record.dateAdministered ? formatDate(record.dateAdministered) : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Administration Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Administration Details</Text>
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Administered By:</Text>
              <Text style={styles.detailText}>{record.administeredBy || 'N/A'}</Text>
            </View>
            {record.practiceId && (
              <View style={[styles.detailRow, styles.lastRow]}>
                <Text style={styles.detailKey}>Practice ID:</Text>
                <Text style={styles.detailText}>{record.practiceId}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Cost Information Section */}
        {totalCost > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cost Information</Text>
            <View style={styles.costCard}>
              <LinearGradient
                colors={['#F0FDF4', '#FFFFFF']}
                style={styles.costGradient}>
                {record.costOfVaccine > 0 && (
                  <View style={styles.costRow}>
                    <View style={styles.costIconContainer}>
                      <FastImage source={icons.medical || icons.health} style={styles.costIcon} tintColor="#059669" />
                    </View>
                    <View style={styles.costInfo}>
                      <Text style={styles.costLabel}>Vaccine Cost</Text>
                      <Text style={styles.costValue}>{formatCurrency(record.costOfVaccine)}</Text>
                    </View>
                  </View>
                )}

                {record.costOfService > 0 && (
                  <View style={styles.costRow}>
                    <View style={styles.costIconContainer}>
                      <FastImage source={icons.user || icons.account} style={styles.costIcon} tintColor="#059669" />
                    </View>
                    <View style={styles.costInfo}>
                      <Text style={styles.costLabel}>Service Cost</Text>
                      <Text style={styles.costValue}>{formatCurrency(record.costOfService)}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.totalCostContainer}>
                  <View style={styles.totalCostRow}>
                    <Text style={styles.totalLabel}>Total Cost</Text>
                    <Text style={styles.totalValue}>{formatCurrency(totalCost)}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={styles.actionGradient}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEdit}
            disabled={isDeleting}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.success || '#10B981', '#059669']}
              style={styles.editGradient}>
              <FastImage source={icons.edit} style={styles.actionIcon} tintColor="#FFFFFF" />
              <Text style={styles.editButtonText}>Edit Record</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isDeleting}
            activeOpacity={0.8}>
            <View style={styles.deleteContainer}>
              {isDeleting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <FastImage source={icons.trash} style={styles.actionIcon} tintColor="#EF4444" />
              )}
              <Text style={styles.deleteButtonText}>
                {isDeleting ? 'Deleting...' : 'Delete Record'}
              </Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },

  content: {
    flex: 1,
    padding: 16,
  },

  // Header Card Styles
  headerCard: {
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#059669',
    fontFamily: 'Inter-SemiBold',
  },
  vaccinationTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  drugName: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  calendarIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#059669',
    fontFamily: 'Inter-SemiBold',
  },

  // Section Styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },

  // Animal Card Styles
  animalCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  animalCardGradient: {
    padding: 16,
  },
  animalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  animalIconContainer: {
    marginRight: 12,
  },
  animalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animalIconImage: {
    width: 24,
    height: 24,
  },
  animalHeaderInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  animalCategory: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },

  animalDetailsGrid: {
    gap: 12,
  },
  detailGridRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailGridItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'Inter-Regular',
  },

  // Detail Card Styles
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  detailKey: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'Inter-Regular',
    flex: 1,
    textAlign: 'right',
  },

  // Cost Card Styles
  costCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  costGradient: {
    padding: 16,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  costIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  costIcon: {
    width: 20,
    height: 20,
  },
  costInfo: {
    flex: 1,
  },
  costLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  costValue: {
    fontSize: 16,
    color: '#059669',
    fontFamily: 'Inter-SemiBold',
  },
  totalCostContainer: {
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginTop: 8,
  },
  totalCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Inter-SemiBold',
  },
  totalValue: {
    fontSize: 20,
    color: '#059669',
    fontFamily: 'Inter-Bold',
  },

  // Action Container Styles
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 20,
    gap: 12,
  },
  editButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  editGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  editButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  deleteButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FECACA',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  deleteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  actionIcon: {
    width: 20,
    height: 20,
  },
});

export default VaccineDetailScreen;