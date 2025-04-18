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

  const getDisplayRole = (employee) => {
    if (employee.role === 'custom' && employee.customRole) {
      return employee.customRole;
    }
    return employee.role.charAt(0).toUpperCase() + employee.role.slice(1);
  };

  const formatBenefits = (benefits) => {
    if (!benefits || Object.keys(benefits).length === 0) {
      return "None";
    }
    
    const activeBenefits = Object.keys(benefits)
      .filter(key => benefits[key])
      .map(key => {
        switch(key) {
          case 'paye': return 'PAYE';
          case 'nssf': return 'NSSF';
          case 'nhif': return 'NHIF';
          case 'housingLevy': return 'Housing Levy';
          default: return key.charAt(0).toUpperCase() + key.slice(1);
        }
      });
    
    return activeBenefits.join(', ') || "None";
  };

  const InfoRow = ({label, value}) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
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
              <Text style={styles.employeePosition}>{getDisplayRole(employee)}</Text>
              <View style={styles.badgeContainer}>
                <View style={styles.idBadge}>
                  <Text style={styles.badgeText}>ID: {employee.idNumber}</Text>
                </View>
                <View style={[styles.idBadge, styles.typeBadge, 
                  employee.employeeType === 'permanent' ? styles.permanentBadge : styles.casualBadge]}>
                  <Text style={styles.typeBadgeText}>
                    {employee.employeeType === 'permanent' ? 'Permanent' : 'Casual'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <InfoSectionWithIcon icon={icons.account} title="Personal Information">
          <InfoRow label="First Name" value={employee.firstName} />
          {employee.middleName && (
            <InfoRow label="Middle Name" value={employee.middleName} />
          )}
          <InfoRow label="Last Name" value={employee.lastName} />
          <InfoRow label="ID Number" value={employee.idNumber} />
        </InfoSectionWithIcon>

        <InfoSectionWithIcon icon={icons.call} title="Contact Information">
          <InfoRow label="Phone Number" value={employee.phone} />
          <InfoRow label="Emergency Contact" value={employee.emergencyContact} />
        </InfoSectionWithIcon>

        <InfoSectionWithIcon icon={icons.calendar} title="Employment Details">
          <InfoRow label="Role" value={getDisplayRole(employee)} />
          <InfoRow label="Date of Employment" value={employee.dateOfEmployment} />
          <InfoRow label="Employment Type" value={employee.employeeType === 'permanent' ? 'Permanent' : 'Casual'} />
          {employee.workSchedule && (
            <InfoRow label="Work Schedule" value={
              employee.workSchedule === 'full' ? 'Full Day (8 hours)' : 
              employee.workSchedule === 'half' ? 'Half Day (4 hours)' : 'Custom'
            } />
          )}
        </InfoSectionWithIcon>

        <InfoSectionWithIcon icon={icons.currency} title="Payment Information">
          <InfoRow label="Payment Schedule" value={employee.paymentSchedule.charAt(0).toUpperCase() + employee.paymentSchedule.slice(1)} />
          <InfoRow label="Salary" value={`KSh ${employee.salary}`} />
          <InfoRow label="Benefits" value={formatBenefits(employee.selectedBenefits)} />
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
    flexWrap: 'wrap',
  },
  idBadge: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  typeBadge: {
    marginLeft: 4,
  },
  permanentBadge: {
    backgroundColor: COLORS.green,
  },
  casualBadge: {
    backgroundColor: '#FF9800',
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.green2,
    fontWeight: '500',
  },
  typeBadgeText: {
    fontSize: 12,
    color: COLORS.white,
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