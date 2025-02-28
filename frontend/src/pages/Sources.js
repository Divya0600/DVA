// src/pages/Sources.js - Redesigned to match the mockup style
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  SimpleGrid,
  Stack,
  Tag,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  ExternalLinkIcon,
  InfoOutlineIcon,
} from '@chakra-ui/icons';
import { 
  FaDatabase, 
  FaServer, 
  FaCloud, 
  FaBug, 
  
  FaCloudDownloadAlt,
} from 'react-icons/fa';

import apiService from '../services/api';

// Helper to get icon for a source type
const getSourceIcon = (sourceType) => {
  switch (sourceType.toLowerCase()) {
    case 'alm':
      return FaBug;
    case 'mysql':
      return FaDatabase;
    case 'postgres':
    case 'postgresql':
      return FaDatabase;
    case 'salesforce':
      return FaCloud;
    case 'rest':
      return FaCloudDownloadAlt;
    default:
      return FaServer;
  }
};

const Sources = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch sources
  const {
    data: sourcesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(['adapter-types'], () => apiService.pipelines.getTypes());
  
  // Count how many pipelines use each source
  const { data: pipelinesData } = useQuery(['pipelines'], () => apiService.pipelines.getAll());
  
  const getSourceUsageCount = (sourceType) => {
    if (!pipelinesData?.data) return 0;
    const pipelines = Array.isArray(pipelinesData.data) ? pipelinesData.data : [];
    return pipelines.filter(p => p.source_type === sourceType).length;
  };
  
  // Background colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  const iconBg = useColorModeValue('gray.50', 'gray.800');
  
  // Filter sources based on search
  const getSources = () => {
    if (!sourcesData?.data?.source_types) {
      // Fallback mock data if API doesn't return sources
      return [
        { id: 'mysql', name: 'MySQL', description: 'MySQL Database' },
        { id: 'postgres', name: 'PostgreSQL', description: 'PostgreSQL Database' },
        { id: 'mongodb', name: 'MongoDB', description: 'MongoDB Database' },
        { id: 'alm', name: 'ALM', description: 'HP ALM Defect Tracking' },
        { id: 'salesforce', name: 'Salesforce', description: 'Salesforce CRM' },
        { id: 'rest', name: 'REST API', description: 'Generic REST API' },
      ];
    }
    
    return sourcesData.data.source_types;
  };
  
  const sources = getSources().filter(source => 
    source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="400px">
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg">Data Sources</Heading>
          <Text color="gray.600">Connect to various data sources to create pipelines</Text>
        </Box>
        
        <Button
          as={RouterLink}
          to="/pipelines/create"
          colorScheme="blue"
          rightIcon={<ExternalLinkIcon />}
        >
          Create Pipeline
        </Button>
      </Flex>
      
      {/* Search bar */}
      <InputGroup mb={8} maxW="600px">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search sources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          borderRadius="lg"
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow="sm"
        />
      </InputGroup>
      
      {/* Sources grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        {sources.map((source) => {
          const SourceIcon = getSourceIcon(source.id);
          const usageCount = getSourceUsageCount(source.id);
          
          return (
            <Card
              key={source.id}
              borderWidth="1px"
              borderColor={cardBorder}
              borderRadius="lg"
              bg={cardBg}
              overflow="hidden"
              boxShadow="sm"
              transition="all 0.2s"
              _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
            >
              <CardBody>
                <Flex align="center" mb={4}>
                  <Box
                    p={3}
                    mr={4}
                    borderRadius="lg"
                    bg={iconBg}
                    color={useColorModeValue('blue.500', 'blue.300')}
                  >
                    <Icon as={SourceIcon} boxSize={6} />
                  </Box>
                  
                  <Box flex="1">
                    <Heading size="md">{source.name}</Heading>
                    <Text color="gray.500" fontSize="sm">{source.description}</Text>
                  </Box>
                  
                  {usageCount > 0 && (
                    <Tag size="sm" colorScheme="green" borderRadius="full">
                      {usageCount} {usageCount === 1 ? 'pipeline' : 'pipelines'}
                    </Tag>
                  )}
                </Flex>
                
                <Stack spacing={3}>
                  <Text fontSize="sm" fontWeight="medium">Capabilities:</Text>
                  <Flex wrap="wrap" gap={2}>
                    <Tag size="sm" colorScheme="blue">Data Extraction</Tag>
                    
                    {source.id === 'alm' && (
                      <>
                        <Tag size="sm" colorScheme="blue">Defect Tracking</Tag>
                        <Tag size="sm" colorScheme="blue">Test Management</Tag>
                      </>
                    )}
                    
                    {source.id === 'mysql' || source.id === 'postgres' || source.id === 'mongodb' && (
                      <>
                        <Tag size="sm" colorScheme="blue">Database</Tag>
                        <Tag size="sm" colorScheme="blue">Tables</Tag>
                      </>
                    )}
                    
                    {source.id === 'salesforce' && (
                      <>
                        <Tag size="sm" colorScheme="blue">CRM</Tag>
                        <Tag size="sm" colorScheme="blue">Objects</Tag>
                      </>
                    )}
                    
                    {source.id === 'rest' && (
                      <>
                        <Tag size="sm" colorScheme="blue">API</Tag>
                        <Tag size="sm" colorScheme="blue">Custom Endpoints</Tag>
                      </>
                    )}
                  </Flex>
                  
                  <HStack mt={4} spacing={4}>
                    <Button
                      as={RouterLink}
                      to={{
                        pathname: "/pipelines/create",
                        state: { preselectedSource: source.id }
                      }}
                      size="sm"
                      colorScheme="blue"
                      variant="solid"
                    >
                      Use Source
                    </Button>
                    
                    <Button
                      as={RouterLink}
                      to={`/documentation/sources/${source.id}`}
                      size="sm"
                      variant="ghost"
                      rightIcon={<ExternalLinkIcon />}
                    >
                      Documentation
                    </Button>
                  </HStack>
                </Stack>
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>
      
      {/* Documentation callout */}
      <Card bg="blue.50" borderColor="blue.200" borderWidth="1px" mb={6}>
        <CardBody>
          <Flex>
            <Icon as={InfoOutlineIcon} boxSize={6} color="blue.500" mr={4} mt={1} />
            <Box>
              <Heading size="md" color="blue.700" mb={2}>Creating Custom Sources</Heading>
              <Text color="blue.700">
                Need to connect to a system not listed here? You can create custom source adapters 
                by implementing the source adapter interface. This allows you to connect to any 
                system with an API.
              </Text>
              <Button
                as={RouterLink}
                to="/documentation/custom-adapters"
                mt={4}
                colorScheme="blue"
                variant="outline"
              >
                Read Documentation
              </Button>
            </Box>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Sources;