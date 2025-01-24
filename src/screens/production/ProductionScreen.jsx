import React, { useState } from 'react';
import { Box, Text, VStack, ScrollView, HStack, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'native-base';
import { COLORS } from '../../constants/theme';
import { LineProps } from 'recharts';

const ProductionScreen = () => {
 const [milkData, setMilkData] = useState([
   { month: 'Jan', value: 30 },
   { month: 'Feb', value: 25 },
   { month: 'Mar', value: 32 },
   { month: 'Apr', value: 28 },
   { month: 'May', value: 31 },
   { month: 'Jun', value: 27 },
 ]);

 const [eggData, setEggData] = useState([
   { month: 'Jan', value: 3800 },
   { month: 'Feb', value: 3700 },
   { month: 'Mar', value: 3900 },
   { month: 'Apr', value: 3600 },
   { month: 'May', value: 3850 },
   { month: 'Jun', value: 3750 },
 ]);

 return (
   <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
     <VStack space={6} p={6}>
       <Box>
         <Text fontSize="lg" fontWeight="bold" mb={4}>Milk Yield Trend</Text>
         <ResponsiveContainer width="100%" height={300}>
           <LineChart data={milkData}>
             <XAxis dataKey="month" />
             <YAxis />
             <CartesianGrid strokeDasharray="3 3" />
             <Tooltip />
             <Legend />
             <line
               dataKey="value"
               stroke={COLORS.green}
               type="monotone"
             />
           </LineChart>
         </ResponsiveContainer>
       </Box>

       <Box>
         <Text fontSize="lg" fontWeight="bold" mb={4}>Egg Production</Text>
         <ResponsiveContainer width="100%" height={300}>
           <LineChart data={eggData}>
             <XAxis dataKey="month" />
             <YAxis />
             <CartesianGrid strokeDasharray="3 3" />
             <Tooltip />
             <Legend />
             <line
               dataKey="value"
               stroke={COLORS.green}
               type="monotone"
             />
           </LineChart>
         </ResponsiveContainer>
       </Box>

       <Box>
         <Text fontSize="lg" fontWeight="bold" mb={4}>Overview</Text>
         <VStack space={4}>
           <HStack justifyContent="space-between">
             <Text>Dairy production cattle record</Text>
             <Text></Text>
           </HStack>
           <HStack justifyContent="space-between">
             <Text>Beef production cattle record</Text>
             <Text></Text>
           </HStack>
           <HStack justifyContent="space-between">
             <Text>Poultry production record</Text>
             <Text></Text>
           </HStack>
           <HStack justifyContent="space-between">
             <Text>Swine production record</Text>
             <Text></Text>
           </HStack>
           <HStack justifyContent="space-between">
             <Text>Sheep and Goats production record</Text>
             <Text></Text>
           </HStack>
         </VStack>
       </Box>
     </VStack>
   </ScrollView>
 );
};

export default ProductionScreen;