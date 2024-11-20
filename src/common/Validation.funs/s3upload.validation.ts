/**
 * Validates required fields in the request body.
 * @param {Object} fields - An object containing field names as keys and their values.
 * @returns {{ isValid: boolean, message: string }} - Returns an object with isValid and message properties.
 */
export const validateRequiredFields = (
  fields: Record<string, any>
): { isValid: boolean; message: string } => {
  const missingFields = Object.keys(fields).filter((key) => !fields[key]);

  if (missingFields.length > 0) {
    const message = `Missing required fields: ${missingFields.join(", ")}.`;
    return { isValid: false, message };
  }
  return { isValid: true, message: "All required fields are present." };
};
