// src/pages/Destinations.js
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Link,
  Stack,
  Text,
  Spinner,
  Badge,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { ExternalLinkIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { FaDatabase, FaBug, FaJira, FaCloud, FaCloudDownloadAlt, FaInfoCircle, FaFileAlt } from 'react-icons/fa';

import apiService from '../services/api';

// Helper to get icon for a destination type
const getDestinationIcon = (destinationType) => {
  // Default to database icon if destination type is not recognized
  switch ((destinationType || '').toLowerCase()) {
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

const Destinations = () => {
  // Fetch destinations
  const {
    data: destinationsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(['adapter-types'], () => apiService.pipelines.getTypes());
  
  // Count how many pipelines use each destination
  const { data: pipelinesData } = useQuery(['pipelines'], () => apiService.pipelines.getAll());
  
  const getDestinationUsageCount = (destinationType) => {
    if (!pipelinesData?.data) return 0;
    
    // Ensure it's an array before trying to filter
    const pipelines = Array.isArray(pipelinesData.data) ? pipelinesData.data : [];
    return pipelines.filter(p => p.destination_type === destinationType).length;
  };
  
  // Card background and border colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  const iconColor = useColorModeValue('blue.500', 'blue.300');
  
  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="400px">
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  if (isError) {
    return (
      <Box p={4}>
        <Heading size="md" color="red.500">Error loading destinations</Heading>
        <Text>{error?.message || "Unknown error occurred"}</Text>
        <Button mt={4} onClick={refetch}>Try Again</Button>
      </Box>
    );
  }
  
  // Safely access the destination types array
  const destinations = destinationsData?.data?.destination_types || [];
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Data Destinations</Heading>
        <HStack>
          <Link href="/documentation/destinations" isExternal>
            <Button rightIcon={<ExternalLinkIcon />} variant="outline">
              Documentation
            </Button>
          </Link>
        </HStack>
      </Flex>
      
      <Text mb={8} color="gray.600">
        Data destinations are the target systems where the pipeline uploads data. 
        Configure destinations in your pipelines to automatically transfer data from your sources.
      </Text>
      
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
        {destinations.map((destination) => {
          const DestinationIcon = getDestinationIcon(destination.id);
          const usageCount = getDestinationUsageCount(destination.id);
          
          return (
            <Card key={destination.id} bg={cardBg} borderColor={cardBorder} borderWidth="1px" overflow="hidden">
              <CardHeader pb={0}>
                <Flex align="center" justify="space-between">
                  <Flex align="center">
                    <Box
                      bg={`${destination.id === 'jira' ? 'blue' : destination.id || 'gray'}.50`}
                      p={3}
                      borderRadius="md"
                      mr={4}
                      color={iconColor}
                    >
                      <Icon as={DestinationIcon} boxSize={6} />
                    </Box>
                    <Heading size="md">{destination.name}</Heading>
                  </Flex>
                  {usageCount > 0 && (
                    <Badge colorScheme="green" borderRadius="full">
                      {usageCount} {usageCount === 1 ? 'pipeline' : 'pipelines'}
                    </Badge>
                  )}
                </Flex>
              </CardHeader>
              
              <CardBody>
                <Stack spacing={4}>
                  <Text color="gray.600">{destination.description}</Text>
                  
                  <Box>
                    <Text fontWeight="medium" mb={1}>Capabilities:</Text>
                    <HStack wrap="wrap" spacing={2}>
                      <Badge colorScheme="green">Data Upload</Badge>
                      {destination.id === 'jira' && (
                        <>
                          <Badge colorScheme="green">Issue Creation</Badge>
                          <Badge colorScheme="green">Field Mapping</Badge>
                        </>
                      )}
                      {destination.id === 'alm' && (
                        <>
                          <Badge colorScheme="green">Defect Creation</Badge>
                          <Badge colorScheme="green">Test Results</Badge>
                        </>
                      )}
                      {destination.id === 'salesforce' && (
                        <>
                          <Badge colorScheme="green">Record Creation</Badge>
                          <Badge colorScheme="green">Record Updates</Badge>
                        </>
                      )}
                      {destination.id === 'rest' && (
                        <>
                          <Badge colorScheme="green">Custom Endpoints</Badge>
                          <Badge colorScheme="green">Flexible Payloads</Badge>
                        </>
                      )}
                    </HStack>
                  </Box>
                  
                  <HStack mt={2}>
                    <Icon as={FaInfoCircle} color="gray.500" />
                    <Text fontSize="sm" color="gray.500">
                      Adapter ID: {destination.id || 'unknown'}
                    </Text>
                  </HStack>
                </Stack>
              </CardBody>
            </Card>
          );
        })}
      </Grid>
      
      {/* Configuration Examples */}
      <Box mt={10}>
        <Heading size="md" mb={4}>Configuration Examples</Heading>
        <Accordion allowToggle>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Icon as={FaJira} color="blue.500" />
                    <Text fontWeight="medium">Jira Configuration Example</Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text mb={2}>
                To configure a Jira destination, you'll need the following information:
              </Text>
              <Box
                bg="gray.50"
                p={4}
                borderRadius="md"
                fontFamily="mono"
                fontSize="sm"
                overflowX="auto"
                mb={4}
              >
                <pre>
{`{
  "base_url": "https://your-domain.atlassian.net",
  "auth_method": "token",
  "project_key": "PROJ",
  "issue_type": "Bug",
  "username": "your.email@example.com",
  "api_token": "your-api-token",
  "field_mapping": {
    "summary": "name",
    "description": "description",
    "priority": "priority"
  }
}`}
                </pre>
              </Box>
              <Text>
                The <code>field_mapping</code> section defines how source fields map to Jira fields.
              </Text>
            </AccordionPanel>
          </AccordionItem>
          
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack>
                    <Icon as={FaBug} color="blue.500" />
                    <Text fontWeight="medium">ALM Configuration Example</Text>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text mb={2}>
                To configure an ALM destination, you'll need the following information:
              </Text>
              <Box
                bg="gray.50"
                p={4}
                borderRadius="md"
                fontFamily="mono"
                fontSize="sm"
                overflowX="auto"
                mb={4}
              >
                <pre>
{`{
  "base_url": "https://alm.example.com",
  "domain": "DEFAULT",
  "project": "Project Name",
  "username": "alm_username",
  "password": "alm_password",
  "defect_defaults": {
    "severity": "2-Medium",
    "priority": "1-High"
  }
}`}
                </pre>
              </Box>
              <Text>
                The <code>defect_defaults</code> section sets default values for created defects.
              </Text>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
      
      {/* Information Card */}
      <Card mt={10} bg="green.50" border="1px" borderColor="green.200">
        <CardBody>
          <Flex align="top">
            <Icon as={FaInfoCircle} boxSize={6} color="green.500" mr={4} mt={1} />
            <Box>
              <Heading size="md" mb={2} color="green.700">Extending Destinations</Heading>
              <Text color="green.700">
                Need to push data to a system not listed here? You can create custom destination adapters
                by implementing the destination adapter interface. This allows you to connect with any system
                that provides API access.
              </Text>
              <HStack mt={4}>
                <Icon as={FaFileAlt} color="green.600" />
                <Link color="green.600" href="/documentation/custom-adapters" isExternal>
                  Read the developer guide for creating custom adapters
                </Link>
              </HStack>
            </Box>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Destinations;