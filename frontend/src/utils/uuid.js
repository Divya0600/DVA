// src/utils/uuid.js

/**
 * Generate a UUID v4 string
 * This is a simplified version for demonstration purposes
 */
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  /**
   * Generate a shortened version of a UUID (first part only)
   */
  export function shortUUID() {
    return generateUUID().split('-')[0];
  }
  
  /**
   * Parse a UUID to its components
   */
  export function parseUUID(uuid) {
    const parts = uuid.split('-');
    return {
      timeLow: parts[0],
      timeMid: parts[1],
      timeHiAndVersion: parts[2],
      clockSeqHiAndReserved: parts[3],
      node: parts[4]
    };
  }
  
  /**
   * Generate a set of stable mock UUIDs for testing
   */
  export function getMockUUIDs(count = 5) {
    const uuids = [];
    for (let i = 0; i < count; i++) {
      uuids.push(generateUUID());
    }
    return uuids;
  }
  
  export default {
    generateUUID,
    shortUUID,
    parseUUID,
    getMockUUIDs
  };