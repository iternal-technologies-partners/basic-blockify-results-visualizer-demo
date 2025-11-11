const sanitizeInt = (stringInt) => {
  const trimmedValue = stringInt.trim();
  if (!trimmedValue) {
    return 0;
  }

  const value = parseInt(trimmedValue, 10);

  if (isNaN(value)) {
    return 0;
  }

  return value;
}

const sanitizeParams = (estimateParams) => {
  const sanitizedParams = {
    ...estimateParams,
    numberOfPCs: sanitizeInt(estimateParams.numberOfPCs),
    avgSalary: sanitizeInt(estimateParams.avgSalary),
    timeLost: sanitizeInt(estimateParams.timeLost),
  }

  return sanitizedParams;
}


export const runCalculation =(estimateParams) =>{
    const sanitizedParams = sanitizeParams(estimateParams);
    const {
        jobRole,
        numberOfPCs,
        avgSalary,
        timeLost,
        additionalInfo,
    } = sanitizedParams;

//  console.log(sanitizedParams);
    const newAvgSalary = avgSalary * 1.3;
    const minutesLostPerDay = numberOfPCs * timeLost;
    const minutesLostPerYear = minutesLostPerDay * 248;
    const hoursLostPerYear = minutesLostPerYear / 60 ; 
    const avgSalaryPerHour = newAvgSalary / 1980 ; 
    const lostProductivityWages = hoursLostPerYear * avgSalaryPerHour;

//  console.log('minutes lost per day ,', minutesLostPerDay, 'minutes lost per year ,', minutesLostPerYear, 'hours lost per year ,', hoursLostPerYear, 'average salary per hour ,', avgSalaryPerHour, 'lost productivity wages ,', lostProductivityWages)
    return {
        minutesLostPerDay,
        minutesLostPerYear,
        hoursLostPerYear,
        avgSalaryPerHour,
        lostProductivityWages,
    }
}

export const requiredFormParamsPresent = (params) => {
  const { numberOfPCs } = params;
  const sanitizedPCs = sanitizeInt(numberOfPCs);

  return sanitizedPCs > 0;
}

/**
 * Split text into chunks with overlap
 * @param {string} text - The text to split
 * @param {number} chunkSize - Size of each chunk (default 2000)
 * @param {number} overlap - Number of overlapping characters (default 200)
 * @returns {Array<Object>} - Array of chunk objects with text, index, and metadata
 */
export const splitTextIntoChunks = (text, chunkSize = 2000, overlap = 200) => {
  if (!text || text.length <= chunkSize) {
    return [{ text, index: 0, isLast: true, totalChunks: 1 }];
  }

  const chunks = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    // Calculate end index for this chunk
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    
    // Extract the chunk
    const chunkText = text.substring(startIndex, endIndex);
    
    // Check if this is the last chunk
    const isLast = endIndex >= text.length;
    
    chunks.push({
      text: chunkText,
      index: chunkIndex,
      isLast: isLast,
      startPosition: startIndex,
      endPosition: endIndex,
      length: chunkText.length
    });

    // Move start index forward by (chunkSize - overlap)
    // Unless this is the last chunk
    if (!isLast) {
      startIndex += chunkSize - overlap;
    } else {
      break;
    }
    
    chunkIndex++;
  }

  // Add total chunks count to each chunk
  const totalChunks = chunks.length;
  chunks.forEach(chunk => {
    chunk.totalChunks = totalChunks;
  });

  return chunks;
}