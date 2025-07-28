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
import {
  getGeneticDisorderRecordsForActiveFarm,
  getGeneticDisorderRecordsForLivestock,
  getGeneticDisorderRecordById,
  deleteGeneticDisorderRecord,
} from "../../../services/healthservice"
import { getLivestockForActiveFarm } from "../../../services/livestock"

const { width } = Dimensions.get("window")

const GeneticDisorderRecordsScreen = ({ navigation, route }) => {
  const routeParams = route?.params || {}
  const viewMode = routeParams.viewMode || "farm"
  const livestockId = routeParams.livestockId

  const [geneticDisorderRecords, setGeneticDisorderRecords] = useState([])
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
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(null)
  const [lastRecordCount, setLastRecordCount] = useState(0)

  useEffect(() => {
    loadData()

    // Set up navigation focus listener for auto-refresh
    const unsubscribeFocus = navigation.addListener("focus", () => {
      console.log("GeneticDisorderRecordsScreen focused - refreshing data")
      handleHeaderRefresh()
      startAutoRefresh()
    })

    // Set up navigation blur listener to stop auto-refresh
    const unsubscribeBlur = navigation.addListener("blur", () => {
      console.log("GeneticDisorderRecordsScreen blurred - stopping auto-refresh")
      stopAutoRefresh()
    })

    // Start auto-refresh when component mounts
    startAutoRefresh()

    return () => {
      unsubscribeFocus()
      unsubscribeBlur()
      stopAutoRefresh()
    }
  }, [])

  // Auto-refresh functions
  const startAutoRefresh = () => {
    stopAutoRefresh() // Clear any existing interval
    const interval = setInterval(() => {
      console.log("Auto-refreshing genetic disorder records...")
      loadGeneticDisorderRecords(true) // Silent refresh
    }, 30000) // Refresh every 30 seconds
    setAutoRefreshInterval(interval)
  }

  const stopAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
      setAutoRefreshInterval(null)
    }
  }

  const handleHeaderRefresh = async () => {
    setIsRefreshingHeader(true)
    try {
      await loadData()
      console.log("Header refresh completed")
    } catch (error) {
      console.error("Header refresh failed:", error)
    } finally {
      setIsRefreshingHeader(false)
    }
  }

  const loadData = async () => {
    try {
      setIsLoading(true)
      await Promise.all([loadGeneticDisorderRecords(), loadLivestock()])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadGeneticDisorderRecords = async (silent = false) => {
    try {
      let result
      if (viewMode === "livestock" && livestockId) {
        result = await getGeneticDisorderRecordsForLivestock(livestockId)
      } else {
        result = await getGeneticDisorderRecordsForActiveFarm()
      }

      if (result.error) {
        if (!silent) {
          Alert.alert("Error", result.error)
        }
        return
      }

      const newRecords = result.data || []

      // Check for new records
      if (lastRecordCount > 0 && newRecords.length > lastRecordCount) {
        const newRecordCount = newRecords.length - lastRecordCount
        console.log(`${newRecordCount} new genetic disorder record(s) detected`)
      }

      setGeneticDisorderRecords(newRecords)
      setLastRecordCount(newRecords.length)
    } catch (error) {
      console.error("Failed to load genetic disorder records:", error)
      if (!silent) {
        Alert.alert("Error", "Failed to load genetic disorder records. Please try again.")
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
    let filtered = [...geneticDisorderRecords]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (record) =>
          record.nameOfCondition?.toLowerCase().includes(query) ||
          record.remedy?.toLowerCase().includes(query) ||
          record.administeredByName?.toLowerCase().includes(query),
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
        case "nameOfCondition":
          aValue = a.nameOfCondition?.toLowerCase() || ""
          bValue = b.nameOfCondition?.toLowerCase() || ""
          break
        case "administeredByName":
          aValue = a.administeredByName?.toLowerCase() || ""
          bValue = b.administeredByName?.toLowerCase() || ""
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

  const handleViewDetails = async (record) => {
    setLoadingDetail(true)
    setShowDetailModal(true)
    try {
      const result = await getGeneticDisorderRecordById(record.id)
      if (result.error) {
        Alert.alert("Error", result.error)
        setShowDetailModal(false)
        return
      }
      setSelectedRecord(result.data || record)
    } catch (error) {
      console.error("Failed to load record details:", error)
      setSelectedRecord(record)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleEdit = (record) => {
    setShowDetailModal(false)
    navigation.navigate("GeneticDisorderEditScreen", {
      recordId: record.id,
      recordData: record,
    })
  }

  const handleDelete = (record) => {
    Alert.alert(
      "Delete Genetic Disorder Record",
      "Are you sure you want to delete this genetic disorder record? This action cannot be undone.",
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
      const result = await deleteGeneticDisorderRecord(record.id)
      if (result.error) {
        Alert.alert("Error", result.error)
        return
      }
      Alert.alert("Success", "Genetic disorder record deleted successfully")
      await loadGeneticDisorderRecords()
      setShowDetailModal(false)
    } catch (error) {
      Alert.alert("Error", "Failed to delete genetic disorder record")
    }
  }

  const renderGeneticDisorderCard = ({ item }) => {
    const animal = getAnimalInfo(item.livestockId)
    return (
      <View style={styles.disorderCard}>
        <LinearGradient
          colors={["#F0FDF4", "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Recorded</Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.conditionInfo}>
                <Text style={styles.conditionName}>{item.nameOfCondition}</Text>
                <Text style={styles.remedy} numberOfLines={2}>
                  {item.remedy}
                </Text>
              </View>
              <View style={styles.dateContainer}>
                <FastImage source={icons.calendar} style={styles.calendarIcon} tintColor={COLORS.green3 || "#10B981"} />
                <Text style={styles.dateText}>{formatDate(item.dateRecorded)}</Text>
              </View>
            </View>

            {/* Animal Info */}
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

            {/* Quick Info Row */}
            <View style={styles.quickInfoRow}>
              <View style={styles.quickInfoItem}>
                <View style={styles.infoIconContainer}>
                  <FastImage source={icons.user || icons.account} style={styles.infoIcon} tintColor="#8B5CF6" />
                </View>
                <Text style={styles.quickInfoLabel}>Type</Text>
                <Text style={styles.quickInfoValue}>{item.administeredByType}</Text>
              </View>
              <View style={styles.quickInfoItem}>
                <View style={styles.infoIconContainer}>
                  <FastImage source={icons.medical || icons.health} style={styles.infoIcon} tintColor="#EF4444" />
                </View>
                <Text style={styles.quickInfoLabel}>By</Text>
                <Text style={styles.quickInfoValue}>{item.administeredByName}</Text>
              </View>
              {item.practiceId && (
                <View style={styles.quickInfoItem}>
                  <View style={styles.infoIconContainer}>
                    <FastImage source={icons.building || icons.hospital} style={styles.infoIcon} tintColor="#059669" />
                  </View>
                  <Text style={styles.quickInfoLabel}>Practice</Text>
                  <Text style={styles.quickInfoValue}>ID: {item.practiceId}</Text>
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

  const renderDetailModal = () => (
    <Modal
      visible={showDetailModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDetailModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.detailModal}>
          <LinearGradient colors={["#FFFFFF", "#F0FDF4"]} style={styles.modalGradient}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Genetic Disorder Details</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.closeButton}>
                <FastImage source={icons.close || icons.x} style={styles.closeIcon} tintColor="#6B7280" />
              </TouchableOpacity>
            </View>
            {loadingDetail ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.green3 || "#10B981"} />
                <Text style={styles.loadingText}>Loading details...</Text>
              </View>
            ) : (
              selectedRecord && (
                <ScrollView style={styles.detailContent}>
                  {/* Condition Info */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Condition Information</Text>
                    <View style={styles.detailCard}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailKey}>Condition:</Text>
                        <Text style={styles.detailText}>{selectedRecord.nameOfCondition}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailKey}>Date Recorded:</Text>
                        <Text style={styles.detailText}>{formatDate(selectedRecord.dateRecorded)}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailKey}>Remedy/Treatment:</Text>
                        <Text style={styles.detailText}>{selectedRecord.remedy}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Administrator Info */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Administrator Information</Text>
                    <View style={styles.detailCard}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailKey}>Type:</Text>
                        <Text style={styles.detailText}>{selectedRecord.administeredByType}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailKey}>Name:</Text>
                        <Text style={styles.detailText}>{selectedRecord.administeredByName}</Text>
                      </View>
                      {selectedRecord.practiceId && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailKey}>Practice ID:</Text>
                          <Text style={styles.detailText}>{selectedRecord.practiceId}</Text>
                        </View>
                      )}
                      {selectedRecord.technicianId && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailKey}>Technician ID:</Text>
                          <Text style={styles.detailText}>{selectedRecord.technicianId}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Animal Info */}
                  {(() => {
                    const animal = getAnimalInfo(selectedRecord.livestockId)
                    return (
                      animal && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailSectionTitle}>Animal Information</Text>
                          <View style={styles.enhancedAnimalCard}>
                            <LinearGradient colors={["#F0FDF4", "#ECFDF5"]} style={styles.animalCardGradient}>
                              <View style={styles.animalCardHeader}>
                                <LinearGradient
                                  colors={[COLORS.green3 || "#10B981", "#059669"]}
                                  style={styles.animalIcon}
                                >
                                  <FastImage
                                    source={icons.livestock || icons.account}
                                    style={styles.animalIconImage}
                                    tintColor="#FFFFFF"
                                  />
                                </LinearGradient>
                                <View style={styles.animalHeaderInfo}>
                                  <Text style={styles.animalCardName}>{formatAnimalDisplayName(animal)}</Text>
                                  <Text style={styles.animalCardCategory}>{animal.category?.toUpperCase()}</Text>
                                </View>
                              </View>
                              <View style={styles.animalDetailsGrid}>
                                <View style={styles.detailGridRow}>
                                  <View style={styles.detailGridItem}>
                                    <Text style={styles.detailGridLabel}>Breed</Text>
                                    <Text style={styles.detailGridValue}>
                                      {(animal.category === "poultry" && animal.poultry?.breedType) ||
                                        (animal.category === "mammal" && animal.mammal?.breedType) ||
                                        "Unknown"}
                                    </Text>
                                  </View>
                                  <View style={styles.detailGridItem}>
                                    <Text style={styles.detailGridLabel}>Gender</Text>
                                    <Text style={styles.detailGridValue}>
                                      {(animal.category === "poultry" && animal.poultry?.gender) ||
                                        (animal.category === "mammal" && animal.mammal?.gender) ||
                                        "Unknown"}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </LinearGradient>
                          </View>
                        </View>
                      )
                    )
                  })()}
                </ScrollView>
              )
            )}

            {/* Modal Actions */}
            {selectedRecord && !loadingDetail && (
              <View style={styles.detailModalActions}>
                <TouchableOpacity
                  style={styles.editModalButton}
                  onPress={() => handleEdit(selectedRecord)}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={["#059669", "#047857"]} style={styles.editGradient}>
                    <FastImage source={icons.edit} style={styles.modalActionIcon} tintColor="#FFFFFF" />
                    <Text style={styles.editModalButtonText}>Edit Record</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteModalButton}
                  onPress={() => handleDelete(selectedRecord)}
                  activeOpacity={0.8}
                >
                  <View style={styles.deleteButtonContainer}>
                    <FastImage source={icons.trash} style={styles.modalActionIcon} tintColor="#EF4444" />
                    <Text style={styles.deleteModalButtonText}>Delete</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </View>
      </View>
    </Modal>
  )

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
                  { key: "nameOfCondition", label: "Condition Name" },
                  { key: "administeredByName", label: "Administrator Name" },
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
                  setSortBy("dateRecorded")
                  setSortOrder("desc")
                  setFilterByAnimal("all")
                }}
              >
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyFiltersButton} onPress={() => setShowFilters(false)}>
                <View style={[styles.applyGradient, { backgroundColor: COLORS.green3 || "#10B981" }]}>
                  <Text style={styles.applyFiltersText}>Apply</Text>
                </View>
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
        <Text style={styles.emptyTitle}>No Genetic Disorder Records</Text>
        <Text style={styles.emptySubtitle}>
          {viewMode === "livestock"
            ? "This animal has no genetic disorder records yet."
            : "No genetic disorder records found for your farm."}
        </Text>
        <TouchableOpacity
          style={styles.addFirstRecordButton}
          onPress={() => navigation.navigate("AddGeneticsDisorderRecords")}
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
        <SecondaryHeader
          title="Genetic Disorder Records"
          onBackPress={() => navigation.goBack()}
          showNotification={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.green3 || "#10B981"} />
          <Text style={styles.loadingText}>Loading genetic disorder records...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title={viewMode === "livestock" ? "Animal Genetic Disorders" : "Genetic Disorder Records"}
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
              placeholder="Search conditions..."
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
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleHeaderRefresh}
          disabled={isRefreshingHeader}
          activeOpacity={0.8}
        >
          <View style={styles.refreshButtonContent}>
            {isRefreshingHeader ? (
              <ActivityIndicator size="small" color={COLORS.green3 || "#10B981"} />
            ) : (
              <FastImage
                source={icons.refresh || icons.reload}
                style={styles.refreshIcon}
                tintColor={COLORS.green3 || "#10B981"}
              />
            )}
            <Text style={[styles.refreshText, { color: COLORS.green3 || "#10B981" }]}>
              {isRefreshingHeader ? "Refreshing..." : "Refresh"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredRecords}
          renderItem={renderGeneticDisorderCard}
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (viewMode === "livestock" && livestockId) {
            navigation.navigate("AddGeneticsDisorderRecords", { livestockId })
          } else {
            navigation.navigate("AddGeneticsDisorderRecords")
          }
        }}
        activeOpacity={0.8}
      >
        <FastImage source={icons.plus || icons.add} style={styles.fabIcon} tintColor={COLORS.white} />
      </TouchableOpacity>

      {renderDetailModal()}

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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    fontFamily: "Inter-Medium",
  },
  searchFilterContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  refreshButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  refreshText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  disorderCard: {
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
    backgroundColor: COLORS.lightGreen,
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
    color: "black",
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
  conditionInfo: {
    flex: 1,
    marginRight: 12,
  },
  conditionName: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#1F2937",
    marginBottom: 4,
  },
  remedy: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Inter-Regular",
    lineHeight: 20,
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
    color: "#059669",
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  animalIconImage: {
    width: 20,
    height: 20,
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
    flexWrap: "wrap",
  },
  quickInfoItem: {
    alignItems: "center",
    minWidth: "30%",
    marginBottom: 8,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoIcon: {
    width: 16,
    height: 16,
  },
  quickInfoLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontFamily: "Inter-Medium",
    marginBottom: 2,
  },
  quickInfoValue: {
    fontSize: 12,
    color: "#1F2937",
    fontFamily: "Inter-SemiBold",
    textAlign: "center",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(16, 185, 129, 0.2)",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: "30%",
    justifyContent: "center",
  },
  viewButton: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  editButton: {
    backgroundColor: "rgba(5, 150, 105, 0.1)",
  },
  deleteButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  actionIcon: {
    width: 16,
    height: 16,
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
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.green3,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyGradient: {
    alignItems: "center",
    padding: 32,
    borderRadius: 16,
    width: "100%",
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
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
    lineHeight: 20,
    marginBottom: 24,
  },
  addFirstRecordButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  addFirstGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailModal: {
    width: width * 0.9,
    maxHeight: "80%",
    borderRadius: 20,
    overflow: "hidden",
  },
  filtersModal: {
    width: width * 0.9,
    maxHeight: "70%",
    borderRadius: 20,
    overflow: "hidden",
  },
  modalGradient: {
    borderRadius: 20,
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
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  detailContent: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#1F2937",
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  detailKey: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#6B7280",
    width: 120,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    fontFamily: "Inter-Regular",
    lineHeight: 20,
  },
  enhancedAnimalCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  animalCardGradient: {
    padding: 16,
  },
  animalCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  animalHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  animalCardName: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#1F2937",
    marginBottom: 4,
  },
  animalCardCategory: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Inter-Medium",
  },
  animalDetailsGrid: {
    marginTop: 8,
  },
  detailGridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailGridItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  detailGridLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Inter-Medium",
    marginBottom: 4,
  },
  detailGridValue: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: "#374151",
  },
  detailModalActions: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  editModalButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  editGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  editModalButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  deleteModalButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  deleteButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  deleteModalButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#EF4444",
    marginLeft: 8,
  },
  modalActionIcon: {
    width: 20,
    height: 20,
  },
  filtersContent: {
    maxHeight: 400,
    paddingHorizontal: 20,
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
  },
  selectedOption: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: COLORS.green3 || "#10B981",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Inter-Regular",
    flex: 1,
  },
  selectedOptionText: {
    color: COLORS.black,
    fontFamily: "Inter-Medium",
  },
  checkIcon: {
    width: 16,
    height: 16,
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  clearFiltersButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  clearFiltersText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Inter-Medium",
  },
  applyFiltersButton: {
    borderRadius: 8,
    overflow: "hidden",
  },
  applyGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  applyFiltersText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "Inter-Medium",
  },
})

export default GeneticDisorderRecordsScreen
