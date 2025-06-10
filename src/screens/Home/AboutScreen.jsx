import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    Platform,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { COLORS } from '../../constants/theme';
import { icons } from '../../constants';

const { width } = Dimensions.get('window');

const AboutScreen = ({ navigation }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const features = [
        {
            icon: icons.user,
            title: 'User-Friendly Interface',
            description: 'Simplifies data entry, making it accessible to farmers of all scales.',
            color: '#E8F5E8',
            gradient: ['#E8F5E8', '#F0F8F0'],
        },
        {
            icon: icons.settings,
            title: 'Enhanced Collaboration',
            description: 'Promotes effective communication among stakeholders, boosting productivity and efficiency.',
            color: '#E8F4FD',
            gradient: ['#E8F4FD', '#F0F8FE'],
        },
        {
            icon: icons.agriculture,
            title: 'Smart Agriculture',
            description: 'Leverages technology to make farm management smarter, faster, and more efficient.',
            color: '#FFF8E1',
            gradient: ['#FFF8E1', '#FFFBF0'],
        },
    ];

    const missionPoints = [
        'We transition agricultural enterprises from outdated manual processes to structured and systematic management practices.',
        'Xpert Farmer ensures smooth regulatory compliance and better decision-making.',
        'With Xpert Farmer, you can replace cumbersome documentation with clear, actionable business analytics that empower your farm\'s growth and productivity.',
    ];

    const AnimatedFeatureCard = ({ feature, index }) => {
        const [cardAnim] = useState(new Animated.Value(0));
        const [pressed, setPressed] = useState(false);

        useEffect(() => {
            Animated.timing(cardAnim, {
                toValue: 1,
                duration: 600,
                delay: index * 200,
                useNativeDriver: true,
            }).start();
        }, []);

        const handlePressIn = () => {
            setPressed(true);
            Animated.spring(cardAnim, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        };

        const handlePressOut = () => {
            setPressed(false);
            Animated.spring(cardAnim, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        };

        return (
            <Animated.View
                style={[
                    {
                        opacity: cardAnim,
                        transform: [
                            {
                                translateY: cardAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [30, 0],
                                }),
                            },
                            { scale: cardAnim },
                        ],
                    },
                ]}
            >
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={[
                        styles.featureCard,
                        { backgroundColor: feature.color },
                        pressed && styles.featureCardPressed,
                    ]}
                >
                    <View style={styles.featureIconContainer}>
                        <FastImage
                            source={feature.icon}
                            style={styles.featureIcon}
                            resizeMode="contain"
                            tintColor={COLORS.green}
                        />
                    </View>
                    <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>{feature.title}</Text>
                        <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                    <View style={styles.featureArrow}>
                        <Text style={styles.arrowText}>→</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const AnimatedMissionPoint = ({ point, index }) => {
        const [pointAnim] = useState(new Animated.Value(0));

        useEffect(() => {
            Animated.timing(pointAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 150,
                useNativeDriver: true,
            }).start();
        }, []);

        return (
            <Animated.View
                style={[
                    styles.missionPoint,
                    {
                        opacity: pointAnim,
                        transform: [
                            {
                                translateX: pointAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-20, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.bulletPoint,
                        {
                            transform: [
                                {
                                    scale: pointAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 1],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
                <Text style={styles.missionText}>{point}</Text>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <FastImage
                        source={icons.backarrow}
                        style={styles.backIcon}
                        resizeMode="contain"
                        tintColor="white"
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About Xpert Farmer</Text>
                <View style={styles.headerSpacer} />
                <View style={styles.headerDecoration} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces={true}
            >
                {/* Enhanced Hero Section */}
                <Animated.View
                    style={[
                        styles.heroSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.appIconContainer,
                            {
                                transform: [
                                    {
                                        scale: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.8, 1],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <FastImage
                            source={icons.agriculture}
                            style={styles.appIcon}
                            resizeMode="contain"
                            tintColor={COLORS.green}
                        />
                        <View style={styles.iconGlow} />
                    </Animated.View>
                    <Text style={styles.heroTitle}>Xpert Farmer</Text>
                    <View style={styles.versionBadge}>
                        <Text style={styles.versionText}>Version 1.7</Text>
                    </View>
                </Animated.View>

                {/* Enhanced Main Description Card */}
                <Animated.View
                    style={[
                        styles.card,
                        styles.descriptionCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLine} />
                        <Text style={styles.cardHeaderText}>About Our Platform</Text>
                        <View style={styles.cardHeaderLine} />
                    </View>
                    <Text style={styles.descriptionText}>
                        Xpert Farmer is a farm management system that provides crops, livestock, inventory and sales record keeping for data driven commercial production. Our platform facilitates efficient information collection and organization, replacing documentation with structured business analytics. We enable agricultural enterprises to transition from inefficient manual processes to systematic management practices, ensuring regulatory compliance.
                    </Text>
                </Animated.View>

                {/* Enhanced Mission Points Section */}
                <Animated.View
                    style={[
                        styles.card,
                        {
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>What We Do</Text>

                    </View>
                    <View style={styles.missionPoints}>
                        {missionPoints.map((point, index) => (
                            <AnimatedMissionPoint key={index} point={point} index={index} />
                        ))}
                    </View>
                </Animated.View>

                <View style={styles.featuresSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Key Features</Text>

                    </View>
                    <View style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <AnimatedFeatureCard key={index} feature={feature} index={index} />
                        ))}
                    </View>
                </View>

                {/* Enhanced Footer */}
                <Animated.View
                    style={[
                        styles.footer,
                        {
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    <View style={styles.footerContent}>
                        <Text style={styles.footerText}>© 2024 Xpert Farmer</Text>
                        <Text style={styles.footerSubtext}>Empowering Agriculture Through Technology</Text>
                        <View style={styles.footerDecoration}>
                            <View style={styles.footerDot} />
                            <View style={styles.footerDot} />
                            <View style={styles.footerDot} />
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        backgroundColor: COLORS.green,
        height: 100,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: 16,
        paddingHorizontal: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        position: 'relative',
        overflow: 'hidden',
    },
    headerDecoration: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        padding: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    backIcon: {
        width: 24,
        height: 24,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '800',
        color: 'white',
        textAlign: 'center',
        marginRight: 40,
        letterSpacing: 0.5,
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    appIconContainer: {
        backgroundColor: COLORS.lightGreen,
        padding: 24,
        borderRadius: 28,
        marginBottom: 20,
        elevation: 6,
        shadowColor: COLORS.green,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        position: 'relative',
    },
    iconGlow: {
        position: 'absolute',
        top: -5,
        left: -5,
        right: -5,
        bottom: -5,
        borderRadius: 33,
        backgroundColor: COLORS.green,
        opacity: 0.1,
    },
    appIcon: {
        width: 56,
        height: 56,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.green,
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: 1,
    },
    versionBadge: {
        backgroundColor: COLORS.green,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    versionText: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
    },
    card: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 20,
        padding: 24,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
    },
    descriptionCard: {
        borderLeftWidth: 4,
        borderLeftColor: COLORS.green,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardHeaderLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    cardHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.green,
        marginHorizontal: 16,
    },
    descriptionText: {
        fontSize: 16,
        color: '#2C3E50',
        lineHeight: 26,
        textAlign: 'justify',
        fontWeight: '400',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.green,
        letterSpacing: 0.5,
    },
    sectionIcon: {
        backgroundColor: '#F0F8F0',
        padding: 8,
        borderRadius: 12,
    },
    sectionIconText: {
        fontSize: 18,
    },
    missionPoints: {
        marginTop: 0,
    },
    missionPoint: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    bulletPoint: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.green,
        marginTop: 8,
        marginRight: 16,
        flexShrink: 0,
        elevation: 2,
        shadowColor: COLORS.green,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    missionText: {
        flex: 1,
        fontSize: 16,
        color: '#2C3E50',
        lineHeight: 24,
        fontWeight: '400',
    },
    featuresSection: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    featuresGrid: {
        marginTop: 12,
    },
    featureCard: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    featureCardPressed: {
        elevation: 2,
        shadowOpacity: 0.05,
    },
    featureIconContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        marginRight: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        flexShrink: 0,
    },
    featureIcon: {
        width: 32,
        height: 32,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    featureDescription: {
        fontSize: 15,
        color: '#5D6D7E',
        lineHeight: 22,
        fontWeight: '400',
    },
    featureArrow: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    arrowText: {
        fontSize: 20,
        color: COLORS.green,
        fontWeight: 'bold',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    footerContent: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        color: COLORS.darkGray3,
        marginBottom: 8,
        fontWeight: '600',
    },
    footerSubtext: {
        fontSize: 14,
        color: COLORS.darkGray3,
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: '400',
    },
    footerDecoration: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.green,
        marginHorizontal: 4,
        opacity: 0.6,
    },
});

export default AboutScreen;