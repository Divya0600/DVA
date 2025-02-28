// src/components/PipelineVisualizer.js
import React from 'react';
import { Box, Flex, VStack, Text, Icon, Center, useColorModeValue } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { FaDatabase, FaBug, FaJira, FaCloud, FaCloudDownloadAlt, FaQuestion } from 'react-icons/fa';

// Map of adapter types to icons
const getSourceIcon = (sourceName) => {
  // Default to database icon if source type is not recognized
  // Added null check to prevent errors
  if (!sourceName) return FaQuestion;
  
  switch (sourceName.toLowerCase()) {
    case 'alm':
      return FaBug; // Bug icon for ALM/defect tracking
    case 'jira':
      return FaJira;
    case 'salesforce':
      return FaCloud;
    case 'rest':
      return FaCloudDownloadAlt;
    default:
      return FaDatabase;
  }
};

const getDestinationIcon = (destinationName) => {
  // Default to database icon if destination type is not recognized
  // Added null check to prevent errors
  if (!destinationName) return FaQuestion;
  
  switch (destinationName.toLowerCase()) {
    case 'alm':
      return FaBug;
    case 'jira':
      return FaJira;
    case 'salesforce':
      return FaCloud;
    case 'rest':
      return FaCloudDownloadAlt;
    default:
      return FaDatabase;
  }
};

const PipelineVisualizer = ({ sourceName = 'unknown', destinationName = 'unknown', status = 'inactive' }) => {
  // Color hooks - defined at the top level
  const iconColor = useColorModeValue('blue.500', 'blue.300');
  const inactiveColor = useColorModeValue('gray.300', 'gray.600');
  const lineColorActive = useColorModeValue('blue.400', 'blue.300');
  const lineColorInactive = useColorModeValue('gray.300', 'gray.600');
  const boxBgColor = useColorModeValue('gray.50', 'gray.700');
  const boxBorderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Determine colors based on pipeline status
  const sourceColor = status === 'active' ? iconColor : inactiveColor;
  const destColor = status === 'active' ? iconColor : inactiveColor;
  const lineColor = status === 'active' ? lineColorActive : lineColorInactive;

  // Ensure we have valid strings
  const sourceNameStr = sourceName || 'unknown';
  const destinationNameStr = destinationName || 'unknown';

  return (
    <Flex justify="space-between" align="center" py={6} px={10}>
      {/* Source */}
      <VStack spacing={3}>
        <Box 
          p={4} 
          rounded="lg" 
          bg={boxBgColor}
          borderWidth="1px"
          borderColor={boxBorderColor}
          boxShadow="md"
          width="150px"
          height="150px"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Icon as={getSourceIcon(sourceNameStr)} boxSize="50px" color={sourceColor} />
          <Text mt={3} fontWeight="medium" textAlign="center">
            {sourceNameStr.toUpperCase()}
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign="center">Source</Text>
        </Box>
      </VStack>
      
      {/* Connection Line with Arrow */}
      <Flex flex={1} justify="center" align="center" position="relative">
        <Box 
          height="2px" 
          flex={1} 
          bg={lineColor} 
          position="relative"
        />
        <Center 
          position="absolute" 
          left="50%" 
          transform="translateX(-50%)" 
          bg={status === 'active' ? 'blue.500' : 'gray.400'} 
          rounded="full" 
          p={2}
        >
          <ArrowForwardIcon color="white" />
        </Center>
      </Flex>
      
      {/* Destination */}
      <VStack spacing={3}>
        <Box 
          p={4} 
          rounded="lg" 
          bg={boxBgColor}
          borderWidth="1px"
          borderColor={boxBorderColor}
          boxShadow="md"
          width="150px"
          height="150px"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Icon as={getDestinationIcon(destinationNameStr)} boxSize="50px" color={destColor} />
          <Text mt={3} fontWeight="medium" textAlign="center">
            {destinationNameStr.toUpperCase()}
          </Text>
          <Text fontSize="sm" color="gray.500" textAlign="center">Destination</Text>
        </Box>
      </VStack>
    </Flex>
  );
};

export default PipelineVisualizer;