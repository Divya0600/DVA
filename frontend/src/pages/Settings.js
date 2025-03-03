// src/pages/Settings.js
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  FormControl,
  FormLabel,
  FormHelperText,
  Heading,
  Input,
  Select,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  useColorMode,
} from '@chakra-ui/react';

const Settings = () => {
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'Pipeline Migration System',
    pageSize: 10,
    refreshInterval: 30,
    enableNotifications: true,
  });
  
  // Jobs settings
  const [jobsSettings, setJobsSettings] = useState({
    maxRetries: 3,
    retryDelay: 60,
    jobTimeout: 30,
    cleanupAfterDays: 30,
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: false,
    emailAddress: '',
    failureNotificationsOnly: true,
    slackNotifications: false,
    slackWebhook: '',
  });
  
  // Handle general settings change
  const handleGeneralChange = (field, value) => {
    setGeneralSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Handle jobs settings change
  const handleJobsChange = (field, value) => {
    setJobsSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Handle notification settings change
  const handleNotificationChange = (field, value) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Handle save settings
  const handleSaveSettings = (section) => {
    // In a real application, this would call an API to save settings
    toast({
      title: 'Settings Saved',
      description: `${section} settings have been saved successfully.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Settings</Heading>
      
      <Tabs colorScheme="blue" isLazy>
        <TabList>
          <Tab>General</Tab>
          <Tab>Jobs</Tab>
          <Tab>Notifications</Tab>
          <Tab>Appearance</Tab>
        </TabList>
        
        <TabPanels>
          {/* General Settings Tab */}
          <TabPanel px={0}>
            <Card>
              <CardHeader>
                <Heading size="md">General Settings</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel>System Name</FormLabel>
                    <Input
                      value={generalSettings.systemName}
                      onChange={(e) => handleGeneralChange('systemName', e.target.value)}
                    />
                    <FormHelperText>
                      The name displayed in the application header
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Default Page Size</FormLabel>
                    <Select
                      value={generalSettings.pageSize}
                      onChange={(e) => handleGeneralChange('pageSize', parseInt(e.target.value))}
                    >
                      <option value={10}>10 items per page</option>
                      <option value={20}>20 items per page</option>
                      <option value={50}>50 items per page</option>
                      <option value={100}>100 items per page</option>
                    </Select>
                    <FormHelperText>
                      Default number of items to display in lists and tables
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Auto-Refresh Interval (seconds)</FormLabel>
                    <NumberInput
                      value={generalSettings.refreshInterval}
                      onChange={(valueString, valueNumber) => handleGeneralChange('refreshInterval', valueNumber)}
                      min={0}
                      max={300}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText>
                      How often to refresh job statuses (0 to disable)
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="enable-notifications"
                      isChecked={generalSettings.enableNotifications}
                      onChange={(e) => handleGeneralChange('enableNotifications', e.target.checked)}
                      mr={3}
                    />
                    <FormLabel htmlFor="enable-notifications" mb="0">
                      Enable Browser Notifications
                    </FormLabel>
                  </FormControl>
                  
                  <Button
                    colorScheme="blue"
                    alignSelf="flex-start"
                    onClick={() => handleSaveSettings('General')}
                  >
                    Save General Settings
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Jobs Settings Tab */}
          <TabPanel px={0}>
            <Card>
              <CardHeader>
                <Heading size="md">Jobs Settings</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel>Maximum Retry Attempts</FormLabel>
                    <NumberInput
                      value={jobsSettings.maxRetries}
                      onChange={(valueString, valueNumber) => handleJobsChange('maxRetries', valueNumber)}
                      min={0}
                      max={10}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText>
                      Number of times to retry a failed job automatically
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Retry Delay (seconds)</FormLabel>
                    <NumberInput
                      value={jobsSettings.retryDelay}
                      onChange={(valueString, valueNumber) => handleJobsChange('retryDelay', valueNumber)}
                      min={10}
                      max={3600}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText>
                      Delay before retrying a failed job
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Job Timeout (minutes)</FormLabel>
                    <NumberInput
                      value={jobsSettings.jobTimeout}
                      onChange={(valueString, valueNumber) => handleJobsChange('jobTimeout', valueNumber)}
                      min={1}
                      max={1440}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText>
                      Maximum running time before a job is marked as failed
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Job History Retention (days)</FormLabel>
                    <NumberInput
                      value={jobsSettings.cleanupAfterDays}
                      onChange={(valueString, valueNumber) => handleJobsChange('cleanupAfterDays', valueNumber)}
                      min={1}
                      max={365}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText>
                      How long to keep job history before cleanup
                    </FormHelperText>
                  </FormControl>
                  
                  <Button
                    colorScheme="blue"
                    alignSelf="flex-start"
                    onClick={() => handleSaveSettings('Jobs')}
                  >
                    Save Jobs Settings
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Notifications Tab */}
          <TabPanel px={0}>
            <Card>
              <CardHeader>
                <Heading size="md">Notification Settings</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="email-notifications"
                      isChecked={notificationSettings.emailNotifications}
                      onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                      mr={3}
                    />
                    <FormLabel htmlFor="email-notifications" mb="0">
                      Enable Email Notifications
                    </FormLabel>
                  </FormControl>
                  
                  {notificationSettings.emailNotifications && (
                    <>
                      <FormControl>
                        <FormLabel>Email Address</FormLabel>
                        <Input
                          value={notificationSettings.emailAddress}
                          onChange={(e) => handleNotificationChange('emailAddress', e.target.value)}
                          placeholder="admin@example.com"
                        />
                        <FormHelperText>
                          Email address to send notifications to
                        </FormHelperText>
                      </FormControl>
                      
                      <FormControl display="flex" alignItems="center">
                        <Switch
                          id="failure-only"
                          isChecked={notificationSettings.failureNotificationsOnly}
                          onChange={(e) => handleNotificationChange('failureNotificationsOnly', e.target.checked)}
                          mr={3}
                        />
                        <FormLabel htmlFor="failure-only" mb="0">
                          Only notify on failures
                        </FormLabel>
                      </FormControl>
                    </>
                  )}
                  
                  <Divider />
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch
                      id="slack-notifications"
                      isChecked={notificationSettings.slackNotifications}
                      onChange={(e) => handleNotificationChange('slackNotifications', e.target.checked)}
                      mr={3}
                    />
                    <FormLabel htmlFor="slack-notifications" mb="0">
                      Enable Slack Notifications
                    </FormLabel>
                  </FormControl>
                  
                  {notificationSettings.slackNotifications && (
                    <FormControl>
                      <FormLabel>Slack Webhook URL</FormLabel>
                      <Input
                        value={notificationSettings.slackWebhook}
                        onChange={(e) => handleNotificationChange('slackWebhook', e.target.value)}
                        placeholder="https://hooks.slack.com/services/..."
                      />
                      <FormHelperText>
                        Webhook URL for your Slack channel
                      </FormHelperText>
                    </FormControl>
                  )}
                  
                  <Button
                    colorScheme="blue"
                    alignSelf="flex-start"
                    onClick={() => handleSaveSettings('Notification')}
                  >
                    Save Notification Settings
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Appearance Tab */}
          <TabPanel px={0}>
            <Card>
              <CardHeader>
                <Heading size="md">Appearance Settings</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="color-mode" mb="0">
                      Color Mode
                    </FormLabel>
                    <Switch
                      id="color-mode"
                      isChecked={colorMode === 'dark'}
                      onChange={toggleColorMode}
                      ml="auto"
                    />
                    <Text ml={2}>{colorMode === 'dark' ? 'Dark' : 'Light'}</Text>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Date Format</FormLabel>
                    <Select defaultValue="localized">
                      <option value="localized">Localized (browser default)</option>
                      <option value="iso">ISO Format (YYYY-MM-DD HH:MM:SS)</option>
                      <option value="us">US Format (MM/DD/YYYY hh:mm A)</option>
                      <option value="eu">EU Format (DD/MM/YYYY HH:MM)</option>
                    </Select>
                    <FormHelperText>
                      How dates should be displayed throughout the application
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Time Zone</FormLabel>
                    <Select defaultValue="local">
                      <option value="local">Browser Local Time</option>
                      <option value="utc">UTC</option>
                      <option value="est">Eastern Time (ET)</option>
                      <option value="pst">Pacific Time (PT)</option>
                      <option value="ist">India Standard Time (IST)</option>
                    </Select>
                    <FormHelperText>
                      Time zone for displaying dates and times
                    </FormHelperText>
                  </FormControl>
                  
                  <Button
                    colorScheme="blue"
                    alignSelf="flex-start"
                    onClick={() => handleSaveSettings('Appearance')}
                  >
                    Save Appearance Settings
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Settings;