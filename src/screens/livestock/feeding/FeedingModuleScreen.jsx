"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  TextInput,
  Dimensions,
} from "react-native"
import { Box, HStack, VStack, Badge, Menu, Pressable, Divider, Center, Icon, Select, CheckIcon } from "native-base"
import FastImage from "react-native-fast-image"
import { icons } from "../../../constants"
import { COLORS } from "../../../constants/theme"
import SecondaryHeader from "../../../components/headers/secondary-header"
import { getFeedingProgramsForActiveFarm, deleteFeedingProgram, getFeedingProgramById } from "../../../services/feeding"
import { getLivestockForActiveFarm } from "../../../services/livestock"

const { width } = Dimensions.get("window")

const FeedingModuleScreen = ({ navigation }) => {
  const [feedingPrograms, setFeedingPrograms] = useState([])
  const [filteredPrograms, setFilteredPrograms] = useState([])
  const [livestock, setLivestock] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [detailsModalVisible, setDetailsModalVisible] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("All")
  const [sortBy, setSortBy] = useState("Recent")
  const [showFilters, setShowFilters] = useState(false)

  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterAndSearchPrograms()
  }, [feedingPrograms, searchQuery, filterType, sortBy])

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false)
        setSuccessMessage("")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessToast])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [programsData, livestockData] = await Promise.all([
        getFeedingProgramsForActiveFarm(),
        getLivestockForActiveFarm(),
      ])
      setFeedingPrograms(programsData)
      setLivestock(livestockData)
    } catch (error) {
      console.error("Error fetching data:", error)
      Alert.alert("Oops!", "We couldn't load your feeding programs. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  const filterAndSearchPrograms = () => {
    let filtered = [...feedingPrograms]
    if (searchQuery) {
      filtered = filtered.filter((program) => {
        const animalInfo = getAnimalInfo(program)
        return (
          animalInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          program.feedType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          program.notes?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
    }
    if (filterType !== "All") {
      filtered = filtered.filter((program) => program.programType === filterType)
    }
    switch (sortBy) {
      case "Recent":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case "Oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
      case "Name":
        filtered.sort((a, b) => {
          const aName = getAnimalInfo(a)?.name || ""
          const bName = getAnimalInfo(b)?.name || ""
          return aName.localeCompare(bName)
        })
        break
      default:
        break
    }
    setFilteredPrograms(filtered)
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }, [fetchData])

  const getAnimalInfo = (program) => {
    if (program.programType === "Single Animal" && program.animalId) {
      const animal = livestock.find((l) => l.id === program.animalId)
      return {
        name: animal?.mammal?.idNumber || program.animalId,
        type: program.animalType,
        category: "Animal",
      }
    } else if (program.programType === "Group" && program.groupId) {
      const group = livestock.find((l) => l.id === program.groupId)
      return {
        name: group?.poultry?.flockId || program.groupId,
        type: program.groupType,
        category: "Group",
        quantity: group?.poultry?.currentQuantity || group?.poultry?.initialQuantity || 0,
      }
    }
    return null
  }

  const handleDelete = async (programId) => {
    Alert.alert(
      "Delete Feeding Program?",
      "This will permanently remove this feeding program and cannot be undone.",
      [
        { text: "Keep Program", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFeedingProgram(programId)
              setFeedingPrograms((prev) => prev.filter((p) => p.id !== programId))
              setSuccessMessage("Feeding program deleted successfully!")
              setShowSuccessToast(true)
            } catch (error) {
              Alert.alert("Error", "Couldn't delete the program. Please try again.")
            }
          },
        },
      ],
    )
  }

  const handleViewDetails = async (program) => {
    setLoadingDetails(true)
    setDetailsModalVisible(true)
    try {
      const detailedProgram = await getFeedingProgramById(program.id)
      setSelectedProgram(detailedProgram)
    } catch (error) {
      console.error("Error fetching program details:", error)
      Alert.alert("Error", "Couldn't load program details. Please try again.")
      setDetailsModalVisible(false)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleEdit = (program) => {
    navigation.navigate("EditFeedingRequirementScreen", { programId: program.id })
  }

  const handleCardPress = (program) => {
    navigation.navigate("FeedingDetailsScreen", { programId: program.id })
  }

  const getFeedTypeColor = (feedType) => {
    switch (feedType) {
      case "Basal Feed Only":
        return "#22c55e"
      case "Basal Feed + Concentrates + Supplements":
        return "#f59e0b"
      case "Concentrates Only":
        return "#3b82f6"
      default:
        return "#6b7280"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Enhanced search and filter component
  const renderSearchAndFilter = () => (
    <Box bg="white" borderRadius={20} shadow={1} mb={6} p={5}>
      {/* Search Bar */}
      <Box bg="#f8fafc" borderRadius={16} px={4} py={3} mb={4}>
        <HStack alignItems="center" space={3}>
          <FastImage source={icons.search} style={styles.searchIcon} tintColor="#64748b" />
          <TextInput
            placeholder="Search by animal name, feed type, or notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#94a3b8"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.clearSearchText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </HStack>
      </Box>

      {/* Quick Stats */}
      <HStack justifyContent="space-between" alignItems="center" mb={4}>
        <VStack>
          <Text style={styles.statsNumber}>{filteredPrograms.length}</Text>
          <Text style={styles.statsLabel}>Programs Found</Text>
        </VStack>
        <VStack alignItems="center">
          <Text style={styles.statsNumber}>{feedingPrograms.filter(p => p.programType === "Single Animal").length}</Text>
          <Text style={styles.statsLabel}>Individual</Text>
        </VStack>
        <VStack alignItems="center">
          <Text style={styles.statsNumber}>{feedingPrograms.filter(p => p.programType === "Group").length}</Text>
          <Text style={styles.statsLabel}>Groups</Text>
        </VStack>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.filterToggle, { backgroundColor: showFilters ? "#3b82f6" : "#f1f5f9" }]}
        >
          <FastImage
            source={icons.filter}
            style={styles.filterToggleIcon}
            tintColor={showFilters ? "white" : "#64748b"}
          />
        </TouchableOpacity>
      </HStack>

      {/* Expandable Filters */}
      {showFilters && (
        <VStack space={4} pt={4} borderTopWidth={1} borderTopColor="#e2e8f0">
          <HStack space={3}>
            <Box flex={1}>
              <Text style={styles.filterLabel}>Filter by Type</Text>
              <Select
                selectedValue={filterType}
                onValueChange={setFilterType}
                bg="#f8fafc"
                borderWidth={0}
                borderRadius={12}
                fontSize={14}
                _selectedItem={{
                  bg: "#3b82f6",
                  endIcon: <CheckIcon size="4" color="white" />,
                }}
              >
                <Select.Item label="All Programs" value="All" />
                <Select.Item label="Individual Animals" value="Single Animal" />
                <Select.Item label="Animal Groups" value="Group" />
              </Select>
            </Box>
            <Box flex={1}>
              <Text style={styles.filterLabel}>Sort Order</Text>
              <Select
                selectedValue={sortBy}
                onValueChange={setSortBy}
                bg="#f8fafc"
                borderWidth={0}
                borderRadius={12}
                fontSize={14}
                _selectedItem={{
                  bg: "#3b82f6",
                  endIcon: <CheckIcon size="4" color="white" />,
                }}
              >
                <Select.Item label="Newest First" value="Recent" />
                <Select.Item label="Oldest First" value="Oldest" />
                <Select.Item label="By Name" value="Name" />
              </Select>
            </Box>
          </HStack>

          <TouchableOpacity
            onPress={() => {
              setSearchQuery("")
              setFilterType("All")
              setSortBy("Recent")
              setShowFilters(false)
            }}
            style={styles.resetFiltersButton}
          >
            <Text style={styles.resetFiltersText}>Reset All Filters</Text>
          </TouchableOpacity>
        </VStack>
      )}
    </Box>
  )

  // Enhanced program card
  const renderFeedingProgramCard = (program) => {
    const animalInfo = getAnimalInfo(program)
    const lifecycleStages =
      program.programType === "Single Animal" ? program.lifecycleStages || [] : program.groupLifecycleStages || []

    return (
      <TouchableOpacity
        key={program.id}
        activeOpacity={0.7}
        onPress={() => handleCardPress(program)}
        style={styles.modernCard}
      >
        <Box bg="white" borderRadius={20} shadow={2} mb={5} overflow="hidden">
          <HStack bg="#f8fafc" px={5} py={4} alignItems="center" justifyContent="space-between">
            <HStack alignItems="center" flex={1} space={3}>
              <Box
                bg={getFeedTypeColor(program.feedType)}
                p={3}
                borderRadius={16}
                style={styles.cardIconContainer}
              >
                <Text style={styles.modernCardIcon}>
                  {program.programType === "Single Animal" ? "🐄" : "🐔"}
                </Text>
              </Box>
              <VStack flex={1}>
                <Text style={styles.modernCardTitle} numberOfLines={1}>
                  {animalInfo?.name || "Unknown Animal"}
                </Text>
                <HStack alignItems="center" space={2} mt={1}>
                  <Badge
                    bg={program.programType === "Single Animal" ? "#22c55e" : "#f59e0b"}
                    borderRadius={16}
                    px={3}
                    py={1}
                    _text={{ color: "white", fontSize: 11, fontWeight: "600" }}
                  >
                    {program.programType === "Single Animal" ? "Individual" : "Group"}
                  </Badge>
                  <Text style={styles.modernCardSubtitle}>
                    {animalInfo?.type}
                    {animalInfo?.category === "Group" && ` • ${animalInfo.quantity} animals`}
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            {/* Quick Actions Menu */}
            <Menu
              trigger={(triggerProps) => (
                <Pressable {...triggerProps} style={styles.modernMenuButton}>
                  <FastImage source={icons.dots3} style={styles.modernMenuIcon} tintColor="#64748b" />
                </Pressable>
              )}
            >
              <Menu.Item onPress={() => handleViewDetails(program)}>
                <HStack alignItems="center" space={3}>
                  <FastImage source={icons.eye} style={styles.menuActionIcon} tintColor="#3b82f6" />
                  <Text style={styles.menuActionText}>Quick View</Text>
                </HStack>
              </Menu.Item>
              <Menu.Item onPress={() => handleEdit(program)}>
                <HStack alignItems="center" space={3}>
                  <FastImage source={icons.edit} style={styles.menuActionIcon} tintColor="#f59e0b" />
                  <Text style={styles.menuActionText}>Edit Program</Text>
                </HStack>
              </Menu.Item>
              <Menu.Item onPress={() => handleCardPress(program)}>
                <HStack alignItems="center" space={3}>
                  <FastImage source={icons.info} style={styles.menuActionIcon} tintColor="#8b5cf6" />
                  <Text style={styles.menuActionText}>Full Details</Text>
                </HStack>
              </Menu.Item>
              <Divider my={1} />
              <Menu.Item onPress={() => handleDelete(program.id)}>
                <HStack alignItems="center" space={3}>
                  <FastImage source={icons.delete} style={styles.menuActionIcon} tintColor="#ef4444" />
                  <Text style={[styles.menuActionText, { color: "#ef4444" }]}>Delete</Text>
                </HStack>
              </Menu.Item>
            </Menu>
          </HStack>

          {/* Card Content */}
          <VStack p={5} space={4}>
            {/* Feed Type Badge */}
            <HStack alignItems="center" justifyContent="space-between">
              <Text style={styles.modernSectionLabel}>Feed Program</Text>
              <Badge
                bg={getFeedTypeColor(program.feedType)}
                borderRadius={16}
                px={4}
                py={2}
                _text={{ color: "white", fontSize: 12, fontWeight: "600" }}
              >
                {program.feedType?.replace("Basal Feed + Concentrates + Supplements", "Complete Program") || "Standard"}
              </Badge>
            </HStack>

            {/* Feeding Schedule */}
            {program.timeOfDay && program.timeOfDay.length > 0 && (
              <VStack space={2}>
                <Text style={styles.modernSectionLabel}>Daily Schedule</Text>
                <HStack flexWrap="wrap" space={2}>
                  {program.timeOfDay.map((time, index) => (
                    <Box
                      key={index}
                      bg="#fef3c7"
                      px={3}
                      py={1}
                      borderRadius={12}
                      borderWidth={1}
                      borderColor="#f59e0b"
                      mb={1}
                    >
                      <Text style={styles.scheduleTimeText}>{time}</Text>
                    </Box>
                  ))}
                </HStack>
              </VStack>
            )}

            {/* Feed Summary */}
            {program.feedDetails && program.feedDetails.length > 0 && (
              <VStack space={2}>
                <Text style={styles.modernSectionLabel}>Feed Components</Text>
                <VStack space={1}>
                  {program.feedDetails.slice(0, 3).map((feed, index) => (
                    <HStack key={index} alignItems="center" justifyContent="space-between">
                      <Text style={styles.feedComponentName}>{feed.feedType}</Text>
                      <Text style={styles.feedComponentAmount}>{feed.quantity}kg</Text>
                    </HStack>
                  ))}
                  {program.feedDetails.length > 3 && (
                    <Text style={styles.moreComponentsText}>
                      +{program.feedDetails.length - 3} more components
                    </Text>
                  )}
                </VStack>
              </VStack>
            )}

            {/* Notes Preview */}
            {program.notes && (
              <VStack space={2}>
                <Text style={styles.modernSectionLabel}>Notes</Text>
                <Text style={styles.modernNotesText} numberOfLines={2}>
                  {program.notes}
                </Text>
              </VStack>
            )}

            {/* Action Buttons */}
            <HStack space={3} mt={4}>
              <TouchableOpacity
                style={[styles.modernActionButton, { backgroundColor: "#3b82f6" }]}
                onPress={() => handleViewDetails(program)}
              >
                <FastImage source={icons.eye} style={styles.actionButtonIcon} tintColor="white" />
                <Text style={styles.actionButtonText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modernActionButton, { backgroundColor: "#f59e0b" }]}
                onPress={() => handleEdit(program)}
              >
                <FastImage source={icons.edit} style={styles.actionButtonIcon} tintColor="white" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modernActionButton, { backgroundColor: "#ef4444" }]}
                onPress={() => handleDelete(program.id)}
              >
                <FastImage source={icons.delete} style={styles.actionButtonIcon} tintColor="white" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </HStack>

            {/* Card Footer */}
            <HStack alignItems="center" justifyContent="space-between" pt={3} borderTopWidth={1} borderTopColor="#f1f5f9">
              <Text style={styles.modernFooterText}>Created {formatDate(program.createdAt)}</Text>
              <HStack alignItems="center" space={2}>
                <Box w={2} h={2} bg="#22c55e" borderRadius={1} />
                <Text style={styles.modernActiveText}>Active</Text>
              </HStack>
            </HStack>
          </VStack>
        </Box>
      </TouchableOpacity>
    )
  }

  // Enhanced details modal
  const renderDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={detailsModalVisible}
      onRequestClose={() => setDetailsModalVisible(false)}
    >
      <View style={styles.modernModalOverlay}>
        <View style={styles.modernModalContent}>
          {/* Modal Header */}
          <HStack alignItems="center" justifyContent="space-between" mb={6}>
            <VStack>
              <Text style={styles.modernModalTitle}>Program Details</Text>
              <Text style={styles.modernModalSubtitle}>Quick overview of feeding program</Text>
            </VStack>
            <TouchableOpacity onPress={() => setDetailsModalVisible(false)} style={styles.modernCloseButton}>
              <Text style={styles.modernCloseButtonText}>×</Text>
            </TouchableOpacity>
          </HStack>

          {loadingDetails ? (
            <Center py={20}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.modernLoadingText}>Loading program details...</Text>
            </Center>
          ) : selectedProgram ? (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
              <VStack space={6}>
                {/* Program Overview */}
                <Box bg="#f8fafc" p={5} borderRadius={16}>
                  <Text style={styles.modalSectionTitle}>Program Overview</Text>
                  <VStack space={3} mt={3}>
                    <HStack alignItems="center" justifyContent="space-between">
                      <Text style={styles.modalDetailLabel}>Type:</Text>
                      <Badge
                        bg={selectedProgram.programType === "Single Animal" ? "#22c55e" : "#f59e0b"}
                        borderRadius={12}
                        _text={{ color: "white", fontSize: 12, fontWeight: "600" }}
                      >
                        {selectedProgram.programType}
                      </Badge>
                    </HStack>
                    <HStack alignItems="center" justifyContent="space-between">
                      <Text style={styles.modalDetailLabel}>Feed Type:</Text>
                      <Text style={styles.modalDetailValue}>{selectedProgram.feedType}</Text>
                    </HStack>
                    <HStack alignItems="center" justifyContent="space-between">
                      <Text style={styles.modalDetailLabel}>Animal/Group:</Text>
                      <Text style={styles.modalDetailValue}>{getAnimalInfo(selectedProgram)?.name || "Unknown"}</Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Action Buttons */}
                <HStack space={3}>
                  <TouchableOpacity
                    style={[styles.modernModalButton, { backgroundColor: "#f59e0b" }]}
                    onPress={() => {
                      setDetailsModalVisible(false)
                      handleEdit(selectedProgram)
                    }}
                  >
                    <FastImage source={icons.edit} style={styles.modalButtonIcon} tintColor="white" />
                    <Text style={styles.modernModalButtonText}>Edit Program</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modernModalButton, { backgroundColor: "#8b5cf6" }]}
                    onPress={() => {
                      setDetailsModalVisible(false)
                      handleCardPress(selectedProgram)
                    }}
                  >
                    <FastImage source={icons.info} style={styles.modalButtonIcon} tintColor="white" />
                    <Text style={styles.modernModalButtonText}>Full Details</Text>
                  </TouchableOpacity>
                </HStack>

                {/* Feed Details */}
                {selectedProgram.feedDetails && selectedProgram.feedDetails.length > 0 && (
                  <VStack space={4}>
                    <Text style={styles.modalSectionTitle}>Feed Components</Text>
                    {selectedProgram.feedDetails.map((feed, index) => (
                      <Box key={index} bg="white" p={4} borderRadius={16} borderWidth={1} borderColor="#e2e8f0">
                        <VStack space={3}>
                          <HStack alignItems="center" justifyContent="space-between">
                            <Text style={styles.feedComponentTitle}>{feed.feedType}</Text>
                            <Badge
                              bg={getFeedTypeColor(feed.feedType)}
                              borderRadius={12}
                              _text={{ color: "white", fontSize: 12, fontWeight: "600" }}
                            >
                              {feed.quantity}kg
                            </Badge>
                          </HStack>
                          <VStack space={1}>
                            <Text style={styles.feedDetailInfo}>Source: {feed.source || "Not specified"}</Text>
                            <Text style={styles.feedDetailInfo}>Schedule: {feed.schedule || "As needed"}</Text>
                            <Text style={styles.feedDetailInfo}>Cost: ${feed.cost || "0"}</Text>
                            {feed.supplier && <Text style={styles.feedDetailInfo}>Supplier: {feed.supplier}</Text>}
                          </VStack>
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                )}

                {/* Feeding Schedule */}
                {selectedProgram.timeOfDay && selectedProgram.timeOfDay.length > 0 && (
                  <VStack space={3}>
                    <Text style={styles.modalSectionTitle}>Daily Schedule</Text>
                    <HStack flexWrap="wrap" space={2}>
                      {selectedProgram.timeOfDay.map((time, index) => (
                        <Box
                          key={index}
                          bg="#dbeafe"
                          px={4}
                          py={2}
                          borderRadius={16}
                          borderWidth={1}
                          borderColor="#3b82f6"
                          mb={2}
                        >
                          <Text style={styles.modalScheduleTime}>{time}</Text>
                        </Box>
                      ))}
                    </HStack>
                  </VStack>
                )}

                {/* Notes */}
                {selectedProgram.notes && (
                  <VStack space={3}>
                    <Text style={styles.modalSectionTitle}>Additional Notes</Text>
                    <Box bg="#f8fafc" p={4} borderRadius={16}>
                      <Text style={styles.modalNotesText}>{selectedProgram.notes}</Text>
                    </Box>
                  </VStack>
                )}
              </VStack>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  )

  // Enhanced success toast
  const renderSuccessToast = () => (
    <Modal animationType="fade" transparent={true} visible={showSuccessToast}>
      <View style={styles.modernToastOverlay}>
        <Box style={styles.modernToastContent}>
          <HStack alignItems="center" space={3}>
            <Box bg="#22c55e" p={2} borderRadius={12}>
              <FastImage source={icons.check} style={styles.toastIcon} tintColor="white" />
            </Box>
            <VStack flex={1}>
              <Text style={styles.modernToastTitle}>Success!</Text>
              <Text style={styles.modernToastMessage}>{successMessage}</Text>
            </VStack>
          </HStack>
        </Box>
      </View>
    </Modal>
  )

  // Enhanced empty state
  const renderEmptyState = () => (
    <Center py={20}>
      <VStack alignItems="center" space={6}>
        <Box bg="#f8fafc" p={8} borderRadius={32}>
          <Text style={styles.emptyStateIcon}>🌾</Text>
        </Box>
        <VStack alignItems="center" space={3}>
          <Text style={styles.modernEmptyTitle}>
            {searchQuery || filterType !== "All" ? "No matching programs" : "No feeding programs yet"}
          </Text>
          <Text style={styles.modernEmptyText}>
            {searchQuery || filterType !== "All"
              ? "Try adjusting your search or filter criteria to find what you're looking for."
              : "Create your first feeding program to start managing your livestock nutrition effectively."}
          </Text>
        </VStack>
        {!searchQuery && filterType === "All" && (
          <TouchableOpacity
            style={styles.modernCreateButton}
            onPress={() => navigation.navigate("FarmFeedsScreen")}
          >
            <FastImage source={icons.plus} style={styles.createButtonIcon} tintColor="white" />
            <Text style={styles.modernCreateButtonText}>Create Your First Program</Text>
          </TouchableOpacity>
        )}
      </VStack>
    </Center>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.modernContainer}>
        <SecondaryHeader
          title="Feeding Programs"
          onBackPress={() => navigation.goBack()}
          backgroundColor="white"
        />
        <Center flex={1}>
          <VStack alignItems="center" space={4}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <VStack alignItems="center" space={1}>
              <Text style={styles.modernLoadingTitle}>Loading your programs</Text>
              <Text style={styles.modernLoadingText}>This will just take a moment...</Text>
            </VStack>
          </VStack>
        </Center>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.modernContainer}>
      <SecondaryHeader
        title="Feeding Programs"
        onBackPress={() => navigation.goBack()}
        backgroundColor="white"
      />
      <ScrollView
        style={styles.modernContent}
        contentContainerStyle={styles.modernScrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3b82f6"
            colors={["#3b82f6"]}
          />
        }
      >
        {renderSearchAndFilter()}

        {filteredPrograms.length === 0 ? (
          renderEmptyState()
        ) : (
          filteredPrograms.map(renderFeedingProgramCard)
        )}
      </ScrollView>

      {/* Modern FAB */}
      <TouchableOpacity
        style={styles.modernFab}
        onPress={() => navigation.navigate("FarmFeedsScreen")}
        activeOpacity={0.8}
      >
        <FastImage source={icons.plus} style={styles.modernFabIcon} tintColor="white" />
      </TouchableOpacity>

      {renderDetailsModal()}
      {renderSuccessToast()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  modernContainer: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  modernContent: {
    flex: 1,
  },
  modernScrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  searchIcon: {
    width: 18,
    height: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    fontFamily: "Inter-Medium",
  },
  clearSearchText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "Inter-Bold",
  },
  statsLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    textAlign: "center",
  },
  filterToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filterToggleIcon: {
    width: 18,
    height: 18,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  resetFiltersButton: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  resetFiltersText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
  modernCard: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardIconContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modernCardIcon: {
    fontSize: 20,
  },
  modernCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "Inter-Bold",
  },
  modernCardSubtitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  modernMenuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  modernMenuIcon: {
    width: 16,
    height: 16,
  },
  menuActionIcon: {
    width: 16,
    height: 16,
  },
  menuActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  modernSectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  scheduleTimeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f59e0b",
  },
  feedComponentName: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  feedComponentAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  moreComponentsText: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
  },
  modernNotesText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  modernActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    space: 2,
  },
  actionButtonIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  modernFooterText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  modernActiveText: {
    fontSize: 12,
    color: "#22c55e",
    fontWeight: "600",
  },
  modernModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modernModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
    minHeight: "50%",
  },
  modernModalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "Inter-Bold",
  },
  modernModalSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  modernCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  modernCloseButtonText: {
    fontSize: 20,
    color: "#64748b",
    fontWeight: "600",
  },
  modernLoadingText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },
  modalScrollView: {
    flex: 1,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "Inter-Bold",
  },
  modalDetailLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  modalDetailValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  modernModalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
  },
  modalButtonIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  modernModalButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  feedComponentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  feedDetailInfo: {
    fontSize: 13,
    color: "#64748b",
  },
  modalScheduleTime: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3b82f6",
  },
  modalNotesText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  modernToastOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  modernToastContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  toastIcon: {
    width: 16,
    height: 16,
  },
  modernToastTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  modernToastMessage: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  emptyStateIcon: {
    fontSize: 48,
  },
  modernEmptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    fontFamily: "Inter-Bold",
  },
  modernEmptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginHorizontal: 20,
  },
  modernCreateButton: {
    backgroundColor: COLORS.green3,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: COLORS.green3,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  modernCreateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modernLoadingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
  },
  modernFab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.green3,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.green3,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modernFabIcon: {
    width: 24,
    height: 24,
  },
})

export default FeedingModuleScreen