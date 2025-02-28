// src/components/JsonEditor.js
import React, { useState, useEffect } from 'react';
import { Box, Textarea, useColorModeValue } from '@chakra-ui/react';

const JsonEditor = ({ value, onChange }) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState(null);
  
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const errorBorderColor = useColorModeValue('red.300', 'red.500');
  
  // Convert the object to formatted JSON text when the value prop changes
  useEffect(() => {
    if (!value) return;
    
    try {
      const formatted = JSON.stringify(value, null, 2);
      setJsonText(formatted);
      setError(null);
    } catch (err) {
      setError('Invalid JSON object provided');
    }
  }, [value]);
  
  // Handle text changes and try to parse as JSON
  const handleTextChange = (e) => {
    const text = e.target.value;
    setJsonText(text);
    
    try {
      if (text.trim() === '') {
        onChange({});
        setError(null);
        return;
      }
      
      const parsed = JSON.parse(text);
      onChange(parsed);
      setError(null);
    } catch (err) {
      setError(err.message);
      // Don't update the value if there's an error
    }
  };
  
  return (
    <Box position="relative">
      <Textarea
        value={jsonText}
        onChange={handleTextChange}
        placeholder='{"key": "value"}'
        fontFamily="mono"
        fontSize="sm"
        rows={10}
        bg={bgColor}
        borderColor={error ? errorBorderColor : borderColor}
        _hover={{ borderColor: error ? errorBorderColor : 'gray.300' }}
      />
      
      {error && (
        <Box
          color="red.500"
          fontSize="sm"
          mt={1}
          fontStyle="italic"
        >
          Error: {error}
        </Box>
      )}
    </Box>
  );
};

export default JsonEditor;
