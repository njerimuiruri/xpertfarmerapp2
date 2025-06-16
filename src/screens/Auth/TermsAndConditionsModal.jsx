import React, { useState } from 'react';
import { Modal, ScrollView, Dimensions } from 'react-native';
import { Box, Text, Button, VStack, HStack, Pressable, Checkbox } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { height } = Dimensions.get('window');

const TermsAndConditionsModal = ({
    isVisible,
    onClose,
    onAccept,
    isAccepted = false
}) => {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(isAccepted);

    const handleScroll = ({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const paddingToBottom = 20;
        const isScrolledToBottom = layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;

        if (isScrolledToBottom && !hasScrolledToBottom) {
            setHasScrolledToBottom(true);
        }
    };

    const handleAccept = () => {
        if (acceptTerms) {
            onAccept(true);
            onClose();
        }
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <Box flex={1} backgroundColor="white" safeArea>
                {/* Header */}
                <HStack
                    alignItems="center"
                    justifyContent="space-between"
                    paddingX={4}
                    paddingY={3}
                    borderBottomWidth={1}
                    borderBottomColor="gray.200"
                >
                    <Text fontSize="18" fontWeight="600" color="gray.800">
                        Terms and Conditions
                    </Text>
                    <Pressable onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Icon name="close" size={24} color="#6B7280" />
                    </Pressable>
                </HStack>

                <ScrollView
                    flex={1}
                    paddingX={4}
                    paddingY={4}
                    onScroll={handleScroll}
                    scrollEventThrottle={400}
                    showsVerticalScrollIndicator={true}
                >
                    <VStack space={4}>
                        {/* Introduction */}
                        <Box>
                            <Text fontSize="18" fontWeight="600" color="green.600" mb={3}>
                                Introduction
                            </Text>
                            <Text fontSize="14" color="gray.700" lineHeight={5}>
                                Welcome to Xpert Farmer, we are a platform that provides digital tools for recording, managing,
                                analyzing and improving farm operations. These Terms and Conditions govern your access to and use of
                                our services.
                            </Text>
                            <Text fontSize="14" color="gray.700" lineHeight={5} mt={2}>
                                By using the Xpert Farmer system you agree to be bound by these terms and confirm that you have read
                                and understood our Privacy Policy.
                            </Text>
                        </Box>

                        {/* Definitions */}
                        <Box>
                            <Text fontSize="16" fontWeight="600" color="green.600" mb={2}>
                                Definitions
                            </Text>
                            <VStack space={2}>
                                <Text fontSize="14" color="gray.700">
                                    • <Text fontWeight="500">"Xpert Farmer", "we", "our", "us"</Text> – Refers to the company operating the Xpert Farmer platform.
                                </Text>
                                <Text fontSize="14" color="gray.700">
                                    • <Text fontWeight="500">"User", "you", "farmer"</Text> – Any individual, cooperative or corporate entity that registers for or uses the Xpert Farmer services.
                                </Text>
                                <Text fontSize="14" color="gray.700">
                                    • <Text fontWeight="500">"Platform"</Text> – The software, website and mobile application known as Xpert Farmer.
                                </Text>
                                <Text fontSize="14" color="gray.700">
                                    • <Text fontWeight="500">"Services"</Text> – All tools, features, content and subscription packages offered by Xpert Farmer.
                                </Text>
                            </VStack>
                        </Box>

                        {/* Purpose of the App */}
                        <Box>
                            <Text fontSize="16" fontWeight="600" color="green.600" mb={2}>
                                Purpose of the App
                            </Text>
                            <VStack space={1}>
                                <Text fontSize="14" color="gray.700">• Automate Farm Data Management</Text>
                                <Text fontSize="14" color="gray.700">• Enable Business-Oriented Farming</Text>
                                <Text fontSize="14" color="gray.700">• Provide Data-Driven Insights</Text>
                                <Text fontSize="14" color="gray.700">• Support Decision-Making</Text>
                                <Text fontSize="14" color="gray.700">• Boost Market Access and Financial Linkages</Text>
                                <Text fontSize="14" color="gray.700">• Train and Onboard Less-Informed Farmers</Text>
                            </VStack>
                        </Box>

                        {/* Eligibility and Registration */}
                        <Box>
                            <Text fontSize="16" fontWeight="600" color="green.600" mb={2}>
                                Eligibility and Registration
                            </Text>
                            <Text fontSize="14" color="gray.700" mb={2}>You must:</Text>
                            <VStack space={1}>
                                <Text fontSize="14" color="gray.700">• Be at least 16 years old.</Text>
                                <Text fontSize="14" color="gray.700">• Have the legal capacity to enter into agreements.</Text>
                                <Text fontSize="14" color="gray.700">• Provide accurate and complete registration information.</Text>
                                <Text fontSize="14" color="gray.700">• Maintain confidentiality of your account credentials.</Text>
                            </VStack>
                        </Box>

                        {/* License to Use */}
                        <Box>
                            <Text fontSize="16" fontWeight="600" color="green.600" mb={2}>
                                License to Use
                            </Text>
                            <Text fontSize="14" color="gray.700" mb={2}>
                                We grant you a limited, non-transferable non-exclusive license to use the platform for farm-related data
                                management insights and decision support.
                            </Text>
                            <Text fontSize="14" color="gray.700" mb={2}>You may not:</Text>
                            <VStack space={1}>
                                <Text fontSize="14" color="gray.700">• Reproduce, sell or lease any part of our software.</Text>
                                <Text fontSize="14" color="gray.700">• Reverse engineer or attempt to extract the source code.</Text>
                                <Text fontSize="14" color="gray.700">• Use our services for illegal or malicious purposes.</Text>
                            </VStack>
                        </Box>

                        {/* Subscription and Payment */}
                        <Box>
                            <Text fontSize="16" fontWeight="600" color="green.600" mb={2}>
                                Subscription and Payment
                            </Text>
                            <Text fontSize="14" color="gray.700" mb={2}>Our pricing model is subscription-based. Payment terms include:</Text>
                            <VStack space={1}>
                                <Text fontSize="14" color="gray.700">• Subscription is tiered based on the number of livestock or type of crops/farms.</Text>
                                <Text fontSize="14" color="gray.700">• Subscriptions will be monthly, seasonally, quarterly or annually or as prescribed to deem fit to the client.</Text>
                                <Text fontSize="14" color="gray.700">• Failure to pay on time may result in suspension of access.</Text>
                                <Text fontSize="14" color="gray.700">• We are only liable to issue refunds upon vetting per; failure to use the system for up to 24hrs despite making payment, technical failure leading to double transactions and wrongful deduction or any other issue.</Text>
                            </VStack>
                            <Text fontSize="14" color="gray.700" mt={2}>
                                Payment channels include mobile money, bank transfers or any method listed on our platform. We do not accept cash payments.
                            </Text>
                        </Box>

                        {/* Data Ownership and Protection */}
                        <Box>
                            <Text fontSize="16" fontWeight="600" color="green.600" mb={2}>
                                Data Ownership and Protection
                            </Text>
                            <Text fontSize="14" color="gray.700" mb={2}>
                                Xpert Farmer respects and protects user data in accordance with the Kenyan Data Protection Act, 2019.
                            </Text>

                            <Text fontSize="14" fontWeight="500" color="gray.800" mb={1}>Your Rights:</Text>
                            <VStack space={1} mb={3}>
                                <Text fontSize="14" color="gray.700">• Access, rectify or delete your data.</Text>
                                <Text fontSize="14" color="gray.700">• Withdraw consent at any time.</Text>
                                <Text fontSize="14" color="gray.700">• Object to direct marketing.</Text>
                            </VStack>

                            <Text fontSize="14" fontWeight="500" color="gray.800" mb={1}>Our Responsibilities:</Text>
                            <VStack space={1} mb={3}>
                                <Text fontSize="14" color="gray.700">• Store data securely.</Text>
                                <Text fontSize="14" color="gray.700">• Avoid unauthorized access, disclosure or misuse.</Text>
                                <Text fontSize="14" color="gray.700">• Retain data only as long as necessary or legally required.</Text>
                            </VStack>

                            <Text fontSize="14" fontWeight="500" color="gray.800" mb={1}>Data Usage:</Text>
                            <VStack space={1}>
                                <Text fontSize="14" color="gray.700">• To deliver personalized insights and services.</Text>
                                <Text fontSize="14" color="gray.700">• For anonymized analysis to improve our system.</Text>
                                <Text fontSize="14" color="gray.700">• To comply with legal or regulatory obligations.</Text>
                            </VStack>
                        </Box>

                        {/* User-Generated Content */}
                        <Box>
                            <Text fontSize="16" fontWeight="600" color="green.600" mb={2}>
                                User-Generated Content
                            </Text>
                            <Text fontSize="14" color="gray.700" mb={2}>
                                You are solely responsible for the accuracy of the data you input, including:
                            </Text>
                            <VStack space={1} mb={2}>
                                <Text fontSize="14" color="gray.700">• Livestock and crop data.</Text>
                                <Text fontSize="14" color="gray.700">• Inventory records.</Text>
                                <Text fontSize="14" color="gray.700">• Production costs and revenue figures.</Text>
                            </VStack>
                            <Text fontSize="14" color="gray.700">
                                We reserve the right to remove any content that violates these terms or is deemed fraudulent, illegal or offensive.
                            </Text>
                        </Box>

                        {/* Warranties and Disclaimers */}
                        <Box>
                            <Text fontSize="16" fontWeight="600" color="green.600" mb={2}>
                                Warranties and Disclaimers
                            </Text>
                            <Text fontSize="14" color="gray.700" mb={2}>Xpert Farmer does not guarantee:</Text>
                            <VStack space={1} mb={2}>
                                <Text fontSize="14" color="gray.700">• That the platform will meet all your farm's unique needs.</Text>
                                <Text fontSize="14" color="gray.700">• That the system is entirely error free or uninterrupted.</Text>
                                <Text fontSize="14" color="gray.700">• That the insights provided guarantee increased yields or income.</Text>
                            </VStack>
                            <Text fontSize="14" color="gray.700" fontWeight="500">
                                You use the platform at your own risk.
                            </Text>
                        </Box>

                        {/* Limitation of Liability */}
                        <Box>
                            <Text fontSize="16" fontWeight="600" color="green.600" mb={2}>
                                Limitation of Liability
                            </Text>
                            <Text fontSize="14" color="gray.700" mb={2}>To the extent permitted by law:</Text>
                            <VStack space={1}>
                                <Text fontSize="14" color="gray.700">• We are not liable for indirect, incidental or consequential damages.</Text>
                                <Text fontSize="14" color="gray.700">• Our total liability will not exceed the amount you paid in the last 12 months.</Text>
                            </VStack>
                        </Box>

                        {/* Governing Law */}
                        <Box>
                            <Text fontSize="16" fontWeight="600" color="green.600" mb={2}>
                                Governing Law and Dispute Resolution
                            </Text>
                            <Text fontSize="14" color="gray.700" mb={2}>
                                These Terms shall be governed by the laws of Kenya including:
                            </Text>
                            <VStack space={1} mb={3}>
                                <Text fontSize="14" color="gray.700">• The Constitution of Kenya (2010) Articles 31 (Privacy), 46 (Consumer Rights)</Text>
                                <Text fontSize="14" color="gray.700">• The Data Protection Act (2019)</Text>
                                <Text fontSize="14" color="gray.700">• The Kenya Information and Communications Act</Text>
                                <Text fontSize="14" color="gray.700">• The Agricultural sector regulations and county-specific Agri tech programs</Text>
                            </VStack>

                            <Text fontSize="14" fontWeight="500" color="gray.800" mb={1}>Dispute Resolution Process:</Text>
                            <VStack space={1}>
                                <Text fontSize="14" color="gray.700">1. Amicable Negotiation</Text>
                                <Text fontSize="14" color="gray.700">2. Arbitration (in accordance with the Arbitration Act No. 4 of 1995)</Text>
                                <Text fontSize="14" color="gray.700">3. Legal recourse in Kenyan courts</Text>
                            </VStack>
                        </Box>

                        {/* Termination */}
                        <Box>
                            <Text fontSize="16" fontWeight="600" color="green.600" mb={2}>
                                Termination
                            </Text>
                            <Text fontSize="14" color="gray.700" mb={2}>We may suspend or terminate your account for:</Text>
                            <VStack space={1} mb={2}>
                                <Text fontSize="14" color="gray.700">• Breach of any terms.</Text>
                                <Text fontSize="14" color="gray.700">• Non-payment.</Text>
                                <Text fontSize="14" color="gray.700">• Violation of Kenyan laws or misuse of data.</Text>
                            </VStack>
                            <Text fontSize="14" color="gray.700" mb={2}>On termination:</Text>
                            <VStack space={1}>
                                <Text fontSize="14" color="gray.700">• Access will be revoked.</Text>
                                <Text fontSize="14" color="gray.700">• Data will be handled per our Privacy Policy and Kenya's Data Protection Act.</Text>
                            </VStack>
                        </Box>

                        {/* Contact Information */}
                        <Box>
                            <Text fontSize="16" fontWeight="600" color="green.600" mb={2}>
                                Contact Us
                            </Text>
                            <Text fontSize="14" color="gray.700">
                                If you have questions, complaints, or wish to exercise your rights under the Data Protection Act:
                            </Text>
                            <Text fontSize="14" color="green.600" fontWeight="500" mt={1}>
                                support@xpertfarmer.com
                            </Text>
                        </Box>

                        {/* Bottom padding for better scrolling */}
                        <Box height={4} />
                    </VStack>
                </ScrollView>

                {/* Footer with acceptance */}
                <Box
                    paddingX={4}
                    paddingY={4}
                    borderTopWidth={1}
                    borderTopColor="gray.200"
                    backgroundColor="white"
                >
                    <VStack space={3}>
                        {/* Scroll indicator */}
                        {!hasScrolledToBottom && (
                            <HStack alignItems="center" justifyContent="center" space={2}>
                                <Icon name="scroll-vertical" size={16} color="#059669" />
                                <Text fontSize="12" color="green.600" textAlign="center">
                                    Please scroll to read all terms and conditions
                                </Text>
                            </HStack>
                        )}

                        {/* Acceptance checkbox */}
                        <Checkbox
                            value="accepted"
                            isChecked={acceptTerms}
                            onChange={setAcceptTerms}
                            colorScheme="green"
                            size="sm"
                            isDisabled={!hasScrolledToBottom}
                        >
                            <Text fontSize="14" color="gray.700" flex={1} flexWrap="wrap">
                                I have read, understood, and agree to the Terms and Conditions
                            </Text>
                        </Checkbox>

                        {/* Action buttons */}
                        <HStack space={3}>
                            <Button
                                variant="outline"
                                borderColor="gray.300"
                                flex={1}
                                height={12}
                                onPress={onClose}
                                borderRadius={8}
                            >
                                <Text color="gray.600" fontSize="16" fontWeight="500">
                                    Cancel
                                </Text>
                            </Button>

                            <Button
                                backgroundColor={acceptTerms ? "green.500" : "gray.300"}
                                flex={1}
                                height={12}
                                onPress={handleAccept}
                                isDisabled={!acceptTerms}
                                borderRadius={8}
                                _pressed={{ backgroundColor: acceptTerms ? "green.600" : "gray.300" }}
                            >
                                <Text
                                    color={acceptTerms ? "white" : "gray.500"}
                                    fontSize="16"
                                    fontWeight="500"
                                >
                                    Accept & Continue
                                </Text>
                            </Button>
                        </HStack>
                    </VStack>
                </Box>
            </Box>
        </Modal>
    );
};

export default TermsAndConditionsModal;