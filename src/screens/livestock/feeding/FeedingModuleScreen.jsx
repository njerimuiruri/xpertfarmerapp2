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
      }, 2500)
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
      Alert.alert("Error", "Failed to load feeding programs")
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
      "Delete Feeding Program",
      "Are you sure you want to delete this feeding program? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
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
              Alert.alert("Error", error.toString())
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
      Alert.alert("Error", "Failed to load program details")
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
        return COLORS.green2
      case "Basal Feed + Concentrates + Supplements":
        return COLORS.lightOrange
      case "Concentrates Only":
        return COLORS.primary
      default:
        return COLORS.gray
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const renderSearchAndFilter = () => (
    <Box bg="white" borderRadius={16} shadow={2} mb={4} p={4}>
      <HStack alignItems="center" space={3} mb={3}>
        <Box flex={1} bg={COLORS.lightGreen} borderRadius={12} px={3} py={2}>
          <HStack alignItems="center" space={2}>
            <FastImage source={icons.search} style={styles.searchIcon} tintColor={COLORS.green2} />
            <TextInput
              placeholder="Search programs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor={COLORS.gray}
            />
          </HStack>
        </Box>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.filterButton, { backgroundColor: showFilters ? COLORS.green : COLORS.lightGreen }]}
        >
          <FastImage
            source={icons.filter}
            style={styles.filterIcon}
            tintColor={showFilters ? "white" : COLORS.green2}
          />
        </TouchableOpacity>
      </HStack>
      {showFilters && (
        <VStack space={3}>
          <HStack space={3} alignItems="center">
            <Box flex={1}>
              <Text style={styles.filterLabel}>Type</Text>
              <Select
                selectedValue={filterType}
                onValueChange={setFilterType}
                bg={COLORS.lightGreen}
                borderRadius={8}
                _selectedItem={{
                  bg: COLORS.green3,
                  endIcon: <CheckIcon size="5" color="white" />,
                }}
                dropdownIcon={
                  <Icon as={FastImage} source={icons.arrowDown} style={styles.dropdownIcon} tintColor={COLORS.green2} />
                }
                placeholder="Select Type"
                fontSize={14}
                color={COLORS.black}
              >
                <Select.Item label="All Types" value="All" />
                <Select.Item label="Single Animal" value="Single Animal" />
                <Select.Item label="Group" value="Group" />
              </Select>
            </Box>
            <Box flex={1}>
              <Text style={styles.filterLabel}>Sort By</Text>
              <Select
                selectedValue={sortBy}
                onValueChange={setSortBy}
                bg={COLORS.lightGreen}
                borderRadius={8}
                _selectedItem={{
                  bg: COLORS.green3,
                  endIcon: <CheckIcon size="5" color="white" />,
                }}
                dropdownIcon={
                  <Icon as={FastImage} source={icons.arrowDown} style={styles.dropdownIcon} tintColor={COLORS.green2} />
                }
                placeholder="Sort By"
                fontSize={14}
                color={COLORS.black}
              >
                <Select.Item label="Most Recent" value="Recent" />
                <Select.Item label="Oldest First" value="Oldest" />
                <Select.Item label="Name A-Z" value="Name" />
              </Select>
            </Box>
          </HStack>
          <HStack justifyContent="space-between" alignItems="center" mt={2}>
            <Text style={styles.resultsText}>
              {filteredPrograms.length} of {feedingPrograms.length} programs
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("")
                setFilterType("All")
                setSortBy("Recent")
              }}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </HStack>
        </VStack>
      )}
    </Box>
  )

  const renderActionButtons = (program) => (
    <HStack space={2} mt={4} justifyContent="space-between">
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: COLORS.skyBlue }]}
        onPress={() => handleViewDetails(program)}
      >
        <FastImage source={icons.eye} style={styles.actionIcon} tintColor="white" />
        <Text style={styles.actionButtonText}>View</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: COLORS.green }]}
        onPress={() => handleEdit(program)}
      >
        <FastImage source={icons.edit} style={styles.actionIcon} tintColor="white" />
        <Text style={styles.actionButtonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: COLORS.red }]}
        onPress={() => handleDelete(program.id)}
      >
        <FastImage source={icons.delete} style={styles.actionIcon} tintColor="white" />
        <Text style={styles.actionButtonText}>Delete</Text>
      </TouchableOpacity>
    </HStack>
  )

  const renderFeedingProgramCard = (program) => {
    const animalInfo = getAnimalInfo(program)
    const lifecycleStages =
      program.programType === "Single Animal" ? program.lifecycleStages || [] : program.groupLifecycleStages || []
    return (
      <TouchableOpacity
        key={program.id}
        activeOpacity={0.8}
        onPress={() => handleCardPress(program)}
        style={styles.cardContainer}
      >
        <Box
          bg="white"
          borderRadius={16}
          shadow={2}
          mb={4}
          overflow="hidden"
          borderWidth={1}
          borderColor={COLORS.lightGreen}
        >
          <HStack bg={COLORS.lightGreen} px={4} py={3} alignItems="center" justifyContent="space-between">
            <HStack alignItems="center" flex={1}>
              <Box bg={getFeedTypeColor(program.feedType)} p={2} borderRadius={8} mr={3}>
                <Text style={styles.cardIcon}>{program.programType === "Single Animal" ? "🐄" : "🐔"}</Text>
              </Box>
              <VStack flex={1}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {animalInfo?.name || "Unknown"}
                </Text>
                <HStack alignItems="center" space={2} mt={1}>
                  <Badge
                    bg={program.programType === "Single Animal" ? COLORS.green2 : "#FF8C00"}
                    borderRadius={12}
                    _text={{ color: "white", fontSize: 10, fontWeight: "600" }}
                  >
                    {program.programType}
                  </Badge>
                  <Text style={styles.cardSubtitle}>
                    {animalInfo?.type}
                    {animalInfo?.category === "Group" && ` (${animalInfo.quantity} birds)`}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
            <Menu
              trigger={(triggerProps) => (
                <Pressable accessibilityLabel="More options" {...triggerProps}>
                  <Box p={2} backgroundColor={COLORS.green2} borderRadius={8}>
                    <FastImage source={icons.dots3} style={styles.moreIcon} tintColor="white" />
                  </Box>
                </Pressable>
              )}
            >
              <Menu.Item onPress={() => handleViewDetails(program)}>
                <HStack alignItems="center" space={2}>
                  <FastImage source={icons.eye} style={styles.menuIcon} tintColor={COLORS.green2} />
                  <Text style={styles.menuText}>View Details</Text>
                </HStack>
              </Menu.Item>
              <Menu.Item onPress={() => handleEdit(program)}>
                <HStack alignItems="center" space={2}>
                  <FastImage source={icons.edit} style={styles.menuIcon} tintColor="#FF8C00" />
                  <Text style={styles.menuText}>Edit Program</Text>
                </HStack>
              </Menu.Item>
              <Menu.Item onPress={() => handleCardPress(program)}>
                <HStack alignItems="center" space={2}>
                  <FastImage source={icons.info} style={styles.menuIcon} tintColor="#FFD700" />
                  <Text style={styles.menuText}>Full Details</Text>
                </HStack>
              </Menu.Item>
              <Divider my="2" _light={{ bg: COLORS.lightGreen }} />
              <Menu.Item onPress={() => handleDelete(program.id)}>
                <HStack alignItems="center" space={2}>
                  <FastImage source={icons.delete} style={styles.menuIcon} tintColor={COLORS.red} />
                  <Text style={[styles.menuText, { color: COLORS.red }]}>Delete</Text>
                </HStack>
              </Menu.Item>
            </Menu>
          </HStack>
          <VStack p={4} space={3}>
            <HStack alignItems="center" justifyContent="space-between">
              <Text style={styles.labelText}>Feed Type:</Text>
              <Badge
                bg={getFeedTypeColor(program.feedType)}
                borderRadius={12}
                _text={{ color: "white", fontSize: 11, fontWeight: "600" }}
              >
                {program.feedType}
              </Badge>
            </HStack>
            {lifecycleStages.length > 0 && (
              <VStack space={2}>
                <Text style={styles.labelText}>Lifecycle Stages:</Text>
                <HStack flexWrap="wrap" space={1}>
                  {lifecycleStages.map((stage, index) => (
                    <Badge
                      key={index}
                      background={COLORS.green3}
                      borderRadius={8}
                      mb={1}
                      _text={{ color: "white", fontSize: 10, fontWeight: "500" }}
                    >
                      {stage}
                    </Badge>
                  ))}
                </HStack>
              </VStack>
            )}
            <VStack space={2}>
              <Text style={styles.labelText}>Feeding Schedule:</Text>
              <HStack flexWrap="wrap" space={1}>
                {(program.timeOfDay || []).map((time, index) => (
                  <HStack key={index} alignItems="center" space={1} mb={1}>
                    <Box w={2} h={2} bg="#FF8C00" borderRadius={1} />
                    <Text style={styles.scheduleText}>{time}</Text>
                  </HStack>
                ))}
              </HStack>
            </VStack>
            <VStack space={2}>
              <Text style={styles.labelText}>Feed Details:</Text>
              <VStack space={1}>
                {(program.feedDetails || []).slice(0, 2).map((feed, index) => (
                  <HStack key={index} alignItems="center" space={1}>
                    <Text style={styles.feedDetailText}>
                      {feed.feedType}: {feed.quantity}kg
                    </Text>
                    {feed.schedule && <Text style={styles.scheduleDetailText}>({feed.schedule})</Text>}
                  </HStack>
                ))}
                {(program.feedDetails || []).length > 2 && (
                  <Text style={styles.moreText}>+{(program.feedDetails || []).length - 2} more</Text>
                )}
              </VStack>
            </VStack>
            {program.notes && (
              <VStack space={2}>
                <Text style={styles.labelText}>Notes:</Text>
                <Text style={styles.notesText} numberOfLines={2}>
                  {program.notes}
                </Text>
              </VStack>
            )}
            {renderActionButtons(program)}
            <Divider my="2" _light={{ bg: COLORS.lightGreen }} />
            <HStack alignItems="center" justifyContent="space-between">
              <Text style={styles.footerText}>Created: {formatDate(program.createdAt)}</Text>
              <HStack alignItems="center" space={1}>
                <Box w={2} h={2} bg={COLORS.green2} borderRadius={1} />
                <Text style={styles.activeText}>Active</Text>
              </HStack>
            </HStack>
          </VStack>
        </Box>
      </TouchableOpacity>
    )
  }

  const renderDetailsModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={detailsModalVisible}
      onRequestClose={() => setDetailsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <HStack alignItems="center" justifyContent="space-between" mb={4}>
            <Text style={styles.modalTitle}>Program Details</Text>
            <TouchableOpacity onPress={() => setDetailsModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </HStack>
          {loadingDetails ? (
            <Center py={10}>
              <ActivityIndicator size="large" color={COLORS.green2} />
              <Text style={styles.loadingText}>Loading details...</Text>
            </Center>
          ) : selectedProgram ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <VStack space={4}>
                <Box bg={COLORS.lightGreen} p={4} borderRadius={12}>
                  <VStack space={2}>
                    <Text style={styles.detailLabel}>Program Type:</Text>
                    <Text style={styles.detailValue}>{selectedProgram.programType}</Text>
                    <Text style={styles.detailLabel}>Feed Type:</Text>
                    <Text style={styles.detailValue}>{selectedProgram.feedType}</Text>
                    <Text style={styles.detailLabel}>Animal/Group:</Text>
                    <Text style={styles.detailValue}>{getAnimalInfo(selectedProgram)?.name || "Unknown"}</Text>
                  </VStack>
                </Box>
                <HStack space={2} mt={2}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, { backgroundColor: "#FF8C00" }]}
                    onPress={() => {
                      setDetailsModalVisible(false)
                      handleEdit(selectedProgram)
                    }}
                  >
                    <Text style={styles.modalActionText}>Edit Program</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionButton, { backgroundColor: "#FFD700" }]}
                    onPress={() => {
                      setDetailsModalVisible(false)
                      handleCardPress(selectedProgram)
                    }}
                  >
                    <Text style={styles.modalActionText}>Full Details</Text>
                  </TouchableOpacity>
                </HStack>
                <VStack space={3}>
                  <Text style={styles.sectionTitle}>Feed Details</Text>
                  {(selectedProgram.feedDetails || []).map((feed, index) => (
                    <Box key={index} bg="white" p={4} borderRadius={12} borderWidth={1} borderColor={COLORS.lightGreen}>
                      <VStack space={2}>
                        <HStack alignItems="center" justifyContent="space-between">
                          <Text style={styles.feedTypeTitle}>{feed.feedType}</Text>
                          <Badge bg={getFeedTypeColor(feed.feedType)} borderRadius={8}>
                            <Text style={styles.badgeText}>{feed.quantity}kg</Text>
                          </Badge>
                        </HStack>
                        <Text style={styles.feedDetailLabel}>Source: {feed.source}</Text>
                        <Text style={styles.feedDetailLabel}>Schedule: {feed.schedule}</Text>
                        <Text style={styles.feedDetailLabel}>Cost: ${feed.cost}</Text>
                        {feed.supplier && <Text style={styles.feedDetailLabel}>Supplier: {feed.supplier}</Text>}
                        <Text style={styles.feedDetailLabel}>Date: {formatDate(feed.date)}</Text>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
                <VStack space={2}>
                  <Text style={styles.sectionTitle}>Feeding Schedule</Text>
                  <HStack flexWrap="wrap" space={2}>
                    {(selectedProgram.timeOfDay || []).map((time, index) => (
                      <Badge
                        key={index}
                        bg="#FF8C00"
                        borderRadius={12}
                        mb={1}
                        _text={{ color: "white", fontSize: 12, fontWeight: "600" }}
                      >
                        {time}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>
                {selectedProgram.notes && (
                  <VStack space={2}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <Box bg={COLORS.lightGreen} p={4} borderRadius={12}>
                      <Text style={styles.notesDetailText}>{selectedProgram.notes}</Text>
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

  // New render function for the success toast
  const renderSuccessToast = () => (
    <Modal animationType="fade" transparent={true} visible={showSuccessToast}>
      <View style={styles.toastOverlay}>
        <Box style={styles.toastContent} bg="white" borderRadius={12} shadow={4} p={4}>
          <HStack alignItems="center" space={3}>
            <FastImage source={icons.check} style={styles.toastIcon} tintColor={COLORS.green} />
            <Text style={styles.toastText}>{successMessage}</Text>
          </HStack>
        </Box>
      </View>
    </Modal>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <SecondaryHeader
          title="Feeding Programs"
          onBackPress={() => navigation.goBack()}
          backgroundColor={COLORS.lightGreen}
        />
        <Center flex={1}>
          <ActivityIndicator size="large" color={COLORS.green2} />
          <Text style={styles.loadingText}>Loading feeding programs...</Text>
        </Center>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <SecondaryHeader
        title="Feeding Programs"
        onBackPress={() => navigation.goBack()}
        backgroundColor={COLORS.lightGreen}
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.green2} />}
      >
        {renderSearchAndFilter()}
        {filteredPrograms.length === 0 ? (
          <Center py={10}>
            <FastImage source={icons.emptyState} style={styles.emptyStateIcon} tintColor={COLORS.gray} />
            <Text style={styles.emptyStateTitle}>
              {searchQuery || filterType !== "All" ? "No programs match your search" : "No Feeding Programs Yet"}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || filterType !== "All"
                ? "Try adjusting your search or filter criteria"
                : "Create your first feeding program to get started"}
            </Text>
            {!searchQuery && filterType === "All" && (
              <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate("FarmFeeds")}>
                <Text style={styles.createButtonText}>Create Program</Text>
              </TouchableOpacity>
            )}
          </Center>
        ) : (
          filteredPrograms.map(renderFeedingProgramCard)
        )}
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("FarmFeedsScreen")}>
        <FastImage source={icons.plus} style={styles.fabIcon} tintColor="#fff" />
      </TouchableOpacity>
      {renderDetailsModal()}
      {renderSuccessToast()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGreen,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  searchIcon: {
    width: 18,
    height: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
    paddingVertical: 0,
    height: 36,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.gray,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  resultsText: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: "italic",
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.green2,
  },
  clearButtonText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  cardContainer: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
  },
  moreIcon: {
    width: 20,
    height: 20,
  },
  menuIcon: {
    width: 16,
    height: 16,
  },
  menuText: {
    fontSize: 14,
    color: COLORS.black,
  },
  labelText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scheduleText: {
    fontSize: 12,
    color: "#FF8C00",
    fontWeight: "500",
  },
  feedDetailText: {
    fontSize: 13,
    color: COLORS.black,
    fontWeight: "500",
  },
  scheduleDetailText: {
    fontSize: 11,
    color: COLORS.gray,
  },
  moreText: {
    fontSize: 11,
    color: "#FFD700",
    fontWeight: "600",
    fontStyle: "italic",
    marginTop: 4,
  },
  notesText: {
    fontSize: 13,
    color: COLORS.gray,
    lineHeight: 18,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.gray,
  },
  activeText: {
    fontSize: 11,
    color: COLORS.green2,
    fontWeight: "600",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
  },
  actionIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: "#FF8C00",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.black,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.gray,
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 10,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.gray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: "500",
    marginBottom: 8,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalActionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 8,
  },
  feedTypeTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.black,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  feedDetailLabel: {
    fontSize: 13,
    color: COLORS.gray,
  },
  notesDetailText: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.green,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    width: 24,
    height: 24,
  },
  toastOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 50,
    backgroundColor: "rgba(0,0,0,0.0)",
  },
  toastContent: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: width * 0.8,
  },
  toastIcon: {
    width: 20,
    height: 20,
  },
  toastText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.black,
  },
})

export default FeedingModuleScreen
