"use client"

import { useState, useEffect } from "react"
import {
    SafeAreaView,
    View,
    Text,
    ScrollView,
    StyleSheet,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Modal,
} from "react-native"
import FastImage from "react-native-fast-image"
import LinearGradient from "react-native-linear-gradient"
import { icons } from "../../constants"
import { COLORS } from "../../constants/theme"
import SecondaryHeader from "../../components/headers/secondary-header"
import {
    getInventoryItemDetails,
    deleteGoodsInStock,
    deleteMachinery,
    deleteUtility,
} from "../../services/inventoryService"

const { width } = Dimensions.get("window")

const InventoryDetails = ({ navigation, route }) => {
    const { item: initialItem } = route.params
    const [item, setItem] = useState(initialItem)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const loadItemDetails = async () => {
        if (!initialItem?.id) return
        setIsLoading(true)
        setError(null)
        try {
            const detailedItem = await getInventoryItemDetails(initialItem)
            setItem({ ...initialItem, ...detailedItem })
        } catch (err) {
            console.error("Error loading item details:", err)
            setError(err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadItemDetails()
    }, [])

    const getItemConfig = () => {
        switch (item.type) {
            case "goodsInStock":
                return {
                    title: "Goods in Stock",
                    icon: icons.package,
                    color: COLORS.green3 || "#10B981",
                    bgColor: "#ECFDF5",
                }
            case "machinery":
                return {
                    title: "Machinery",
                    icon: icons.settings,
                    color: COLORS.green2 || "#16A34A",
                    bgColor: "#F0FDF4",
                }
            case "utility":
                return {
                    title: "Utility",
                    icon: icons.power,
                    color: COLORS.green3 || "#10B981",
                    bgColor: "#ECFDF5",
                }
            default:
                return {
                    title: "Inventory Item",
                    icon: icons.list,
                    color: COLORS.green3 || "#10B981",
                    bgColor: "#F0FDF4",
                }
        }
    }

    const getItemName = () => {
        return item.itemName || item.equipmentName || item.utilityType || "Unknown Item"
    }

    const getConditionColor = (condition) => {
        if (!condition) return "#6B7280"
        switch (condition.toLowerCase()) {
            case "excellent":
            case "new":
                return "#22C55E"
            case "good":
                return COLORS.green3 || "#10B981"
            case "fair":
                return "#F59E0B"
            case "poor":
            case "needs repair":
                return "#EF4444"
            default:
                return COLORS.green3 || "#10B981"
        }
    }

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "Not specified"
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
        } catch {
            return "Invalid date"
        }
    }

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return "Not specified"
        return `KES ${Number.parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    }

    const handleEdit = () => {
        navigation.navigate("EditInventoryItem", { item })
    }

    const handleDelete = () => {
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        try {
            let result
            switch (item.type) {
                case "goodsInStock":
                    result = await deleteGoodsInStock(item.id)
                    break
                case "machinery":
                    result = await deleteMachinery(item.id)
                    break
                case "utility":
                    result = await deleteUtility(item.id)
                    break
                default:
                    Alert.alert("Error", "Unknown item type")
                    return
            }
            if (result.error) {
                Alert.alert("Error", result.error)
            } else {
                Alert.alert("Success", "Item deleted successfully", [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack(),
                    },
                ])
            }
        } catch (error) {
            Alert.alert("Error", "Failed to delete item")
        } finally {
            setShowDeleteModal(false)
        }
    }

    const renderInfoCard = (title, children, icon = null) => (
        <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
                {icon && <FastImage source={icon} style={styles.infoCardIcon} tintColor={getItemConfig().color} />}
                <Text style={styles.infoCardTitle}>{title}</Text>
            </View>
            <View style={styles.infoCardContent}>{children}</View>
        </View>
    )

    const renderInfoRow = (label, value, isHighlight = false) => (
        <View style={[styles.infoRow, isHighlight && styles.infoRowHighlight]}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, isHighlight && styles.infoValueHighlight]}>{value || "Not specified"}</Text>
        </View>
    )

    const renderConditionBadge = (condition) => {
        if (!condition) return null
        return (
            <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(condition) }]}>
                <Text style={styles.conditionBadgeText}>{condition.toUpperCase()}</Text>
            </View>
        )
    }

    const renderDeleteModal = () => (
        <Modal
            visible={showDeleteModal}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setShowDeleteModal(false)}
        >
            <View style={styles.deleteModalOverlay}>
                <View style={styles.deleteModalContainer}>
                    <LinearGradient
                        colors={["#FFFFFF", "#FEF2F2"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.deleteModalCard}
                    >
                        <View style={styles.deleteModalIconContainer}>
                            <LinearGradient colors={["#FEE2E2", "#FECACA"]} style={styles.deleteModalIconGradient}>
                                <FastImage source={icons.trash} style={styles.deleteModalIcon} tintColor="#EF4444" />
                            </LinearGradient>
                        </View>

                        <Text style={styles.deleteModalTitle}>Delete Item</Text>
                        <Text style={styles.deleteModalMessage}>Are you sure you want to delete "{getItemName()}"?</Text>
                        <Text style={styles.deleteModalSubMessage}>This action cannot be undone.</Text>

                        {/* Item Info Card */}
                        <View style={styles.deleteModalItemCard}>
                            <View style={styles.deleteModalItemIconContainer}>
                                <LinearGradient
                                    colors={[getItemConfig().color, getItemConfig().color + "DD"]}
                                    style={styles.deleteModalItemIconGradient}
                                >
                                    <FastImage source={getItemConfig().icon} style={styles.deleteModalItemIcon} tintColor="#FFFFFF" />
                                </LinearGradient>
                            </View>
                            <View style={styles.deleteModalItemInfo}>
                                <Text style={styles.deleteModalItemName}>{getItemName()}</Text>
                                <Text style={styles.deleteModalItemType}>{getItemConfig().title}</Text>
                            </View>
                            <View style={styles.deleteModalItemBadge}>
                                <Text style={styles.deleteModalItemBadgeText}>
                                    {item.condition || item.facilityCondition || "Good"}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.deleteModalActions}>
                            <TouchableOpacity
                                style={styles.deleteModalCancelButton}
                                onPress={() => setShowDeleteModal(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.deleteModalCancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.deleteModalConfirmButton} onPress={confirmDelete} activeOpacity={0.8}>
                                <LinearGradient colors={["#EF4444", "#DC2626"]} style={styles.deleteModalConfirmGradient}>
                                    <FastImage source={icons.trash} style={styles.deleteModalConfirmIcon} tintColor="#FFFFFF" />
                                    <Text style={styles.deleteModalConfirmText}>Delete</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    )

    const renderGoodsDetails = () => (
        <>
            {renderInfoCard(
                "Basic Information",
                <>
                    {renderInfoRow("Item Name", item.itemName, true)}
                    {renderInfoRow("SKU", item.sku)}
                    {renderInfoRow("Quantity", item.quantity?.toString())}
                    {renderInfoRow("Current Location", item.currentLocation)}
                    <View style={styles.conditionRow}>
                        <Text style={styles.infoLabel}>Condition</Text>
                        {renderConditionBadge(item.condition)}
                    </View>
                </>,
                icons.package,
            )}

            {item.expirationDate &&
                renderInfoCard(
                    "Expiration Details",
                    <>
                        {renderInfoRow("Expiration Date", formatDate(item.expirationDate))}
                        {(() => {
                            const today = new Date()
                            const expDate = new Date(item.expirationDate)
                            const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24))
                            let expiryStatus = "Unknown"
                            let expiryColor = "#6B7280"

                            if (daysUntilExpiry < 0) {
                                expiryStatus = "Expired"
                                expiryColor = "#EF4444"
                            } else if (daysUntilExpiry <= 7) {
                                expiryStatus = "Expires Soon"
                                expiryColor = "#F59E0B"
                            } else if (daysUntilExpiry <= 30) {
                                expiryStatus = "Expires This Month"
                                expiryColor = COLORS.green2 || "#16A34A"
                            } else {
                                expiryStatus = "Fresh"
                                expiryColor = COLORS.green3 || "#10B981"
                            }

                            return (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Status</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: expiryColor }]}>
                                        <Text style={styles.statusBadgeText}>{expiryStatus}</Text>
                                    </View>
                                </View>
                            )
                        })()}
                    </>,
                    icons.calendar,
                )}
        </>
    )

    const renderMachineryDetails = () => (
        <>
            {renderInfoCard(
                "Equipment Information",
                <>
                    {renderInfoRow("Equipment Name", item.equipmentName, true)}
                    {renderInfoRow("Equipment ID", item.equipmentId)}
                    {renderInfoRow("Purchase Date", formatDate(item.purchaseDate))}
                    {renderInfoRow("Current Location", item.currentLocation)}
                    <View style={styles.conditionRow}>
                        <Text style={styles.infoLabel}>Condition</Text>
                        {renderConditionBadge(item.condition)}
                    </View>
                </>,
                icons.settings,
            )}

            {(item.lastServiceDate || item.nextServiceDate) &&
                renderInfoCard(
                    "Service Information",
                    <>
                        {item.lastServiceDate && renderInfoRow("Last Service Date", formatDate(item.lastServiceDate))}
                        {item.nextServiceDate && renderInfoRow("Next Service Date", formatDate(item.nextServiceDate))}
                        {(() => {
                            if (!item.nextServiceDate) return null
                            const today = new Date()
                            const serviceDate = new Date(item.nextServiceDate)
                            const daysUntilService = Math.ceil((serviceDate - today) / (1000 * 60 * 60 * 24))
                            let serviceStatus = "Unknown"
                            let serviceColor = "#6B7280"

                            if (daysUntilService < 0) {
                                serviceStatus = "Overdue"
                                serviceColor = "#EF4444"
                            } else if (daysUntilService <= 7) {
                                serviceStatus = "Due Soon"
                                serviceColor = "#F59E0B"
                            } else if (daysUntilService <= 30) {
                                serviceStatus = "Due This Month"
                                serviceColor = COLORS.green2 || "#16A34A"
                            } else {
                                serviceStatus = "Up to Date"
                                serviceColor = COLORS.green3 || "#10B981"
                            }

                            return (
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Service Status</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: serviceColor }]}>
                                        <Text style={styles.statusBadgeText}>{serviceStatus}</Text>
                                    </View>
                                </View>
                            )
                        })()}
                    </>,
                    icons.calendar,
                )}
        </>
    )

    const renderUtilityDetails = () => (
        <>
            {renderInfoCard(
                "Utility Information",
                <>
                    {renderInfoRow("Utility Type", item.utilityType, true)}
                    {item.entryDate && renderInfoRow("Entry Date", formatDate(item.entryDate))}
                    <View style={styles.conditionRow}>
                        <Text style={styles.infoLabel}>Condition</Text>
                        {renderConditionBadge(item.facilityCondition || item.condition)}
                    </View>
                </>,
                icons.power,
            )}

            {(item.waterLevel || item.waterSource || item.waterStorage) &&
                renderInfoCard(
                    "Water Information",
                    <>
                        {item.waterLevel && renderInfoRow("Water Level", item.waterLevel.toString())}
                        {item.waterSource && renderInfoRow("Water Source", item.waterSource)}
                        {item.waterStorage && renderInfoRow("Water Storage", item.waterStorage.toString())}
                    </>,
                    icons.droplet,
                )}

            {(item.powerSource || item.powerCapacity) &&
                renderInfoCard(
                    "Power Information",
                    <>
                        {item.powerSource && renderInfoRow("Power Source", item.powerSource)}
                        {item.powerCapacity && renderInfoRow("Power Capacity", item.powerCapacity)}
                        {item.consumptionRate && renderInfoRow("Consumption Rate", item.consumptionRate?.toString())}
                    </>,
                    icons.zap,
                )}

            {(item.structureType || item.structureCapacity) &&
                renderInfoCard(
                    "Structure Information",
                    <>
                        {item.structureType && renderInfoRow("Structure Type", item.structureType)}
                        {item.structureCapacity && renderInfoRow("Structure Capacity", item.structureCapacity)}
                    </>,
                    icons.home,
                )}

            {(item.installationCost || item.consumptionCost || item.constructionCost || item.maintenanceCost) &&
                renderInfoCard(
                    "Cost Information",
                    <>
                        {item.installationCost && renderInfoRow("Installation Cost", formatCurrency(item.installationCost))}
                        {item.consumptionCost && renderInfoRow("Consumption Cost", formatCurrency(item.consumptionCost))}
                        {item.constructionCost && renderInfoRow("Construction Cost", formatCurrency(item.constructionCost))}
                        {item.maintenanceCost && renderInfoRow("Maintenance Cost", formatCurrency(item.maintenanceCost))}
                    </>,
                    icons.dollarSign,
                )}

            {item.lastMaintenanceDate &&
                renderInfoCard(
                    "Maintenance Information",
                    <>{renderInfoRow("Last Maintenance Date", formatDate(item.lastMaintenanceDate))}</>,
                    icons.tool,
                )}
        </>
    )

    const itemConfig = getItemConfig()

    if (error && !item) {
        return (
            <SafeAreaView style={styles.container}>
                <SecondaryHeader title="Inventory Details" showBack={true} onBack={() => navigation.goBack()} />
                <View style={styles.errorContainer}>
                    <FastImage source={icons.alertCircle} style={styles.errorIcon} tintColor="#EF4444" />
                    <Text style={styles.errorTitle}>Error Loading Details</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadItemDetails}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" /> */}
            <SecondaryHeader
                title="Inventory Details"
                showBack={true}
                onBack={() => navigation.goBack()}
                rightComponent={
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
                            <FastImage source={icons.edit} style={styles.headerButtonIcon} tintColor={COLORS.green3 || "#10B981"} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
                            <FastImage source={icons.trash} style={styles.headerButtonIcon} tintColor="#EF4444" />
                        </TouchableOpacity>
                    </View>
                }
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header Card */}
                <LinearGradient
                    colors={[itemConfig.color, itemConfig.color + "DD"]}
                    style={styles.headerCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.headerCardContent}>
                        <View style={styles.headerIcon}>
                            <FastImage source={itemConfig.icon} style={styles.headerIconImage} tintColor="#FFFFFF" />
                        </View>
                        <View style={styles.headerInfo}>
                            <Text style={styles.headerType}>{itemConfig.title}</Text>
                            <Text style={styles.headerName} numberOfLines={2}>
                                {getItemName()}
                            </Text>
                            <Text style={styles.headerDate}>
                                Added {formatDate(item.createdAt || item.purchaseDate || item.entryDate)}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Loading Indicator */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={itemConfig.color} />
                        <Text style={styles.loadingText}>Loading details...</Text>
                    </View>
                )}

                {/* Details Content */}
                <View style={styles.detailsContent}>
                    {item.type === "goodsInStock" && renderGoodsDetails()}
                    {item.type === "machinery" && renderMachineryDetails()}
                    {item.type === "utility" && renderUtilityDetails()}

                    {/* Additional Information */}
                    {(item.createdAt || item.updatedAt || item.farmId) &&
                        renderInfoCard(
                            "System Information",
                            <>
                                {item.farmId && renderInfoRow("Farm ID", item.farmId)}
                                {item.inventoryId && renderInfoRow("Inventory ID", item.inventoryId)}
                                {item.createdAt && renderInfoRow("Created At", formatDate(item.createdAt))}
                                {item.updatedAt && renderInfoRow("Last Updated", formatDate(item.updatedAt))}
                            </>,
                            icons.info,
                        )}
                </View>
            </ScrollView>

            <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                    <FastImage source={icons.edit} style={styles.bottomButtonIcon} tintColor="#FFFFFF" />
                    <Text style={styles.bottomButtonText}>Edit Item</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <FastImage source={icons.trash} style={styles.bottomButtonIcon} tintColor="#FFFFFF" />
                    <Text style={styles.bottomButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>

            {renderDeleteModal()}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    content: {
        flex: 1,
    },

    // Header Actions
    headerActions: {
        flexDirection: "row",
        gap: 8,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerButtonIcon: {
        width: 18,
        height: 18,
    },

    // Header Card
    headerCard: {
        margin: 16,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    headerCardContent: {
        flexDirection: "row",
        alignItems: "center",
        padding: 24,
    },
    headerIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 20,
    },
    headerIconImage: {
        width: 32,
        height: 32,
    },
    headerInfo: {
        flex: 1,
    },
    headerType: {
        fontSize: 14,
        fontWeight: "600",
        color: "rgba(255, 255, 255, 0.8)",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    headerName: {
        fontSize: 24,
        fontWeight: "800",
        color: "#FFFFFF",
        marginBottom: 8,
        lineHeight: 30,
    },
    headerDate: {
        fontSize: 14,
        fontWeight: "500",
        color: "rgba(255, 255, 255, 0.8)",
    },

    // Loading
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#6B7280",
    },

    // Details Content
    detailsContent: {
        paddingHorizontal: 16,
        paddingBottom: 100, // Space for bottom actions
    },

    // Info Cards
    infoCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    infoCardHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    infoCardIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    infoCardTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
    },
    infoCardContent: {
        padding: 20,
    },

    // Info Rows
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F9FAFB",
    },
    infoRowHighlight: {
        backgroundColor: "#F0FDF4",
        marginHorizontal: -20,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#1F2937",
        textAlign: "right",
        flex: 1,
    },
    infoValueHighlight: {
        fontWeight: "700",
        color: COLORS.green3 || "#10B981",
    },

    // Condition
    conditionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F9FAFB",
    },
    conditionBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    conditionBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 0.5,
    },

    // Status Badge
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#FFFFFF",
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },

    // Delete Modal
    deleteModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    deleteModalContainer: {
        width: "100%",
        maxWidth: 400,
    },
    deleteModalCard: {
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    deleteModalIconContainer: {
        marginBottom: 20,
    },
    deleteModalIconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    deleteModalIcon: {
        width: 36,
        height: 36,
    },
    deleteModalTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1F2937",
        marginBottom: 8,
        textAlign: "center",
    },
    deleteModalMessage: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 4,
    },
    deleteModalSubMessage: {
        fontSize: 14,
        color: "#9CA3AF",
        textAlign: "center",
        marginBottom: 20,
    },
    deleteModalItemCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        width: "100%",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    deleteModalItemIconContainer: {
        marginRight: 12,
    },
    deleteModalItemIconGradient: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    deleteModalItemIcon: {
        width: 24,
        height: 24,
    },
    deleteModalItemInfo: {
        flex: 1,
    },
    deleteModalItemName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 2,
    },
    deleteModalItemType: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
    deleteModalItemBadge: {
        backgroundColor: "#FEE2E2",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    deleteModalItemBadgeText: {
        fontSize: 12,
        color: "#DC2626",
        fontWeight: "600",
    },
    deleteModalActions: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    deleteModalCancelButton: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    deleteModalCancelText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#374151",
    },
    deleteModalConfirmButton: {
        flex: 1,
        borderRadius: 16,
        overflow: "hidden",
    },
    deleteModalConfirmGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 8,
    },
    deleteModalConfirmIcon: {
        width: 16,
        height: 16,
    },
    deleteModalConfirmText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    // Bottom Actions
    bottomActions: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingBottom: 32,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        gap: 12,
    },
    editButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.green3 || "#10B981",
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: COLORS.green3 || "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        gap: 8,
    },
    deleteButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#EF4444",
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: "#EF4444",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        gap: 8,
    },
    bottomButtonIcon: {
        width: 18,
        height: 18,
    },
    bottomButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    // Error State
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    errorIcon: {
        width: 64,
        height: 64,
        marginBottom: 24,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1F2937",
        marginBottom: 12,
        textAlign: "center",
    },
    errorMessage: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
    },
    retryButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        backgroundColor: COLORS.green3 || "#10B981",
        shadowColor: COLORS.green3 || "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },
})

export default InventoryDetails
