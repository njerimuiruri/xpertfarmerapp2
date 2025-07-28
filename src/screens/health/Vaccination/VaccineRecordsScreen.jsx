"use client"

import { useState, useEffect, useCallback } from "react"
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
import { getVaccinationsForActiveFarm, getVaccinationsForLivestock } from "../../../services/healthservice"
import { getLivestockForActiveFarm } from "../../../services/livestock"

const { width } = Dimensions.get("window")

const VaccineRecordsScreen = ({ navigation, route }) => {
  const routeParams = route?.params || {}
  const viewMode = routeParams.viewMode || "farm"
  const livestockId = routeParams.livestockId

  const [vaccineRecords, setVaccineRecords] = useState([])
  const [livestock, setLivestock] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("dateAdministered")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterByAnimal, setFilterByAnimal] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Auto-refresh functionality
  useEffect(() => {
    loadData()
  }, [])

  // Listen for navigation focus to refresh data when returning from add/edit screens
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // Refresh data when screen comes into focus
      loadData()
    })

    return unsubscribe
  }, [navigation])

  // Auto-refresh every 30 seconds when screen is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigation.isFocused()) {
        loadVaccineRecords()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [navigation])

  const loadData = async () => {
    try {
      setIsLoading(true)
      await Promise.all([loadVaccineRecords(), loadLivestock()])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadVaccineRecords = async () => {
    try {
      let result
      if (viewMode === "livestock" && livestockId) {
        result = await getVaccinationsForLivestock(livestockId)
      } else {
        result = await getVaccinationsForActiveFarm()
      }

      if (result.error) {
        Alert.alert("Error", result.error)
        return
      }

      const newRecords = result.data || []

      // Check if there are new records and show a subtle notification
      if (vaccineRecords.length > 0 && newRecords.length > vaccineRecords.length) {
        const newRecordsCount = newRecords.length - vaccineRecords.length
        // You could show a toast notification here if you have a toast library
        console.log(`${newRecordsCount} new vaccine record(s) added`)
      }

      setVaccineRecords(newRecords)
    } catch (error) {
      console.error("Failed to load vaccine records:", error)
      Alert.alert("Error", "Failed to load vaccine records. Please try again.")
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

  // Enhanced refresh with loading indicator
  const handleManualRefresh = async () => {
    setRefreshing(true)
    try {
      await loadData()
      // Show success feedback
      Alert.alert("Success", "Records refreshed successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to refresh records")
    } finally {
      setRefreshing(false)
    }
  }

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

  const formatCurrency = (amount) => {
    return amount ? `KES ${Number.parseFloat(amount).toLocaleString()}` : "N/A"
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatWeight = (weight) => {
    return weight ? `${weight} kg` : "N/A"
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "Unknown"
    const birth = new Date(dateOfBirth)
    const now = new Date()
    const diffTime = Math.abs(now - birth)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays} days`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? "s" : ""}`
    } else {
      const years = Math.floor(diffDays / 365)
      const remainingMonths = Math.floor((diffDays % 365) / 30)
      return `${years} year${years > 1 ? "s" : ""}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}` : ""}`
    }
  }

  const getFilteredAndSortedRecords = () => {
    let filtered = [...vaccineRecords]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (record) =>
          record.vaccinationAgainst?.toLowerCase().includes(query) ||
          record.drugAdministered?.toLowerCase().includes(query) ||
          record.administeredBy?.toLowerCase().includes(query),
      )
    }

    if (filterByAnimal !== "all") {
      filtered = filtered.filter((record) => record.livestockId === filterByAnimal)
    }

    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case "dateAdministered":
          aValue = new Date(a.dateAdministered)
          bValue = new Date(b.dateAdministered)
          break
        case "vaccinationAgainst":
          aValue = a.vaccinationAgainst?.toLowerCase() || ""
          bValue = b.vaccinationAgainst?.toLowerCase() || ""
          break
        case "cost":
          aValue = (Number.parseFloat(a.costOfVaccine) || 0) + (Number.parseFloat(a.costOfService) || 0)
          bValue = (Number.parseFloat(b.costOfVaccine) || 0) + (Number.parseFloat(b.costOfService) || 0)
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
    navigation.navigate("VaccineDetailScreen", {
      recordId: record.id,
      recordData: record,
    })
  }

  const handleEdit = (record) => {
    setShowDetailModal(false)
    navigation.navigate("VaccineEditScreen", {
      recordId: record.id,
      recordData: record,
    })
  }

  const handleDelete = (record) => {
    Alert.alert(
      "Delete Vaccine Record",
      "Are you sure you want to delete this vaccination record? This action cannot be undone.",
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
      Alert.alert("Success", "Vaccine record deleted successfully")
      await loadVaccineRecords()
    } catch (error) {
      Alert.alert("Error", "Failed to delete vaccine record")
    }
  }

  const renderVaccineCard = ({ item }) => {
    const animal = getAnimalInfo(item.livestockId)
    const totalCost = (Number.parseFloat(item.costOfVaccine) || 0) + (Number.parseFloat(item.costOfService) || 0)

    return (
      <View style={styles.vaccineCard}>
        <LinearGradient
          colors={["#F0FDF4", "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Completed</Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.vaccineInfo}>
                <Text style={styles.vaccinationAgainst}>{item.vaccinationAgainst}</Text>
                <Text style={styles.drugAdministered}>{item.drugAdministered}</Text>
              </View>
              <View style={styles.dateContainer}>
                <FastImage source={icons.calendar} style={styles.calendarIcon} tintColor={COLORS.green3 || "#10B981"} />
                <Text style={styles.dateText}>{formatDate(item.dateAdministered)}</Text>
              </View>
            </View>

            {/* Animal Info with Enhanced Design */}
            {animal && (
              <View style={styles.animalSection}>
                <View style={styles.animalIconContainer}>
                  <LinearGradient colors={[COLORS.green3 || "#10B981", "#059669"]} style={styles.animalIcon}>
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

            {/* Enhanced Quick Info Row */}
            <View style={styles.quickInfoRow}>
              <View style={styles.quickInfoItem}>
                <View style={styles.infoIconContainer}>
                  <FastImage source={icons.medical || icons.health} style={styles.infoIcon} tintColor="#6366F1" />
                </View>
                <Text style={styles.quickInfoLabel}>Dosage</Text>
                <Text style={styles.quickInfoValue}>{item.dosage}</Text>
              </View>

              <View style={styles.quickInfoItem}>
                <View style={styles.infoIconContainer}>
                  <FastImage source={icons.user || icons.account} style={styles.infoIcon} tintColor="#8B5CF6" />
                </View>
                <Text style={styles.quickInfoLabel}>By</Text>
                <Text style={styles.quickInfoValue}>{item.administeredBy}</Text>
              </View>

              {totalCost > 0 && (
                <View style={styles.quickInfoItem}>
                  <View style={styles.infoIconContainer}>
                    <FastImage source={icons.dollar || icons.money} style={styles.infoIcon} tintColor="#059669" />
                  </View>
                  <Text style={styles.quickInfoLabel}>Cost</Text>
                  <Text style={styles.costValue}>{formatCurrency(totalCost)}</Text>
                </View>
              )}
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
              <FastImage source={icons.edit} style={styles.actionIcon} tintColor="#059669" />
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
          <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} style={styles.modalGradient}>
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
                  { key: "dateAdministered", label: "Date Administered" },
                  { key: "vaccinationAgainst", label: "Vaccination Against" },
                  { key: "cost", label: "Total Cost" },
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
                      <FastImage source={icons.check} style={styles.checkIcon} tintColor={COLORS.green3 || "#10B981"} />
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
                      <FastImage source={icons.check} style={styles.checkIcon} tintColor={COLORS.green3 || "#10B981"} />
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
                      <FastImage source={icons.check} style={styles.checkIcon} tintColor={COLORS.green3 || "#10B981"} />
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
                        <FastImage
                          source={icons.check}
                          style={styles.checkIcon}
                          tintColor={COLORS.green3 || "#10B981"}
                        />
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
                  setSortBy("dateAdministered")
                  setSortOrder("desc")
                  setFilterByAnimal("all")
                }}
              >
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyFiltersButton} onPress={() => setShowFilters(false)}>
                <LinearGradient colors={[COLORS.green3 || "#10B981", "#059669"]} style={styles.applyGradient}>
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
      <LinearGradient colors={["#F8FAFC", "#FFFFFF"]} style={styles.emptyGradient}>
        <FastImage source={icons.medical || icons.health} style={styles.emptyIcon} tintColor="#9CA3AF" />
        <Text style={styles.emptyTitle}>No Vaccine Records</Text>
        <Text style={styles.emptySubtitle}>
          {viewMode === "livestock"
            ? "This animal has no vaccination records yet."
            : "No vaccination records found for your farm."}
        </Text>
        <TouchableOpacity
          style={styles.addFirstRecordButton}
          onPress={() => navigation.navigate("AddVaccineRecords")}
          activeOpacity={0.8}
        >
          <View style={[styles.addFirstGradient, { backgroundColor: COLORS.green3 || "#10B981" }]}>
            <FastImage source={icons.plus || icons.add} style={styles.addFirstIcon} tintColor="#FFFFFF" />
            <Text style={styles.addFirstText}>Add First Record</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  )

  const filteredRecords = getFilteredAndSortedRecords()

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader title="Vaccine Records" onBackPress={() => navigation.goBack()} showNotification={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.green3 || "#10B981"} />
          <Text style={styles.loadingText}>Loading vaccine records...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title={viewMode === "livestock" ? "Animal Vaccines" : "Vaccine Records"}
        onBackPress={() => navigation.goBack()}
        showNotification={true}
        rightComponent={
          <TouchableOpacity style={styles.refreshButton} onPress={handleManualRefresh} disabled={refreshing}>
            <FastImage
              source={icons.refresh || icons.reload}
              style={[styles.refreshIcon, refreshing && styles.refreshIconRotating]}
              tintColor={COLORS.green3 || "#10B981"}
            />
          </TouchableOpacity>
        }
      />

      {/* Search and Filter Bar */}
      <View style={styles.searchFilterContainer}>
        <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} style={styles.searchGradient}>
          <View style={styles.searchContainer}>
            <FastImage source={icons.search} style={styles.searchIcon} tintColor="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search vaccines..."
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
            <LinearGradient colors={["#EFF6FF", "#DBEAFE"]} style={styles.filterGradient}>
              <FastImage source={icons.filter} style={styles.filterIcon} tintColor="#3B82F6" />
              <Text style={styles.filterButtonText}>Filter</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View style={styles.headerActions}>
        <Text style={styles.recordsCount}>
          {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""} found
        </Text>
        {refreshing && (
          <View style={styles.refreshingIndicator}>
            <ActivityIndicator size="small" color={COLORS.green3 || "#10B981"} />
            <Text style={styles.refreshingText}>Refreshing...</Text>
          </View>
        )}
      </View>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredRecords}
          renderItem={renderVaccineCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.green3 || "#10B981"]}
              tintColor={COLORS.green3 || "#10B981"}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("AddVaccineRecords")}>
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

  // Refresh Button Styles
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  refreshIcon: {
    width: 20,
    height: 20,
  },
  refreshIconRotating: {
    // You can add rotation animation here if needed
  },
  refreshingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  refreshingText: {
    fontSize: 12,
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
    color: "#3B82F6",
    fontFamily: "Inter-Medium",
  },

  // Header Actions styles
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
  addButton: {
    borderRadius: 8,
    overflow: "hidden",
  },
  addGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addIcon: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  addButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "Inter-SemiBold",
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  vaccineCard: {
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
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green3 || "#10B981",
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.green3 || "#059669",
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
  vaccineInfo: {
    flex: 1,
    marginRight: 12,
  },
  vaccinationAgainst: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#1F2937",
    marginBottom: 4,
  },
  drugAdministered: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Inter-Regular",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
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
    color: COLORS.green3 || "#059669",
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
    borderColor: "rgba(16, 185, 129, 0.2)",
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
  quickInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickInfoItem: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoIcon: {
    width: 16,
    height: 16,
  },
  quickInfoLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "Inter-Medium",
    marginBottom: 2,
    textAlign: "center",
  },
  quickInfoValue: {
    fontSize: 13,
    color: "#1F2937",
    fontFamily: "Inter-SemiBold",
    textAlign: "center",
  },
  costValue: {
    fontSize: 13,
    color: "#059669",
    fontFamily: "Inter-Bold",
    textAlign: "center",
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
    backgroundColor: "rgba(5, 150, 105, 0.05)",
    borderColor: "rgba(5, 150, 105, 0.2)",
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
    color: "#059669",
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
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: COLORS.green3 || "#10B981",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Inter-Regular",
  },
  selectedOptionText: {
    color: COLORS.green3 || "#059669",
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
    backgroundColor: COLORS.green3 || "#10B981",
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

export default VaccineRecordsScreen
