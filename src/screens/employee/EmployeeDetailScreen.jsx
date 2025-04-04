import React from 'react';
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

const EmployeeDetailScreen = ({route, navigation}) => {
  const {employee} = route.params || {};

  const InfoRow = ({label, value}) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const InfoSectionWithIcon = ({icon, title, children}) => (
    <View style={styles.infoCard}>
      <View style={styles.sectionHeader}>
        <FastImage
          source={icon}
          style={styles.sectionIcon}
          tintColor={COLORS.green2}
        />
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      {children}
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
      <SecondaryHeader title={employee.fullName} showBackButton={true} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <FastImage
                source={icons.account}
                style={styles.avatarIcon}
                tintColor={COLORS.green2}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.employeeName}>{employee.fullName}</Text>
              <Text style={styles.employeePosition}>{employee.position}</Text>
              <View style={styles.badgeContainer}>
                <View style={styles.idBadge}>
                  <Text style={styles.badgeText}>ID: {employee.farmId}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <InfoSectionWithIcon icon={icons.call} title="Contact Information">
          <InfoRow label="Phone Number" value={employee.phone} />
          <InfoRow label="Email" value={`${employee.fullName.toLowerCase().replace(' ', '.')}@farmcompany.com`} />
          <InfoRow label="Emergency Contact" value="Not provided" />
        </InfoSectionWithIcon>

        <InfoSectionWithIcon icon={icons.calendar} title="Employment Details">
          <InfoRow label="Position" value={employee.position} />
          <InfoRow label="Date of Employment" value={employee.dateOfEmployment} />
          <InfoRow label="Employment Type" value="Full-time" />
          <InfoRow label="Reports To" value="Farm Director" />
        </InfoSectionWithIcon>

        <InfoSectionWithIcon icon={icons.livestock} title="Farm Assignment">
          <InfoRow label="Farm ID" value={employee.farmId} />
          <InfoRow label="Location" value="Main Facility" />
          <InfoRow label="Working Area" value="Section A" />
        </InfoSectionWithIcon>

        <InfoSectionWithIcon icon={icons.submited} title="Qualifications & Skills">
          <View style={styles.skillTagsContainer}>
            <View style={styles.skillTag}><Text style={styles.skillTagText}>Agriculture</Text></View>
            <View style={styles.skillTag}><Text style={styles.skillTagText}>Management</Text></View>
            <View style={styles.skillTag}><Text style={styles.skillTagText}>Animal Care</Text></View>
            <View style={styles.skillTag}><Text style={styles.skillTagText}>Record Keeping</Text></View>
          </View>
          <Text style={styles.qualificationsText}>
            Bachelor's degree in Agriculture Management with 5+ years of experience in farm operations.
          </Text>
        </InfoSectionWithIcon>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditEmployeeScreen', {employee})}>
          <FastImage
            source={icons.edit}
            style={styles.editIcon}
            tintColor={COLORS.white}
          />
          <Text style={styles.editButtonText}>Edit Employee Details</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarIcon: {
    width: 48,
    height: 48,
  },
  profileInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  employeePosition: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  idBadge: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.green2,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    width: 130,
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  skillTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  skillTag: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillTagText: {
    fontSize: 12,
    color: COLORS.green2,
    fontWeight: '500',
  },
  qualificationsText: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green2,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  editIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: '500',
    fontSize: 16,
  },
});

export default EmployeeDetailScreen;