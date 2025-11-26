import React from 'react';
import { Activity, Users, Sprout, Coffee, TrendingUp } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Box, SimpleGrid, VStack, Icon, Heading, Text } from '@chakra-ui/react';
import { Card, CardContent } from '../ui/card';

const Stat = () => {
  const stats = [
    {
      icon: Activity,
      value: "5K+",
      label: "Diseases Solved",
      color: "text-emerald-600",
      bgColor: "from-emerald-50 to-emerald-100",
      borderColor: "border-emerald-200",
      hoverColor: "hover:border-emerald-400"
    },
    {
      icon: Users,
      value: "10K+",
      label: "Farmers Helped",
      color: "text-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      hoverColor: "hover:border-blue-400"
    },
    {
      icon: Sprout,
      value: "15K+",
      label: "Coffee Planted",
      color: "text-green-600",
      bgColor: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      hoverColor: "hover:border-green-400"
    },
    {
      icon: Coffee,
      value: "20K+",
      label: "Cups of Coffee",
      color: "text-amber-600",
      bgColor: "from-amber-50 to-amber-100",
      borderColor: "border-amber-200",
      hoverColor: "hover:border-amber-400"
    }
  ];

  return (
    <Box py={{ base: 16, md: 24 }} px={{ base: 4, md: 8 }} bg="white" position="relative" overflow="hidden">
      {/* Background Pattern */}
      <Box position="absolute" inset={0} opacity={0.05}>
        <Box position="absolute" top={10} left={10} w={16} h={16} border="2px solid" borderColor="amber.400" borderRadius="full" />
        <Box position="absolute" bottom={20} right={20} w={12} h={12} border="2px solid" borderColor="emerald.400" borderRadius="full" />
        <Box position="absolute" top="50%" left="25%" w={8} h={8} border="2px solid" borderColor="orange.400" borderRadius="full" />
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} maxW="7xl" w="full" mx="auto">
        {stats.map((stat, index) => (
          <Card
            key={stat.label}
            className={`text-center bg-gradient-to-br ${stat.bgColor} border-2 ${stat.borderColor} rounded-3xl p-6 md:p-8 min-h-56 md:min-h-64 shadow-xl transition-all duration-300 hover:-translate-y-2 ${stat.hoverColor} relative overflow-hidden group cursor-default`}
          >
            <CardContent>
              {/* Animated Top Border */}
              <motion.div
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-emerald-500"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
              />

              {/* Icon with Animation */}
              <VStack spacing={4} align="center">
                <Icon as={stat.icon} w={{ base: 12, md: 16 }} h={{ base: 12, md: 16 }} color={stat.color.replace('text-', '')} />

                {/* Value with Counter Animation */}
                <Heading size="2xl" color={stat.color.replace('text-', '')} fontWeight="bold">
                  {stat.value}
                </Heading>

                {/* Label */}
                <Text fontSize={{ base: "base", md: "lg" }} fontWeight="semibold" color={stat.color.replace('text-', '').replace('600', '700')}>
                  {stat.label}
                </Text>
              </VStack>

              {/* Hover Effect Overlay */}
              <Box
                position="absolute"
                inset={0}
                bgGradient="linear(to-br, rgba(255,255,255,0.1), transparent)"
                opacity={0}
                _groupHover={{ opacity: 0.8 }}
                transition="opacity 0.3s"
                borderRadius="3xl"
              />
            </CardContent>
          </Card>
        ))}
      </SimpleGrid>

      {/* Trending Up Indicator */}
      <Box position="absolute" bottom={8} right={8} color="amber.600">
        <Icon as={TrendingUp} w={8} h={8} />
      </Box>
    </Box>
  );
};

export default Stat;
