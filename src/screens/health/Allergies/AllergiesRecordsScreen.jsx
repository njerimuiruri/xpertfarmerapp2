"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  Modal,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native"
import FastImage from "react-native-fast-image"
import LinearGradient from "react-native-linear-gradient"
import { icons } from "../../../constants"
import { COLORS } from "../../../constants/theme"
import SecondaryHeader from "../../../components/headers/secondary-header"
import { getAllergiesForActiveFarm, getAllergiesForLivestock, deleteAllergy } from "../../../services/healthservice"
import { getLivestockForActiveFarm } from "../../../services/livestock"

const { width } = Dimensions.get("window")

const AllergiesRecordsScreen = ({ navigation, route }) => {
  const routeParams = route?.params || {}
  const viewMode = routeParams.viewMode || "farm"
  const livestockId = routeParams.livestockId

  const [allergyRecords, setAllergyRecords] = useState([])
  const [livestock, setLivestock] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isRefreshingHeader, setIsRefreshingHeader] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("dateRecorded")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterByAnimal, setFilterByAnimal] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Auto-refresh functionality
  const [lastRecordCount, setLastRecordCount] = useState(0)
  const [isScreenFocused, setIsScreenFocused] = useState(true)
  const refreshIntervalRef = useRef(null)

  useEffect(() => {
    loadData()

    const unsubscribeFocus = navigation.addListener("focus", () => {
      setIsScreenFocused(true)
      loadData()
      startAutoRefresh()
    })

    const unsubscribeBlur = navigation.addListener("blur", () => {
      setIsScreenFocused(false)
      stopAutoRefresh()
    })

    startAutoRefresh()

    return () => {
      unsubscribeFocus()
      unsubscribeBlur()
      stopAutoRefresh()
    }
  }, [])

  const startAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    refreshIntervalRef.current = setInterval(() => {
      if (isScreenFocused) {
        loadData(true) // Silent refresh
      }
    }, 30000) // Refresh every 30 seconds
  }

  const stopAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }
  }

  const loadData = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true)
      }
      await Promise.all([loadAllergyRecords(silent), loadLivestock()])
    } catch (error) {
      console.error("Error loading data:", error)
      if (!silent) {
        Alert.alert("Error", "Failed to load data. Please try again.")
      }
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }

  const loadAllergyRecords = async (silent = false) => {
    try {
      let result
      if (viewMode === "livestock" && livestockId) {
        result = await getAllergiesForLivestock(livestockId)
      } else {
        result = await getAllergiesForActiveFarm()
      }

      if (result.error) {
        if (!silent) {
          Alert.alert("Error", result.error)
        }
        return
      }

      const newRecords = result.data || []
      setAllergyRecords(newRecords)

      // Check for new records
      if (lastRecordCount > 0 && newRecords.length > lastRecordCount) {
        console.log(`New allergy records detected: ${newRecords.length - lastRecordCount} new records`)
      }
      setLastRecordCount(newRecords.length)
    } catch (error) {
      console.error("Failed to load allergy records:", error)
      if (!silent) {
        Alert.alert("Error", "Failed to load allergy records. Please try again.")
      }
    }
  }

  const loadLivestock = async () => {
    try {
      const result = await getLivestockForActiveFarm()
      if (Array.isArray(result)) {
        setLivestock(result)
      } else {
        setLivestock([])
      }
    } catch (error) {
      console.error("Failed to load livestock:", error)
      setLivestock([])
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [])

  const onHeaderRefresh = useCallback(async () => {
    setIsRefreshingHeader(true)
    await loadData()
    setIsRefreshingHeader(false)
  }, [])

  const getAnimalInfo = (animalId) => {
    return livestock.find((animal) => animal.id === animalId)
  }

  const formatAnimalDisplayName = (animal) => {
    if (!animal) return "Unknown Animal"
    if (animal.category === "poultry" && animal.poultry) {
      return `${animal.type.toUpperCase()} - Flock ID: ${animal.poultry.flockId || "N/A"}`
    } else if (animal.category === "mammal" && animal.mammal) {
      return `${animal.type.toUpperCase()} - ID: ${animal.mammal.idNumber || "N/A"}`
    }
    return `${animal.type.toUpperCase()} - ID: ${animal.id}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getFilteredAndSortedRecords = () => {
    let filtered = [...allergyRecords]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (record) =>
          record.cause?.toLowerCase().includes(query) ||
          record.remedy?.toLowerCase().includes(query) ||
          record.animalIdOrFlockId?.toLowerCase().includes(query),
      )
    }

    if (filterByAnimal !== "all") {
      filtered = filtered.filter((record) => record.livestockId === filterByAnimal)
    }

    filtered.sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case "dateRecorded":
          aValue = new Date(a.dateRecorded)
          bValue = new Date(b.dateRecorded)
          break
        case "cause":
          aValue = a.cause?.toLowerCase() || ""
          bValue = b.cause?.toLowerCase() || ""
          break
        case "remedy":
          aValue = a.remedy?.toLowerCase() || ""
          bValue = b.remedy?.toLowerCase() || ""
          break
        default:
          aValue = a[sortBy] || ""
          bValue = b[sortBy] || ""
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }

  const handleViewDetails = (record) => {
    navigation.navigate("AllergyDetailScreen", {
      recordId: record.id,
      recordData: record,
    })
  }

  const handleEdit = (record) => {
    setShowDetailModal(false)
    navigation.navigate("AllergyEditScreen", {
      recordId: record.id,
      recordData: record,
    })
  }

  const handleDelete = (record) => {
    Alert.alert(
      "Delete Allergy Record",
      "Are you sure you want to delete this allergy record? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => confirmDelete(record),
        },
      ],
    )
  }

  const confirmDelete = async (record) => {
    try {
      const result = await deleteAllergy(record.id)
      if (result.error) {
        Alert.alert("Error", result.error)
        return
      }
      Alert.alert("Success", "Allergy record deleted successfully")
      await loadAllergyRecords()
    } catch (error) {
      Alert.alert("Error", "Failed to delete allergy record")
    }
  }

  const renderAllergyCard = ({ item }) => {
    const animal = getAnimalInfo(item.livestockId)
    return (
      <View style={styles.allergyCard}>
        <LinearGradient
          colors={["#F0FDF4", "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.green3 }]} />
            <Text style={[styles.statusText, { color: COLORS.green3 }]}>Recorded</Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.allergyInfo}>
                <Text style={styles.allergyCause}>{item.cause}</Text>
                <Text style={styles.allergyId}>ID: {item.animalIdOrFlockId}</Text>
              </View>
              <View style={styles.dateContainer}>
                <FastImage source={icons.calendar} style={styles.calendarIcon} tintColor={COLORS.green3} />
                <Text style={[styles.dateText, { color: COLORS.green3 }]}>{formatDate(item.dateRecorded)}</Text>
              </View>
            </View>

            {/* Animal Info */}
            {animal && (
              <View style={styles.animalSection}>
                <View style={styles.animalIconContainer}>
                  <LinearGradient colors={[COLORS.green3, COLORS.green3]} style={styles.animalIcon}>
                    <FastImage
                      source={icons.livestock || icons.account}
                      style={styles.animalIconImage}
                      tintColor="#FFFFFF"
                    />
                  </LinearGradient>
                </View>
                <View style={styles.animalInfo}>
                  <Text style={styles.animalName}>{formatAnimalDisplayName(animal)}</Text>
                  <Text style={styles.animalBreed}>
                    {(animal.category === "poultry" && animal.poultry?.breedType) ||
                      (animal.category === "mammal" && animal.mammal?.breedType) ||
                      "Unknown breed"}
                  </Text>
                </View>
              </View>
            )}

            {/* Remedy Info */}
            <View style={styles.remedySection}>
              <View style={styles.remedyHeader}>
                <View style={styles.remedyIconContainer}>
                  <FastImage
                    source={icons.medical || icons.health}
                    style={styles.remedyIcon}
                    tintColor={COLORS.green3}
                  />
                </View>
                <Text style={styles.remedyLabel}>Treatment/Remedy</Text>
              </View>
              <Text style={styles.remedyText} numberOfLines={3}>
                {item.remedy}
              </Text>
            </View>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => handleViewDetails(item)}
              activeOpacity={0.8}
            >
              <FastImage source={icons.eye || icons.view} style={styles.actionIcon} tintColor="#3B82F6" />
              <Text style={[styles.actionButtonText, styles.viewButtonText]}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEdit(item)}
              activeOpacity={0.8}
            >
              <FastImage source={icons.edit} style={styles.actionIcon} tintColor={COLORS.green3} />
              <Text style={[styles.actionButtonText, styles.editButtonText]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item)}
              activeOpacity={0.8}
            >
              <FastImage source={icons.trash} style={styles.actionIcon} tintColor="#EF4444" />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    )
  }

  const renderFiltersModal = () => (
    <Modal visible={showFilters} animationType="slide" transparent={true} onRequestClose={() => setShowFilters(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.filtersModal}>
          <LinearGradient colors={["#FFFFFF", "#F0FDF4"]} style={styles.modalGradient}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)} style={styles.closeButton}>
                <FastImage source={icons.close || icons.x} style={styles.closeIcon} tintColor="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filtersContent}>
              {/* Sort Section */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Sort By</Text>
                {[
                  { key: "dateRecorded", label: "Date Recorded" },
                  { key: "cause", label: "Allergy Cause" },
                  { key: "remedy", label: "Treatment/Remedy" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.filterOption, sortBy === option.key && styles.selectedOption]}
                    onPress={() => setSortBy(option.key)}
                  >
                    <Text style={[styles.filterOptionText, sortBy === option.key && styles.selectedOptionText]}>
                      {option.label}
                    </Text>
                    {sortBy === option.key && (
                      <FastImage source={icons.check} style={styles.checkIcon} tintColor={COLORS.green3} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sort Order Section */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Sort Order</Text>
                {[
                  { key: "desc", label: "Newest First" },
                  { key: "asc", label: "Oldest First" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.filterOption, sortOrder === option.key && styles.selectedOption]}
                    onPress={() => setSortOrder(option.key)}
                  >
                    <Text style={[styles.filterOptionText, sortOrder === option.key && styles.selectedOptionText]}>
                      {option.label}
                    </Text>
                    {sortOrder === option.key && (
                      <FastImage source={icons.check} style={styles.checkIcon} tintColor={COLORS.green3} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Filter by Animal Section */}
              {viewMode === "farm" && livestock.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={styles.sectionTitle}>Filter by Animal</Text>
                  <TouchableOpacity
                    style={[styles.filterOption, filterByAnimal === "all" && styles.selectedOption]}
                    onPress={() => setFilterByAnimal("all")}
                  >
                    <Text style={[styles.filterOptionText, filterByAnimal === "all" && styles.selectedOptionText]}>
                      All Animals
                    </Text>
                    {filterByAnimal === "all" && (
                      <FastImage source={icons.check} style={styles.checkIcon} tintColor={COLORS.green3} />
                    )}
                  </TouchableOpacity>
                  {livestock.map((animal) => (
                    <TouchableOpacity
                      key={animal.id}
                      style={[styles.filterOption, filterByAnimal === animal.id && styles.selectedOption]}
                      onPress={() => setFilterByAnimal(animal.id)}
                    >
                      <Text
                        style={[styles.filterOptionText, filterByAnimal === animal.id && styles.selectedOptionText]}
                      >
                        {formatAnimalDisplayName(animal)}
                      </Text>
                      {filterByAnimal === animal.id && (
                        <FastImage source={icons.check} style={styles.checkIcon} tintColor={COLORS.green3} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearchQuery("")
                  setSortBy("dateRecorded")
                  setSortOrder("desc")
                  setFilterByAnimal("all")
                }}
              >
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyFiltersButton} onPress={() => setShowFilters(false)}>
                <LinearGradient colors={[COLORS.green3, COLORS.green3]} style={styles.applyGradient}>
                  <Text style={styles.applyFiltersText}>Apply</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient colors={["#F0FDF4", "#FFFFFF"]} style={styles.emptyGradient}>
        <FastImage source={icons.medical || icons.health} style={styles.emptyIcon} tintColor="#9CA3AF" />
        <Text style={styles.emptyTitle}>No Allergy Records</Text>
        <Text style={styles.emptySubtitle}>
          {viewMode === "livestock"
            ? "This animal has no allergy records yet."
            : "No allergy records found for your farm."}
        </Text>
        <TouchableOpacity
          style={styles.addFirstRecordButton}
          onPress={() => navigation.navigate("AddAllergiesRecords")}
          activeOpacity={0.8}
        >
          <LinearGradient colors={[COLORS.green3, COLORS.green3]} style={styles.addFirstGradient}>
            <FastImage source={icons.plus || icons.add} style={styles.addFirstIcon} tintColor="#FFFFFF" />
            <Text style={styles.addFirstText}>Add First Record</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  )

  const filteredRecords = getFilteredAndSortedRecords()

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader title="Allergy Records" onBackPress={() => navigation.goBack()} showNotification={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.green3} />
          <Text style={styles.loadingText}>Loading allergy records...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title={viewMode === "livestock" ? "Animal Allergies" : "Allergy Records"}
        onBackPress={() => navigation.goBack()}
        showNotification={true}
      />

      {/* Search and Filter Bar */}
      <View style={styles.searchFilterContainer}>
        <LinearGradient colors={["#FFFFFF", "#F0FDF4"]} style={styles.searchGradient}>
          <View style={styles.searchContainer}>
            <FastImage source={icons.search} style={styles.searchIcon} tintColor="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search allergies..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearSearchButton}>
                <FastImage source={icons.close || icons.x} style={styles.clearSearchIcon} tintColor="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)} activeOpacity={0.8}>
            <LinearGradient colors={["rgba(34, 197, 94, 0.1)", "rgba(34, 197, 94, 0.2)"]} style={styles.filterGradient}>
              <FastImage source={icons.filter} style={styles.filterIcon} tintColor={COLORS.green3} />
              <Text style={[styles.filterButtonText, { color: COLORS.green3 }]}>Filter</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View style={styles.headerActions}>
        <Text style={styles.recordsCount}>
          {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""} found
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onHeaderRefresh}
          disabled={isRefreshingHeader}
          activeOpacity={0.8}
        >
          {isRefreshingHeader ? (
            <ActivityIndicator size="small" color={COLORS.green3} />
          ) : (
            <FastImage source={icons.refresh} style={styles.refreshIcon} tintColor={COLORS.green3} />
          )}
        </TouchableOpacity>
      </View>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredRecords}
          renderItem={renderAllergyCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.green3]}
              tintColor={COLORS.green3}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("AddAllergiesRecords")}>
        <FastImage source={icons.plus || icons.add} style={styles.fabIcon} tintColor={COLORS.white} />
      </TouchableOpacity>

      {renderFiltersModal()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "Inter-Medium",
  },
  searchFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchGradient: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#1F2937",
    fontFamily: "Inter-Regular",
  },
  clearSearchButton: {
    padding: 4,
  },
  clearSearchIcon: {
    width: 16,
    height: 16,
  },
  filterButton: {
    borderRadius: 8,
    overflow: "hidden",
  },
  filterGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  recordsCount: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Inter-Medium",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  refreshIcon: {
    width: 20,
    height: 20,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  allergyCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  cardGradient: {
    padding: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  cardContent: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  allergyInfo: {
    flex: 1,
    marginRight: 12,
  },
  allergyCause: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#1F2937",
    marginBottom: 4,
  },
  allergyId: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Inter-Regular",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  calendarIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  animalSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  animalIconContainer: {
    marginRight: 12,
  },
  animalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  animalIconImage: {
    width: 18,
    height: 18,
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: "#1F2937",
    marginBottom: 2,
  },
  animalBreed: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Inter-Regular",
  },
  remedySection: {
    backgroundColor: "rgba(240, 253, 244, 0.7)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  remedyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  remedyIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  remedyIcon: {
    width: 14,
    height: 14,
  },
  remedyLabel: {
    fontSize: 12,
    color: COLORS.green3,
    fontFamily: "Inter-SemiBold",
  },
  remedyText: {
    fontSize: 14,
    color: "#1F2937",
    fontFamily: "Inter-Regular",
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewButton: {
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  editButton: {
    backgroundColor: "rgba(34, 197, 94, 0.05)",
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  deleteButton: {
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  actionIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  viewButtonText: {
    color: "#3B82F6",
  },
  editButtonText: {
    color: COLORS.green3,
  },
  deleteButtonText: {
    color: "#EF4444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  filtersModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "80%",
    overflow: "hidden",
  },
  modalGradient: {
    flex: 1,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    color: "#1F2937",
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  filtersContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#1F2937",
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedOption: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: COLORS.green3,
  },
  filterOptionText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Inter-Regular",
  },
  selectedOptionText: {
    color: COLORS.green3,
    fontFamily: "Inter-Medium",
  },
  checkIcon: {
    width: 16,
    height: 16,
  },
  filterActions: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  clearFiltersText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Inter-Medium",
  },
  applyFiltersButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  applyGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  applyFiltersText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "Inter-SemiBold",
  },
  emptyContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  emptyGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter-SemiBold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Inter-Regular",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  addFirstRecordButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  addFirstGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  addFirstIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  addFirstText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Inter-SemiBold",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.green3,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    width: 24,
    height: 24,
  },
})

export default AllergiesRecordsScreen
