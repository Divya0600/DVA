// src/components/JsonViewer.js
import React, { useState } from 'react';
import { Box, Button, Text, useClipboard, Flex, useColorModeValue } from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';

const JsonViewer = ({ data, maxHeight = '400px' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const formattedJson = JSON.stringify(data, null, 2);
  
  const { hasCopied, onCopy } = useClipboard(formattedJson);
  
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box position="relative">
      <Flex justify="flex-end" mb={2}>
        <Button
          size="xs"
          leftIcon={hasCopied ? <CheckIcon /> : <CopyIcon />}
          onClick={onCopy}
          colorScheme={hasCopied ? 'green' : 'gray'}
        >
          {hasCopied ? 'Copied' : 'Copy'}
        </Button>
      </Flex>
      
      <Box
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="md"
        bg={bgColor}
        p={4}
        overflowX="auto"
        overflowY="auto"
        maxHeight={isExpanded ? 'none' : maxHeight}
        fontSize="sm"
        fontFamily="mono"
      >
        {Object.keys(data).length === 0 ? (
          <Text color="gray.500" fontStyle="italic">Empty configuration</Text>
        ) : (
          <pre>{formattedJson}</pre>
        )}
      </Box>
      
      {formattedJson.split('\n').length > 20 && (
        <Button 
          size="xs" 
          variant="link" 
          mt={2}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </Button>
      )}
    </Box>
  );
};

export default JsonViewer;