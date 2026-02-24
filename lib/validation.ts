// Validation utilities for forms

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Password minimal 6 karakter");
  }

  if (password.length > 100) {
    errors.push("Password maksimal 100 karakter");
  }

  // Optional: Add more password requirements
  // if (!/[A-Z]/.test(password)) {
  //   errors.push("Password harus mengandung minimal 1 huruf besar");
  // }

  // if (!/[a-z]/.test(password)) {
  //   errors.push("Password harus mengandung minimal 1 huruf kecil");
  // }

  // if (!/[0-9]/.test(password)) {
  //   errors.push("Password harus mengandung minimal 1 angka");
  // }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100;
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): boolean => {
  return password === confirmPassword;
};

// Form validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
  };
}

// Validate registration form
export const validateRegistrationForm = (data: {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}): ValidationResult => {
  const errors: ValidationResult["errors"] = {};

  // Validate email
  if (!data.email) {
    errors.email = "Email wajib diisi";
  } else if (!validateEmail(data.email)) {
    errors.email = "Format email tidak valid";
  }

  // Validate password
  if (!data.password) {
    errors.password = "Password wajib diisi";
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }
  }

  // Validate password confirmation
  if (!data.confirmPassword) {
    errors.confirmPassword = "Konfirmasi password wajib diisi";
  } else if (!validatePasswordMatch(data.password, data.confirmPassword)) {
    errors.confirmPassword = "Password tidak cocok";
  }

  // Validate name
  if (!data.name) {
    errors.name = "Nama wajib diisi";
  } else if (!validateName(data.name)) {
    errors.name = "Nama minimal 2 karakter dan maksimal 100 karakter";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate login form
export const validateLoginForm = (data: {
  email: string;
  password: string;
}): ValidationResult => {
  const errors: ValidationResult["errors"] = {};

  // Validate email
  if (!data.email) {
    errors.email = "Email wajib diisi";
  } else if (!validateEmail(data.email)) {
    errors.email = "Format email tidak valid";
  }

  // Validate password
  if (!data.password) {
    errors.password = "Password wajib diisi";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
