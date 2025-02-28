// src/pages/Help.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Heading,
  Link,
  List,
  ListItem,
  ListIcon,
  Text,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  InfoOutlineIcon, 
  QuestionOutlineIcon, 
  ExternalLinkIcon,
  ChevronRightIcon
} from '@chakra-ui/icons';
import { 
  FaBook, 
  FaCode, 
  FaVideo, 
  FaFileAlt, 
  FaLifeRing, 
  FaExchangeAlt,
  FaServer,
  FaDatabase,
  FaTools
} from 'react-icons/fa';

const Help = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Help & Documentation</Heading>
      
      {/* Quick Start Section */}
      <Card mb={8} bg={cardBg} borderColor={cardBorder} borderWidth="1px">
        <CardHeader>
          <Heading size="md">Getting Started</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <VStack align="start" spacing={4}>
            <Text>
              Welcome to the Pipeline Migration System! This application helps you migrate data between 
              different systems using configurable pipelines. Get started with these resources:
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="100%">
              <VStack align="start" p={4} borderWidth="1px" borderRadius="md" spacing={3}>
                <HStack>
                  <Icon as={FaExchangeAlt} color="blue.500" boxSize={6} />
                  <Heading size="sm">Create Your First Pipeline</Heading>
                </HStack>
                <Text>Learn how to create a pipeline to migrate data between systems.</Text>
                <Button 
                  as={RouterLink} 
                  to="/documentation/first-pipeline" 
                  rightIcon={<ChevronRightIcon />} 
                  size="sm" 
                  variant="outline"
                >
                  View Tutorial
                </Button>
              </VStack>
              
              <VStack align="start" p={4} borderWidth="1px" borderRadius="md" spacing={3}>
                <HStack>
                  <Icon as={FaServer} color="purple.500" boxSize={6} />
                  <Heading size="sm">Configure Data Sources</Heading>
                </HStack>
                <Text>Learn how to set up connections to your source systems.</Text>
                <Button 
                  as={RouterLink} 
                  to="/documentation/sources" 
                  rightIcon={<ChevronRightIcon />} 
                  size="sm" 
                  variant="outline"
                >
                  View Guide
                </Button>
              </VStack>
              
              <VStack align="start" p={4} borderWidth="1px" borderRadius="md" spacing={3}>
                <HStack>
                  <Icon as={FaDatabase} color="green.500" boxSize={6} />
                  <Heading size="sm">Configure Destinations</Heading>
                </HStack>
                <Text>Learn how to set up connections to your destination systems.</Text>
                <Button 
                  as={RouterLink} 
                  to="/documentation/destinations" 
                  rightIcon={<ChevronRightIcon />} 
                  size="sm" 
                  variant="outline"
                >
                  View Guide
                </Button>
              </VStack>
              
              <VStack align="start" p={4} borderWidth="1px" borderRadius="md" spacing={3}>
                <HStack>
                  <Icon as={FaTools} color="orange.500" boxSize={6} />
                  <Heading size="sm">Advanced Configuration</Heading>
                </HStack>
                <Text>Learn about data transformation and advanced settings.</Text>
                <Button 
                  as={RouterLink} 
                  to="/documentation/advanced" 
                  rightIcon={<ChevronRightIcon />} 
                  size="sm" 
                  variant="outline"
                >
                  View Guide
                </Button>
              </VStack>
            </SimpleGrid>
            
            <Box alignSelf="center" mt={4}>
              <Button 
                as={RouterLink} 
                to="/pipelines/create"
                colorScheme="blue" 
                size="lg"
              >
                Create Your First Pipeline
              </Button>
            </Box>
          </VStack>
        </CardBody>
      </Card>
      
      {/* FAQs Section */}
      <Card mb={8} bg={cardBg} borderColor={cardBorder} borderWidth="1px">
        <CardHeader>
          <Heading size="md">Frequently Asked Questions</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <Accordion allowToggle>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <QuestionOutlineIcon color="blue.500" />
                      <Text fontWeight="medium">What is a pipeline?</Text>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Text>
                  A pipeline is a configured data flow between a source system and a destination system. 
                  It defines where to get data from, where to send it, and any transformations that should 
                  be applied to the data along the way. Pipelines can be run manually or on a schedule.
                </Text>
              </AccordionPanel>
            </AccordionItem>
            
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <QuestionOutlineIcon color="blue.500" />
                      <Text fontWeight="medium">How do I schedule a pipeline to run automatically?</Text>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Text>
                  When creating or editing a pipeline, you can set a schedule using a cron expression 
                  in the "Advanced Settings" tab. For example, "0 0 * * *" will run the pipeline daily at midnight.
                  The system will automatically execute the pipeline according to this schedule.
                </Text>
              </AccordionPanel>
            </AccordionItem>
            
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <QuestionOutlineIcon color="blue.500" />
                      <Text fontWeight="medium">What should I do if a pipeline job fails?</Text>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Text>
                  If a job fails, you can view the detailed error messages in the job details page.
                  Check the "Errors" tab to see specific error information. Common issues include:
                </Text>
                <List mt={2} spacing={2}>
                  <ListItem>
                    <ListIcon as={InfoOutlineIcon} color="red.500" />
                    Authentication errors (invalid credentials)
                  </ListItem>
                  <ListItem>
                    <ListIcon as={InfoOutlineIcon} color="red.500" />
                    Connection timeouts (service unavailable)
                  </ListItem>
                  <ListItem>
                    <ListIcon as={InfoOutlineIcon} color="red.500" />
                    Data format issues (incompatible data types)
                  </ListItem>
                </List>
                <Text mt={2}>
                  After resolving the issue, you can retry the job from the job details page.
                </Text>
              </AccordionPanel>
            </AccordionItem>
            
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <QuestionOutlineIcon color="blue.500" />
                      <Text fontWeight="medium">Can I add custom source or destination adapters?</Text>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Text>
                  Yes, the system is built with an extensible adapter framework. New source and destination 
                  adapters can be added by implementing the respective adapter interfaces. This requires coding 
                  and changes to the backend. Refer to the developer documentation for details on implementing 
                  custom adapters.
                </Text>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </CardBody>
      </Card>
      
      {/* Resources Section */}
      <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px">
        <CardHeader>
          <Heading size="md">Additional Resources</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <VStack align="start">
              <HStack>
                <Icon as={FaBook} color="blue.500" />
                <Heading size="sm">Documentation</Heading>
              </HStack>
              <List spacing={3} styleType="none" pl={6} mt={2}>
                <ListItem>
                  <Link as={RouterLink} to="/documentation/user-guide" color="blue.500">
                    User Guide
                  </Link>
                </ListItem>
                <ListItem>
                  <Link as={RouterLink} to="/documentation/administration" color="blue.500">
                    Administration Guide
                  </Link>
                </ListItem>
                <ListItem>
                  <Link as={RouterLink} to="/documentation/api" color="blue.500">
                    API Reference
                  </Link>
                </ListItem>
              </List>
            </VStack>
            
            <VStack align="start">
              <HStack>
                <Icon as={FaVideo} color="red.500" />
                <Heading size="sm">Video Tutorials</Heading>
              </HStack>
              <List spacing={3} styleType="none" pl={6} mt={2}>
                <ListItem>
                  <Link href="https://example.com/tutorial1" isExternal color="blue.500">
                    Getting Started <ExternalLinkIcon mx="2px" />
                  </Link>
                </ListItem>
                <ListItem>
                  <Link href="https://example.com/tutorial2" isExternal color="blue.500">
                    Advanced Configurations <ExternalLinkIcon mx="2px" />
                  </Link>
                </ListItem>
                <ListItem>
                  <Link href="https://example.com/tutorial3" isExternal color="blue.500">
                    Troubleshooting <ExternalLinkIcon mx="2px" />
                  </Link>
                </ListItem>
              </List>
            </VStack>
            
            <VStack align="start">
              <HStack>
                <Icon as={FaLifeRing} color="green.500" />
                <Heading size="sm">Support</Heading>
              </HStack>
              <List spacing={3} styleType="none" pl={6} mt={2}>
                <ListItem>
                  <Link href="mailto:support@example.com" color="blue.500">
                    Email Support
                  </Link>
                </ListItem>
                <ListItem>
                  <Link href="https://example.com/support-portal" isExternal color="blue.500">
                    Support Portal <ExternalLinkIcon mx="2px" />
                  </Link>
                </ListItem>
                <ListItem>
                  <Link href="https://example.com/community" isExternal color="blue.500">
                    Community Forum <ExternalLinkIcon mx="2px" />
                  </Link>
                </ListItem>
              </List>
            </VStack>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Help;
