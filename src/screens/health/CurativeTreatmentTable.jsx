import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Checkbox} from 'native-base';
import FastImage from 'react-native-fast-image';
import {icons} from '../../constants';
import SecondaryHeader from '../../components/headers/secondary-header';

const CurativeTreatmentTable = () => {
  const [data, setData] = useState([
    {
      id: 1,
      animalId: 'A001',
      healthEventDate: '2023-05-01',
      healthEventSymptom: 'Fever',
      diagnosis: 'Bacterial Infection',
      treatmentGiven: 'Antibiotics',
      preventive: 'Vaccination Schedule',
      medicalOfficer: 'Dr. Smith',
      name: 'John Doe',
      licenseId: 'LIC001',
      costOfService: 120.0,
      farmerName: 'James Farmer',
      notes: 'Animal responded well to treatment.',
    },
    {
      id: 2,
      animalId: 'A002',
      healthEventDate: '2023-06-15',
      healthEventSymptom: 'Limping',
      diagnosis: 'Joint Injury',
      treatmentGiven: 'Anti-inflammatory Medication',
      preventive: 'Ensure proper exercise',
      medicalOfficer: 'Dr. Johnson',
      name: 'Jane Roe',
      licenseId: 'LIC002',
      costOfService: 85.0,
      farmerName: 'Michael Agrarian',
      notes: 'Advised to monitor for recurring issues.',
    },
    {
      id: 3,
      animalId: 'A003',
      healthEventDate: '2023-07-10',
      healthEventSymptom: 'Loss of Appetite',
      diagnosis: 'Parasitic Infection',
      treatmentGiven: 'Deworming Medication',
      preventive: 'Regular deworming',
      medicalOfficer: 'Dr. Brown',
      name: 'Emily White',
      licenseId: 'LIC003',
      costOfService: 95.0,
      farmerName: 'Sarah Cultivator',
      notes: 'Scheduled follow-up in two weeks.',
    },
    {
      id: 4,
      animalId: 'A004',
      healthEventDate: '2023-08-20',
      healthEventSymptom: 'Diarrhea',
      diagnosis: 'Viral Infection',
      treatmentGiven: 'Supportive Care',
      preventive: 'Improved hygiene practices',
      medicalOfficer: 'Dr. Davis',
      name: 'William Black',
      licenseId: 'LIC004',
      costOfService: 60.0,
      farmerName: 'Tom Pastoralist',
      notes: 'Recovered fully within three days.',
    },
    {
      id: 5,
      animalId: 'A005',
      healthEventDate: '2023-09-05',
      healthEventSymptom: 'Coughing',
      diagnosis: 'Respiratory Infection',
      treatmentGiven: 'Antibiotics and Rest',
      preventive: 'Quarantine during outbreaks',
      medicalOfficer: 'Dr. Wilson',
      name: 'Anne Green',
      licenseId: 'LIC005',
      costOfService: 150.0,
      farmerName: 'Laura Harvester',
      notes: 'Animal is under observation.',
    },
  ]);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const allSelected = data.length > 0 && selectedIds.size === data.length;

  const toggleSelection = id => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(data.map(item => item.id));
      setSelectedIds(allIds);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <TouchableOpacity style={styles.checkboxColumn} activeOpacity={1}>
        <Checkbox
          value="all"
          isChecked={allSelected}
          onChange={toggleSelectAll}
          accessibilityLabel="Select all records"
          aria-label="Select all records"
        />
      </TouchableOpacity>
      <Text style={styles.columnHeading}>Animal Id/Flock Id</Text>
      <Text style={styles.columnHeading}>Health Event Date</Text>
      <Text style={styles.columnHeading}>Health Event Symptom</Text>
      <Text style={styles.columnHeading}>Diagnosis</Text>
      <Text style={styles.columnHeading}>Treatment Given</Text>
      <Text style={styles.columnHeading}>Preventive</Text>
      <Text style={styles.columnHeading}>Medical Officer</Text>
      <Text style={styles.columnHeading}>Name</Text>
      <Text style={styles.columnHeading}>License ID</Text>
      <Text style={styles.columnHeading}>Cost of Service</Text>
      <Text style={styles.columnHeading}>Farmer Name</Text>
      <Text style={styles.columnHeading}>Notes</Text>
      <Text style={styles.columnHeading}>Actions</Text>
    </View>
  );

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => toggleSelection(item.id)}
      activeOpacity={0.7}>
      <View style={styles.checkboxColumn}>
        <Checkbox
          value={item.id.toString()}
          isChecked={selectedIds.has(item.id)}
          onChange={() => toggleSelection(item.id)}
          accessibilityLabel={`Select record for animal ${item.animalId}`}
          aria-label={`Select record for animal ${item.animalId}`}
        />
      </View>
      <Text style={styles.cell}>{item.animalId}</Text>
      <Text style={styles.cell}>{item.healthEventDate}</Text>
      <Text style={styles.cell}>{item.healthEventSymptom}</Text>
      <Text style={styles.cell}>{item.diagnosis}</Text>
      <Text style={styles.cell}>{item.treatmentGiven}</Text>
      <Text style={styles.cell}>{item.preventive}</Text>
      <Text style={styles.cell}>{item.medicalOfficer}</Text>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.licenseId}</Text>
      <Text style={styles.cell}>${item.costOfService.toFixed(2)}</Text>
      <Text style={styles.cell}>{item.farmerName}</Text>
      <Text style={styles.cell}>{item.notes}</Text>
      <Text style={styles.cell}>
        <TouchableOpacity onPress={() => alert('Edit record')}>
          <Text style={{color: 'blue'}}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => alert('Delete record')}
          style={{marginLeft: 10}}>
          <Text style={{color: 'red'}}>Delete</Text>
        </TouchableOpacity>
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SecondaryHeader title="Curative Treatment Records" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIcon}
          accessibilityLabel="Delete selected records">
          <FastImage
            source={icons.remove}
            className="w-[20px] h-[20px]"
            tintColor="black"
          />
          <Text style={styles.headerIconText}>Delete </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerIcon}
          accessibilityLabel="Filter records">
          <FastImage
            source={icons.filter}
            className="w-[20px] h-[20px]"
            tintColor="black"
          />
          <Text style={styles.headerIconText}>Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerIcon}
          accessibilityLabel="Export records">
          <FastImage
            source={icons.download}
            className="w-[20px] h-[20px]"
            tintColor="black"
          />
          <Text style={styles.headerIconText}>Export</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.contentContainer} horizontal>
        <View style={styles.tableContainer}>
          {renderHeader()}
          <FlatList
            data={data}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            numColumns={1}
          />
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.addButton}
        accessibilityLabel="Add new record">
        <FastImage
          source={icons.add}
          className="w-[20px] h-[20px]"
          tintColor="white"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerIcon: {
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 14,
    color: 'black',
    marginLeft: 4,
  },
  contentContainer: {
    flex: 1,
  },
  tableContainer: {
    minWidth: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    alignItems: 'center',
  },
  checkboxColumn: {
    width: 40,
    justifyContent: 'center',
  },
  columnHeading: {
    flex: 1,
    fontWeight: 'bold',
    color: 'black',
    marginHorizontal: 8,
    minWidth: 120,
  },
  cell: {
    flex: 1,
    color: 'black',
    marginHorizontal: 8,
    minWidth: 120,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default CurativeTreatmentTable;
